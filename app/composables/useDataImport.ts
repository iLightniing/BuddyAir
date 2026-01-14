import { parseCSVFile, generateAutoMapping, transformImportedRow, type FieldMapping } from '~/utils/importHelpers'
import { useRules } from '~/composables/useRules'

export { type FieldMapping }

export const useDataImport = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  const { applyRules, fetchRules } = useRules()
  const isImporting = ref(false)
  const parsedData = ref<any[]>([])
  const headers = ref<string[]>([])
  const mapping = ref<Record<string, FieldMapping>>({})
  const importStats = ref({ success: 0, errors: 0, skipped: 0 })
  const progress = ref(0)
  
  // --- Wizard State ---
  const step = ref(1)
  const selectedFile = ref<File | null>(null)
  const targetAccountId = ref('')

  // --- Configuration ---
  const mappingOptions: { label: string, value: FieldMapping }[] = [
    { label: 'Ignorer', value: 'ignore' },
    { label: 'Date', value: 'date' },
    { label: 'Montant', value: 'amount' },
    { label: 'Description', value: 'description' },
    { label: 'Catégorie', value: 'category' },
    { label: 'Sous-catégorie', value: 'sub_category' },
    { label: 'Moyen de paiement', value: 'payment_method' },
    { label: 'Date de pointage', value: 'pointed_at' },
    { label: 'Statut (Pointé ?)', value: 'status' },
  ]

  // --- Validation ---
  const isMappingValid = computed(() => {
    const values = Object.values(mapping.value)
    return values.includes('date') && values.includes('amount')
  })

  // Lecture du fichier CSV
  const parseCSV = async (file: File) => {
    try {
      const result = await parseCSVFile(file)
      headers.value = result.headers
      parsedData.value = result.data
      mapping.value = generateAutoMapping(result.headers)
    } catch (e: any) {
      notify(e, "error")
      throw e
    }
  }

  const processImport = async (accountId: string) => {
    if (!accountId) {
      notify("Veuillez sélectionner un compte cible.", "error")
      return false
    }
    
    isImporting.value = true
    importStats.value = { success: 0, errors: 0, skipped: 0 }
    progress.value = 0
    let totalNetChange = 0

    try {
      const user = pb.authStore.model
      if (!user) throw new Error("Utilisateur non connecté")

      // Charger les règles avant de traiter
      await fetchRules()

      // Inverser le mapping pour une recherche plus facile
      const fieldToHeader: Partial<Record<FieldMapping, string>> = {}
      for (const header in mapping.value) {
        const field = mapping.value[header]
        if (field && field !== 'ignore') {
          fieldToHeader[field] = header
        }
      }

      if (!fieldToHeader.date || !fieldToHeader.amount) {
        throw new Error("Les colonnes 'Date' et 'Montant' sont obligatoires.")
      }

      // Préparation des transactions
      const transactionsToCreate = parsedData.value.map(row => {
          const tx = transformImportedRow(row, fieldToHeader, user.id, accountId)
          if (!tx) {
            importStats.value.skipped++
            return null
          }

          // Application des règles si pas de catégorie définie
          if (!tx.category || tx.category === 'Non catégorisé') {
             const match = applyRules(tx.description)
             if (match) {
                tx.category = match.category
                if (match.sub_category) tx.sub_category = match.sub_category
             }
          }
          
          // Calcul du solde net pour mise à jour du compte
          const amount = tx.type === 'expense' ? -tx.amount : tx.amount
          totalNetChange += amount
          
          return tx
      }).filter(t => t !== null)

      // Envoi par lots (Batch)
      let processed = 0
      const total = transactionsToCreate.length

      for (const tx of transactionsToCreate) {
        try {
          await pb.collection('transactions').create(tx)
          importStats.value.success++
        } catch (e) {
          importStats.value.errors++
        }
        progress.value = Math.round((++processed / total) * 100)
      }

      // Mise à jour atomique du solde du compte
      if (totalNetChange !== 0) {
        await pb.collection('accounts').update(accountId, { 'current_balance+': totalNetChange })
      }
      
      notify(`Import terminé : ${importStats.value.success} succès, ${importStats.value.errors} erreurs.`, importStats.value.success > 0 ? 'success' : 'error')
      return true

    } catch (e: any) {
      notify(e.message || "Erreur critique lors de l'import", "error")
      return false
    } finally {
      isImporting.value = false
    }
  }

  const reset = () => {
    step.value = 1
    selectedFile.value = null
    targetAccountId.value = ''
    parsedData.value = []
    headers.value = []
    mapping.value = {}
    importStats.value = { success: 0, errors: 0, skipped: 0 }
    progress.value = 0
    isImporting.value = false
  }

  return {
    isImporting,
    parsedData,
    headers,
    mapping,
    mappingOptions,
    isMappingValid,
    step,
    selectedFile,
    targetAccountId,
    parseCSV,
    processImport,
    progress,
    importStats,
    reset
  }
}
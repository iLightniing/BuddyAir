import { 
  generateTransactionCSV, generateGenericCSV, 
  generateAccountQIF, generateCategoryQIF, generateQIF, 
  generateOFX 
} from '~/utils/exportGenerators'

export const useAdvancedExport = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const isExporting = ref(false)
  const { notify } = useNotification()

  // --- State ---
  const step = ref(1)
  const config = ref({
    dataType: 'transactions',
    accountId: 'all',
    accountGroup: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    format: 'csv',
    csvOptions: {
      delimiter: ';',
      decimalSeparator: ',',
      dateFormat: 'DD/MM/YYYY'
    }
  })

  // --- Configuration Data ---
  const dataTypes = [
    { id: 'transactions', label: 'Transactions', icon: 'lucide:arrow-right-left', desc: 'Historique des opérations' },
    { id: 'accounts', label: 'Comptes', icon: 'lucide:wallet', desc: 'Liste des comptes' },
    { id: 'categories', label: 'Catégories', icon: 'lucide:tag', desc: 'Vos catégories' },
    { id: 'scheduled_transactions', label: 'Échéancier', icon: 'lucide:calendar-clock', desc: 'Opérations récurrentes' },
    { id: 'full', label: 'Sauvegarde complète', icon: 'lucide:archive', desc: 'Archive JSON globale' },
  ]

  const accountGroupOptions = [
    { label: 'Tous les groupes', value: 'all' },
    { label: 'Comptes Courants', value: 'current' },
    { label: 'Épargne', value: 'savings' },
    { label: 'Crédits', value: 'credit' },
  ]

  // Options de format dynamiques
  const formatOptions = computed(() => {
    const opts = [
      { label: 'CSV', desc: 'Excel, Tableur', value: 'csv', icon: 'lucide:file-spreadsheet' },
      { label: 'JSON', desc: 'Données brutes', value: 'json', icon: 'lucide:file-json' },
    ]
    
    if (['transactions', 'accounts', 'categories'].includes(config.value.dataType)) {
      opts.push({ label: 'QIF', desc: 'Quicken / Money', value: 'qif', icon: 'lucide:file-text' })
    }

    if (config.value.dataType === 'transactions') {
      opts.push({ label: 'OFX', desc: 'Format Bancaire', value: 'ofx', icon: 'lucide:file-code' })
    }
    
    return opts
  })

  // Reset format si non disponible lors du changement de type
  watch(() => config.value.dataType, () => {
    const availableFormats = formatOptions.value.map(f => f.value)
    if (!availableFormats.includes(config.value.format)) {
      config.value.format = 'csv'
    }
  })

  // --- Actions ---
  const processExport = async () => {
    if (!user.value) return
    isExporting.value = true

    try {
      let data: any[] = []
      let content = ''
      let mimeType = 'text/plain'
      let extension = 'txt'
      let filename = `export_${config.value.dataType}_${new Date().toISOString().slice(0, 10)}`

      // Cas spécial : Sauvegarde complète
      if (config.value.dataType === 'full') {
        const collections = ['accounts', 'transactions', 'categories', 'scheduled_transactions', 'projects', 'budgets']
        
        if (config.value.format === 'json') {
          const fullData: Record<string, any> = {}
          for (const col of collections) {
            try {
              fullData[col] = await pb.collection(col).getFullList({ filter: `user = "${user.value.id}"` })
            } catch (e) {
              console.warn(`Impossible d'exporter ${col}`, e)
            }
          }
          content = JSON.stringify(fullData, null, 2)
          mimeType = 'application/json'
          extension = 'json'
        } else {
          // CSV Mode : Concaténation
          const parts = []
          for (const col of collections) {
             const data = await pb.collection(col).getFullList({ filter: `user = "${user.value.id}"` }).catch(() => [])
             const csv = col === 'transactions' ? generateTransactionCSV(data, config.value.csvOptions) : generateGenericCSV(data, config.value.csvOptions)
             parts.push(`\n\n=== ${col.toUpperCase()} ===\n${csv}`)
          }
          content = parts.join('')
          mimeType = 'text/csv'
          extension = 'csv'
        }
        filename = `buddyair_backup_${new Date().toISOString().slice(0, 10)}`
      } 
      else if (config.value.dataType === 'transactions') {
        // Logique spécifique Transactions (Filtres)
        let filter = `user = "${user.value.id}"`
        if (config.value.accountId && config.value.accountId !== 'all') {
          filter += ` && account = "${config.value.accountId}"`
        }
        if (config.value.dateRange === 'custom' && config.value.startDate) {
          filter += ` && date >= "${new Date(config.value.startDate).toISOString()}"`
        }
        if (config.value.dateRange === 'custom' && config.value.endDate) {
          const end = new Date(config.value.endDate)
          end.setHours(23, 59, 59, 999)
          filter += ` && date <= "${end.toISOString()}"`
        }
        data = await pb.collection('transactions').getFullList({ filter, sort: '-date', expand: 'account' })
      } 
      else {
        // Autres collections avec filtres optionnels
        let filter = `user = "${user.value.id}"`

        if (config.value.dataType === 'accounts' && config.value.accountGroup && config.value.accountGroup !== 'all') {
          filter += ` && account_group = "${config.value.accountGroup}"`
        }

        if (config.value.dataType === 'scheduled_transactions' && config.value.accountId && config.value.accountId !== 'all') {
          filter += ` && account = "${config.value.accountId}"`
        }

        data = await pb.collection(config.value.dataType).getFullList({ filter })
      }

      // Génération du contenu (si pas déjà fait pour 'full')
      if (config.value.dataType !== 'full') {
        switch (config.value.format) {
          case 'csv':
            content = config.value.dataType === 'transactions' 
              ? generateTransactionCSV(data, config.value.csvOptions)
              : generateGenericCSV(data, config.value.csvOptions)
            mimeType = 'text/csv'
            extension = 'csv'
            break
          case 'qif':
            if (config.value.dataType === 'accounts') {
              content = generateAccountQIF(data)
            } else if (config.value.dataType === 'categories') {
              content = generateCategoryQIF(data)
            } else {
              content = generateQIF(data)
            }
            mimeType = 'application/qif'
            extension = 'qif'
            break
          case 'ofx':
            content = generateOFX(data, config.value.accountId)
            mimeType = 'application/x-ofx'
            extension = 'ofx'
            break
          case 'json':
            content = JSON.stringify(data, null, 2)
            mimeType = 'application/json'
            extension = 'json'
            break
        }
      }

      // Téléchargement
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      notify('Exportation réussie ! Le fichier a été téléchargé.', 'success')

    } catch (e) {
      console.error("Erreur export:", e)
      throw e
    } finally {
      isExporting.value = false
    }
  }

  return {
    config,
    step,
    isExporting,
    processExport,
    dataTypes,
    accountGroupOptions,
    formatOptions
  }
}
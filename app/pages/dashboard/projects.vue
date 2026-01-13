<script setup lang="ts">
/**
 * Collection PocketBase 'savings_goals' requise :
 * - user : Relation
 * - name : Text
 * - target_amount : Number
 * - saved_amount : Number
 * - deadline : Date (Nouveau)
 * - color : Text (Nouveau - ex: 'bg-blue-500')
 * - icon : Text (Nouveau - ex: 'lucide:plane')
 */
definePageMeta({ title: 'Mes Projets' })

const pb = usePocketBase()
const { notify } = useNotification()
const user = usePocketBaseUser()

const loading = ref(true)
const projects = ref<any[]>([])
const showModal = ref(false)
const editingProject = ref<any>(null)
const showDeleteModal = ref(false)
const projectToDelete = ref<any>(null)
const showDepositModal = ref(false)
const depositProject = ref<any>(null)
const depositAmount = ref('')
const depositAccount = ref('')
const transferType = ref<'deposit' | 'withdraw'>('deposit')
const showHistoryModal = ref(false)
const historyProject = ref<any>(null)
const historyTransactions = ref<any[]>([])
const historyLoading = ref(false)
const accounts = ref<any[]>([])

const form = ref({
  name: '',
  target_amount: '',
  saved_amount: '0',
  deadline: '',
  icon: 'lucide:piggy-bank',
  color: 'bg-blue-500'
})

// Options de personnalisation
const colors = [
  { label: 'Bleu', value: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Vert', value: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Violet', value: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Orange', value: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Rose', value: 'bg-pink-500', text: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'Rouge', value: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
]

const icons = [
  'lucide:piggy-bank', 'lucide:plane', 'lucide:car', 'lucide:home', 
  'lucide:smartphone', 'lucide:gift', 'lucide:graduation-cap', 'lucide:gamepad-2'
]

const fetchData = async () => {
  if (!user.value) return
  loading.value = true
  try {
    const result = await pb.collection('savings_goals').getFullList({
      filter: `user = "${user.value.id}"`,
      sort: '-created',
      requestKey: null
    })
    projects.value = result.map(p => ({ ...p }))

    // Récupérer les comptes pour le versement
    const accountsResult = await pb.collection('accounts').getFullList({
      sort: '+name',
      requestKey: null
    })
    accounts.value = accountsResult.map(a => ({ ...a }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// --- Calculs ---
const stats = computed(() => {
  const totalSaved = projects.value.reduce((acc, p) => acc + p.saved_amount, 0)
  const totalTarget = projects.value.reduce((acc, p) => acc + p.target_amount, 0)
  const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  return { totalSaved, totalTarget, progress, remaining: totalTarget - totalSaved }
})

const getMonthlyEffort = (project: any) => {
  if (!project.deadline || project.saved_amount >= project.target_amount) return null
  
  const now = new Date()
  const end = new Date(project.deadline)
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
  
  if (months <= 0) return { amount: project.target_amount - project.saved_amount, label: 'tout de suite' }
  
  const amount = (project.target_amount - project.saved_amount) / months
  return { amount, label: '/ mois' }
}

const getDeadlineBadge = (dateStr: string) => {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const now = new Date()
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return { label: 'Terminé', class: 'bg-gray-100 text-gray-600 border-gray-200' }
  if (diffDays <= 30) return { label: `J-${diffDays}`, class: 'bg-red-50 text-red-600 border-red-100' }
  return { label: target.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), class: 'bg-blue-50 text-blue-600 border-blue-100' }
}

const accountOptions = computed(() => {
  return accounts.value.map(acc => ({ label: `${acc.name} (${acc.current_balance} €)`, value: acc.id }))
})

// --- Actions ---
const openModal = (project: any = null) => {
  editingProject.value = project
  if (project) {
    form.value = {
      name: project.name,
      target_amount: project.target_amount.toString(),
      saved_amount: project.saved_amount.toString(),
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      icon: project.icon || 'lucide:piggy-bank',
      color: project.color || 'bg-blue-500'
    }
  } else {
    form.value = { name: '', target_amount: '', saved_amount: '0', deadline: '', icon: 'lucide:piggy-bank', color: 'bg-blue-500' }
  }
  showModal.value = true
}

const saveProject = async () => {
  if (!user.value) return
  try {
    const data = {
      user: user.value.id,
      name: form.value.name,
      target_amount: parseFloat(form.value.target_amount || '0'),
      saved_amount: parseFloat(form.value.saved_amount || '0'),
      deadline: form.value.deadline ? new Date(form.value.deadline).toISOString() : null,
      icon: form.value.icon,
      color: form.value.color
    }

    if (editingProject.value) {
      await pb.collection('savings_goals').update(editingProject.value.id, data)
      notify('Projet mis à jour', 'success')
    } else {
      await pb.collection('savings_goals').create(data)
      notify('Projet créé', 'success')
    }
    showModal.value = false
    fetchData()
  } catch (e: any) {
    console.error("Erreur lors de l'enregistrement du projet :", e)
    notify('Erreur lors de l\'enregistrement', 'error')
  }
}

const deleteProject = (project: any) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!projectToDelete.value) return
  try {
    await pb.collection('savings_goals').delete(projectToDelete.value.id)
    notify('Projet supprimé', 'success')
    showDeleteModal.value = false
    fetchData()
  } catch (e) {
    notify('Erreur', 'error')
  }
}

const openTransferModal = (project: any) => {
  depositProject.value = project
  depositAmount.value = ''
  depositAccount.value = ''
  transferType.value = 'deposit'
  showDepositModal.value = true
}

const confirmDeposit = async () => {
  if (!depositProject.value) return
  if (!user.value) return

  if (!depositAccount.value) {
     notify('Veuillez sélectionner un compte source', 'error')
     return
  }
  const amount = parseFloat(depositAmount.value)
  if (isNaN(amount) || amount <= 0) {
     notify('Montant invalide', 'error')
     return
  }

  if (transferType.value === 'withdraw' && depositProject.value.saved_amount < amount) {
     notify('Solde insuffisant dans le projet', 'error')
     return
  }

  try {
    const isDeposit = transferType.value === 'deposit'
    
    // 1. Créer la transaction sur le compte bancaire
    await pb.collection('transactions').create({
      user: user.value.id,
      account: depositAccount.value,
      type: isDeposit ? 'expense' : 'income', // Dépense si versement, Revenu si retrait
      amount: amount,
      category: 'Épargne',
      description: `${isDeposit ? 'Versement' : 'Retrait'} projet : ${depositProject.value.name}`,
      date: new Date().toISOString(),
      payment_method: 'transfer',
      status: 'completed',
      pointed_at: new Date().toISOString()
    })

    // 2. Mettre à jour le solde du compte bancaire
    const sourceAccount = accounts.value.find(a => a.id === depositAccount.value)
    if (sourceAccount) {
      const newBalance = isDeposit 
        ? sourceAccount.current_balance - amount 
        : sourceAccount.current_balance + amount
        
      await pb.collection('accounts').update(sourceAccount.id, {
        current_balance: newBalance
      })
    }

    // 3. Mettre à jour la cagnotte du projet
    const newAmount = isDeposit
      ? depositProject.value.saved_amount + amount
      : depositProject.value.saved_amount - amount

    await pb.collection('savings_goals').update(depositProject.value.id, {
      saved_amount: newAmount
    })
    notify('Épargne ajoutée avec succès', 'success')
    showDepositModal.value = false
    fetchData()
  } catch (e) {
    notify('Erreur lors du versement', 'error')
  }
}

const openHistoryModal = async (project: any) => {
  if (!user.value) return

  historyProject.value = project
  showHistoryModal.value = true
  historyLoading.value = true
  historyTransactions.value = []
  
  try {
    // On recherche les transactions liées à ce projet via la description
    // (Idéalement, on ajouterait un champ relation 'project' dans la collection transactions pour être plus robuste)
    const result = await pb.collection('transactions').getList(1, 50, {
      filter: `user = "${user.value.id}" && category = "Épargne" && description ~ "${project.name}"`,
      sort: '-date',
      requestKey: null
    })
    historyTransactions.value = result.items.map(t => ({ ...t }))
  } catch (e) {
    console.error(e)
  } finally {
    historyLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header & Synthèse -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-ui-surface border border-ui-border rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
         <div class="relative z-10">
            <h1 class="text-2xl font-black text-ui-content mb-1">Mes Projets</h1>
            <p class="text-ui-content-muted text-sm mb-6">Visualisez et réalisez vos rêves.</p>
            <div class="flex items-end gap-2">
               <span class="text-4xl font-black text-ui-content tracking-tight">{{ stats.totalSaved.toLocaleString('fr-FR') }} €</span>
               <span class="text-sm font-bold text-ui-content-muted mb-1.5">épargnés au total</span>
            </div>
         </div>
         <div class="absolute right-0 top-0 p-8 opacity-5">
            <Icon name="lucide:rocket" class="w-40 h-40 text-ui-content" />
         </div>
      </div>

      <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-xl shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 group">
         <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <Icon name="lucide:plus" class="w-8 h-8" />
         </div>
         <span class="font-bold text-lg">Nouveau Projet</span>
      </button>
    </div>

    <!-- Liste des projets -->
    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="project in projects" :key="project.id" 
        class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
        :class="{ 'ring-2 ring-amber-400/50': project.saved_amount >= project.target_amount && project.target_amount > 0 }"
      >
         <!-- Header Card -->
         <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" :class="project.color || 'bg-blue-500'">
               <Icon :name="project.icon || 'lucide:piggy-bank'" class="w-6 h-6" />
            </div>
            <div v-if="project.deadline" class="px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide" :class="getDeadlineBadge(project.deadline)?.class">
               {{ getDeadlineBadge(project.deadline)?.label }}
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button @click="openHistoryModal(project)" class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-purple-600 transition-colors" title="Historique"><Icon name="lucide:history" class="w-4 h-4" /></button>
               <button @click="openModal(project)" class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-blue-600 transition-colors"><Icon name="lucide:pencil" class="w-4 h-4" /></button>
               <button @click="deleteProject(project)" class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-red-600 transition-colors"><Icon name="lucide:trash-2" class="w-4 h-4" /></button>
            </div>
         </div>

         <!-- Info -->
         <h3 class="text-lg font-black text-ui-content mb-1">{{ project.name }}</h3>
         <div class="flex items-baseline gap-1 mb-4">
            <span class="text-2xl font-black" :class="project.saved_amount >= project.target_amount ? 'text-emerald-600' : 'text-ui-content'">{{ project.saved_amount.toLocaleString('fr-FR') }} €</span>
            <span class="text-sm text-ui-content-muted font-medium">/ {{ project.target_amount.toLocaleString('fr-FR') }} €</span>
         </div>

         <!-- Progress -->
         <div class="h-3 w-full bg-ui-surface-muted rounded-full overflow-hidden mb-3">
            <div class="h-full rounded-full transition-all duration-1000" :class="project.color || 'bg-blue-500'" :style="{ width: `${Math.min((project.saved_amount / project.target_amount) * 100, 100)}%` }"></div>
         </div>

         <!-- Footer / Actions -->
         <div class="flex justify-between items-end mt-4">
            <div class="flex flex-col gap-1">
            <span class="text-ui-content-muted font-medium">{{ ((project.saved_amount / project.target_amount) * 100).toFixed(0) }}% atteint</span>
            <span v-if="getMonthlyEffort(project)" class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit">
               {{ getMonthlyEffort(project)?.amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }} € {{ getMonthlyEffort(project)?.label }}
            </span>
            </div>
            <button @click="openTransferModal(project)" class="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-1.5">
              {{ project.saved_amount >= project.target_amount ? 'Gérer' : 'Verser' }} 
              <Icon :name="project.saved_amount >= project.target_amount ? 'lucide:settings-2' : 'lucide:plus'" class="w-3 h-3" />
            </button>
         </div>
      </div>
    </div>

    <!-- Modal Création/Edition -->
    <UiModal :show="showModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-ui-content">{{ editingProject ? 'Modifier le projet' : 'Nouveau Projet' }}</h3>
          <button @click="showModal = false"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
        </div>
        <form class="space-y-5" @submit.prevent="saveProject">
          <UiInput v-model="form.name" label="Nom du projet" placeholder="Ex: Vacances Bali" />
          <div class="grid grid-cols-2 gap-4">
             <UiInput v-model="form.target_amount" label="Objectif (€)" type="number" placeholder="0.00" />
             <UiInput v-model="form.saved_amount" label="Déjà épargné (€)" type="number" placeholder="0.00" />
          </div>
          <UiDate v-model="form.deadline" label="Date limite (Optionnel)" />
          
          <div>
             <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1 mb-2 block">Apparence</label>
             <div class="flex gap-2 mb-3 overflow-x-auto pb-2">
                <button type="button" v-for="c in colors" :key="c.value" @click="form.color = c.value" class="w-8 h-8 rounded-full shrink-0 border-2 transition-all" :class="[c.value, form.color === c.value ? 'border-ui-content scale-110' : 'border-transparent opacity-50 hover:opacity-100']"></button>
             </div>
             <div class="flex gap-2 overflow-x-auto pb-2">
                <button type="button" v-for="icon in icons" :key="icon" @click="form.icon = icon" class="w-10 h-10 rounded-lg shrink-0 border flex items-center justify-center transition-all" :class="form.icon === icon ? 'bg-ui-surface border-blue-500 text-blue-500 shadow-sm' : 'bg-ui-surface-muted border-transparent text-ui-content-muted hover:text-ui-content'">
                   <Icon :name="icon" class="w-5 h-5" />
                </button>
             </div>
          </div>

          <div class="pt-4 flex gap-3">
            <UiButton type="button" @click="showModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
            <UiButton type="submit" class="flex-1">{{ editingProject ? 'Enregistrer' : 'Créer' }}</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Versement Rapide -->
    <UiModal :show="showDepositModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-sm w-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-ui-content">Gérer l'épargne</h3>
          <button @click="showDepositModal = false"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
        </div>

        <!-- Tabs -->
        <div class="flex p-1 bg-ui-surface-muted rounded-lg mb-6">
           <button @click="transferType = 'deposit'" class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" :class="transferType === 'deposit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-ui-content-muted hover:text-ui-content'">Verser</button>
           <button @click="transferType = 'withdraw'" class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" :class="transferType === 'withdraw' ? 'bg-white text-red-600 shadow-sm' : 'text-ui-content-muted hover:text-ui-content'">Retirer</button>
        </div>

        <div class="mb-6 text-center">
           <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors" :class="transferType === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
              <Icon :name="transferType === 'deposit' ? 'lucide:piggy-bank' : 'lucide:hand-coins'" class="w-6 h-6" />
           </div>
           <p class="text-sm text-ui-content-muted">Combien souhaitez-vous {{ transferType === 'deposit' ? 'verser sur' : 'retirer de' }} <br><span class="font-bold text-ui-content">{{ depositProject?.name }}</span> ?</p>
        </div>

        <form @submit.prevent="confirmDeposit" class="space-y-4">
          <div class="relative">
             <input v-model="depositAmount" type="number" step="0.01" placeholder="0.00" class="w-full text-center text-3xl font-black bg-transparent border-b-2 border-ui-border outline-none py-2 tabular-nums placeholder:text-ui-content-muted/20 transition-colors" :class="transferType === 'deposit' ? 'text-emerald-600 focus:border-emerald-500' : 'text-red-600 focus:border-red-500'" autofocus />
             <span class="absolute right-8 top-1/2 -translate-y-1/2 text-ui-content-muted font-bold pointer-events-none">€</span>
          </div>
          <div>
             <UiSelect v-model="depositAccount" label="Depuis le compte" :options="accountOptions" placeholder="Choisir un compte..." />
          </div>
          <div class="pt-4 flex gap-3">
            <UiButton type="button" @click="showDepositModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
            <UiButton type="submit" class="flex-1 text-white shadow-xl transition-all" :class="transferType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-700 border-red-700 shadow-red-500/20'">
               {{ transferType === 'deposit' ? 'Verser' : 'Retirer' }}
            </UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Historique -->
    <UiModal :show="showHistoryModal">
      <div class="bg-ui-surface border border-ui-border p-0 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
        <div class="p-5 border-b border-ui-border flex items-center justify-between bg-ui-surface-muted/30">
          <div>
             <h3 class="text-lg font-black text-ui-content">Historique</h3>
             <p class="text-xs text-ui-content-muted">{{ historyProject?.name }}</p>
          </div>
          <button @click="showHistoryModal = false"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
        </div>

        <div v-if="historyLoading" class="p-10 flex justify-center">
           <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
        </div>

        <div v-else-if="historyTransactions.length === 0" class="p-10 text-center text-ui-content-muted text-sm">
           Aucun mouvement récent trouvé pour ce projet.
        </div>

        <div v-else class="overflow-y-auto p-0">
           <table class="w-full text-left text-sm">
              <tbody class="divide-y divide-ui-border">
                 <tr v-for="tx in historyTransactions" :key="tx.id" class="hover:bg-ui-surface-muted/50 transition-colors">
                    <td class="px-5 py-3 text-ui-content-muted text-xs font-bold w-24">
                       {{ new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }}
                    </td>
                    <td class="px-5 py-3">
                       <div class="font-bold text-ui-content">{{ tx.type === 'expense' ? 'Versement' : 'Retrait' }}</div>
                    </td>
                    <td class="px-5 py-3 text-right font-black tabular-nums" :class="tx.type === 'expense' ? 'text-emerald-600' : 'text-red-600'">
                       {{ tx.type === 'expense' ? '+' : '-' }}{{ Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} €
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>
      </div>
    </UiModal>
  </div>
</template>
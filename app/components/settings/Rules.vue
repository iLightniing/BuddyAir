<script setup lang="ts">
import { useRules } from '~/composables/useRules'
import { useCategories } from '~/composables/useCategories'

const { rules, loading, fetchRules, saveRule, deleteRule } = useRules()
const { categoryOptions, fetchCategories, categories } = useCategories()

onMounted(() => {
  fetchRules()
  fetchCategories()
})

const showModal = ref(false)
const showDeleteModal = ref(false)
const ruleToDelete = ref<any>(null)
const isSaving = ref(false)

const form = ref({
  id: '',
  name: '',
  keywords: '',
  category: '',
  sub_category: '',
  is_active: true
})

const openModal = (rule?: any) => {
  if (rule) {
    form.value = { ...rule }
  } else {
    form.value = {
      id: '',
      name: '',
      keywords: '',
      category: '',
      sub_category: '',
      is_active: true
    }
  }
  showModal.value = true
}

const subCategoryOptions = computed(() => {
  const category = form.value.category
  const cat = categories.value.find(c => c.name === category)
  return cat && cat.sub_categories ? cat.sub_categories.map((s: string) => ({ label: s, value: s })) : []
})

const handleSubmit = async () => {
  isSaving.value = true
  const success = await saveRule(form.value)
  isSaving.value = false
  if (success) showModal.value = false
}

const confirmDelete = (rule: any) => {
  ruleToDelete.value = rule
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (ruleToDelete.value) {
    await deleteRule(ruleToDelete.value.id)
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-black text-ui-content">Règles d'automatisation</h2>
        <p class="text-sm text-ui-content-muted">Catégorisez automatiquement vos transactions importées.</p>
      </div>
      <UiButton @click="openModal()" variant="primary" class="shadow-sm">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Nouvelle règle
      </UiButton>
    </div>

    <div v-if="loading" class="py-12 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else-if="rules.length === 0" class="bg-ui-surface border border-ui-border rounded-xl p-8 text-center">
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="lucide:wand-2" class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-ui-content">Aucune règle définie</h3>
      <p class="text-sm text-ui-content-muted mt-2 max-w-md mx-auto">
        Créez des règles pour détecter automatiquement des transactions (ex: "Netflix", "Spotify") et leur assigner une catégorie.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="rule in rules" :key="rule.id" class="bg-ui-surface border border-ui-border rounded-xl p-4 flex items-center justify-between group hover:shadow-md transition-all">
        <div class="flex items-center gap-4 overflow-hidden">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :class="rule.is_active ? 'bg-blue-50 text-blue-600' : 'bg-ui-surface-muted text-ui-content-muted'">
            <Icon name="lucide:bot" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-ui-content truncate">{{ rule.name }}</h3>
              <span v-if="!rule.is_active" class="text-[10px] font-bold bg-ui-surface-muted text-ui-content-muted px-2 py-0.5 rounded">Désactivé</span>
            </div>
            <p class="text-xs text-ui-content-muted truncate">
              Si contient : <span class="font-mono text-blue-600">{{ rule.keywords }}</span>
              <Icon name="lucide:arrow-right" class="w-3 h-3 inline mx-1" />
              <span class="font-bold">{{ rule.category }}</span>
              <span v-if="rule.sub_category" class="opacity-75"> > {{ rule.sub_category }}</span>
            </p>
          </div>
        </div>

        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="openModal(rule)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 text-ui-content-muted hover:text-blue-600 transition-colors">
            <Icon name="lucide:pen-line" class="w-4 h-4" />
          </button>
          <button @click="confirmDelete(rule)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-ui-content-muted hover:text-red-600 transition-colors">
            <Icon name="lucide:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Édition -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-lg font-black text-ui-content mb-6">{{ form.id ? 'Modifier la règle' : 'Nouvelle règle' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <UiInput v-model="form.name" label="Nom de la règle" placeholder="Ex: Abonnements Streaming" required />
          
          <div class="space-y-2">
            <UiInput v-model="form.keywords" label="Mots-clés (séparés par des virgules)" placeholder="netflix, spotify, disney+" required />
            <p class="text-[10px] text-ui-content-muted">La règle s'appliquera si la description contient l'un de ces mots.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UiSelect v-model="form.category" label="Catégorie" :options="categoryOptions" />
            <UiSelect v-model="form.sub_category" label="Sous-catégorie" :options="subCategoryOptions" placeholder="Aucune" />
          </div>

          <div class="pt-2">
            <UiSwitch v-model="form.is_active" label="Activer cette règle" />
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <UiButton type="button" @click="showModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit" :loading="isSaving">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:trash-2" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer cette règle ?</h3>
        <div class="flex justify-center gap-3 mt-6">
          <UiButton @click="showDeleteModal = false" variant="secondary">Annuler</UiButton>
          <UiButton @click="handleDelete" class="bg-red-600 hover:bg-red-700 text-white border-red-600">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>
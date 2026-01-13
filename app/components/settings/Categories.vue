<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'

const pb = usePocketBase()
const { notify } = useNotification()
const { categories, fetchCategories } = useCategories()

const showModal = ref(false)
const categoryForm = ref({
  id: '',
  name: '',
  sub_categories: [] as string[]
})
const newSubCategoryName = ref('')

const showDeleteModal = ref(false)
const categoryToDelete = ref<any>(null)

const updateOrder = async () => {
  // Mise à jour de l'ordre dans la base
  const promises = categoriesList.value.map((cat, index) => {
    return pb.collection('transaction_categories').update(cat.id, { order: index })
  })
  try {
    await Promise.all(promises)
    categories.value = categoriesList.value // Mise à jour du state global
  } catch (e) {
    console.error("Erreur sauvegarde ordre", e)
  }
}

// Initialisation du Drag & Drop pour la liste principale
const [parent, categoriesList] = useDragAndDrop<any>([], {
  plugins: [animations()],
  dragHandle: '.drag-handle-cat',
  onDragend: () => updateOrder()
})

onMounted(async () => {
  await fetchCategories()
  categoriesList.value = [...categories.value]
})

const openModal = (cat?: any) => {
  if (cat) {
    categoryForm.value = {
      id: cat.id,
      name: cat.name,
      sub_categories: [...(cat.sub_categories || [])]
    }
  } else {
    categoryForm.value = {
      id: '',
      name: '',
      sub_categories: []
    }
  }
  newSubCategoryName.value = ''
  showModal.value = true
}

const saveCategory = async () => {
  if (!categoryForm.value.name) return

  try {
    if (categoryForm.value.id) {
      // Update
      await pb.collection('transaction_categories').update(categoryForm.value.id, {
        name: categoryForm.value.name,
        sub_categories: categoryForm.value.sub_categories
      })
      // Update local state
      const index = categories.value.findIndex(c => c.id === categoryForm.value.id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], name: categoryForm.value.name, sub_categories: categoryForm.value.sub_categories }
        categoriesList.value = [...categories.value]
      }
      notify("Catégorie modifiée", "success")
    } else {
      // Create
      const user = pb.authStore.model
      const newCat = await pb.collection('transaction_categories').create({
        user: user?.id,
        name: categoryForm.value.name,
        sub_categories: categoryForm.value.sub_categories,
        order: categoriesList.value.length
      })
      categories.value.push(newCat)
      categoriesList.value = [...categories.value]
      notify("Catégorie ajoutée", "success")
    }
    showModal.value = false
  } catch (e) {
    notify("Erreur lors de l'enregistrement", "error")
  }
}

const addSubCategory = () => {
  if (!newSubCategoryName.value) return
  if (categoryForm.value.sub_categories.includes(newSubCategoryName.value)) {
    notify("Cette sous-catégorie existe déjà", "error")
    return
  }
  categoryForm.value.sub_categories.push(newSubCategoryName.value)
  newSubCategoryName.value = ''
}

const removeSubCategory = (index: number) => {
  categoryForm.value.sub_categories.splice(index, 1)
}

const requestDelete = (cat: any) => {
  categoryToDelete.value = cat
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!categoryToDelete.value) return
  try {
    await pb.collection('transaction_categories').delete(categoryToDelete.value.id)
    categories.value = categories.value.filter(c => c.id !== categoryToDelete.value.id)
    categoriesList.value = [...categories.value]
    notify("Catégorie supprimée", "success")
    if (categoryForm.value.id === categoryToDelete.value.id) showModal.value = false
    showDeleteModal.value = false
  } catch (e) {
    notify("Erreur suppression", "error")
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-black text-ui-content">Gestion des catégories</h2>
        <p class="text-sm text-ui-content-muted">Personnalisez vos catégories de dépenses et revenus.</p>
      </div>
      <UiButton @click="openModal()" class="shadow-lg shadow-blue-500/20">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" /> Nouvelle catégorie
      </UiButton>
    </div>

    <div ref="parent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="cat in categoriesList" :key="cat.id" class="bg-ui-surface border border-ui-border rounded-xl p-4 hover:border-blue-300/50 transition-all group relative flex flex-col gap-3 shadow-sm hover:shadow-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="drag-handle-cat cursor-grab active:cursor-grabbing text-ui-content-muted hover:text-ui-content p-1 -ml-1 touch-none">
              <Icon name="lucide:grip-vertical" class="w-4 h-4 pointer-events-none" />
            </div>
            <span class="font-bold text-ui-content truncate">{{ cat.name }}</span>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openModal(cat)" class="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"><Icon name="lucide:pencil" class="w-3.5 h-3.5" /></button>
            <button @click="requestDelete(cat)" class="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"><Icon name="lucide:trash-2" class="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div class="pl-8">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-ui-surface-muted text-ui-content-muted border border-ui-border">
            {{ cat.sub_categories?.length || 0 }} sous-catégories
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Édition -->
    <UiModal :show="showModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-ui-content tracking-tight">
            {{ categoryForm.id ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
          </h3>
          <button @click="showModal = false" class="text-ui-content-muted hover:text-ui-content transition-colors">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="space-y-6">
          <UiInput v-model="categoryForm.name" label="Nom de la catégorie" placeholder="Ex: Alimentation" required />

          <div class="space-y-3">
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Sous-catégories</label>
            
            <div class="flex gap-2">
              <input 
                v-model="newSubCategoryName" 
                @keydown.enter.prevent="addSubCategory"
                placeholder="Ajouter une sous-catégorie..." 
                class="flex-1 bg-ui-surface border border-ui-border rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
              />
              <button type="button" @click="addSubCategory" class="px-3 py-2 bg-ui-surface-muted hover:bg-ui-border rounded-md text-ui-content transition-colors">
                <Icon name="lucide:plus" class="w-4 h-4" />
              </button>
            </div>

            <SettingsSubCategoryList v-model="categoryForm.sub_categories" @remove="removeSubCategory" />
          </div>

          <div class="pt-2">
            <UiButton type="submit" class="w-full">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer la catégorie ?</h3>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer la catégorie <span class="font-bold text-ui-content">{{ categoryToDelete?.name }}</span> et toutes ses sous-catégories ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>
<script setup lang="ts">
const { message, type, isVisible } = useNotification()
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isVisible" class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex justify-center">
      <div 
        class="px-4 py-2.5 rounded-md shadow-xl border flex items-center gap-3"
        :class="[
          type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
          type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          'bg-indigo-50 border-indigo-200 text-indigo-800'
        ]"
      >
        <div class="p-1 rounded-full shrink-0" :class="[
            type === 'error' ? 'bg-red-100 text-red-600' : 
            type === 'success' ? 'bg-emerald-100 text-emerald-600' :
            'bg-indigo-100 text-indigo-600'
        ]">
            <Icon :name="type === 'error' ? 'lucide:alert-circle' : (type === 'success' ? 'lucide:check-circle' : 'lucide:info')" class="w-4 h-4" />
        </div>
        <p class="text-sm font-bold">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>
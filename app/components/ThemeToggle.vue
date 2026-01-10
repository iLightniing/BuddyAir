<script setup lang="ts">
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('buddyair-theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('buddyair-theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('buddyair-theme')
  const prefersDark = window.matchMedia('(prefers-color-mode: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <button
    @click="toggleTheme"
    class="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:scale-110 transition-all duration-300 cursor-pointer"
  >
    <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="w-5 h-5" />
  </button>
</template>
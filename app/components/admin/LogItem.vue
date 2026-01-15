<script setup lang="ts">
import { ref } from 'vue'
import { getLogLevelConfig } from '~/utils/logUtils'

const props = defineProps<{
  log: any
}>()

const expanded = ref(false)

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="group hover:bg-ui-surface-muted/50 transition-colors">
    <!-- Ligne principale -->
    <div 
      class="flex items-start gap-3 p-3 cursor-pointer select-none"
      @click="toggleExpand"
    >
      <!-- Indicateur Niveau -->
      <div class="mt-0.5 shrink-0">
        <div :class="`w-5 h-5 rounded flex items-center justify-center border ${getLogLevelConfig(log.level).bg} ${getLogLevelConfig(log.level).color} ${getLogLevelConfig(log.level).border}`">
          <Icon :name="getLogLevelConfig(log.level).icon" class="w-4 h-4" />
        </div>
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0 grid gap-1">
        <div class="flex items-center justify-between gap-4">
          <span class="font-bold truncate text-ui-content" :class="log.level === 'error' ? 'text-red-600' : ''">
            {{ log.message }}
          </span>
          <span class="text-[10px] text-ui-content-muted shrink-0">
            {{ new Date(log.created).toLocaleString('fr-FR') }}
          </span>
        </div>
        
        <div class="flex items-center gap-2 text-[10px] text-ui-content-muted overflow-hidden">
          <!-- Badge Context (URL) -->
          <span v-if="log.context" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ui-surface-muted border border-ui-border max-w-[200px] truncate" title="Contexte / URL">
            <Icon name="lucide:globe" class="w-3 h-3" />
            {{ log.context }}
          </span>
          
          <!-- Badge User -->
          <span v-if="log.expand?.user" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ui-surface-muted border border-ui-border max-w-[150px] truncate" :title="log.expand.user.email">
            <Icon name="lucide:user" class="w-3 h-3" />
            {{ log.expand.user.name || log.expand.user.email }}
          </span>

          <!-- Badge ID -->
          <span class="opacity-30 ml-auto">#{{ log.id.slice(-6) }}</span>
        </div>
      </div>

      <!-- Chevron -->
      <div class="mt-1 text-ui-content-muted transition-transform duration-200" :class="expanded ? 'rotate-90' : ''">
        <Icon name="lucide:chevron-right" class="w-4 h-4" />
      </div>
    </div>

    <!-- Détails (Expandable) -->
    <div v-if="expanded" class="px-3 pb-3 pl-12 animate-in slide-in-from-top-2 duration-200">
      <div class="bg-ui-surface-muted rounded-lg p-3 relative group/code overflow-hidden border border-ui-border">
        <button 
          @click.stop="copyToClipboard(JSON.stringify(log.data, null, 2))"
          class="absolute top-2 right-2 p-1.5 text-ui-content-muted hover:text-ui-content hover:bg-ui-surface rounded opacity-0 group-hover/code:opacity-100 transition-opacity"
          title="Copier le JSON"
        >
          <Icon name="lucide:copy" class="w-3.5 h-3.5" />
        </button>
        <pre class="text-[11px] font-mono text-ui-content overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(log.data, null, 2) }}</pre>
        
        <div v-if="log.user_agent" class="mt-3 pt-3 border-t border-ui-border text-[10px] text-ui-content-muted font-mono">
          User-Agent: {{ log.user_agent }}
        </div>
      </div>
    </div>
  </div>
</template>
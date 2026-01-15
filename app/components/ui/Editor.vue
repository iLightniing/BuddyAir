<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || 'Écrivez votre contenu ici...',
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({ openOnClick: false }),
    Image,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Mise à jour externe (si le formulaire est reset par exemple)
watch(() => props.modelValue, (value) => {
  if (editor.value && value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL du lien', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const addImage = () => {
  const url = window.prompt('URL de l\'image')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<template>
  <div class="border border-ui-border rounded-lg overflow-hidden bg-ui-surface focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
    <div v-if="editor" class="flex flex-wrap gap-1 p-2 border-b border-ui-border bg-ui-surface-muted/50">
      <!-- History -->
      <button type="button" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors disabled:opacity-30" title="Annuler">
        <Icon name="lucide:undo" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors disabled:opacity-30" title="Rétablir">
        <Icon name="lucide:redo" class="w-4 h-4" />
      </button>
      <div class="w-px h-6 bg-ui-border mx-1"></div>

      <!-- Text Style -->
      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('bold') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Gras">
        <Icon name="lucide:bold" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('italic') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Italique">
        <Icon name="lucide:italic" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('underline') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Souligné">
        <Icon name="lucide:underline" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('strike') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Barré">
        <Icon name="lucide:strikethrough" class="w-4 h-4" />
      </button>
      
      <div class="w-px h-6 bg-ui-border mx-1"></div>

      <!-- Headings -->
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('heading', { level: 1 }) }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Titre 1">
        <Icon name="lucide:heading-1" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('heading', { level: 2 }) }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Titre">
        <Icon name="lucide:heading-2" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('heading', { level: 3 }) }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Titre 3">
        <Icon name="lucide:heading-3" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-ui-border mx-1"></div>

      <!-- Lists -->
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('bulletList') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Liste à puces">
        <Icon name="lucide:list" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('orderedList') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Liste numérotée">
        <Icon name="lucide:list-ordered" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-ui-border mx-1"></div>

      <!-- Alignment -->
      <button type="button" @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive({ textAlign: 'left' }) }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Aligner à gauche">
        <Icon name="lucide:align-left" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive({ textAlign: 'center' }) }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Centrer">
        <Icon name="lucide:align-center" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive({ textAlign: 'right' }) }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Aligner à droite">
        <Icon name="lucide:align-right" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-ui-border mx-1"></div>

      <!-- Extras -->
      <button type="button" @click="setLink" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('link') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Lien">
        <Icon name="lucide:link" class="w-4 h-4" />
      </button>
      <button type="button" @click="addImage" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Image">
        <Icon name="lucide:image" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('blockquote') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Citation">
        <Icon name="lucide:quote" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'bg-blue-100 text-blue-600': editor.isActive('codeBlock') }" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Code">
        <Icon name="lucide:code" class="w-4 h-4" />
      </button>
      <button type="button" @click="editor.chain().focus().setHorizontalRule().run()" class="p-1.5 rounded hover:bg-ui-surface-muted transition-colors" title="Séparateur">
        <Icon name="lucide:minus" class="w-4 h-4" />
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
/* Styles basiques pour le contenu de l'éditeur */
.ProseMirror {
  outline: none;
  min-height: 150px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Reproduction du style 'prose' pour le WYSIWYG */
.ProseMirror p {
  margin-top: 1em;
  margin-bottom: 1em;
  line-height: 1.6;
}

.ProseMirror h1 { 
  font-size: 1.5em; 
  font-weight: 800; 
  margin-top: 1.5em; 
  margin-bottom: 0.8em; 
  line-height: 1.2; 
  color: #1e293b;
}

.ProseMirror h2 { 
  font-size: 1.25em; 
  font-weight: 700; 
  margin-top: 1.5em; 
  margin-bottom: 0.8em; 
  line-height: 1.3;
  color: #334155;
}

.ProseMirror h3 { 
  font-size: 1.1em; 
  font-weight: 600; 
  margin-top: 1.2em; 
  margin-bottom: 0.6em; 
  line-height: 1.4;
  color: #475569;
}

.ProseMirror ul { 
  list-style-type: disc; 
  padding-left: 1.6em; 
  margin-top: 1em; 
  margin-bottom: 1em; 
}

.ProseMirror ol { 
  list-style-type: decimal; 
  padding-left: 1.6em; 
  margin-top: 1em; 
  margin-bottom: 1em; 
}

.ProseMirror li {
  margin-top: 0.4em;
  margin-bottom: 0.4em;
}

.ProseMirror blockquote {
  border-left: 4px solid #e2e8f0;
  padding-left: 1em;
  margin-left: 0;
  margin-right: 0;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
  font-style: italic;
  color: #64748b;
}

.ProseMirror hr {
  margin-top: 2em;
  margin-bottom: 2em;
  border: none;
  border-top: 1px solid #e2e8f0;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
}

.ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror code {
  background-color: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: monospace;
  color: #0f172a;
}

.ProseMirror pre {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
}

.ProseMirror pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}
</style>
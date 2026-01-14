export const slugify = (text: string): string => {
  if (!text) return ''
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents
    .replace(/[^a-z0-9]/g, '_') // Remplacer caractères spéciaux
}
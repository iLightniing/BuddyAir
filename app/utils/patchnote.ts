export const getNoteItems = (content: string) => {
  try {
    const items = JSON.parse(content)
    return Array.isArray(items) ? items : null
  } catch (e) {
    return null
  }
}
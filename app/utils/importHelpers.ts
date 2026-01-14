import { parseDate, parseAmount } from './parse'

export type FieldMapping = 'date' | 'amount' | 'description' | 'category' | 'sub_category' | 'payment_method' | 'pointed_at' | 'status' | 'ignore'

export const parseCSVFile = (file: File): Promise<{ headers: string[], data: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return reject("Fichier vide")

      // Parsing basique
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '')
      if (lines.length < 2) return reject("Format CSV invalide (pas assez de lignes)")

      // Détection du séparateur (, ou ;)
      const separator = (lines[0] || '').includes(';') ? ';' : ','
      
      const headers = (lines[0] || '').split(separator).map(h => h.trim().replace(/^"|"$/g, ''))
      
      const data = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''))
        const row: any = {}
        headers.forEach((h, i) => {
          row[h] = values[i]
        })
        return row
      })

      resolve({ headers, data })
    }
    reader.onerror = () => reject("Erreur de lecture")
    reader.readAsText(file)
  })
}

export const generateAutoMapping = (headers: string[]): Record<string, FieldMapping> => {
  const lowerHeaders = headers.map(h => h.toLowerCase())
  const mapping: Record<string, FieldMapping> = {}
  
  headers.forEach((header, index) => {
    const lowerHeader = lowerHeaders[index] || ''
    if (['date', 'jour', 'time'].some(k => lowerHeader.includes(k))) mapping[header] = 'date'
    else if (['montant', 'amount', 'solde', 'value', 'debit', 'credit'].some(k => lowerHeader.includes(k))) mapping[header] = 'amount'
    else if (['libelle', 'label', 'description', 'objet', 'tiers'].some(k => lowerHeader.includes(k))) mapping[header] = 'description'
    else if (['cat', 'category'].some(k => lowerHeader.includes(k))) mapping[header] = 'category'
    else if (['sous', 'sub'].some(k => lowerHeader.includes(k))) mapping[header] = 'sub_category'
    else if (['paiement', 'payment', 'method', 'moyen'].some(k => lowerHeader.includes(k))) mapping[header] = 'payment_method'
    else if (['pointage', 'pointed', 'valeur'].some(k => lowerHeader.includes(k))) mapping[header] = 'pointed_at'
    else if (['statut', 'status', 'etat', 'state', 'check', 'pointe'].some(k => lowerHeader.includes(k))) mapping[header] = 'status'
    else mapping[header] = 'ignore'
  })
  return mapping
}

export const transformImportedRow = (row: any, fieldToHeader: Partial<Record<FieldMapping, string>>, userId: string, accountId: string): any | null => {
    if (!fieldToHeader.amount || !fieldToHeader.date) return null

    const amount = parseAmount(row[fieldToHeader.amount])
    const date = parseDate(row[fieldToHeader.date])
    const pointedAt = fieldToHeader.pointed_at ? parseDate(row[fieldToHeader.pointed_at]) : null

    if (amount === null || date === null) return null

    let status = 'pending'
    let finalPointedAt = pointedAt ? pointedAt.toISOString() : null

    if (fieldToHeader.status) {
        const val = String(row[fieldToHeader.status]).toLowerCase().trim()
        if (['1', 'true', 'oui', 'yes', 'x', 'ok', 'checked', 'completed', 'validé'].includes(val)) {
            status = 'completed'
            if (!finalPointedAt) finalPointedAt = date.toISOString()
        }
    }
    
    if (pointedAt) status = 'completed'

    const type = amount < 0 ? 'expense' : 'income'

    return {
        user: userId,
        account: accountId,
        date: date.toISOString(),
        description: (fieldToHeader.description && row[fieldToHeader.description]) || 'Import CSV',
        amount: Math.abs(amount),
        type: type,
        category: (fieldToHeader.category && row[fieldToHeader.category]) || 'Non catégorisé',
        sub_category: (fieldToHeader.sub_category && row[fieldToHeader.sub_category]) || '',
        payment_method: (fieldToHeader.payment_method && row[fieldToHeader.payment_method]) || 'other',
        status: status,
        pointed_at: finalPointedAt,
    }
}
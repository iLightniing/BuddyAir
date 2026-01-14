export const convertToCSV = (objArray: any[]) => {
    if (!objArray || objArray.length === 0) return ''
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
    
    // Récupérer tous les headers possibles
    const headers = Array.from(new Set(array.flatMap((row: Record<string, any>) => Object.keys(row)))) as string[]
    const str = headers.join(',') + '\r\n'

    return str + array.map((row: any) => {
        return headers.map(fieldName => {
            let value = (row as Record<string, any>)[fieldName]
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        }).join(',')
    }).join('\r\n')
}
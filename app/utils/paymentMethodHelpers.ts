export const mergePaymentMethods = (globalRecords: any[], localRecords: any[]) => {
    const mergedMap = new Map()

    // 1. On place d'abord les globaux
    globalRecords.forEach(record => {
        mergedMap.set(record.name, {
            id: null, // Pas d'ID local pour l'instant
            global_id: record.id,
            name: record.name,
            icon: record.icon,
            is_global_source: true,
            user_record_exists: false,
            original_record: record
        })
    })

    // 2. On fusionne avec les locaux
    localRecords.forEach(record => {
        if (mergedMap.has(record.name)) {
            // Fusion : Le mode existe en global, on ajoute les spécificités locales (ex: surcharge d'icône si on le permettait)
            const existing = mergedMap.get(record.name)
            existing.id = record.id // On garde l'ID local pour les updates
            existing.user_record_exists = true
            // Si l'utilisateur a une icône différente, on pourrait la prendre ici, mais pour l'instant on garde la logique simple
        } else {
            // Purement local
            mergedMap.set(record.name, {
                id: record.id,
                global_id: null,
                name: record.name,
                icon: record.icon,
                is_global_source: false,
                user_record_exists: true,
                original_record: record
            })
        }
    })

    return Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
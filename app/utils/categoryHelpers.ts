export const mergeCategories = (globalRecords: any[], localRecords: any[]) => {
    const mergedMap = new Map()

    // 1. On place d'abord les globales
    globalRecords.forEach(record => {
        mergedMap.set(record.name, {
            id: null, // Pas d'ID local pour l'instant
            global_id: record.id,
            name: record.name,
            sub_categories: [...record.sub_categories],
            locked_subs: [...record.sub_categories], // Verrouillé car source globale
            is_global_source: true,
            user_record_exists: false,
            original_record: record
        })
    })

    // 2. On fusionne avec les locales
    localRecords.forEach(record => {
        if (mergedMap.has(record.name)) {
            // Fusion : La catégorie existe en global, on ajoute les spécificités locales
            const existing = mergedMap.get(record.name)
            existing.id = record.id // On garde l'ID local pour les updates
            existing.user_record_exists = true
            
            // On utilise l'ordre de l'utilisateur (record.sub_categories)
            // Et on ajoute à la fin les globales qui manqueraient (cas où l'admin en a ajouté une nouvelle)
            const userSubs = record.sub_categories || []
            const userSubsSet = new Set(userSubs)
            const missingGlobals = existing.sub_categories.filter((sub: string) => !userSubsSet.has(sub))
            
            existing.sub_categories = [...userSubs, ...missingGlobals]
        } else {
            // Purement local
            mergedMap.set(record.name, {
                id: record.id,
                global_id: null,
                name: record.name,
                sub_categories: [...record.sub_categories],
                locked_subs: [],
                is_global_source: false,
                user_record_exists: true,
                original_record: record
            })
        }
    })

    return Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
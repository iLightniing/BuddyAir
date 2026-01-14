// Utilitaires de formatage
export const formatDate = (dateStr: string, format: string) => {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`
  if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  return d.toISOString()
}

export const formatAmount = (amount: number, type: string, decimalSeparator: string) => {
  const val = type === 'expense' ? -Math.abs(amount) : Math.abs(amount)
  return val.toFixed(2).replace('.', decimalSeparator)
}

// Générateurs CSV
export const generateTransactionCSV = (transactions: any[], options: any) => {
  const separator = options.delimiter === 'tab' ? '\t' : options.delimiter
  const headers = ['Date', 'Description', 'Montant', 'Type', 'Catégorie', 'Compte']
  
  const rows = transactions.map(tx => {
    return [
      formatDate(tx.date, options.dateFormat),
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      formatAmount(tx.amount, tx.type, options.decimalSeparator),
      tx.type,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      `"${(tx.expand?.account?.name || '').replace(/"/g, '""')}"`
    ].join(separator)
  })

  return [headers.join(separator), ...rows].join('\n')
}

export const generateGenericCSV = (data: any[], options: any) => {
  if (!data.length) return ''
  const separator = options.delimiter === 'tab' ? '\t' : options.delimiter
  const keys = Object.keys(data[0]).filter(k => !['collectionId', 'collectionName', 'expand', 'created', 'updated', 'user'].includes(k))
  
  const header = keys.join(separator)
  const rows = data.map(item => {
    return keys.map(k => {
      let val = item[k]
      if (val === null || val === undefined) return ''
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(separator)
  }).join('\n')
  
  return header + '\n' + rows
}

// Générateurs QIF
export const generateAccountQIF = (accounts: any[]) => {
  let qif = '!Account\n'
  accounts.forEach(acc => {
    qif += `N${acc.name}\n`
    let type = 'Bank'
    if (acc.account_group === 'credit') type = 'CCard'
    else if (acc.account_group === 'savings') type = 'Oth A'
    
    qif += `T${type}\n`
    if (acc.bank) qif += `D${acc.bank}\n`
    qif += '^\n'
  })
  return qif
}

export const generateCategoryQIF = (categories: any[]) => {
  let qif = '!Type:Cat\n'
  categories.forEach(cat => {
    qif += `N${cat.name}\n`
    qif += '^\n'
    if (cat.sub_categories && Array.isArray(cat.sub_categories)) {
      cat.sub_categories.forEach((sub: string) => {
        qif += `N${cat.name}:${sub}\n`
        qif += '^\n'
      })
    }
  })
  return qif
}

export const generateQIF = (transactions: any[]) => {
  let qif = '!Type:Bank\n'
  transactions.forEach(tx => {
    const date = new Date(tx.date)
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
    
    qif += `D${dateStr}\n`
    qif += `T${amount.toFixed(2)}\n`
    qif += `P${tx.description}\n`
    if (tx.category) qif += `L${tx.category}\n`
    qif += '^\n'
  })
  return qif
}

// Générateur OFX
export const generateOFX = (transactions: any[], accountId: string) => {
  const dateNow = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  
  let ofx = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:US-ASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>${dateNow}
<LANGUAGE>FRA
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>EUR
<BANKACCTFROM>
<BANKID>BUDDYAIR
<ACCTID>${accountId || 'ALL'}
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${dateNow}
<DTEND>${dateNow}
`

  transactions.forEach(tx => {
    const dateTx = new Date(tx.date).toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
    
    ofx += `<STMTTRN>
<TRNTYPE>${tx.type === 'expense' ? 'DEBIT' : 'CREDIT'}
<DTPOSTED>${dateTx}
<TRNAMT>${amount.toFixed(2)}
<FITID>${tx.id}
<NAME>${tx.description}
<MEMO>${tx.category || ''}
</STMTTRN>
`
  })

  ofx += `</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>0.00
<DTASOF>${dateNow}
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`
  return ofx
}
import banksList from '~/data/banks.json'

export const useAccountConstants = () => {
  const banks = [
    ...banksList.map(b => ({ label: b.nom, value: b.nom })).sort((a, b) => a.label.localeCompare(b.label)),
    { label: 'Autre', value: 'Autre' }
  ]

  const types = [
    { label: 'Débit immédiat', value: 'immediate' },
    { label: 'Débit différé', value: 'deferred' }
  ]
  const groups = [
    { label: 'Compte courant', value: 'current' },
    { label: 'Compte Épargne', value: 'savings' },
    { label: 'Compte Crédit', value: 'credit' }
  ]
  const currencies = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' }
  ]
  const balanceOptions = [
    { label: 'Créditeur (+)', value: 'credit', activeClass: 'bg-ui-surface shadow-sm text-emerald-500' },
    { label: 'Débiteur (-)', value: 'debit', activeClass: 'bg-ui-surface shadow-sm text-red-500' }
  ]
  const savingsTypes = [
    { label: 'Livret A', value: 'Livret A' },
    { label: 'LDDS', value: 'LDDS' },
    { label: 'LEP', value: 'LEP' },
    { label: 'PEL', value: 'PEL' },
    { label: 'CEL', value: 'CEL' },
    { label: 'Assurance Vie', value: 'Assurance Vie' },
    { label: 'Autre', value: 'Autre' }
  ]

  return { banks, types, groups, currencies, balanceOptions, savingsTypes }
}
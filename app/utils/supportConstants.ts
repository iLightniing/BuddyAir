export const SUPPORT_STATUS_CONFIG: Record<string, any> = {
  open: { label: 'Ouvert', class: 'bg-blue-100 text-blue-700' },
  pending: { label: 'En attente', class: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Résolu', class: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Fermé', class: 'bg-gray-100 text-gray-600' }
}

export const SUPPORT_CATEGORIES: Record<string, any> = {
  bug: { label: 'Bug', icon: 'lucide:bug' },
  feature: { label: 'Suggestion', icon: 'lucide:lightbulb' },
  payment: { label: 'Paiement', icon: 'lucide:credit-card' },
  other: { label: 'Autre', icon: 'lucide:help-circle' }
}

export const SUPPORT_CATEGORIES_OPTIONS = [
  { label: 'Signaler un bug', value: 'bug', icon: 'lucide:bug' },
  { label: 'Suggestion', value: 'feature', icon: 'lucide:lightbulb' },
  { label: 'Paiement / Abo', value: 'payment', icon: 'lucide:credit-card' },
  { label: 'Autre demande', value: 'other', icon: 'lucide:help-circle' }
]
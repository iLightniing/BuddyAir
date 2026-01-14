import banksList from '~/data/banks.json'

export const TAG_COLORS = [
    { name: 'Rouge', value: 'red', class: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Ambre', value: 'amber', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Vert', value: 'emerald', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Bleu', value: 'blue', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Violet', value: 'purple', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Rose', value: 'pink', class: 'bg-pink-50 text-pink-700 border-pink-200' },
    { name: 'Gris', value: 'slate', class: 'bg-slate-50 text-slate-700 border-slate-200' },
]

export const ACCOUNT_BANKS = [
    ...banksList.map(b => ({ label: b.nom, value: b.nom })).sort((a, b) => a.label.localeCompare(b.label)),
    { label: 'Autre', value: 'Autre' }
]

export const ACCOUNT_TYPES = [
    { label: 'Débit immédiat', value: 'immediate' },
    { label: 'Débit différé', value: 'deferred' }
]

export const ACCOUNT_GROUPS = [
    { label: 'Compte courant', value: 'current' },
    { label: 'Compte Épargne', value: 'savings' },
    { label: 'Compte Crédit', value: 'credit' }
]

export const CURRENCIES = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' }
]

export const BALANCE_OPTIONS = [
    { label: 'Créditeur (+)', value: 'credit', activeClass: 'bg-ui-surface shadow-sm text-emerald-500' },
    { label: 'Débiteur (-)', value: 'debit', activeClass: 'bg-ui-surface shadow-sm text-red-500' }
  ]

export const SAVINGS_TYPES = [
    { label: 'Livret A', value: 'Livret A' },
    { label: 'LDDS', value: 'LDDS' },
    { label: 'LEP', value: 'LEP' },
    { label: 'PEL', value: 'PEL' },
    { label: 'CEL', value: 'CEL' },
    { label: 'Assurance Vie', value: 'Assurance Vie' },
    { label: 'Autre', value: 'Autre' }
]

export const PATHS = {
  CONFIRM: '/confirm',
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/auth/login',
  AUTH: '/auth',
  UPDATE_PASSWORD: '/auth/update-password',
}

export const DEFAULT_CATEGORIES = {
  'Alimentation': ['Courses', 'Restaurant', 'Fast Food', 'Boulangerie', 'Autre'],
  'Logement': ['Loyer', 'Électricité', 'Eau', 'Internet', 'Assurance', 'Travaux', 'Autre'],
  'Transport': ['Carburant', 'Transport en commun', 'Entretien', 'Assurance', 'Parking', 'Péage', 'Autre'],
  'Loisirs': ['Sorties', 'Sport', 'Voyage', 'Streaming', 'Jeux vidéo', 'Autre'],
  'Santé': ['Médecin', 'Pharmacie', 'Mutuelle', 'Spécialiste', 'Autre'],
  'Shopping': ['Vêtements', 'Électronique', 'Maison', 'Cadeaux', 'Autre'],
  'Salaire': ['Salaire', 'Prime', 'Remboursement', 'Autre'],
  'Services': ['Banque', 'Frais', 'Abonnement', 'Autre'],
  'Autre': ['Autre']
}

export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Carte Bancaire', code: 'card', icon: 'lucide:credit-card' },
  { name: 'Virement', code: 'transfer', icon: 'lucide:arrow-right-left' },
  { name: 'Prélèvement', code: 'direct_debit', icon: 'lucide:landmark' },
  { name: 'Espèces', code: 'cash', icon: 'lucide:banknote' },
  { name: 'Chèque', code: 'check', icon: 'lucide:scroll-text' },
  { name: 'Autre', code: 'other', icon: 'lucide:more-horizontal' }
]

export const USER_ROLES = [
    { value: 1, label: 'Utilisateur (Free)', class: 'bg-gray-100 text-gray-600' },
    { value: 2, label: 'Premium', class: 'bg-amber-100 text-amber-700' },
    { value: 3, label: 'Administrateur', class: 'bg-purple-100 text-purple-700' }
]

export const SEX_OPTIONS = [
    { label: 'Homme', value: 'Homme' },
    { label: 'Femme', value: 'Femme' },
    { label: 'Autre', value: 'Autre' }
]

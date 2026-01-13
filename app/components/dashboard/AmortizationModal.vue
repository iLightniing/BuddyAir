<script setup lang="ts">
const props = defineProps<{
  show: boolean
  account: any
}>()

const emit = defineEmits(['close'])

const schedule = computed(() => {
  if (!props.account || !props.account.credit_amount || !props.account.interest_rate || !props.account.loan_duration) return []

  const amount = props.account.credit_amount
  const rate = props.account.interest_rate / 100 / 12
  const duration = props.account.loan_duration
  const startDate = new Date(props.account.loan_start_date || new Date())

  // Assurance
  const insuranceRate = (props.account.insurance_rate || 0) / 100
  const insuranceFixed = props.account.insurance_amount || 0

  // Calcul de la mensualité théorique si non fournie (Formule standard)
  // M = P * [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
  const calculatedPayment = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1)
  const payment = props.account.monthly_payment || calculatedPayment

  let balance = amount
  const rows = []

  for (let i = 1; i <= duration; i++) {
    const interest = balance * rate
    const principal = payment - interest
    balance -= principal

    // Assurance mensuelle (souvent calculée sur le capital initial en France)
    const insurance = (amount * insuranceRate) / 12 + insuranceFixed
    
    // Gestion de la date
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)

    rows.push({
      id: i,
      date: date,
      payment: payment,
      interest: interest,
      principal: principal,
      insurance: insurance,
      balance: Math.max(0, balance)
    })

    if (balance <= 0) break
  }

  return rows
})

const totalInterest = computed(() => schedule.value.reduce((sum, row) => sum + row.interest, 0))
const totalInsurance = computed(() => schedule.value.reduce((sum, row) => sum + row.insurance, 0))
const totalCost = computed(() => (props.account?.credit_amount || 0) + totalInterest.value + totalInsurance.value)
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between mb-6 shrink-0">
        <div>
           <h3 class="text-xl font-black text-ui-content tracking-tight">Tableau d'amortissement</h3>
           <p class="text-xs text-ui-content-muted">Coût total : <span class="font-bold text-red-500">{{ totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span> (Intérêts: {{ totalInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }} | Assurance: {{ totalInsurance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }})</p>
        </div>
        <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <div class="overflow-y-auto flex-1 border border-ui-border rounded-xl">
        <table class="w-full text-left border-collapse text-sm">
          <thead class="sticky top-0 bg-ui-surface-muted z-10">
            <tr>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px]">Date</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Mensualité</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Intérêts</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Capital</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Assurance</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Restant dû</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ui-border">
            <tr v-for="row in schedule" :key="row.id" class="hover:bg-ui-surface-muted/50 transition-colors">
              <td class="p-3 font-medium text-ui-content tabular-nums">
                {{ row.date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) }}
              </td>
              <td class="p-3 text-right font-bold text-ui-content tabular-nums">
                {{ row.payment.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right text-orange-500 tabular-nums">
                {{ row.interest.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right text-emerald-600 tabular-nums">
                {{ row.principal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right text-blue-500 tabular-nums">
                {{ row.insurance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right font-bold text-ui-content tabular-nums">
                {{ row.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UiModal>
</template>
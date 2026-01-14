import { ACCOUNT_BANKS, ACCOUNT_TYPES, ACCOUNT_GROUPS, CURRENCIES, BALANCE_OPTIONS, SAVINGS_TYPES } from '~/utils/constants'

export const useAccountConstants = () => {
  return { 
      banks: ACCOUNT_BANKS, 
      types: ACCOUNT_TYPES, 
      groups: ACCOUNT_GROUPS, 
      currencies: CURRENCIES, 
      balanceOptions: BALANCE_OPTIONS, 
      savingsTypes: SAVINGS_TYPES 
  }
}
// app/utils/format.ts

export const formatAmountDisplay = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return ''
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const parseAmountInput = (val: string | number | null | undefined): number => {
  const str = val ? val.toString() : ''
  return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0
}
export const useBalanceAnimation = (balances: Ref<{ current: number, cleared: number, projected: number }>) => {
  const displayedBalances = reactive({ ...balances.value })

  watch(balances, (newBalances) => {
    const duration = 800 // ms
    const start = performance.now()
    const startBalances = { ...displayedBalances }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)
      // Easing cubic-out pour un effet naturel
      const ease = 1 - Math.pow(1 - progress, 3)

      displayedBalances.current = startBalances.current + (newBalances.current - startBalances.current) * ease
      displayedBalances.cleared = startBalances.cleared + (newBalances.cleared - startBalances.cleared) * ease
      displayedBalances.projected = startBalances.projected + (newBalances.projected - startBalances.projected) * ease

      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, { deep: true })

  return { displayedBalances }
}
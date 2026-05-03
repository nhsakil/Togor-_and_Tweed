describe('Pricing Logic', () => {
  const getEffectivePrice = (basePrice: number, salePrice: number | null) =>
    salePrice !== null && salePrice < basePrice ? salePrice : basePrice

  const getDiscount = (basePrice: number, salePrice: number | null) => {
    if (!salePrice || salePrice >= basePrice) return 0
    return Math.round(((basePrice - salePrice) / basePrice) * 100)
  }

  it('returns base price when no sale price', () => {
    expect(getEffectivePrice(99.99, null)).toBe(99.99)
  })

  it('returns sale price when lower than base', () => {
    expect(getEffectivePrice(99.99, 79.99)).toBe(79.99)
  })

  it('returns base price when sale price equals base', () => {
    expect(getEffectivePrice(99.99, 99.99)).toBe(99.99)
  })

  it('calculates discount percentage correctly', () => {
    expect(getDiscount(100, 80)).toBe(20)
    expect(getDiscount(99.99, 59.99)).toBe(40)
    expect(getDiscount(100, null)).toBe(0)
  })

  it('calculates cart total correctly', () => {
    const items = [
      { price: 49.99, quantity: 2 },
      { price: 89.99, quantity: 1 },
    ]
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    expect(total).toBeCloseTo(189.97, 2)
  })
})

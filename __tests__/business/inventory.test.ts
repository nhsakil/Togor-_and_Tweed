describe('Inventory Logic', () => {
  const isInStock = (stock: number, reservedQty: number = 0) => stock - reservedQty > 0
  const getAvailableStock = (stock: number, reservedQty: number = 0) => Math.max(0, stock - reservedQty)
  const canFulfillQty = (stock: number, requestedQty: number, reservedQty: number = 0) =>
    getAvailableStock(stock, reservedQty) >= requestedQty

  it('correctly identifies in-stock items', () => {
    expect(isInStock(10, 0)).toBe(true)
    expect(isInStock(1, 0)).toBe(true)
  })

  it('correctly identifies out-of-stock items', () => {
    expect(isInStock(0, 0)).toBe(false)
    expect(isInStock(5, 5)).toBe(false)
  })

  it('calculates available stock after reservation', () => {
    expect(getAvailableStock(10, 3)).toBe(7)
    expect(getAvailableStock(5, 5)).toBe(0)
    expect(getAvailableStock(3, 5)).toBe(0) // never negative
  })

  it('validates if quantity can be fulfilled', () => {
    expect(canFulfillQty(10, 3)).toBe(true)
    expect(canFulfillQty(10, 10)).toBe(true)
    expect(canFulfillQty(10, 11)).toBe(false)
  })
})

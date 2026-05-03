// Test utility functions
describe('Utility Functions', () => {
  it('formats currency correctly', () => {
    const formatPrice = (price: number) => `$${price.toFixed(2)}`
    expect(formatPrice(99.99)).toBe('$99.99')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(1234.5)).toBe('$1234.50')
  })

  it('generates slug from name', () => {
    const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    expect(slugify('Classic Oxford Shirt')).toBe('classic-oxford-shirt')
    expect(slugify("Men's Clothing")).toBe('mens-clothing')
  })

  it('truncates long text', () => {
    const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len) + '...' : str
    expect(truncate('Hello World', 5)).toBe('Hello...')
    expect(truncate('Hi', 5)).toBe('Hi')
  })
})

describe('Authentication Logic', () => {
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPassword = (password: string) => password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  const isAdmin = (role: string) => role === 'ADMIN'
  const isCustomer = (role: string) => role === 'CUSTOMER'

  it('validates email format', () => {
    expect(isValidEmail('admin@togor.com')).toBe(true)
    expect(isValidEmail('customer@togor.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('@nouser.com')).toBe(false)
    expect(isValidEmail('noatsign.com')).toBe(false)
  })

  it('validates password strength', () => {
    expect(isValidPassword('Admin@123')).toBe(true)
    expect(isValidPassword('short')).toBe(false) // too short
    expect(isValidPassword('alllowercase1')).toBe(false) // no uppercase
    expect(isValidPassword('NOLOWERCASE1')).toBe(true) // uppercase + number is fine
  })

  it('correctly identifies admin role', () => {
    expect(isAdmin('ADMIN')).toBe(true)
    expect(isAdmin('CUSTOMER')).toBe(false)
  })

  it('correctly identifies customer role', () => {
    expect(isCustomer('CUSTOMER')).toBe(true)
    expect(isCustomer('ADMIN')).toBe(false)
  })
})

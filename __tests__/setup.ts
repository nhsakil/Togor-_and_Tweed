// Global test setup
process.env.DATABASE_URL = 'mysql://root:@localhost:3306/togor_tweed_test'
process.env.NEXTAUTH_SECRET = 'test-secret-32chars-minimum-length!!'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

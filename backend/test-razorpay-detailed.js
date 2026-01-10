// Detailed Razorpay test
const Razorpay = require('razorpay')

console.log('Testing Razorpay Authentication...\n')

// Test with the keys
const keyId = 'rzp_live_RqAs29en0wWF99'
const keySecret = 'dEX6oOrl9e0a3bKX93Gr8AQ4'

console.log('Key ID:', keyId)
console.log('Key Secret (first 10 chars):', keySecret.substring(0, 10))
console.log('Key Secret length:', keySecret.length)
console.log('\nAttempting to create Razorpay instance...')

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
})

console.log('Razorpay instance created successfully')
console.log('\nAttempting to create a test order...\n')

razorpay.orders
  .create({
    amount: 100,
    currency: 'INR',
    receipt: 'test_' + Date.now(),
  })
  .then((order) => {
    console.log('✅ SUCCESS! Razorpay is working correctly')
    console.log('\nOrder Details:')
    console.log('- Order ID:', order.id)
    console.log('- Amount:', order.amount / 100, 'INR')
    console.log('- Status:', order.status)
    process.exit(0)
  })
  .catch((error) => {
    console.log('❌ FAILED! Authentication Error\n')
    console.log('Error Details:')
    console.log('- Status Code:', error.statusCode)
    console.log('- Error Code:', error.error?.code)
    console.log('- Description:', error.error?.description)
    console.log('\n📋 Possible reasons:')
    console.log('1. Keys belong to a different Razorpay account')
    console.log('2. Keys are expired or regenerated')
    console.log('3. Account not activated for live mode')
    console.log('4. IP/domain restrictions on the keys')
    console.log(
      '\n💡 Solution: Login to YOUR Razorpay dashboard for QuietSummit and get fresh keys'
    )
    process.exit(1)
  })

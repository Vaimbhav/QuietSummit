// Test Razorpay connection
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
  key_id: 'rzp_live_RqAs29en0wWF99',
  key_secret: 'dEX6oOr19e0a3bKX93Gr8AOd',
})

// Test creating an order
razorpay.orders
  .create({
    amount: 100, // 1 rupee in paise
    currency: 'INR',
    receipt: 'test_receipt_' + Date.now(),
    notes: {
      test: 'Testing Razorpay connection',
    },
  })
  .then((order) => {
    console.log('✅ Razorpay connection successful!')
    console.log('Order created:', order)
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Razorpay error:')
    console.error('Status Code:', error.statusCode)
    console.error('Error:', error.error)
    process.exit(1)
  })

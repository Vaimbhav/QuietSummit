// Test if environment config is loading correctly
require('dotenv').config()

console.log('Environment variables check:')
console.log('================================')
console.log('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID)
console.log('RAZORPAY_KEY_ID length:', process.env.RAZORPAY_KEY_ID?.length || 0)
console.log('RAZORPAY_KEY_ID value:', process.env.RAZORPAY_KEY_ID || 'NOT SET')
console.log('RAZORPAY_KEY_ID (with quotes):', JSON.stringify(process.env.RAZORPAY_KEY_ID))
console.log('')
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET)
console.log('RAZORPAY_KEY_SECRET length:', process.env.RAZORPAY_KEY_SECRET?.length || 0)
console.log(
  'RAZORPAY_KEY_SECRET (first 10 chars):',
  process.env.RAZORPAY_KEY_SECRET?.substring(0, 10) || 'NOT SET'
)
console.log(
  'RAZORPAY_KEY_SECRET (with quotes):',
  JSON.stringify(process.env.RAZORPAY_KEY_SECRET?.substring(0, 10))
)
console.log('================================')

// Check for whitespace issues
if (process.env.RAZORPAY_KEY_ID) {
  const trimmed = process.env.RAZORPAY_KEY_ID.trim()
  if (trimmed !== process.env.RAZORPAY_KEY_ID) {
    console.log('⚠️  WARNING: RAZORPAY_KEY_ID has whitespace!')
    console.log('Original length:', process.env.RAZORPAY_KEY_ID.length)
    console.log('Trimmed length:', trimmed.length)
  }
}

if (process.env.RAZORPAY_KEY_SECRET) {
  const trimmed = process.env.RAZORPAY_KEY_SECRET.trim()
  if (trimmed !== process.env.RAZORPAY_KEY_SECRET) {
    console.log('⚠️  WARNING: RAZORPAY_KEY_SECRET has whitespace!')
    console.log('Original length:', process.env.RAZORPAY_KEY_SECRET.length)
    console.log('Trimmed length:', trimmed.length)
  }
}

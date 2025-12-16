import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  const email = 'recruiter@anthropic.com'
  const password = 'rendus2024'
  const name = 'Anthropic Recruiter'

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    // Update the password if user exists
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        name,
        credits: 100, // Give them plenty of credits
      },
    })
    console.log(`Updated existing user: ${email}`)
  } else {
    // Create new user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        credits: 100, // Give them plenty of credits
      },
    })
    console.log(`Created new user: ${email}`)
  }

  console.log('\n=== Test User Credentials ===')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('=============================\n')

  await prisma.$disconnect()
}

createTestUser().catch((e) => {
  console.error(e)
  process.exit(1)
})

import { Suspense } from 'react'
import LoginPage from '@/components/login'

function LoginPageWrapper() {
  return <LoginPage />
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginPageWrapper />
    </Suspense>
  )
}

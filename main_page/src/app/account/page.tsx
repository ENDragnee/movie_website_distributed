import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account',
}

export default function Page() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-4 text-muted-foreground">This is a placeholder account page.</p>
    </main>
  )
}

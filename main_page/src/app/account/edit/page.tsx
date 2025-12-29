import React from 'react';
import { getSession } from '@/lib/auth';
import EditProfileForm from '@/components/account/EditProfileForm';

export default async function Page() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit profile</h1>
      <EditProfileForm initialName={user?.name ?? ''} initialImage={user?.image ?? ''} />
    </main>
  );
}

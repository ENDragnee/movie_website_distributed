'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSession } from '@/store/slices/auth-slice';

// 1. Define Types to fix 'Unexpected any'
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface SessionData {
  user: User;
  session?: {
    id: string;
    expiresAt: Date;
  };
}

export default function SessionSyncer({ session }: { session: SessionData | null }) {
  const dispatch = useDispatch();

  // 2. Use useEffect to handle side effects (dispatching to store)
  useEffect(() => {
    // Sync the server-provided session to the Redux Client Store
    dispatch(setSession(session?.user || null));
  }, [dispatch, session]);

  return null;
}

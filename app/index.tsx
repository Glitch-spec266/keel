import { Redirect } from 'expo-router';
import React from 'react';
import { useSession } from '@/state/useSession';

export default function Index() {
  const session = useSession((s) => s.session);
  if (!session) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={session.role === 'org' ? '/(org)' : '/(teen)'} />;
}

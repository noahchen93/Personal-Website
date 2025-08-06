import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
};

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  
  return {
    id: session.user.id,
    email: session.user.email!,
    user_metadata: session.user.user_metadata
  };
}

export async function getAccessToken(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session.access_token;
}
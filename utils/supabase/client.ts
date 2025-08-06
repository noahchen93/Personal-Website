import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey, defaultConfig } from './info';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, publicAnonKey, defaultConfig);

// Helper function to get the current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { session } = await getCurrentSession();
  return !!session;
};

// Export the client as default
export default supabase;
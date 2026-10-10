import { useContext } from 'react';
import { AuthContext } from './AuthContextValue';
import type { AuthContextValue } from './AuthContextValue';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
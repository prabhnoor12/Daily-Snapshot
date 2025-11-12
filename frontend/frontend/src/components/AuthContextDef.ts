import { createContext } from 'react';

export interface AuthUser {
  id: string;
  shopId: string;
  accessToken: string;
  email?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

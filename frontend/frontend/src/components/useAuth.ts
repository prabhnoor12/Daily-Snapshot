import { useContext } from 'react';
import { AuthContext } from './AuthContextDef';

/**
 * useAuth hook to access authentication context.
 * Throws a helpful error if used outside AuthProvider.
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider.\n' +
      'Make sure your component tree is wrapped in <AuthProvider>.'
    );
  }
  return context;
};

export default useAuth;

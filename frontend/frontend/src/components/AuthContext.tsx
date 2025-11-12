import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/authApi';
import { AuthContext } from './AuthContextDef';
import type { AuthUser } from './AuthContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				const response = await getCurrentUser();
				const data = response.data;
				// Check for required fields from backend
				if (data && data.id && data.shopId && data.accessToken) {
					setUser({
						id: data.id,
						shopId: data.shopId,
						accessToken: data.accessToken,
						email: data.email,
					});
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error('Failed to fetch user:', error);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, []);

	const logout = () => {
		setUser(null);
		window.location.href = '/api/auth/logout'; // Redirect to backend logout
	};

	return (
		<AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, logout }}>
			{children}
		</AuthContext.Provider>
	);
};




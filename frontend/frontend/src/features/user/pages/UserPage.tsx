
import React from 'react';
import User from '../components/User';
import '../../mobileResponsive.css';

const UserPage: React.FC = () => {
	return (
		<div className="user-page-root">
			<User />
		</div>
	);
};

export default UserPage;

import React from 'react';
import '../../mobileResponsive.css'
import '../components/profile.css';
import '../components/notification.css';
import '../components/apperance.css';
import Profile from '../components/Profile';
import Notification from '../components/Notification';
import Appearnce from '../components/Appearnce';

const SettingPage: React.FC = () => {
	return (
		<div className="settings-page">
			<Appearnce />
			<Profile />
			<Notification />
		</div>
	);
};

export { SettingPage };

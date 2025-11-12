import React, { useState, useEffect } from 'react';
import { getSettingByKey } from '../../../api/settingApi';
import {updateSetting} from "../../../api/settingApi";
import {deleteSetting} from "../../../api/settingApi";
import "./profile.css";
import "../../mobileResponsive.css";
interface UserProfileSettings {
	allowFriendRequests: boolean;
	showActivityStatus: boolean;
	profileVisibility: 'public' | 'private' | 'friends';
}

const defaultProfile: UserProfileSettings = {
	allowFriendRequests: true,
	showActivityStatus: true,
	profileVisibility: 'public',
};


const Profile: React.FC = () => {
	const [profile, setProfile] = useState<UserProfileSettings>(defaultProfile);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await getSettingByKey('user-profile');
				if (res.data && res.data.value) {
					setProfile({
						...defaultProfile,
						...JSON.parse(res.data.value)
					});
				}
					} catch {
						// Handle error (optional)
					} finally {
				setLoading(false);
			}
		};
		fetchProfile();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, type, value } = e.target;
		let newValue: boolean | string;
		if (type === 'checkbox') {
			newValue = (e.target as HTMLInputElement).checked;
		} else {
			newValue = value;
		}
		setProfile((prev) => ({
			...prev,
			[name]: newValue,
		}));
	};

	if (loading) return <div>Loading...</div>;

		const handleUpdate = async () => {
			await updateSetting('user-profile', { value: JSON.stringify(profile) });
			// Optionally show a success message
		};

		const handleDelete = async () => {
			await deleteSetting('user-profile');
			setProfile(defaultProfile);
			// Optionally show a success message
		};

		return (
			<div className="profile-settings">
				<h2>User Profile Settings</h2>
				<form>
					<label>
						<input
							type="checkbox"
							name="allowFriendRequests"
							checked={profile.allowFriendRequests}
							onChange={handleChange}
						/>
						Allow Friend Requests
					</label>
					<br />
					<label>
						<input
							type="checkbox"
							name="showActivityStatus"
							checked={profile.showActivityStatus}
							onChange={handleChange}
						/>
						Show Activity Status
					</label>
					<br />
					<label>
						Profile Visibility:
						<select
							name="profileVisibility"
							value={profile.profileVisibility}
							onChange={handleChange}
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
							<option value="friends">Friends Only</option>
						</select>
					</label>
					<br />
				<button type="button" onClick={handleUpdate}>Update</button>
				<button type="button" onClick={handleDelete} className="delete-btn">Delete</button>
				</form>
			</div>
		);
};

export default Profile;

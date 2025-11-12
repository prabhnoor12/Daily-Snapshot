import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = '/api/settings/appearance'; // Adjust to your backend endpoint

const Language: React.FC = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLanguage() {
      try {
        const response = await axios.get(API_URL);
        const userLang = response.data.language || 'en';
        i18n.changeLanguage(userLang);
        setLoading(false);
      } catch {
        setError('Failed to fetch language');
        setLoading(false);
      }
    }
    fetchLanguage();
  }, [i18n]);

  if (loading) return <div>Loading language...</div>;
  if (error) return <div>{error}</div>;

  return null; // This component only sets language, no UI
};

export default Language;

import { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

type Lang = 'en' | 'sw';

const translations = {
  en: {
    home: 'Home', animals: 'Animals', register: 'Register', map: 'Map', profile: 'Profile',
    analytics: 'Analytics', vaccinations: 'Vaccinations', export: 'Export',
    search: 'Search', filter: 'Filter', refresh: 'Refresh',
    totalAnimals: 'Total Animals', healthy: 'Healthy', sick: 'Sick',
    treatment: 'Treatment', recovered: 'Recovered', counties: 'Counties',
    herdOverview: 'Herd overview', recentAnimals: 'Recent animals',
    noAnimals: 'No animals match your filters.',
    loading: 'Loading...', offline: "You're offline",
    signOut: 'Sign Out', saveChanges: 'Save Changes',
    darkMode: 'Dark Mode', lightMode: 'Light Mode',
    syncNow: 'Sync Now', lastSynced: 'Last synced',
    allSynced: 'All synced', pending: 'pending',
    addVaccination: 'Add Vaccination', noRecords: 'No vaccination records yet', noData: 'No data available yet',
    loadingAnimals: 'Loading vaccinations...', registerHint: 'Register animals to see analytics here.',
    delete: 'Delete', cancel: 'Cancel', confirm: 'Confirm',
   Healthy: 'Healthy', Sick: 'Sick', 'Under Treatment': 'Under Treatment', Recovered: 'Recovered',
    Cattle: 'Cattle', Goat: 'Goat', Sheep: 'Sheep', Camel: 'Camel', Pig: 'Pig', Chicken: 'Chicken',
    diseases: 'Diseases', predict: 'Predict Risk', predicting: 'Predicting...',
    riskAssessment: 'Risk Assessment', selectCounty: 'Select county',
    noDataAvailable: 'No risk data available', lastCalculated: 'Last calculated',
    critical: 'critical', high: 'high', medium: 'medium', low: 'low',
    reminders: 'Reminders', farmerDashboard: 'My Farm', animalQR: 'QR Codes',
    upcomingReminders: 'Upcoming Reminders', noReminders: 'No upcoming reminders',
    days: 'days', today: 'Today', tomorrow: 'Tomorrow', vet: 'Vet', batch: 'Batch',
    voiceInput: 'Voice Input', startVoice: 'Tap to speak', stopRecording: 'Stop',
    healthAssessment: 'Health Assessment', photoAssessment: 'Photo Assessment',
    uploadPhoto: 'Upload Photo', assessing: 'Analyzing...', assessHealth: 'Assess Health',
  },
  sw: {
    home: 'Nyumbani', animals: 'Wanyama', register: 'Usajili', map: 'Ramani', profile: 'Wasifu',
    analytics: 'Uchambuzi', vaccinations: 'Chanjo', export: 'Hamisha',
    search: 'Tafuta', filter: 'Chuja', refresh: 'Sasisha',
    totalAnimals: 'Wanyama Wote', healthy: 'Wazima', sick: 'Wauguzi',
    treatment: 'Matibabu', recovered: 'Wamepona', counties: 'Kaunti',
    herdOverview: 'Muhtasari wa kundi', recentAnimals: 'Wanyama wa hivi karibuni',
    noAnimals: 'Hakuna wanyama wanaolingana na vichujio vyako.',
    loading: 'Inapakia...', offline: 'Huna mtandao',
    signOut: 'Ondoka', saveChanges: 'Hifadhi Mabadiliko',
    darkMode: 'Hali ya Giza', lightMode: 'Hali ya Mwangaza',
    syncNow: 'Sasisha Sasa', lastSynced: 'Imesasishwa mara ya mwisho',
    allSynced: 'Yote yamesasishwa', pending: 'inasubiri',
    addVaccination: 'Ongeza Chanjo', noRecords: 'Hakuna rekodi za chanjo bado', noData: 'Hakuna data bado',
    loadingAnimals: 'Inapakia chanjo...', registerHint: 'Usajili wanyama kuona uchambuzi hapa.',
    delete: 'Futa', cancel: 'Ghairi', confirm: 'Thibitisha',
    Healthy: 'Wazima', Sick: 'Wauguzi', 'Under Treatment': 'Wakati wa Matibabu', Recovered: 'Wamepona',
    Cattle: "Ng'ombe", Goat: 'Mbuzi', Sheep: 'Kondoo', Camel: 'Ngamia', Pig: 'Nguruwe', Chicken: 'Kuku',
    diseases: 'Magonjwa', predict: 'Tabiri Hatari', predicting: 'Inatabiri...',
    riskAssessment: 'Tathmini ya Hatari', selectCounty: 'Chagua kaunti',
    noDataAvailable: 'Hakuna data ya hatari', lastCalculated: 'Ilhesabwa mwisho',
    critical: 'hatari sana', high: 'juu', medium: 'wastani', low: 'chini',
    reminders: 'Ukumbusho', farmerDashboard: 'Shamba Langu', animalQR: 'Msimbo QR',
    upcomingReminders: 'Ukumbusho Ujao', noReminders: 'Hakuna ukumbusho ujao',
    days: 'siku', today: 'Leo', tomorrow: 'Kesho', vet: 'Daktari', batch: 'Kundi',
    voiceInput: 'Uingizaji wa Sauti', startVoice: 'Gusa kuzungumza', stopRecording: 'Simamisha',
    healthAssessment: 'Tathmini ya Afya', photoAssessment: 'Tathmini ya Picha',
    uploadPhoto: 'Pakia Picha', assessing: 'Inachambua...', assessHealth: 'Tathmini Afya',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem('app-lang').then((v) => {
      if (v === 'en' || v === 'sw') setLangState(v);
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('app-lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

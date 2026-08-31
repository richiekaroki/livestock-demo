import { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

type Lang = 'en' | 'sw';

const translations = {
  en: {
    // Navigation
    home: 'Home', animals: 'Animals', register: 'Register', map: 'Map', profile: 'Profile',
    analytics: 'Analytics', vaccinations: 'Vaccinations', outbreaks: 'Outbreaks',
    diseases: 'Diseases', export: 'Export', more: 'More',
    search: 'Search', filter: 'Filter', refresh: 'Refresh',
    delete: 'Delete', cancel: 'Cancel', confirm: 'Confirm', save: 'Save',
    loading: 'Loading...', offline: "You're offline",
    signOut: 'Sign Out', signIn: 'Sign In', saveChanges: 'Save Changes',
    darkMode: 'Dark Mode', lightMode: 'Light Mode',
    syncNow: 'Sync Now', lastSynced: 'Last synced',
    allSynced: 'All synced', pending: 'pending',

    // Animal types
    Cattle: 'Cattle', Goat: 'Goat', Sheep: 'Sheep', Camel: 'Camel', Pig: 'Pig', Chicken: 'Chicken',
    cattle: 'Cattle', goat: 'Goat', sheep: 'Sheep', camel: 'Camel', pig: 'Pig', chicken: 'Chicken',

    // Health statuses
    Healthy: 'Healthy', Sick: 'Sick', 'Under Treatment': 'Under Treatment', Recovered: 'Recovered',
    healthy: 'Healthy', sick: 'Sick', underTreatment: 'Under Treatment', recovered: 'Recovered',

    // Home screen
    totalAnimals: 'Total Animals', herdOverview: 'Herd overview',
    recentAnimals: 'Recent animals', noAnimals: 'No animals match your filters.',
    addFirstAnimal: 'Get started by registering your first animal.',
    total: 'Total', healthyRate: 'Healthy Rate',
    exportCsv: 'Export CSV', exportJson: 'Export JSON', ofType: 'of',

    // Registration
    registerAnimal: 'Register Animal', name: 'Name', type: 'Type',
    county: 'County', owner: 'Owner', farmerOptional: 'Farmer (optional)',
    captureBiometrics: 'Capture biometrics', biometricCaptured: 'Biometric captured',
    recapture: 'recapture?', grantPermission: 'Grant permission',
    capture: 'Capture', registerBtn: 'Register animal',
    loadingCamera: 'Loading camera...', ownerPlaceholder: 'Owner name',
    namePlaceholder: 'e.g. Shujaa', registrationQueued: 'Saved. Will sync when you\'re back online.',
    registrationFailed: 'Registration failed. Please try again.',

    // Animals list
    noAnimalsRegistered: 'No animals registered yet.', allTypes: 'All Types',
    allHealth: 'All Health', allCounties: 'All Counties',
    deletionQueued: 'Deleted. Will sync when you\'re back online.',

    // Analytics
    analyticsTitle: 'Analytics', healthStatus: 'Health Status',
    byAnimalType: 'By Animal Type', byCounty: 'By County (Top 10)',
    vaccinationCoverage: 'Vaccination Coverage', counties: 'Counties',
    registerHint: 'Register animals to see analytics here.',

    // Vaccinations
    vaccinationRecords: 'Vaccination Records', animal: 'Animal',
    vaccine: 'Vaccine', date: 'Date', batchNumber: 'Batch Number',
    veterinarian: 'Veterinarian', nextDueDate: 'Next Due Date',
    addVaccination: 'Add Vaccination', editVaccination: 'Edit Vaccination',
    noRecords: 'No vaccination records yet', recordFirst: 'Record First Vaccination',
    loadingVaccinations: 'Loading vaccinations...',
    saveRecord: 'Save Record', updateRecord: 'Update Record',
    vaccinationQueued: 'Saved. Will sync when you\'re back online.',
    vaccinationFailed: 'Failed to save. Please try again.',

    // Outbreaks
    outbreakTitle: 'Outbreaks', reportOutbreak: 'Report Outbreak',
    diseaseType: 'Disease Type', affectedAnimals: 'Affected Animals',
    reportedBy: 'Reported By', symptoms: 'Symptoms',
    actionsTaken: 'Actions Taken', submitReport: 'Submit Report',
    reported: 'Reported', investigating: 'Investigating',
    contained: 'Contained', resolved: 'Resolved',
    noOutbreaks: 'No outbreaks reported', loadingOutbreaks: 'Loading outbreaks...',
    reportQueued: 'Saved. Will sync when you\'re back online.',

    // Map
    noLocations: 'No animal locations available yet.', heatmap: 'Heatmap',
    animalsCount: '{count} of {total} animals',

    // Health alerts
    sickAnimals: 'Sick Animals', diseaseOutbreak: 'Disease Outbreak',
    reportToKalro: 'Report to KALRO',
    sendReport: 'Send Report', dismiss: 'Dismiss',
    restoreCount: 'Restore {count} dismissed',

    // Offline banner
    syncing: 'Syncing...', syncComplete: 'Sync complete',
    changesPending: 'changes pending sync',
    changesFailed: 'changes failed to sync',
    retry: 'Retry',

    // Live indicator
    live: 'Live',

    // Error boundary
    somethingWrong: 'Something went wrong',
    errorOccurred: 'An unexpected error occurred',
    tryAgain: 'Try Again',

    // Profile
    myProfile: 'My Profile', manageAccount: 'Manage your account',
    email: 'Email', emailReadonly: 'Email cannot be changed',
    role: 'Role', roleReadonly: 'Role can only be changed by an admin',
    fullName: 'Full Name', phone: 'Phone', subCounty: 'Sub-County',
    subCountyOptional: 'Optional', phonePlaceholder: '+254700000000',
    language: 'Language',
    profileUpdated: 'Profile updated successfully',
    profileFailed: 'Update failed', saving: 'Saving...',

    // Admin
    admin: 'Admin', userManagement: 'User Management', auditLog: 'Audit Log',
    allEvents: 'All', otpSent: 'OTP Sent', otpVerified: 'OTP Verified',
    otpFailed: 'OTP Failed', loginSuccess: 'Login Success',
    sessionsRevoked: 'Sessions Revoked', tokenRefreshed: 'Token Refreshed',
    system: 'System', events: 'events', noAuditLogs: 'No audit logs found',
    justNow: 'Just now', minutesAgo: 'm ago', hoursAgo: 'h ago', daysAgo: 'd ago',
    adminRole: 'Admin', fieldAgentRole: 'Field Agent', farmerRole: 'Farmer',
    active: 'Active', inactive: 'Inactive', changeRole: 'Change Role',
    changeRoleConfirm: 'Change {name} to {role}?',
    deactivateUser: 'Deactivate User', deactivateUserConfirm: 'Deactivate {name}? They will no longer be able to sign in.',
    deactivate: 'Deactivate', failedToLoadUsers: 'Failed to load users',
    failedToUpdateRole: 'Failed to update role', failedToDeactivateUser: 'Failed to deactivate user',
    noUsersFound: 'No users found', userCount: '{count} users',
    searchPlaceholder: 'Search by name, email, or county...',
    login: 'Login', logout: 'Logout', created: 'Created', updated: 'Updated',
    deactivated: 'Deactivated', revoked: 'Revoked', refreshed: 'Refreshed',
    noEventsMatchFilter: 'No events match filter',
    failedToLoadAuditLogs: 'Failed to load audit logs',
    eventCount: '{count} events',

    // Diseases
    predict: 'Predict Risk', predicting: 'Predicting...',
    riskAssessment: 'Risk Assessment', selectCounty: 'Select county',
    noDataAvailable: 'No risk data available', lastCalculated: 'Last calculated',
    critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
    confidence: 'Confidence',

    // Reminders
    reminders: 'Reminders', farmerDashboard: 'My Farm', animalQR: 'QR Codes',
    upcomingReminders: 'Upcoming Reminders', noReminders: 'No upcoming reminders',
    days: 'days', today: 'Today', tomorrow: 'Tomorrow', vet: 'Vet', batch: 'Batch',
    showNext: 'Show next',

    // Voice
    voiceInput: 'Voice Input', startVoice: 'Tap to speak', stopRecording: 'Stop',

    // Health assessment
    healthAssessment: 'Health Assessment', photoAssessment: 'Photo Assessment',
    uploadPhoto: 'Upload Photo', assessing: 'Analyzing...', assessHealth: 'Assess Health',
    animalPhoto: 'Animal Photo', clickToUpload: 'Click to upload or drag and drop',
    upTo: 'up to 10MB', animalType: 'Animal Type', animalName: 'Animal Name (optional)',
    notesOptional: 'Notes (optional)', observedSymptoms: 'Observed symptoms or concerns...',
    reset: 'Reset', assessmentResult: 'Assessment Result',
    aiAssessment: 'AI powered assessment', findings: 'Findings',
    recommendations: 'Recommendations', uploadToStart: 'Upload a photo and click Assess Health to get started',
    assessmentFailed: 'Assessment failed. Please try again.',
    connectFailed: 'Could not connect. Please try again.',

    // KALRO sync
    kalroSync: 'KALRO Sync', syncToKalro: 'Sync to KALRO',
    lastSync: 'Last sync', never: 'Never', syncCompleteShort: 'Complete',

    // Auth
    invalidOtp: 'Invalid or expired OTP. Please try again.',
    emailPlaceholder: 'you@example.com',
    sendOtp: 'Send OTP',
    noAccount: "Don't have an account?",
    verificationCode: 'Verification Code',
    enterOtpSentTo: 'Enter the 6-digit code sent to',
    verify: 'Verify',
    useDifferentEmail: 'Use a different email',
    registerFailed: 'Registration failed. Please try again.',
    verifyFailed: 'Verification failed. Please try again.',
    createAccount: 'Create Account',
    joinWamMfugo: 'Join Wam Mfugo to manage your livestock',
    alreadyHaveAccount: 'Already have an account?',
    backToForm: 'Back to form',

    // Mortality
    mortality: 'Mortality', mortalityTracking: 'Mortality Tracking',
    reportMortality: 'Report Mortality', reportMortalityTitle: 'Report Animal Mortality',
    cause: 'Cause', selectCause: 'Select cause',
    disease: 'Disease', predation: 'Predation', accident: 'Accident',
    oldAge: 'Old Age', malnutrition: 'Malnutrition', poisoning: 'Poisoning',
    diseaseName: 'Disease Name (optional)', mortalityNotes: 'Notes (optional)',
    submittingReport: 'Submitting...', submitMortalityReport: 'Submit Report',
    last30Days: 'Last 30 Days', topCause: 'Top Cause', mostAffected: 'Most Affected',
    noMortalityRecords: 'No mortality records found.',
    animalIdLabel: 'Animal ID', reportedByMortality: 'Reported by',

    // Weight Gain
    weightGain: 'Weight Gain', weightGainAnalytics: 'Weight Gain Analytics',
    recordWeight: 'Record Weight', recordAnimalWeight: 'Record Animal Weight',
    selectAnimal: 'Select animal', weightKg: 'Weight (kg)', weightNotes: 'Notes (optional)',
    animalsTracked: 'Animals Tracked', avgGain: 'Avg Gain', topPerformer: 'Top Performer',
    byAnimal: 'By Animal', weightRecords: 'records', weightHistory: 'Weight History',
    noWeightData: 'No weight data available.',

    // County Comparison
    countyComparison: 'County Comparison', countyComparisonDesc: 'Compare livestock metrics across counties',
    cTotal: 'Total', cHealthyRate: 'Healthy Rate',
    cVaccinationRate: 'Vaccination Rate', cMortalityRate: 'Mortality Rate',
    cOutbreaks: 'Outbreaks', cAnimals: 'Animals', cHealthy: 'Healthy',
    cVaccinated: 'Vaccinated', cMortality: 'Mortality', cSick: 'Sick',
    noCountyData: 'No county data available. Register animals in different counties.',

    // What-If Simulator
    simulator: 'Simulator', simulatorTitle: 'What-If Simulator',
    simulatorDesc: 'Model the impact of vaccination campaigns and livestock management decisions on disease risk.',
    simCounty: 'County', simSelectCounty: 'Select county',
    simVaccinationIncrease: 'Vaccination Increase', simLivestockReduction: 'Livestock Reduction',
    simRun: 'Run Simulation', simSimulating: 'Simulating...',
    simResults: 'Results', simEmpty: 'No simulation results. Select a county and run a simulation.',
    reduced: 'Reduced',

    // CSV Import
    csvImport: 'CSV Import', csvImportDesc: 'Bulk import animals from a CSV file.',
    expectedFormat: 'Expected Format', required: 'Required', optional: 'Optional',
    selectCsvFile: 'Select CSV file', importing: 'Importing...', importBtn: 'Import',
    animalsImported: 'animals imported', errors: 'Errors',

    // Health Assessment extras
    animalNamePlaceholder: 'e.g. Shujaa',

    // Bulk Operations
    bulkOperations: 'Bulk Operations', bulkSelected: 'selected',
    bAllTypes: 'All Types', bAllHealth: 'All Health',
    selectAll: 'Select All', deselectAll: 'Deselect All',
    bulkHealthUpdate: 'Health Update', bulkDelete: 'Bulk Delete',
    cUnderTreatment: 'Under Treatment',

    // KALRO Report
    kalroReport: 'KALRO Report', countyOptional: 'Optional',
    generateReport: 'Generate Report', reportSummary: 'Report Summary',
    downloadCsv: 'Download CSV',

    // QR Code
    qrCodePage: 'Animal QR Codes',

    // Sessions
    sessions: 'Sessions', revokeAll: 'Revoke All', noSessions: 'No active sessions.',
  },
  sw: {
    // Navigation
    home: 'Nyumbani', animals: 'Wanyama', register: 'Usajili', map: 'Ramani', profile: 'Wasifu',
    analytics: 'Uchambuzi', vaccinations: 'Chanjo', outbreaks: 'Mlipuko',
    diseases: 'Magonjwa', export: 'Hamisha', more: 'Zaidi',
    search: 'Tafuta', filter: 'Chuja', refresh: 'Sasisha',
    delete: 'Futa', cancel: 'Ghairi', confirm: 'Thibitisha', save: 'Hifadhi',
    loading: 'Inapakia...', offline: 'Huna mtandao',
    signOut: 'Ondoka', signIn: 'Ingia', saveChanges: 'Hifadhi Mabadiliko',
    darkMode: 'Hali ya Giza', lightMode: 'Hali ya Mwangaza',
    syncNow: 'Sasisha Sasa', lastSynced: 'Imesasishwa mara ya mwisho',
    allSynced: 'Yote yamesasishwa', pending: 'inasubiri',

    // Animal types
    Cattle: "Ng'ombe", Goat: 'Mbuzi', Sheep: 'Kondoo', Camel: 'Ngamia', Pig: 'Nguruwe', Chicken: 'Kuku',
    cattle: "Ng'ombe", goat: 'Mbuzi', sheep: 'Kondoo', camel: 'Ngamia', pig: 'Nguruwe', chicken: 'Kuku',

    // Health statuses
    Healthy: 'Wazima', Sick: 'Wauguzi', 'Under Treatment': 'Wakati wa Matibabu', Recovered: 'Wamepona',
    healthy: 'Wazima', sick: 'Wauguzi', underTreatment: 'Chini ya Matibabu', recovered: 'Wamepona',

    // Home screen
    totalAnimals: 'Wanyama Wote', herdOverview: 'Muhtasari wa kundi',
    recentAnimals: 'Wanyama wa hivi karibuni', noAnimals: 'Hakuna wanyama wanaolingana na vichujio vyako.',
    addFirstAnimal: 'Anza kwa kusajili mnyama wako wa kwanza.',
    total: 'Jumla', healthyRate: 'Kiwango cha Afya',
    exportCsv: 'Hamisha CSV', exportJson: 'Hamisha JSON', ofType: 'kati ya',

    // Registration
    registerAnimal: 'Usajili Mnyama', name: 'Jina', type: 'Aina',
    county: 'Kaunti', owner: 'Mmiliki', farmerOptional: 'Mfugaji (si lazima)',
    captureBiometrics: 'Nakili sifa', biometricCaptured: 'Sifa zimenakiliwa',
    recapture: 'nakili upya?', grantPermission: 'Ruhusu',
    capture: 'Nakili', registerBtn: 'Usajili mnyama',
    loadingCamera: 'Inapakia kamera...', ownerPlaceholder: 'Jina la mmiliki',
    namePlaceholder: 'mf. Shujaa', registrationQueued: 'Imehifadhiwa. Itasasishwa mtandaoni.',
    registrationFailed: 'Usajili umeshindikana. Tafadhali jaribu tena.',

    // Animals list
    noAnimalsRegistered: 'Hakuna wanyama waliosajiliwa bado.', allTypes: 'Aina Zote',
    allHealth: 'Afya Zote', allCounties: 'Kaunti Zote',
    deletionQueued: 'Imefutwa. Itasasishwa mtandaoni.',

    // Analytics
    analyticsTitle: 'Uchambuzi', healthStatus: 'Hali ya Afya',
    byAnimalType: 'Kwa Aina ya Mnyama', byCounty: 'Kwa Kaunti (10 Bora)',
    vaccinationCoverage: 'Upatikanaji wa Chanjo', counties: 'Kaunti',
    registerHint: 'Usajili wanyama kuona uchambuzi hapa.',

    // Vaccinations
    vaccinationRecords: 'Rekodi za Chanjo', animal: 'Mnyama',
    vaccine: 'Chanjo', date: 'Tarehe', batchNumber: 'Nambari ya Kundi',
    veterinarian: 'Daktari', nextDueDate: 'Tarehe Inayofuata',
    addVaccination: 'Ongeza Chanjo', editVaccination: 'Hariri Chanjo',
    noRecords: 'Hakuna rekodi za chanjo bado', recordFirst: 'Rekodi Chanjo ya Kwanza',
    loadingVaccinations: 'Inapakia chanjo...',
    saveRecord: 'Hifadhi Rekodi', updateRecord: 'Sasisha Rekodi',
    vaccinationQueued: 'Imehifadhiwa. Itasasishwa mtandaoni.',
    vaccinationFailed: 'Imeshindikana kuhifadhi. Tafadhali jaribu tena.',

    // Outbreaks
    outbreakTitle: 'Mlipuko', reportOutbreak: 'Ripoti Mlipuko',
    diseaseType: 'Aina ya Ugonjwa', affectedAnimals: 'Wanyama Waliathiriwa',
    reportedBy: 'Imeripotiwa na', symptoms: 'Dalili',
    actionsTaken: 'Hatua Zilizochukuliwa', submitReport: 'Wasilisha Ripoti',
    reported: 'Imeripotiwa', investigating: 'Inachunguzwa',
    contained: 'Imedhibitiwa', resolved: 'Imetatuliwa',
    noOutbreaks: 'Hakuna mlipuko ulioripotiwa', loadingOutbreaks: 'Inapakia milipuko...',
    reportQueued: 'Imehifadhiwa. Itasasishwa mtandaoni.',

    // Map
    noLocations: 'Hakuna maeneo ya wanyama bado.', heatmap: 'Ramani ya Joto',
    animalsCount: '{count} kati ya {total} wanyama',

    // Health alerts
    sickAnimals: 'Wanyama Wauguzi', diseaseOutbreak: 'Mlipuko wa Ugonjwa',
    reportToKalro: 'Ripoti kwa KALRO',
    sendReport: 'Tuma Ripoti', dismiss: 'Ondoa',
    restoreCount: 'Rejesha {count} zilizoondolewa',

    // Offline banner
    syncing: 'Inasasisha...', syncComplete: 'Usasishaji umekamilika',
    changesPending: 'mabadiliko yansubiri kusasishwa',
    changesFailed: 'mabadiliko yameshindikana kusasishwa',
    retry: 'Jaribu tena',

    // Live indicator
    live: 'Moja kwa moja',

    // Error boundary
    somethingWrong: 'Kuna kitu kimeenda vibaya',
    errorOccurred: 'Hitilafu isiyotarajiwa imetokea',
    tryAgain: 'Jaribu Tena',

    // Profile
    myProfile: 'Wasifu Wangu', manageAccount: 'Simamia akaunti yako',
    email: 'Barua pepe', emailReadonly: 'Barua pepe haiwezi kubadilishwa',
    role: 'Jukumu', roleReadonly: 'Jukumu linaweza kubadilishwa na msimamizi tu',
    fullName: 'Jina Kamili', phone: 'Simu', subCounty: 'Kaunti ndogo',
    subCountyOptional: 'Si lazima', phonePlaceholder: '+254700000000',
    language: 'Lugha',
    profileUpdated: 'Wasifu umesasishwa kwa mafanikio',
    profileFailed: 'Usasishaji umeshindikana', saving: 'Inahifadhi...',

    // Admin
    admin: 'Msimamizi', userManagement: 'Usimamizi wa Watumiaji', auditLog: 'Kumbukumbu za Ukaguzi',
    allEvents: 'Yote', otpSent: 'OTP Imetumwa', otpVerified: 'OTP Imethibitishwa',
    otpFailed: 'OTP Imeshindikana', loginSuccess: 'Umeingia',
    sessionsRevoked: 'Vipindi Vimeghairiwa', tokenRefreshed: 'Kifuo Kimesasishwa',
    system: 'Mfumo', events: 'matukio', noAuditLogs: 'Hakuna kumbukumbu za ukaguzi',
    justNow: 'Sasa hivi', minutesAgo: 'dak zilizopita', hoursAgo: 'saa zilizopita', daysAgo: 'siku zilizopita',
    adminRole: 'Msimamizi', fieldAgentRole: 'Wakala wa Shamba', farmerRole: 'Mfugaji',
    active: 'Hai', inactive: 'Haijawahi', changeRole: 'Badilisha Jukumu',
    changeRoleConfirm: 'Badilisha {name} kuwa {role}?',
    deactivateUser: 'Kuzima Mtumiaji', deactivateUserConfirm: 'Kuzima {name}? Hawataweza tena kuingia.',
    deactivate: 'Kuzima', failedToLoadUsers: 'Imeshindikana kupata watumiaji',
    failedToUpdateRole: 'Imeshindikana kubadilisha jukumu', failedToDeactivateUser: 'Imeshindikana kuzima mtumiaji',
    noUsersFound: 'Hakuna watumiaji waliopatikana', userCount: 'watumiaji {count}',
    searchPlaceholder: 'Tafuta kwa jina, barua pepe, au kaunti...',
    login: 'Umeingia', logout: 'Umetoka', created: 'Imeundwa', updated: 'Imesasishwa',
    deactivated: 'Imezimwa', revoked: 'Imeondolewa', refreshed: 'Imesasishwa',
    noEventsMatchFilter: 'Hakuna matukio yanayolingana na kichujio',
    failedToLoadAuditLogs: 'Imeshindikana kupata kumbukumbu za ukaguzi',
    eventCount: 'matukio {count}',

    // Diseases
    predict: 'Tabiri Hatari', predicting: 'Inatabiri...',
    riskAssessment: 'Tathmini ya Hatari', selectCounty: 'Chagua kaunti',
    noDataAvailable: 'Hakuna data ya hatari', lastCalculated: 'Ilhesabwa mwisho',
    critical: 'Hatari Sana', high: 'Juu', medium: 'Wastani', low: 'Chini',
    confidence: 'Uthabiti',

    // Reminders
    reminders: 'Ukumbusho', farmerDashboard: 'Shamba Langu', animalQR: 'Msimbo QR',
    upcomingReminders: 'Ukumbusho Ujao', noReminders: 'Hakuna ukumbusho ujao',
    days: 'siku', today: 'Leo', tomorrow: 'Kesho', vet: 'Daktari', batch: 'Kundi',
    showNext: 'Onyesha',

    // Voice
    voiceInput: 'Uingizaji wa Sauti', startVoice: 'Gusa kuzungumza', stopRecording: 'Simamisha',

    // Health assessment
    healthAssessment: 'Tathmini ya Afya', photoAssessment: 'Tathmini ya Picha',
    uploadPhoto: 'Pakia Picha', assessing: 'Inachambua...', assessHealth: 'Tathmini Afya',
    animalPhoto: 'Picha ya Mnyama', clickToUpload: 'Gusa kupakia au buruta na kuachilia',
    upTo: 'hadi 10MB', animalType: 'Aina ya Mnyama', animalName: 'Jina la Mnyama (si lazima)',
    notesOptional: 'Maelezo (si lazima)', observedSymptoms: 'Dalili zilizoungwa mkono...',
    reset: 'Weka upya', assessmentResult: 'Matokeo ya Tathmini',
    aiAssessment: 'Tathmini ya AI', findings: 'Matokeo',
    recommendations: 'Mapendekezo', uploadToStart: 'Pakia picha na ubofye Tathmini Afya kuanza',
    assessmentFailed: 'Tathmini imeshindikana. Tafadhali jaribu tena.',
    connectFailed: 'Imeshindikana kuungana. Tafadhali jaribu tena.',

    // KALRO sync
    kalroSync: 'Usasishaji wa KALRO', syncToKalro: 'Sasisha KALRO',
    lastSync: 'Usasishaji wa mwisho', never: 'Kamwe', syncCompleteShort: 'Umekamilika',

    // Auth
    invalidOtp: 'OTP batili au imeisha. Tafadhali jaribu tena.',
    emailPlaceholder: 'wewe@mfano.com',
    sendOtp: 'Tuma OTP',
    noAccount: 'Huna akaunti?',
    verificationCode: 'Nambari ya Uthibitisho',
    enterOtpSentTo: 'Weka nambari ya tarifa 6 iliyotumwa kwa',
    verify: 'Thibitisha',
    useDifferentEmail: 'Tumia barua pepe tofauti',
    registerFailed: 'Usajili umeshindikana. Tafadhali jaribu tena.',
    verifyFailed: 'Uthibitishaji umeshindikana. Tafadhali jaribu tena.',
    createAccount: 'Fungua Akaunti',
    joinWamMfugo: 'Jiunge na Wam Mfugo kusimamia mifugo yako',
    alreadyHaveAccount: 'Tayari una akaunti?',
    backToForm: 'Rudi kwenye fomu',

    // Mortality
    mortality: 'Vifo', mortalityTracking: 'Ufuatiliaji wa Vifo',
    reportMortality: 'Ripoti Kifo', reportMortalityTitle: 'Ripoti Kifo cha Mnyama',
    cause: 'Sababu', selectCause: 'Chagua sababu',
    disease: 'Ugonjwa', predation: 'Uwindaji', accident: 'Ajali',
    oldAge: 'Umri mkubwa', malnutrition: 'Utapiamlo', poisoning: 'Uchingizaji',
    diseaseName: 'Jina la Ugonjwa (si lazima)', mortalityNotes: 'Maelezo (si lazima)',
    submittingReport: 'Inawasilisha...', submitMortalityReport: 'Wasilisha Ripoti',
    last30Days: 'Siku 30 Zilizopita', topCause: 'Sababu Kuu', mostAffected: 'Zilizoathiriwa Zaidi',
    noMortalityRecords: 'Hakuna rekodi za vifo.',
    animalIdLabel: 'Nambari ya Mnyama', reportedByMortality: 'Imeripotiwa na',

    // Weight Gain
    weightGain: 'Ongezeko la Uzito', weightGainAnalytics: 'Uchambuzi wa Ongezeko la Uzito',
    recordWeight: 'Rekodi Uzito', recordAnimalWeight: 'Rekodi Uzito wa Mnyama',
    selectAnimal: 'Chagua mnyama', weightKg: 'Uzito (kg)', weightNotes: 'Maelezo (si lazima)',
    animalsTracked: 'Wanyama Waliofuatiliwa', avgGain: 'Wastani wa Ongezeko', topPerformer: 'Bora Zaidi',
    byAnimal: 'Kwa Mnyama', weightRecords: 'rekodi', weightHistory: 'Historia ya Uzito',
    noWeightData: 'Hakuna data ya uzito.',

    // County Comparison
    countyComparison: 'Ulinganishaji wa Kaunti', countyComparisonDesc: 'Linganisha viwango vya mifugo kati ya kaunti',
    cTotal: 'Jumla', cHealthyRate: 'Kiwango cha Afya',
    cVaccinationRate: 'Kiwango chanjo', cMortalityRate: 'Kiwango cha vifo',
    cOutbreaks: 'Mlipuko', cAnimals: 'Wanyama', cHealthy: 'Wenye afya',
    cVaccinated: 'Waliopewa chanjo', cMortality: 'Vifo', cSick: 'Wagonjwa',
    noCountyData: 'Hakuna data ya kaunti. Jisajili wanyama katika kaunti tofauti.',

    // What-If Simulator
    simulator: 'Kigunduzi', simulatorTitle: 'Kigunduzi cha Nini Kama',
    simulatorDesc: 'Unda athari za kampeni za chanjo na uamuzi wa usimamizi wa mifugo kwenye hatari ya ugonjwa.',
    simCounty: 'Kaunti', simSelectCounty: 'Chagua kaunti',
    simVaccinationIncrease: 'Ongezeko la Chanjo', simLivestockReduction: 'Kupungua kwa Mifugo',
    simRun: 'Endesha Uthabiti', simSimulating: 'Inaendesha...',
    simResults: 'Matokeo', simEmpty: 'Hakuna matokeo. Chagua kaunti na endesha uthabiti.',
    reduced: 'Imepungua',

    // CSV Import
    csvImport: 'Kuagiza CSV', csvImportDesc: 'Ingiza wanyama kwa wingi kutoka faili la CSV.',
    expectedFormat: 'Muundo Unaotarajiwa', required: 'Lazima', optional: 'Si lazima',
    selectCsvFile: 'Chagua faili la CSV', importing: 'Inaagiza...', importBtn: 'Agiza',
    animalsImported: 'wanyama wameagizwa', errors: 'Hitilafu',

    // Health Assessment extras
    animalNamePlaceholder: 'mfano. Shujaa',

    // Bulk Operations
    bulkOperations: 'Operesheni za Wingi', bulkSelected: 'zilizochaguliwa',
    bAllTypes: 'Aina Zote', bAllHealth: 'Afya Zote',
    selectAll: 'Chagua Zote', deselectAll: 'Ondoa Uchaguzi',
    bulkHealthUpdate: 'Sasisha Afya', bulkDelete: 'Futa kwa Wingi',
    cUnderTreatment: 'Chini ya Matibabu',

    // KALRO Report
    kalroReport: 'Ripoti ya KALRO', countyOptional: 'Si lazima',
    generateReport: 'Tengeneza Ripoti', reportSummary: 'Muhtasari wa Ripoti',
    downloadCsv: 'Pakua CSV',

    // QR Code
    qrCodePage: 'Msimbo QR wa Wanyama',

    // Sessions
    sessions: 'Vikao', revokeAll: 'Batilisha Vyote', noSessions: 'Hakuna vikao hai.',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
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

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let text: string = translations[lang][key] || translations.en[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

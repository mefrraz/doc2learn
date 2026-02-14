import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import ptPT from './locales/pt-PT.json'

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flag: 'PT' },
] as const

export type LanguageCode = typeof supportedLanguages[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'pt-PT': { translation: ptPT },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages.map(l => l.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n
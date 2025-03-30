import { BuildConfig } from "@/build.config";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const initPromise = i18next
  .use(LanguageDetector)
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    debug: !BuildConfig.IS_PRODUCTION,
    lng: "en",
    supportedLngs: ["en", "es"],
    fallbackLng: "en",
    fallbackNS: "translation",
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // Path to load translation files
    },
  });

export { initPromise };
export default i18next;

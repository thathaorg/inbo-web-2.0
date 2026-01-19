module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'zh', 'hi', 'bn', 'ar', 'fr', 'pt', 'ru', 'ja'],
    localeDetection: true,
  },
  fallbackLng: {
    default: ['en'],
  },
  react: {
    useSuspense: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

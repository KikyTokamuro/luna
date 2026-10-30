import { I18n } from 'i18n-js';
import ru from './locales/ru.json';
import en from './locales/en.json';

const i18n = new I18n(
  {
    ru,
    en,
  },
  {
    locale: 'ru',
    defaultLocale: 'ru',
    enableFallback: true,
  },
);

export let language = 'ru';

export const setLanguage = value => {
  language = value === 'en' ? 'en' : 'ru';
  i18n.locale = language;
};

export const locale = () => (language === 'en' ? 'en-US' : 'ru-RU');

export const t = (key, options = {}) =>
  i18n.t(key, options);

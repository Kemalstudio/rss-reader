'use client';

import { useEffect } from 'react';
import { isLocale } from '@/lib/i18n';

export function ThemeInit() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('frontpage-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const savedLocale = localStorage.getItem('frontpage-locale');
    if (isLocale(savedLocale)) {
      document.documentElement.lang = savedLocale;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  return null;
}

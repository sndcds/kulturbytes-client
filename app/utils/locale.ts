export function ogLocale(locale: string | null | undefined): string {
    const locales: Record<string, string> = {
        de: 'de_DE',
        da: 'da_DK',
        en: 'en_US'
    }

    return locales[locale ?? ''] ?? 'de_DE'
}
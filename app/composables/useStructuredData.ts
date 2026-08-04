export const useStructuredData = () => {
    const config = useRuntimeConfig()
    const { t, locale } = useI18n()

    const siteUrl = config.public.siteUrl

    // TODO: Edit data for DatenSindDaten e. V.

    return {
        organization: {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            "name": "DatenSindDaten e. V.",
            "url": siteUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/images/kulturbytes-logo-typo-2-lines.svg`
            }
        },

        website: {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            "name": t('siteName'),
            "url": siteUrl,
            "inLanguage": locale.value,
            "publisher": {
                "@id": `${siteUrl}/#organization`
            }
        }
    }
}
// TODO: define this as a complete list in a external file!
const nativeCountryNames: Record<string, string> = {
    DEU: 'Deutschland',
    DNK: 'Danmark',
    GBR: 'United Kingdom',
    USA: 'United States',
    AUT: 'Österreich',
    CHE: 'Schweiz',
    SWE: 'Sverige',
    NOR: 'Norge',
    FIN: 'Suomi',
    NLD: 'Nederland',
    BEL: 'België',
    FRA: 'France',
    ESP: 'España',
    ITA: 'Italia',
    POL: 'Polska'
}

export function useCountryName() {
    function countryName(iso3: string | null | undefined): string | null {
        if (!iso3) {
            return null
        }
        const normalizedCode = iso3.toUpperCase()
        return nativeCountryNames[normalizedCode] ?? normalizedCode
    }

    return {
        countryName
    }
}
export interface Country {
  code: string
  name: string
  dial: string
  flag: string
}

export const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', dial: '55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', dial: '1', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷' },
  { code: 'UY', name: 'Uruguai', dial: '598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', dial: '595', flag: '🇵🇾' },
  { code: 'CL', name: 'Chile', dial: '56', flag: '🇨🇱' },
  { code: 'ES', name: 'Espanha', dial: '34', flag: '🇪🇸' },
]

export const DEFAULT_COUNTRY = COUNTRIES[0]

export function formatNationalNumber(digits: string, countryCode: string): string {
  const cleanDigits = digits.replace(/\D/g, '')

  if (countryCode === 'BR') {
    const ddd = cleanDigits.slice(0, 2)
    const rest = cleanDigits.slice(2, 11)

    if (cleanDigits.length <= 2) return ddd
    if (rest.length <= 4) return `(${ddd}) ${rest}`
    if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`
  }

  return cleanDigits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

export function findCountryByCode(code: string): Country {
  return COUNTRIES.find((country) => country.code === code) ?? DEFAULT_COUNTRY
}

export function parsePhoneValue(value: string): { country: Country; digits: string } {
  const trimmed = (value ?? '').trim()

  if (trimmed.startsWith('+')) {
    const digitsOnly = trimmed.slice(1).replace(/\D/g, '')
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((country) => digitsOnly.startsWith(country.dial))

    if (match) {
      return { country: match, digits: digitsOnly.slice(match.dial.length) }
    }
  }

  return { country: DEFAULT_COUNTRY, digits: trimmed.replace(/\D/g, '') }
}

export function buildPhoneValue(country: Country, digits: string): string {
  const cleanDigits = digits.replace(/\D/g, '')
  if (!cleanDigits) return ''

  return `+${country.dial} ${formatNationalNumber(cleanDigits, country.code)}`
}

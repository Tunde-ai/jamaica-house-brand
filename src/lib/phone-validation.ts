import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { CARIBBEAN_AREA_CODES } from './florida-counties'

export interface PhoneValidationResult {
  isValid: boolean
  isInternational: boolean
  isCaribbean: boolean
  country?: string
  areaCode?: string
  formattedNumber?: string
}

export function validatePhoneNumber(phoneInput: string): PhoneValidationResult {
  try {
    // Clean input
    const cleaned = phoneInput.replace(/\D/g, '')

    // Basic validation
    if (cleaned.length < 10) {
      return { isValid: false, isInternational: false, isCaribbean: false }
    }

    // Parse phone number
    const parsed = parsePhoneNumber(phoneInput, 'US')

    if (!parsed || !isValidPhoneNumber(phoneInput, 'US')) {
      return { isValid: false, isInternational: false, isCaribbean: false }
    }

    const country = parsed.country
    const areaCode = parsed.nationalNumber.toString().substring(0, 3)

    // Check if international (non-US/CA)
    const isInternational = country !== 'US' && country !== 'CA'

    // Check if Caribbean area code (technically NANP but likely not FL)
    const isCaribbean = CARIBBEAN_AREA_CODES.includes(areaCode)

    return {
      isValid: true,
      isInternational,
      isCaribbean,
      country,
      areaCode,
      formattedNumber: parsed.formatNational()
    }

  } catch (error) {
    // Fallback validation for edge cases
    const cleaned = phoneInput.replace(/\D/g, '')

    if (cleaned.length === 10 || cleaned.length === 11) {
      const areaCode = cleaned.substring(cleaned.length === 11 ? 1 : 0, cleaned.length === 11 ? 4 : 3)
      const isCaribbean = CARIBBEAN_AREA_CODES.includes(areaCode)

      return {
        isValid: true,
        isInternational: false,
        isCaribbean,
        areaCode,
        formattedNumber: phoneInput
      }
    }

    return { isValid: false, isInternational: false, isCaribbean: false }
  }
}

export function formatPhoneForDisplay(phoneInput: string): string {
  const result = validatePhoneNumber(phoneInput)
  return result.formattedNumber || phoneInput
}
// Mirrors the Supabase Auth password policy for Been Watching:
// min 8 chars, must include lowercase, uppercase, digit, and symbol,
// plus the HaveIBeenPwned leaked-password check (server-side only).

// Symbol set matches Supabase's required character list.
const SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~\\]/

export interface PasswordRule {
  id: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'A lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'uppercase',
    label: 'An uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'A number (0-9)',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'symbol',
    label: 'A symbol (e.g. !@#$%)',
    test: (password) => SYMBOL_REGEX.test(password),
  },
]

export interface PasswordValidation {
  valid: boolean
  results: { rule: PasswordRule; passed: boolean }[]
}

export function validatePassword(password: string): PasswordValidation {
  const results = PASSWORD_RULES.map((rule) => ({
    rule,
    passed: rule.test(password),
  }))
  return {
    valid: results.every((r) => r.passed),
    results,
  }
}

/**
 * Maps Supabase auth errors to friendly, human-readable copy.
 * Unrecognized errors pass through with their original message.
 */
export function friendlyAuthError(error: {
  message: string
  code?: string
  reasons?: string[]
}): string {
  const code = error.code ?? ''
  const message = error.message || ''

  if (code === 'weak_password' || message.includes('Password should')) {
    const reasons: string[] = Array.isArray(error.reasons) ? error.reasons : []
    const isPwned = reasons.includes('pwned') || message.includes('known to be weak')

    if (isPwned && !reasons.some((r) => r === 'length' || r === 'characters')) {
      return "This password has appeared in a known data breach, so it isn't safe to use. Please choose a different password."
    }
    return "Your password doesn't meet the requirements — check the list under the password field."
  }

  if (code === 'same_password' || message.includes('different from the old password')) {
    return 'Your new password must be different from your current one.'
  }

  return message || 'An error occurred'
}

'use client'

import { useThemeColors } from '@/hooks/useThemeColors'
import { PASSWORD_RULES } from '@/utils/passwordPolicy'

interface PasswordChecklistProps {
  password: string
}

/**
 * Live password-requirements checklist shown under password fields.
 * Rules render neutral before the user types and turn green as they pass.
 */
export default function PasswordChecklist({ password }: PasswordChecklistProps) {
  const colors = useThemeColors()

  return (
    <div style={{ marginTop: '0.625rem' }}>
      <p
        style={{
          color: colors.textSecondary,
          fontSize: '0.8125rem',
          margin: '0 0 0.375rem 0',
        }}
      >
        Your password must include:
      </p>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {PASSWORD_RULES.map((rule) => {
          const passed = password.length > 0 && rule.test(password)
          return (
            <li
              key={rule.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: passed ? colors.success : colors.textSecondary,
                transition: 'color 0.2s',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '14px',
                  height: '14px',
                  flexShrink: 0,
                }}
              >
                {passed ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill={colors.success} fillOpacity="0.15" />
                    <path
                      d="M4 7.2L6.1 9.3L10 5.2"
                      stroke={colors.success}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: colors.textTertiary,
                    }}
                  />
                )}
              </span>
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

'use client'

import { useState } from 'react'
import InviteCodeGate from '@/components/onboarding/InviteCodeGate'

export default function InviteCodePreview() {
  const [validated, setValidated] = useState(false)

  if (validated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅ Code Validated!</h1>
          <p style={{ color: '#666' }}>This is just a preview. In the real app, you'd proceed to profile setup.</p>
          <button
            onClick={() => setValidated(false)}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Preview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>🎭 Preview Mode</h2>
          <p style={{ margin: '0', color: '#666', fontSize: '0.875rem' }}>
            This is a preview of the invite code entry screen.
            <br />
            <strong>Note:</strong> The actual validation won't work in preview mode - this is just for viewing the UI.
          </p>
        </div>
      </div>
      <InviteCodeGate
        userId="preview-user-id"
        onValidated={() => setValidated(true)}
      />
    </div>
  )
}

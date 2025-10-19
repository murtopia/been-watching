'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ProfileSetupProps {
  userId: string
  onComplete: () => void
}

export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('What have you been watching?')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if username is taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUser) {
        setError('Username is already taken')
        setLoading(false)
        return
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase(),
          display_name: displayName,
          bio: bio
        })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      onComplete()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl animate-slide-up border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Been Watching!
          </h2>
          <p className="text-white/80">Set up your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              required
              minLength={3}
              maxLength={20}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder-white/50"
            />
            <p className="text-xs text-white/60 mt-1">Lowercase letters, numbers, and underscores only</p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-white mb-1">
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
              maxLength={50}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder-white/50"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What have you been watching?"
              rows={3}
              maxLength={150}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder-white/50 resize-none"
            />
            <p className="text-xs text-white/60 mt-1">{bio.length}/150</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-white text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !displayName}
            className="w-full bg-gradient-primary text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Creating Profile...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react'
import { signInWithUsername, signUpWithUsername } from '@/lib/auth'
import { UserProfile } from '@/types'

interface AuthFormProps {
  onSuccess: (user: UserProfile) => void
  darkMode?: boolean
  onToggleDarkMode?: () => void
}

export default function AuthForm({ onSuccess, darkMode, onToggleDarkMode }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanUser = username.trim()
    if (!cleanUser) {
      setError('Please enter a username')
      return
    }
    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      let user: UserProfile
      if (mode === 'signup') {
        user = await signUpWithUsername(cleanUser, password)
      } else {
        user = await signInWithUsername(cleanUser, password)
      }
      onSuccess(user)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-950 transition-colors">
      {/* Left Column: Brand Hero Banner */}
      <div className="relative bg-[#0b3cc7] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-700/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-[#0b3cc7] font-extrabold text-sm tracking-tight">JT</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">JobTrack</span>
        </div>

        {/* Center: Main Headline */}
        <div className="relative z-10 my-12 lg:my-auto space-y-4 max-w-lg">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white leading-[1.12] tracking-tight">
            Every application,<br />one clear view.
          </h1>
          <p className="text-base sm:text-lg text-blue-100/90 font-normal leading-relaxed pt-2">
            Log where you applied, track replies and interviews, and see what is working in your search.
          </p>
        </div>

        {/* Bottom: Status Pill Graphic */}
        <div className="relative z-10 pt-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3.5">
            <div className="flex items-center gap-4">
              <span className="w-24 text-white font-medium text-xs">Applied</span>
              <div className="flex-1 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-white/90 font-medium text-xs">Replied</span>
              <div className="w-[68%] h-2 bg-blue-300 rounded-full"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-white/90 font-medium text-xs">Interviewing</span>
              <div className="w-[36%] h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-white/90 font-medium text-xs">Offer</span>
              <div className="w-[18%] h-2 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login / Signup Form */}
      <div className="relative flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-gray-950">
        {/* Theme toggle button in top right */}
        {onToggleDarkMode && (
          <div className="absolute top-6 right-6">
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-800"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        )}

        <div className="w-full max-w-[390px] space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mode === 'signin'
                ? 'Sign in with your username. No email needed.'
                : 'Choose a username to start tracking your applications.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="bg-gray-100/90 dark:bg-gray-900 p-1 rounded-xl flex border border-gray-200/70 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-400 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. alex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-colors shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1456f0] hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>Your applications are private to your account.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

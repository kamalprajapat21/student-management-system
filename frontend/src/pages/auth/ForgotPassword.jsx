import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
      toast.success('Reset link sent if email is registered')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        {sent ? (
          <div>
            <p className="text-green-600 dark:text-green-400 mb-4">
              If that email exists, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="btn-primary w-full block text-center">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@school.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary-600">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

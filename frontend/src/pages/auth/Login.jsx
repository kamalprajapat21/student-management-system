import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, School, Moon, Sun } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Login() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      const routes = { student: '/student', teacher: '/teacher', admin: '/admin', parent: '/parent' }
      navigate(routes[user.role] || '/')
      toast.success(`Welcome back, ${user.full_name}!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 dark:bg-primary-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${40+i*20}px`, height: `${40+i*20}px`,
                left: `${(i*7)%100}%`, top: `${(i*13)%100}%`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative z-10 text-center text-white px-8">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <School className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">EduManage AI</h1>
          <p className="text-xl opacity-90 mb-6">Smart Student Management System</p>
          <div className="space-y-3 text-left">
            {['AI-powered performance insights', 'Real-time attendance tracking', 'Complete fee management', 'Interactive AI chatbot'].map(f => (
              <div key={f} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <School className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">EduManage AI</span>
            </div>
            <button onClick={toggle} className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {dark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to your account</p>
            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  placeholder="you@school.com" autoFocus />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} className="input pr-10"
                    value={form.password}
                    onChange={e => setForm(p => ({...p, password: e.target.value}))}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              New student?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Demo Credentials:</p>
              {[
                ['Admin', 'admin@school.com', 'Admin@123'],
                ['Teacher', 'teacher1@school.com', 'Teacher@123'],
                ['Student', 'student1@school.com', 'Student@123'],
              ].map(([role, email, pass]) => (
                <button key={role} onClick={() => setForm({ email, password: pass })}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline mr-3">
                  Use {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

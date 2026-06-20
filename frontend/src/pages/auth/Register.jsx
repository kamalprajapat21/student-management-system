import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', full_name: '', password: '', phone: '',
    roll_number: '', department: '', class_name: '', section: '', semester: '', year: ''
  })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.roll_number || !form.full_name)
      return toast.error('Please fill all required fields')
    setLoading(true)
    try {
      await authAPI.registerStudent({ ...form, semester: Number(form.semester), year: Number(form.year) })
      toast.success('Registered successfully! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const f = (name) => ({ value: form[name], onChange: e => setForm(p => ({...p, [name]: e.target.value})) })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="card w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-1">Student Registration</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your student account</p>
        <form onSubmit={handle}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              ['full_name', 'Full Name *', 'text', 'Arjun Mehta'],
              ['email', 'Email *', 'email', 'arjun@school.com'],
              ['password', 'Password *', 'password', '••••••••'],
              ['phone', 'Phone', 'tel', '+91 9876543210'],
              ['roll_number', 'Roll Number *', 'text', 'S001'],
              ['department', 'Department', 'text', 'Computer Science'],
              ['class_name', 'Class', 'text', 'CS-3A'],
              ['section', 'Section', 'text', 'A'],
              ['semester', 'Semester', 'number', '3'],
              ['year', 'Year', 'number', '2'],
            ].map(([name, label, type, placeholder]) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input type={type} className="input" placeholder={placeholder} {...f(name)} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

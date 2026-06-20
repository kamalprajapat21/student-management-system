"""Write all frontend pages."""
import os

BASE = r"c:\Users\iSN_kota_T52\Desktop\rag pipeline\frontend"

def w(rel_path, content):
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written: {rel_path}")

# ============ AUTH PAGES ============

w("src/pages/auth/Login.jsx", '''import React, { useState } from 'react'
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
''')

w("src/pages/auth/Register.jsx", '''import React, { useState } from 'react'
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
''')

w("src/pages/auth/ForgotPassword.jsx", '''import React, { useState } from 'react'
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
''')

# ============ STUDENT PAGES ============

w("src/pages/student/Dashboard.jsx", '''import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, aiAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { UserCheck, BookMarked, ClipboardList, DollarSign, Brain, TrendingUp } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
         LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ attendance: null, marks: null, assignments: null, fees: null })
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [att, marks, assign, fees, perfData] = await Promise.all([
          studentAPI.attendance(), studentAPI.marks(), studentAPI.assignments(),
          studentAPI.fees(), aiAPI.performance(user.id)
        ])
        setData({ attendance: att.data, marks: marks.data, assignments: assign.data, fees: fees.data })
        setPerf(perfData.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const att = data.attendance
  const submitted = data.assignments?.assignments?.filter(a => a.submitted).length || 0
  const total = data.assignments?.assignments?.length || 0
  const pendingFees = data.fees?.pending_amount || 0

  const predColors = { Excellent: 'green', Good: 'blue', Average: 'yellow', Weak: 'red' }
  const predColor = predColors[perf?.prediction] || 'blue'

  const radarData = [
    { subject: 'Attendance', value: att?.percentage || 0 },
    { subject: 'Avg Marks', value: data.marks?.marks?.[0] ? 70 : 0 },
    { subject: 'Assignments', value: total > 0 ? (submitted/total)*100 : 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.full_name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Here is your academic overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${att?.percentage || 0}%`} icon={UserCheck}
          color={att?.percentage >= 75 ? 'green' : 'red'}
          subtitle={`${att?.present || 0}/${att?.total_classes || 0} classes`} />
        <StatCard title="Assignments Done" value={`${submitted}/${total}`} icon={ClipboardList} color="blue" />
        <StatCard title="Pending Fees" value={`₹${pendingFees.toLocaleString()}`} icon={DollarSign}
          color={pendingFees > 0 ? 'red' : 'green'} />
        <StatCard title="AI Prediction" value={perf?.prediction || 'N/A'} icon={Brain} color={predColor} />
      </div>

      {att?.percentage < 75 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="font-semibold text-red-800 dark:text-red-300">⚠ Attendance Warning</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            Your attendance ({att?.percentage}%) is below the required 75%. Attend more classes to avoid shortage.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Marks</h3>
          <div className="space-y-3">
            {(data.marks?.marks || []).slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{m.exam_title}</p>
                  <p className="text-xs text-gray-500">{m.exam_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{m.marks_obtained}/{m.total_marks}</p>
                  <span className={`badge ${m.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>
                    {m.grade || `${m.percentage}%`}
                  </span>
                </div>
              </div>
            ))}
            {!data.marks?.marks?.length && <p className="text-gray-500 text-sm">No marks recorded yet.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pending Assignments</h3>
        <div className="space-y-2">
          {(data.assignments?.assignments || []).filter(a => !a.submitted).slice(0, 5).map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-xs text-gray-500">Due: {new Date(a.deadline).toLocaleDateString()}</p>
              </div>
              <span className="badge badge-yellow">Pending</span>
            </div>
          ))}
          {!(data.assignments?.assignments || []).filter(a => !a.submitted).length &&
            <p className="text-green-600 dark:text-green-400 text-sm">All assignments submitted! 🎉</p>}
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/student/Attendance.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function Attendance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.attendance().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const pieData = [
    { name: 'Present', value: data?.present || 0 },
    { name: 'Absent', value: data?.absent || 0 },
  ]
  const COLORS = ['#22c55e', '#ef4444']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-4xl font-bold text-primary-600">{data?.percentage || 0}%</p>
          <p className="text-gray-500 mt-1">Overall Attendance</p>
          <div className={`mt-2 badge ${data?.percentage >= 75 ? 'badge-green' : 'badge-red'}`}>
            {data?.percentage >= 75 ? 'Good Standing' : 'Below Minimum'}
          </div>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-bold text-green-600">{data?.present || 0}</p>
          <p className="text-gray-500 mt-1">Classes Present</p>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-bold text-red-600">{data?.absent || 0}</p>
          <p className="text-gray-500 mt-1">Classes Absent</p>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Attendance Chart</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-gray-500">Date</th>
              <th className="text-left py-2 text-gray-500">Subject</th>
              <th className="text-left py-2 text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {(data?.records || []).slice(0, 30).map((r, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 text-gray-500">{r.subject_id ? `Subject ${r.subject_id}` : 'General'}</td>
                  <td className="py-2">
                    <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'late' ? 'badge-yellow' : 'badge-red'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/student/Exams.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Exams() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.marks().then(r => { setMarks(r.data.marks || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const avg = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0
  const chartData = marks.map(m => ({ name: m.exam_title.substring(0, 12), marks: m.marks_obtained, total: m.total_marks }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks & Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-4xl font-bold text-primary-600">{marks.length}</p><p className="text-gray-500">Total Exams</p></div>
        <div className="card text-center"><p className="text-4xl font-bold text-green-600">{avg}%</p><p className="text-gray-500">Average Score</p></div>
        <div className="card text-center"><p className="text-4xl font-bold text-blue-600">{marks.filter(m => m.percentage >= 60).length}</p><p className="text-gray-500">Passed</p></div>
      </div>
      {marks.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Marks Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="marks" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="card">
        <h3 className="font-semibold mb-4">All Marks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Exam', 'Type', 'Marks', 'Percentage', 'Grade'].map(h => (
                <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4 font-medium">{m.exam_title}</td>
                  <td className="py-2 pr-4 text-gray-500 capitalize">{m.exam_type}</td>
                  <td className="py-2 pr-4">{m.marks_obtained}/{m.total_marks}</td>
                  <td className="py-2 pr-4">{m.percentage}%</td>
                  <td className="py-2"><span className={`badge ${m.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>{m.grade || 'N/A'}</span></td>
                </tr>
              ))}
              {!marks.length && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No marks recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/student/Assignments.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI, assignmentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    studentAPI.assignments().then(r => { setAssignments(r.data.assignments || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const submit = async () => {
    if (!textContent.trim()) return toast.error('Please enter your answer')
    setSubmitting(true)
    try {
      await assignmentAPI.submit(submitModal.id, textContent)
      toast.success('Assignment submitted!')
      setSubmitModal(null)
      setTextContent('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const pending = assignments.filter(a => !a.submitted)
  const submitted = assignments.filter(a => a.submitted)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        <div className="flex gap-2">
          <span className="badge badge-yellow">{pending.length} Pending</span>
          <span className="badge badge-green">{submitted.length} Submitted</span>
        </div>
      </div>
      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Pending</h2>
          <div className="space-y-3">
            {pending.map(a => {
              const isOverdue = new Date(a.deadline) < new Date()
              return (
                <div key={a.id} className="card border-l-4 border-l-yellow-400">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {isOverdue ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                        <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          Due: {new Date(a.deadline).toLocaleString()}
                          {isOverdue ? ' (Overdue)' : ''}
                        </span>
                        <span className="text-xs text-gray-500">• Max: {a.max_marks} marks</span>
                      </div>
                    </div>
                    <button onClick={() => setSubmitModal(a)} className="btn-primary text-sm flex items-center gap-1 whitespace-nowrap">
                      <Upload className="h-4 w-4" /> Submit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {submitted.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Submitted</h2>
          <div className="space-y-3">
            {submitted.map(a => (
              <div key={a.id} className="card border-l-4 border-l-green-400">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Submitted {new Date(a.submission?.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {a.submission?.marks_obtained != null && (
                      <p className="font-bold text-primary-600">{a.submission.marks_obtained}/{a.max_marks}</p>
                    )}
                    <span className={`badge ${a.submission?.status === 'graded' ? 'badge-blue' : 'badge-green'}`}>
                      {a.submission?.status}
                    </span>
                  </div>
                </div>
                {a.submission?.feedback && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                    Feedback: {a.submission.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal open={!!submitModal} onClose={() => setSubmitModal(null)} title={`Submit: ${submitModal?.title}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Due: {submitModal && new Date(submitModal.deadline).toLocaleString()}</p>
          <div>
            <label className="label">Your Answer</label>
            <textarea className="input h-40 resize-none" value={textContent}
              onChange={e => setTextContent(e.target.value)} placeholder="Type your answer here..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSubmitModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/student/Fees.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function Fees() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.fees().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const pieData = [
    { name: 'Paid', value: data?.paid_amount || 0 },
    { name: 'Pending', value: data?.pending_amount || 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{(data?.total_amount || 0).toLocaleString()}</p>
          <p className="text-gray-500">Total Amount</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">₹{(data?.paid_amount || 0).toLocaleString()}</p>
          <p className="text-gray-500">Paid</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">₹{(data?.pending_amount || 0).toLocaleString()}</p>
          <p className="text-gray-500">Pending</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Fee Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={['#22c55e', '#ef4444'][i]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Fee Records</h3>
          <div className="space-y-3">
            {(data?.fees || []).map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{f.fee_type}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(f.due_date).toLocaleDateString()}</p>
                  {f.payment_date && <p className="text-xs text-green-600">Paid: {new Date(f.payment_date).toLocaleDateString()}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{f.amount.toLocaleString()}</p>
                  <span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/student/AIInsights.jsx", '''import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { aiAPI } from '../../services/api'
import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

export default function AIInsights() {
  const { user } = useAuth()
  const [perf, setPerf] = useState(null)
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([aiAPI.performance(user.id), aiAPI.recommendations(user.id)])
      .then(([p, r]) => { setPerf(p.data); setRecs(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const levelColors = { low: 'green', medium: 'yellow', high: 'red' }
  const predColors = { Excellent: 'text-green-600', Good: 'text-blue-600', Average: 'text-yellow-600', Weak: 'text-red-600' }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Performance Insights</h1>
      {perf && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Performance Prediction</h2>
              <p className={`text-2xl font-bold ${predColors[perf.prediction]}`}>{perf.prediction}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Attendance', value: `${perf.attendance_percentage}%`, color: perf.attendance_percentage >= 75 ? 'green' : 'red' },
              { label: 'Average Marks', value: `${perf.average_marks}%`, color: perf.average_marks >= 60 ? 'green' : 'red' },
              { label: 'Assignments', value: `${perf.assignment_completion}%`, color: perf.assignment_completion >= 75 ? 'green' : 'yellow' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-4 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {recs && (
        <>
          {recs.warnings?.length > 0 && (
            <div className="card border-l-4 border-l-red-400">
              <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5" /> Warnings
              </h3>
              <ul className="space-y-2">
                {recs.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <span className="mt-0.5">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" /> AI Recommendations
            </h3>
            <div className="space-y-3">
              {recs.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
''')

w("src/pages/student/Leaves.jsx", '''import React, { useEffect, useState } from 'react'
import { leaveAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'

export default function Leaves() {
  const [leaves, setLeaves] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ reason: '', from_date: '', to_date: '' })
  const [loading, setLoading] = useState(false)

  const load = () => leaveAPI.myLeaves().then(r => setLeaves(r.data.leaves || [])).catch(() => {})
  useEffect(load, [])

  const submit = async () => {
    if (!form.reason || !form.from_date || !form.to_date) return toast.error('Fill all fields')
    setLoading(true)
    try {
      await leaveAPI.apply(form)
      toast.success('Leave application submitted')
      setModal(false)
      setForm({ reason: '', from_date: '', to_date: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const statusColor = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Applications</h1>
        <button onClick={() => setModal(true)} className="btn-primary">Apply for Leave</button>
      </div>
      <div className="space-y-3">
        {leaves.map(l => (
          <div key={l.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{l.reason}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(l.from_date).toLocaleDateString()} – {new Date(l.to_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">Applied: {new Date(l.applied_at).toLocaleDateString()}</p>
              </div>
              <span className={`badge ${statusColor[l.status]}`}>{l.status}</span>
            </div>
          </div>
        ))}
        {!leaves.length && <div className="card text-center text-gray-500">No leave applications found.</div>}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Apply for Leave">
        <div className="space-y-4">
          <div><label className="label">Reason</label>
            <textarea className="input h-24 resize-none" value={form.reason}
              onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="Reason for leave..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">From Date</label>
              <input type="date" className="input" value={form.from_date} onChange={e => setForm(p => ({...p, from_date: e.target.value}))} /></div>
            <div><label className="label">To Date</label>
              <input type="date" className="input" value={form.to_date} onChange={e => setForm(p => ({...p, to_date: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={loading} className="btn-primary flex-1">{loading ? 'Submitting...' : 'Submit'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/student/Timetable.jsx", '''import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { timetableAPI } from '../../services/api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Timetable() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    timetableAPI.get({ class_name: user.class_name }).then(r => { setEntries(r.data.timetable || []); setLoading(false) }).catch(() => setLoading(false))
  }, [user.class_name])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timetable</h1>
      <div className="space-y-4">
        {DAYS.map(day => {
          const dayEntries = entries.filter(e => e.day_of_week === day)
          if (!dayEntries.length) return null
          return (
            <div key={day} className="card">
              <h3 className="font-semibold text-primary-600 dark:text-primary-400 mb-3">{day}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {dayEntries.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(e => (
                  <div key={e.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="font-medium text-sm">Subject {e.subject_id}</p>
                    <p className="text-xs text-gray-500">{e.start_time} – {e.end_time}</p>
                    {e.room && <p className="text-xs text-gray-400">Room: {e.room}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {!entries.length && <div className="card text-center text-gray-500">No timetable entries found.</div>}
      </div>
    </div>
  )
}
''')

w("src/pages/student/Calendar.jsx", '''import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar() {
  const [date, setDate] = useState(new Date())
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Calendar</h1>
      <div className="card max-w-md">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setDate(new Date(year, month-1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft className="h-5 w-5" /></button>
          <h3 className="font-semibold">{monthNames[month]} {year}</h3>
          <button onClick={() => setDate(new Date(year, month+1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>)}
          {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
            return (
              <div key={day} className={`py-1.5 text-sm rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isToday ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}`}>
                {day}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
''')

# ============ TEACHER PAGES ============

w("src/pages/teacher/Dashboard.jsx", '''import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, assignmentAPI, attendanceAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { GraduationCap, ClipboardList, UserCheck, BarChart3 } from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ students: 0, assignments: 0, todayAttendance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentAPI.list().catch(() => ({ data: { total: 0 } })),
      assignmentAPI.list().catch(() => ({ data: { assignments: [] } })),
      attendanceAPI.overview().catch(() => ({ data: { present: 0 } })),
    ]).then(([students, assignments, att]) => {
      setStats({
        students: students.data.total || 0,
        assignments: assignments.data.assignments?.filter(a => a.teacher_id === user.id).length || 0,
        todayAttendance: att.data.present || 0,
      })
    }).finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.full_name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Teacher Dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="blue" />
        <StatCard title="My Assignments" value={stats.assignments} icon={ClipboardList} color="purple" />
        <StatCard title="Present Today" value={stats.todayAttendance} icon={UserCheck} color="green" />
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Mark Attendance', '/teacher/attendance', 'green'],
            ['Create Assignment', '/teacher/assignments', 'blue'],
            ['Add Marks', '/teacher/marks', 'purple'],
            ['View Analytics', '/teacher/analytics', 'orange'],
          ].map(([label, to, color]) => (
            <a key={to} href={to} className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-xl text-center hover:scale-105 transition-transform`}>
              <p className={`font-medium text-sm text-${color}-700 dark:text-${color}-300`}>{label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/teacher/AttendanceManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI, attendanceAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AttendanceManagement() {
  const [students, setStudents] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    studentAPI.list({ limit: 100 }).then(r => {
      const s = r.data.students || []
      setStudents(s)
      const defaults = {}
      s.forEach(st => { defaults[st.id] = 'present' })
      setAttendance(defaults)
    }).catch(() => {})
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({ student_id: Number(student_id), status }))
      await attendanceAPI.markBulk({ date, records })
      toast.success('Attendance marked successfully!')
    } catch {
      toast.error('Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  const setAll = (status) => {
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setAttendance(all)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setAll('present')} className="btn-secondary text-sm">All Present</button>
            <button onClick={() => setAll('absent')} className="btn-secondary text-sm">All Absent</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4">Student</th>
              <th className="text-left py-2 pr-4">Roll No</th>
              <th className="text-left py-2">Status</th>
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{s.roll_number}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {['present', 'absent', 'late'].map(status => (
                        <button key={status}
                          onClick={() => setAttendance(prev => ({...prev, [s.id]: status}))}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            attendance[s.id] === status
                              ? status === 'present' ? 'bg-green-500 text-white'
                                : status === 'absent' ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          }`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={save} disabled={loading} className="btn-primary px-8">{loading ? 'Saving...' : 'Save Attendance'}</button>
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/teacher/AssignmentManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { assignmentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Eye, Trash2 } from 'lucide-react'

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([])
  const [modal, setModal] = useState(false)
  const [viewSubs, setViewSubs] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState({ title: '', description: '', deadline: '', max_marks: 100 })
  const [loading, setLoading] = useState(false)

  const load = () => assignmentAPI.list().then(r => setAssignments(r.data.assignments || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.title || !form.deadline) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await assignmentAPI.create({ ...form, max_marks: Number(form.max_marks) })
      toast.success('Assignment created!')
      setModal(false)
      setForm({ title: '', description: '', deadline: '', max_marks: 100 })
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this assignment?')) return
    await assignmentAPI.delete(id)
    toast.success('Deleted')
    load()
  }

  const viewSubmissions = async (id) => {
    const r = await assignmentAPI.getSubmissions(id)
    setSubmissions(r.data.submissions || [])
    setViewSubs(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Assignment</button>
      </div>
      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.deadline).toLocaleString()} • Max: {a.max_marks} marks</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewSubmissions(a.id)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600"><Eye className="h-4 w-4" /></button>
                <button onClick={() => del(a.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {!assignments.length && <div className="card text-center text-gray-500">No assignments created yet.</div>}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Create Assignment">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Assignment title" /></div>
          <div><label className="label">Description</label><textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Deadline *</label><input type="datetime-local" className="input" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))} /></div>
            <div><label className="label">Max Marks</label><input type="number" className="input" value={form.max_marks} onChange={e => setForm(p => ({...p, max_marks: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
      <Modal open={!!viewSubs} onClose={() => setViewSubs(null)} title="Submissions" size="lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Student ID', 'Submitted At', 'Status', 'Marks', 'Grade'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4">{s.student_id}</td>
                  <td className="py-2 pr-4">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-4"><span className={`badge ${s.status === 'graded' ? 'badge-blue' : s.status === 'late' ? 'badge-red' : 'badge-green'}`}>{s.status}</span></td>
                  <td className="py-2 pr-4">{s.marks_obtained ?? '-'}</td>
                  <td className="py-2">{s.grade ?? '-'}</td>
                </tr>
              ))}
              {!submissions.length && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No submissions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/teacher/MarksManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { examAPI, studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus } from 'lucide-react'

export default function MarksManagement() {
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])
  const [examModal, setExamModal] = useState(false)
  const [marksModal, setMarksModal] = useState(null)
  const [examForm, setExamForm] = useState({ title: '', exam_date: '', exam_type: 'midterm', total_marks: 100, class_name: '' })
  const [marks, setMarks] = useState({})
  const [loading, setLoading] = useState(false)

  const loadExams = () => examAPI.list().then(r => setExams(r.data.exams || [])).catch(() => {})
  const loadStudents = () => studentAPI.list({ limit: 100 }).then(r => setStudents(r.data.students || [])).catch(() => {})
  useEffect(() => { loadExams(); loadStudents() }, [])

  const createExam = async () => {
    if (!examForm.title || !examForm.exam_date) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await examAPI.create({ ...examForm, total_marks: Number(examForm.total_marks) })
      toast.success('Exam created!')
      setExamModal(false)
      loadExams()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const openMarksModal = (exam) => {
    setMarksModal(exam)
    const m = {}
    students.forEach(s => { m[s.id] = '' })
    setMarks(m)
  }

  const saveMarks = async () => {
    setLoading(true)
    try {
      for (const [student_id, val] of Object.entries(marks)) {
        if (val !== '') {
          await examAPI.addMarks({ student_id: Number(student_id), exam_id: marksModal.id, marks_obtained: Number(val) })
        }
      }
      toast.success('Marks saved!')
      setMarksModal(null)
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks Management</h1>
        <button onClick={() => setExamModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Create Exam</button>
      </div>
      <div className="space-y-3">
        {exams.map(e => (
          <div key={e.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{e.title}</h3>
              <p className="text-sm text-gray-500">{new Date(e.exam_date).toLocaleDateString()} • {e.exam_type} • {e.total_marks} marks</p>
            </div>
            <button onClick={() => openMarksModal(e)} className="btn-primary text-sm">Enter Marks</button>
          </div>
        ))}
        {!exams.length && <div className="card text-center text-gray-500">No exams created yet.</div>}
      </div>
      <Modal open={examModal} onClose={() => setExamModal(false)} title="Create Exam">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={examForm.title} onChange={e => setExamForm(p => ({...p, title: e.target.value}))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date *</label><input type="datetime-local" className="input" value={examForm.exam_date} onChange={e => setExamForm(p => ({...p, exam_date: e.target.value}))} /></div>
            <div><label className="label">Type</label>
              <select className="input" value={examForm.exam_type} onChange={e => setExamForm(p => ({...p, exam_type: e.target.value}))}>
                {['midterm', 'final', 'quiz', 'practical'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Total Marks</label><input type="number" className="input" value={examForm.total_marks} onChange={e => setExamForm(p => ({...p, total_marks: e.target.value}))} /></div>
            <div><label className="label">Class</label><input className="input" value={examForm.class_name} placeholder="CS-3A" onChange={e => setExamForm(p => ({...p, class_name: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setExamModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={createExam} disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
      <Modal open={!!marksModal} onClose={() => setMarksModal(null)} title={`Enter Marks: ${marksModal?.title}`} size="lg">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {students.map(s => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="flex-1"><p className="font-medium text-sm">{s.full_name}</p><p className="text-xs text-gray-500">{s.roll_number}</p></div>
              <input type="number" className="input w-24 text-center" placeholder="0" min="0" max={marksModal?.total_marks}
                value={marks[s.id] || ''} onChange={e => setMarks(p => ({...p, [s.id]: e.target.value}))} />
              <span className="text-sm text-gray-400">/{marksModal?.total_marks}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setMarksModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={saveMarks} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Marks'}</button>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/teacher/Analytics.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI, attendanceAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TeacherAnalytics() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.list({ limit: 100 }).then(r => { setStudents(r.data.students || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <div className="card">
        <h3 className="font-semibold mb-4">Student Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center"><p className="text-3xl font-bold text-primary-600">{students.length}</p><p className="text-sm text-gray-500">Total Students</p></div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Students List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Name', 'Roll No', 'Class', 'Department'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-2 pr-4 text-gray-500">{s.roll_number}</td>
                  <td className="py-2 pr-4">{s.class_name}</td>
                  <td className="py-2">{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
''')

w("src/pages/teacher/PracticalManagement.jsx", '''import React from 'react'
export default function PracticalManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practical Management</h1>
      <div className="card text-center text-gray-500">Practical marks management coming soon.</div>
    </div>
  )
}
''')

# ============ ADMIN PAGES ============

w("src/pages/admin/Dashboard.jsx", '''import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { GraduationCap, Users, DollarSign, UserCheck, BarChart3, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
         BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.attendanceTrend()])
      .then(([d, t]) => { setData(d.data); setTrend(t.data.trend?.slice().reverse() || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const gradeData = Object.entries(data?.grade_distribution || {}).map(([grade, count]) => ({ grade, count }))
  const feeData = [
    { name: 'Paid', value: data?.paid_fee_amount || 0 },
    { name: 'Pending', value: data?.pending_fee_amount || 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={data?.total_students || 0} icon={GraduationCap} color="blue" />
        <StatCard title="Total Teachers" value={data?.total_teachers || 0} icon={Users} color="purple" />
        <StatCard title="Attendance Rate" value={`${data?.attendance_percentage || 0}%`} icon={UserCheck} color="green" />
        <StatCard title="Fee Collection" value={`₹${((data?.paid_fee_amount || 0) / 1000).toFixed(0)}K`} icon={DollarSign} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Fee Collection</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                {feeData.map((_, i) => <Cell key={i} fill={['#22c55e', '#ef4444'][i]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {gradeData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
''')

w("src/pages/admin/StudentManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { studentAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Trash2, Search } from 'lucide-react'

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', password: 'Student@123', phone: '', roll_number: '', department: 'Computer Science', class_name: 'CS-3A', section: 'A', semester: '3', year: '2' })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState({ total: 0, skip: 0 })

  const load = (search = '', skip = 0) => {
    studentAPI.list({ search, skip, limit: 20 }).then(r => {
      setStudents(r.data.students || [])
      setPage({ total: r.data.total || 0, skip })
    }).catch(() => {})
  }
  useEffect(() => load(), [])

  const create = async () => {
    if (!form.email || !form.roll_number || !form.full_name) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await authAPI.registerStudent({ ...form, semester: Number(form.semester), year: Number(form.year) })
      toast.success('Student added!')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Deactivate this student?')) return
    await studentAPI.delete(id)
    toast.success('Student deactivated')
    load(search)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Student</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search students..." value={search}
              onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Name', 'Email', 'Roll No', 'Class', 'Department', 'Actions'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{s.email}</td>
                  <td className="py-3 pr-4">{s.roll_number}</td>
                  <td className="py-3 pr-4">{s.class_name}</td>
                  <td className="py-3 pr-4">{s.department}</td>
                  <td className="py-3">
                    <button onClick={() => del(s.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!students.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-2">Total: {page.total} students</p>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Student" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['full_name', 'Full Name *', 'text'],
            ['email', 'Email *', 'email'],
            ['password', 'Password', 'password'],
            ['phone', 'Phone', 'tel'],
            ['roll_number', 'Roll Number *', 'text'],
            ['department', 'Department', 'text'],
            ['class_name', 'Class', 'text'],
            ['section', 'Section', 'text'],
            ['semester', 'Semester', 'number'],
            ['year', 'Year', 'number'],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input type={type} className="input" value={form[name]}
                onChange={e => setForm(p => ({...p, [name]: e.target.value}))} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Student'}</button>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/admin/TeacherManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { teacherAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Trash2, Search } from 'lucide-react'

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', password: 'Teacher@123', phone: '', employee_id: '', department: '', qualification: '', experience_years: '' })
  const [loading, setLoading] = useState(false)

  const load = () => teacherAPI.list({ search }).then(r => setTeachers(r.data.teachers || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.email || !form.employee_id || !form.full_name) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await authAPI.registerTeacher({ ...form, experience_years: Number(form.experience_years) || 0 })
      toast.success('Teacher added!')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Deactivate this teacher?')) return
    await teacherAPI.delete(id)
    toast.success('Teacher deactivated')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Teacher</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search teachers..." value={search}
              onChange={e => { setSearch(e.target.value); load() }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Name', 'Email', 'Employee ID', 'Department', 'Experience', 'Actions'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 pr-4 font-medium">{t.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{t.email}</td>
                  <td className="py-3 pr-4">{t.employee_id}</td>
                  <td className="py-3 pr-4">{t.department}</td>
                  <td className="py-3 pr-4">{t.experience_years ? `${t.experience_years} yrs` : '-'}</td>
                  <td className="py-3">
                    <button onClick={() => del(t.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!teachers.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No teachers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Teacher">
        <div className="space-y-3">
          {[
            ['full_name', 'Full Name *', 'text'],
            ['email', 'Email *', 'email'],
            ['password', 'Password', 'password'],
            ['phone', 'Phone', 'tel'],
            ['employee_id', 'Employee ID *', 'text'],
            ['department', 'Department', 'text'],
            ['qualification', 'Qualification', 'text'],
            ['experience_years', 'Experience (years)', 'number'],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input type={type} className="input" value={form[name]}
                onChange={e => setForm(p => ({...p, [name]: e.target.value}))} />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Teacher'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/admin/FeeManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { feeAPI, studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus } from 'lucide-react'

export default function FeeManagement() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ student_id: '', amount: '', fee_type: 'Tuition', due_date: '' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const load = () => {
    feeAPI.list(filter ? { status: filter } : {}).then(r => setFees(r.data.fees || [])).catch(() => {})
    feeAPI.stats().then(r => setStats(r.data)).catch(() => {})
  }
  useEffect(() => { load(); studentAPI.list({ limit: 200 }).then(r => setStudents(r.data.students || [])).catch(() => {}) }, [])
  useEffect(load, [filter])

  const create = async () => {
    if (!form.student_id || !form.amount || !form.due_date) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await feeAPI.create({ ...form, student_id: Number(form.student_id), amount: Number(form.amount) })
      toast.success('Fee record created!')
      setModal(false)
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const markPaid = async (id) => {
    await feeAPI.pay(id, { status: 'paid' })
    toast.success('Marked as paid')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Fee Record</button>
      </div>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center"><p className="text-3xl font-bold text-gray-900 dark:text-white">₹{stats.total?.toLocaleString()}</p><p className="text-gray-500">Total</p></div>
          <div className="card text-center"><p className="text-3xl font-bold text-green-600">₹{stats.paid?.toLocaleString()}</p><p className="text-gray-500">Collected</p></div>
          <div className="card text-center"><p className="text-3xl font-bold text-red-600">₹{stats.pending?.toLocaleString()}</p><p className="text-gray-500">Pending</p></div>
        </div>
      )}
      <div className="card">
        <div className="flex gap-2 mb-4">
          {['', 'paid', 'unpaid', 'overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Student', 'Type', 'Amount', 'Due Date', 'Status', 'Action'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4">Student #{f.student_id}</td>
                  <td className="py-2 pr-4">{f.fee_type}</td>
                  <td className="py-2 pr-4 font-bold">₹{f.amount?.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-gray-500">{new Date(f.due_date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4"><span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{f.status}</span></td>
                  <td className="py-2">
                    {f.status !== 'paid' && <button onClick={() => markPaid(f.id)} className="text-xs btn-primary py-1 px-3">Mark Paid</button>}
                  </td>
                </tr>
              ))}
              {!fees.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No fee records.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Fee Record">
        <div className="space-y-4">
          <div><label className="label">Student *</label>
            <select className="input" value={form.student_id} onChange={e => setForm(p => ({...p, student_id: e.target.value}))}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Fee Type</label>
              <select className="input" value={form.fee_type} onChange={e => setForm(p => ({...p, fee_type: e.target.value}))}>
                {['Tuition', 'Library', 'Lab', 'Sports', 'Exam'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} /></div>
            <div className="col-span-2"><label className="label">Due Date *</label><input type="datetime-local" className="input" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
''')

w("src/pages/admin/Analytics.jsx", '''import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.attendanceTrend()])
      .then(([d, t]) => { setData(d.data); setTrend(t.data.trend?.slice().reverse() || []) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const gradeData = Object.entries(data?.grade_distribution || {}).map(([grade, count]) => ({ grade, count }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">30-Day Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total Students', data?.total_students, 'blue'],
          ['Total Teachers', data?.total_teachers, 'purple'],
          ['Attendance %', `${data?.attendance_percentage}%`, 'green'],
          ['Total Assignments', data?.total_assignments, 'orange'],
        ].map(([label, value, color]) => (
          <div key={label} className={`card text-center bg-${color}-50 dark:bg-${color}-900/20`}>
            <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
''')

w("src/pages/admin/TimetableManagement.jsx", '''import React, { useEffect, useState } from 'react'
import { timetableAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function TimetableManagement() {
  const [entries, setEntries] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ class_name: 'CS-3A', section: 'A', day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', room: '', subject_id: '', teacher_id: '' })
  const [loading, setLoading] = useState(false)

  const load = () => timetableAPI.get({ class_name: form.class_name }).then(r => setEntries(r.data.timetable || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    setLoading(true)
    try {
      await timetableAPI.create({ ...form, subject_id: form.subject_id ? Number(form.subject_id) : null, teacher_id: form.teacher_id ? Number(form.teacher_id) : null })
      toast.success('Timetable entry added!')
      setModal(false)
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const del = async (id) => {
    await timetableAPI.delete(id)
    toast.success('Entry deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timetable Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Entry</button>
      </div>
      {DAYS.map(day => {
        const dayEntries = entries.filter(e => e.day_of_week === day)
        if (!dayEntries.length) return null
        return (
          <div key={day} className="card">
            <h3 className="font-semibold text-primary-600 mb-3">{day}</h3>
            <div className="space-y-2">
              {dayEntries.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Subject #{e.subject_id || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{e.start_time} – {e.end_time} {e.room ? `| Room: ${e.room}` : ''}</p>
                  </div>
                  <button onClick={() => del(e.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {!entries.length && <div className="card text-center text-gray-500">No timetable entries.</div>}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Timetable Entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Class</label><input className="input" value={form.class_name} onChange={e => setForm(p => ({...p, class_name: e.target.value}))} /></div>
            <div><label className="label">Section</label><input className="input" value={form.section} onChange={e => setForm(p => ({...p, section: e.target.value}))} /></div>
            <div><label className="label">Day</label>
              <select className="input" value={form.day_of_week} onChange={e => setForm(p => ({...p, day_of_week: e.target.value}))}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">Room</label><input className="input" value={form.room} onChange={e => setForm(p => ({...p, room: e.target.value}))} /></div>
            <div><label className="label">Start Time</label><input type="time" className="input" value={form.start_time} onChange={e => setForm(p => ({...p, start_time: e.target.value}))} /></div>
            <div><label className="label">End Time</label><input type="time" className="input" value={form.end_time} onChange={e => setForm(p => ({...p, end_time: e.target.value}))} /></div>
            <div><label className="label">Subject ID</label><input type="number" className="input" value={form.subject_id} onChange={e => setForm(p => ({...p, subject_id: e.target.value}))} /></div>
            <div><label className="label">Teacher ID</label><input type="number" className="input" value={form.teacher_id} onChange={e => setForm(p => ({...p, teacher_id: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Entry'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
''')

# ============ COMMON PAGES ============
w("src/pages/common/Notices.jsx", '''import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { noticeAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Bell } from 'lucide-react'

export default function Notices() {
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target_role: 'all' })
  const [loading, setLoading] = useState(false)

  const load = () => noticeAPI.list().then(r => setNotices(r.data.notices || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.title || !form.description) return toast.error('Fill all fields')
    setLoading(true)
    try {
      await noticeAPI.create(form)
      toast.success('Notice published!')
      setModal(false)
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const del = async (id) => {
    await noticeAPI.delete(id)
    toast.success('Notice deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices & Announcements</h1>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Post Notice</button>
        )}
      </div>
      <div className="space-y-4">
        {notices.map(n => (
          <div key={n.id} className="card border-l-4 border-l-primary-400">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{n.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{n.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    <span className="badge badge-blue">{n.target_role}</span>
                  </div>
                </div>
              </div>
              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <button onClick={() => del(n.id)} className="text-xs text-red-500 hover:text-red-700 ml-4">Delete</button>
              )}
            </div>
          </div>
        ))}
        {!notices.length && (
          <div className="card text-center text-gray-500 py-12">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No notices posted yet.</p>
          </div>
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Post a Notice">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Notice title" /></div>
          <div><label className="label">Description *</label><textarea className="input h-32 resize-none" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Notice content..." /></div>
          <div><label className="label">Target Audience</label>
            <select className="input" value={form.target_role} onChange={e => setForm(p => ({...p, target_role: e.target.value}))}>
              {['all', 'student', 'teacher', 'parent'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Posting...' : 'Post Notice'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
''')

# ============ PARENT PAGES ============
w("src/pages/parent/Dashboard.jsx", '''import React from 'react'
import { useAuth } from '../../context/AuthContext'

export default function ParentDashboard() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.full_name}</h1>
      <div className="card">
        <p className="text-gray-500">Parent dashboard - track your child\'s progress.</p>
      </div>
    </div>
  )
}
''')

# ============ APP.JSX ============
w("src/App.jsx", '''import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { FullPageLoader } from './components/common/LoadingSpinner'
import Layout from './components/common/Layout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import StudentDashboard from './pages/student/Dashboard'
import Attendance from './pages/student/Attendance'
import Exams from './pages/student/Exams'
import Assignments from './pages/student/Assignments'
import Fees from './pages/student/Fees'
import AIInsights from './pages/student/AIInsights'
import Leaves from './pages/student/Leaves'
import Timetable from './pages/student/Timetable'
import Calendar from './pages/student/Calendar'

import TeacherDashboard from './pages/teacher/Dashboard'
import AttendanceManagement from './pages/teacher/AttendanceManagement'
import AssignmentManagement from './pages/teacher/AssignmentManagement'
import MarksManagement from './pages/teacher/MarksManagement'
import TeacherAnalytics from './pages/teacher/Analytics'
import PracticalManagement from './pages/teacher/PracticalManagement'

import AdminDashboard from './pages/admin/Dashboard'
import StudentManagement from './pages/admin/StudentManagement'
import TeacherManagement from './pages/admin/TeacherManagement'
import FeeManagement from './pages/admin/FeeManagement'
import TimetableManagement from './pages/admin/TimetableManagement'
import AdminAnalytics from './pages/admin/Analytics'

import Notices from './pages/common/Notices'
import ParentDashboard from './pages/parent/Dashboard'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (user) return <Navigate to={`/${user.role}`} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={["student"]}><Attendance /></ProtectedRoute>} />
      <Route path="/student/marks" element={<ProtectedRoute roles={["student"]}><Exams /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute roles={["student"]}><Assignments /></ProtectedRoute>} />
      <Route path="/student/fees" element={<ProtectedRoute roles={["student"]}><Fees /></ProtectedRoute>} />
      <Route path="/student/ai-insights" element={<ProtectedRoute roles={["student"]}><AIInsights /></ProtectedRoute>} />
      <Route path="/student/leaves" element={<ProtectedRoute roles={["student"]}><Leaves /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute roles={["student"]}><Timetable /></ProtectedRoute>} />
      <Route path="/student/calendar" element={<ProtectedRoute roles={["student"]}><Calendar /></ProtectedRoute>} />
      <Route path="/student/notices" element={<ProtectedRoute roles={["student"]}><Notices /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute roles={["teacher", "admin"]}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute roles={["teacher", "admin"]}><AttendanceManagement /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute roles={["teacher", "admin"]}><AssignmentManagement /></ProtectedRoute>} />
      <Route path="/teacher/marks" element={<ProtectedRoute roles={["teacher", "admin"]}><MarksManagement /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute roles={["teacher", "admin"]}><StudentManagement /></ProtectedRoute>} />
      <Route path="/teacher/notices" element={<ProtectedRoute roles={["teacher", "admin"]}><Notices /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute roles={["teacher", "admin"]}><TeacherAnalytics /></ProtectedRoute>} />
      <Route path="/teacher/practicals" element={<ProtectedRoute roles={["teacher", "admin"]}><PracticalManagement /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={["admin"]}><StudentManagement /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute roles={["admin"]}><TeacherManagement /></ProtectedRoute>} />
      <Route path="/admin/fees" element={<ProtectedRoute roles={["admin"]}><FeeManagement /></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute roles={["admin"]}><TimetableManagement /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/notices" element={<ProtectedRoute roles={["admin"]}><Notices /></ProtectedRoute>} />

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute roles={["parent"]}><ParentDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                duration: 3000,
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
''')

print("\nAll frontend pages written successfully!")

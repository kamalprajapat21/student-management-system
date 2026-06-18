import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const roleFields = {
  student: [
    { name: 'roll_number', label: 'Roll Number', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'class_name', label: 'Class', type: 'text', required: true },
    { name: 'semester', label: 'Semester', type: 'number', required: true },
    { name: 'year', label: 'Year', type: 'number', required: true },
    { name: 'parent_email', label: 'Parent Email', type: 'email', required: false },
  ],
  teacher: [
    { name: 'employee_id', label: 'Employee ID', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'qualification', label: 'Qualification', type: 'text', required: false },
  ],
  parent: [
    { name: 'student_roll_number', label: "Child's Roll Number", type: 'text', required: true },
    { name: 'relationship', label: 'Relationship', type: 'text', required: true },
  ],
};

const Register = () => {
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, role };
      delete payload.confirm_password;
      if (role === 'student') await authService.registerStudent(payload);
      else if (role === 'teacher') await authService.registerTeacher(payload);
      else await authService.registerParent(payload);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <AcademicCapIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        </div>

        <div className="card shadow-xl border-0">
          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
            {['student', 'teacher', 'parent'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${role === r ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input name="full_name" type="text" className="input" placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" className="input" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" type="tel" className="input" placeholder="+91 9999999999" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            {/* Role-specific fields */}
            {roleFields[role]?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleFields[role].map((field) => (
                  <div key={field.name}>
                    <label className="label">{field.label}</label>
                    <input
                      name={field.name}
                      type={field.type}
                      className="input"
                      required={field.required}
                      value={form[field.name] || ''}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" className="input" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input name="confirm_password" type="password" className="input" placeholder="••••••••" value={form.confirm_password} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <LoadingSpinner size="sm" className="mx-auto" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

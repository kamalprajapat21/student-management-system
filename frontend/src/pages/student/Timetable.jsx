import React, { useEffect, useState } from 'react'
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

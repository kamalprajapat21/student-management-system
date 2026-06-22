import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { timetableAPI } from '../../services/api'
import { Clock, MapPin, BookOpen, Calendar } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const dayColors = {
  Monday: 'from-blue-500 to-blue-600',
  Tuesday: 'from-purple-500 to-purple-600',
  Wednesday: 'from-emerald-500 to-emerald-600',
  Thursday: 'from-amber-500 to-amber-600',
  Friday: 'from-rose-500 to-rose-600',
  Saturday: 'from-indigo-500 to-indigo-600',
}
const dayBg = {
  Monday: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
  Tuesday: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
  Wednesday: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
  Thursday: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
  Friday: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800',
  Saturday: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800',
}

const today = DAYS[new Date().getDay() - 1]

export default function Timetable() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(today || 'Monday')

  useEffect(() => {
    timetableAPI.get({ class_name: user.class_name })
      .then(r => { setEntries(r.data.timetable || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user.class_name])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )

  const activeDays = DAYS.filter(d => entries.some(e => e.day_of_week === d))
  const dayEntries = entries.filter(e => e.day_of_week === activeDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
  const totalClasses = entries.length

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">My Timetable</h1>
        <p className="page-subtitle">{user.class_name} — {totalClasses} classes per week</p>
      </div>

      {!entries.length ? (
        <div className="card text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No timetable entries found for your class.</p>
          <p className="text-xs text-gray-400 mt-1">Contact your admin to set up the timetable.</p>
        </div>
      ) : (
        <>
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {DAYS.filter(d => entries.some(e => e.day_of_week === d)).map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeDay === day
                    ? `bg-gradient-to-r ${dayColors[day]} text-white shadow-md`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${day === today ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}
              >
                {day.slice(0, 3)}
                {day === today && <span className="ml-1 text-xs opacity-80">Today</span>}
              </button>
            ))}
          </div>

          {/* Schedule for active day */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-1 w-6 rounded-full bg-gradient-to-r ${dayColors[activeDay]}`} />
              <h3 className="font-semibold text-gray-900 dark:text-white">{activeDay}</h3>
              <span className="text-sm text-gray-500">— {dayEntries.length} classes</span>
              {activeDay === today && <span className="badge badge-blue text-xs">Today</span>}
            </div>

            {dayEntries.length === 0 ? (
              <div className={`card border ${dayBg[activeDay]} text-center py-8`}>
                <p className="text-gray-500">No classes on {activeDay}</p>
              </div>
            ) : (
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-3">
                  {dayEntries.map((e, idx) => (
                    <div key={e.id} className="relative">
                      {/* Dot */}
                      <div className={`absolute -left-5 w-3 h-3 rounded-full bg-gradient-to-br ${dayColors[activeDay]} mt-4 ring-2 ring-white dark:ring-gray-800`} />
                      <div className={`card border ${dayBg[activeDay]} p-4 ml-1`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {e.subject_name || `Subject ${e.subject_id}`}
                            </p>
                            {e.teacher_name && (
                              <p className="text-xs text-gray-500 mt-0.5">{e.teacher_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {e.start_time} – {e.end_time}
                            </span>
                            {e.room && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {e.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Weekly grid overview */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Weekly Overview</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DAYS.map(day => {
                const cnt = entries.filter(e => e.day_of_week === day).length
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      activeDay === day ? `${dayBg[day]} shadow-sm` : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${cnt === 0 ? 'opacity-40' : ''}`}
                  >
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.slice(0, 3)}</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{cnt}</p>
                    <p className="text-xs text-gray-400">class{cnt !== 1 ? 'es' : ''}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

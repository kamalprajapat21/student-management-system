import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, GraduationCap, PartyPopper } from 'lucide-react'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// Sample academic events (in a real app these would come from an API)
const ACADEMIC_EVENTS = [
  { month: 0, day: 1, label: "New Year Holiday", type: "holiday" },
  { month: 0, day: 15, label: "Unit Test 1", type: "exam" },
  { month: 1, day: 14, label: "Mid-Term Exam Begin", type: "exam" },
  { month: 2, day: 21, label: "Spring Break", type: "holiday" },
  { month: 3, day: 5, label: "Assignment Deadline", type: "assignment" },
  { month: 3, day: 14, label: "Annual Sports Day", type: "event" },
  { month: 4, day: 1, label: "Labour Day Holiday", type: "holiday" },
  { month: 4, day: 20, label: "Final Exam Week", type: "exam" },
  { month: 5, day: 10, label: "Summer Break Begin", type: "holiday" },
  { month: 7, day: 1, label: "New Semester Begins", type: "event" },
  { month: 9, day: 2, label: "Gandhi Jayanti", type: "holiday" },
  { month: 9, day: 15, label: "Mid-Term Exam", type: "exam" },
  { month: 10, day: 1, label: "Assignment Week", type: "assignment" },
  { month: 10, day: 14, label: "Diwali Holiday", type: "holiday" },
  { month: 11, day: 25, label: "Christmas Holiday", type: "holiday" },
]

const typeConfig = {
  exam: { color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: GraduationCap },
  assignment: { color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: BookOpen },
  holiday: { color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: PartyPopper },
  event: { color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: CalendarDays },
}

export default function Calendar() {
  const now = new Date()
  const [date, setDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthEvents = ACADEMIC_EVENTS.filter(e => e.month === month)
  const upcomingEvents = ACADEMIC_EVENTS.filter(e => {
    const d = new Date(now.getFullYear(), e.month, e.day)
    return d >= now
  }).slice(0, 5)

  const getEventsForDay = (day) => monthEvents.filter(e => e.day === day)

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Academic Calendar</h1>
        <p className="page-subtitle">Stay on top of exams, holidays, and important dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setDate(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95">
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{MONTH_NAMES[month]} {year}</h3>
            <button onClick={() => setDate(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95">
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const dayEvts = getEventsForDay(day)
              return (
                <div key={day} className={`relative p-1.5 rounded-xl transition-colors cursor-default min-h-[42px] flex flex-col items-center ${
                  isToday ? 'bg-primary-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{day}</span>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayEvts.slice(0, 3).map((evt, ei) => (
                      <span key={ei} className={`w-1.5 h-1.5 rounded-full ${typeConfig[evt.type]?.color || 'bg-gray-400'}`} title={evt.label} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {Object.entries(typeConfig).map(([type, cfg]) => (
              <span key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                <span className="capitalize">{type}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">This Month's Events</h3>
            {monthEvents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No events this month</p>
            ) : (
              <div className="space-y-2">
                {monthEvents.map((e, i) => {
                  const cfg = typeConfig[e.type]
                  const Icon = cfg?.icon
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${cfg?.badge || ''}`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {Icon && <Icon className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{MONTH_NAMES[month].slice(0, 3)} {e.day}</p>
                        <p className="text-xs mt-0.5 opacity-80">{e.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((e, i) => {
                  const cfg = typeConfig[e.type]
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg?.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{e.label}</p>
                        <p className="text-xs text-gray-400">{MONTH_NAMES[e.month]} {e.day}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg?.badge}`}>{e.type}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

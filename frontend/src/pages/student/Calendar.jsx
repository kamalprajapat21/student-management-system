import React, { useState } from 'react'
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

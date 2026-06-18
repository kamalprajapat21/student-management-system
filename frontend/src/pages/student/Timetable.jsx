import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { timetableService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  useEffect(() => {
    timetableService.getMine()
      .then(({ data }) => setTimetable(data))
      .finally(() => setLoading(false));
  }, []);

  const daySlots = timetable?.slots?.filter(s => s.day === activeDay) || [];

  return (
    <Layout title="Timetable">
      <div className="space-y-6">
        {loading ? <LoadingSpinner className="py-12" /> : !timetable ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">No timetable available for your class yet</p>
          </div>
        ) : (
          <>
            {/* Day selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeDay === day
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border hover:bg-gray-50'
                  } ${day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && activeDay !== day ? 'border-primary-300' : ''}`}
                >
                  {day.slice(0, 3)}
                  {day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && (
                    <span className="ml-1 text-xs">•</span>
                  )}
                </button>
              ))}
            </div>

            {/* Time slots */}
            <div className="card">
              <h3 className="section-title">{activeDay}</h3>
              {daySlots.length === 0 ? (
                <div className="py-12 text-center text-gray-400">No classes scheduled for {activeDay}</div>
              ) : (
                <div className="space-y-3">
                  {daySlots
                    .sort((a, b) => a.start_time?.localeCompare(b.start_time))
                    .map((slot, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-bold text-primary-600">{slot.start_time}</p>
                          <p className="text-xs text-gray-400">to</p>
                          <p className="text-sm font-bold text-gray-500">{slot.end_time}</p>
                        </div>
                        <div className="w-0.5 h-12 bg-primary-200 dark:bg-primary-700" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{slot.subject}</p>
                          <p className="text-sm text-gray-500 mt-0.5">👩‍🏫 {slot.teacher_name}</p>
                        </div>
                        {slot.room && (
                          <div className="text-right">
                            <span className="badge badge-blue">📍 {slot.room}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Full weekly view */}
            <div className="card overflow-x-auto">
              <h3 className="section-title">Weekly Overview</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left text-gray-500 font-semibold">Time</th>
                    {DAYS.slice(0, 6).map(d => (
                      <th key={d} className={`py-2 px-3 font-semibold ${d === activeDay ? 'text-primary-600' : 'text-gray-500'}`}>
                        {d.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const times = [...new Set(timetable.slots?.map(s => s.start_time))].sort();
                    return times.map(time => (
                      <tr key={time} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-500 font-medium">{time}</td>
                        {DAYS.slice(0, 6).map(d => {
                          const slot = timetable.slots?.find(s => s.day === d && s.start_time === time);
                          return (
                            <td key={d} className={`py-2 px-3 ${slot ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                              {slot ? (
                                <div>
                                  <p className="font-medium text-primary-700 dark:text-primary-300">{slot.subject}</p>
                                  <p className="text-gray-400">{slot.room || ''}</p>
                                </div>
                              ) : <span className="text-gray-300">-</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Timetable;

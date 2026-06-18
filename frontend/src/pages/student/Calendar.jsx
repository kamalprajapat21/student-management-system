import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { examService, noticeService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [examsRes, noticesRes] = await Promise.allSettled([
          examService.getAll(),
          noticeService.getAll({ limit: 20 }),
        ]);
        const eventList = [];
        if (examsRes.status === 'fulfilled') {
          examsRes.value.data.forEach(e => {
            eventList.push({
              date: e.exam_date,
              title: e.title,
              type: e.exam_type === 'practical' ? 'practical' : 'exam',
              color: e.exam_type === 'practical' ? 'bg-orange-200 text-orange-800' : 'bg-purple-200 text-purple-800'
            });
          });
        }
        setEvents(eventList);
      } catch {}
    };
    fetch();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <Layout title="Calendar">
      <div className="space-y-6">
        <div className="card">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="btn-secondary px-3 py-1.5">◀</button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {MONTHS[month]} {year}
            </h3>
            <button onClick={nextMonth} className="btn-secondary px-3 py-1.5">▶</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={i} />;
              const dayEvents = getEventsForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              return (
                <div key={day} className={`min-h-[80px] p-1.5 rounded-xl border ${isToday ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`}>
                  <p className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                    {isToday && <span className="ml-1 text-xs bg-primary-600 text-white px-1 rounded">Today</span>}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e, j) => (
                      <div key={j} className={`text-xs px-1 py-0.5 rounded truncate ${e.color}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-400">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="card">
          <h3 className="section-title">Legend</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { color: 'bg-purple-200 text-purple-800', label: 'Exam' },
              { color: 'bg-orange-200 text-orange-800', label: 'Practical' },
              { color: 'bg-blue-200 text-blue-800', label: 'Assignment Due' },
              { color: 'bg-green-200 text-green-800', label: 'Event' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${color}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card">
          <h3 className="section-title">Upcoming Events This Month</h3>
          {events.filter(e => e.date?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 ? (
            <p className="text-gray-400 text-center py-4">No events this month</p>
          ) : (
            <div className="space-y-2">
              {events
                .filter(e => e.date?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                .sort((a, b) => a.date?.localeCompare(b.date))
                .map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${e.color}`}>{e.type}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">{e.title}</p>
                    <p className="text-sm text-gray-500">{e.date}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;

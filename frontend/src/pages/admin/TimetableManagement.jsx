import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { timetableService } from '../../services';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableManagement = () => {
  const [classId, setClassId] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slots, setSlots] = useState([
    { day: 'Monday', start_time: '09:00', end_time: '10:00', subject: '', teacher_name: '', room: '' }
  ]);
  const [form, setForm] = useState({ class_id: '', semester: '1', academic_year: new Date().getFullYear().toString() });

  const fetchTimetable = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await timetableService.getByClass(id);
      setTimetable(data);
    } catch { setTimetable(null); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await timetableService.create({ ...form, slots });
      toast.success('Timetable created!');
      setShowCreate(false);
      fetchTimetable(form.class_id);
    } catch { toast.error('Failed'); } finally { setCreating(false); }
  };

  const addSlot = () => setSlots(p => [...p, { day: 'Monday', start_time: '', end_time: '', subject: '', teacher_name: '', room: '' }]);

  const updateSlot = (i, field, value) => {
    setSlots(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n; });
  };

  const groupedSlots = (allSlots) => {
    const grouped = {};
    DAYS.forEach(d => { grouped[d] = allSlots?.filter(s => s.day === d) || []; });
    return grouped;
  };

  return (
    <Layout title="Timetable Management">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="page-title">Timetable Management</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Timetable
          </button>
        </div>

        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Search by Class</label>
              <input type="text" className="input" placeholder="e.g. CSE-A" value={classId} onChange={(e) => setClassId(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={() => fetchTimetable(classId)} className="btn-primary px-6">Load</button>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : timetable ? (
          <div className="card overflow-x-auto">
            <h3 className="section-title">Timetable for {timetable.class_id} | Semester {timetable.semester}</h3>
            <div className="space-y-4">
              {Object.entries(groupedSlots(timetable.slots)).map(([day, daySlots]) => (
                <div key={day}>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">{day}</h4>
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-gray-400 pl-4">No classes</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot, i) => (
                        <div key={i} className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-3 min-w-[160px]">
                          <p className="text-xs text-primary-600 font-medium">{slot.start_time} - {slot.end_time}</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{slot.subject}</p>
                          <p className="text-xs text-gray-500">{slot.teacher_name}</p>
                          {slot.room && <p className="text-xs text-gray-400">📍 {slot.room}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : classId && (
          <div className="card text-center py-12 text-gray-400">
            No timetable found for {classId}. Create one above.
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Timetable" size="xl"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <LoadingSpinner size="sm" /> : 'Save Timetable'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Class</label><input className="input" value={form.class_id} onChange={(e) => setForm(p => ({ ...p, class_id: e.target.value }))} placeholder="CSE-A" required /></div>
            <div><label className="label">Semester</label><input className="input" value={form.semester} onChange={(e) => setForm(p => ({ ...p, semester: e.target.value }))} /></div>
            <div><label className="label">Academic Year</label><input className="input" value={form.academic_year} onChange={(e) => setForm(p => ({ ...p, academic_year: e.target.value }))} /></div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="label">Slots</label>
              <button type="button" onClick={addSlot} className="text-sm text-primary-600 font-medium">+ Add Slot</button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {slots.map((slot, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div>
                    <label className="label text-xs">Day</label>
                    <select className="input text-sm" value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)}>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Start</label>
                    <input type="time" className="input text-sm" value={slot.start_time} onChange={(e) => updateSlot(i, 'start_time', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-xs">End</label>
                    <input type="time" className="input text-sm" value={slot.end_time} onChange={(e) => updateSlot(i, 'end_time', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-xs">Subject</label>
                    <input className="input text-sm" value={slot.subject} onChange={(e) => updateSlot(i, 'subject', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-xs">Teacher</label>
                    <input className="input text-sm" value={slot.teacher_name} onChange={(e) => updateSlot(i, 'teacher_name', e.target.value)} />
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <label className="label text-xs">Room</label>
                      <input className="input text-sm" value={slot.room} onChange={(e) => updateSlot(i, 'room', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => setSlots(prev => prev.filter((_, j) => j !== i))} className="text-red-500 mb-1 px-2 text-lg">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default TimetableManagement;

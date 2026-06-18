import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { examService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const Exams = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [marksRes, examsRes] = await Promise.all([
          examService.getStudentMarks(user.id),
          examService.getUpcoming(),
        ]);
        setMarks(marksRes.data);
        setUpcomingExams(examsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id]);

  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (pct >= 80) return { grade: 'A', color: 'text-green-500' };
    if (pct >= 70) return { grade: 'B', color: 'text-blue-500' };
    if (pct >= 60) return { grade: 'C', color: 'text-yellow-500' };
    if (pct >= 50) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-600' };
  };

  return (
    <Layout title="Exams & Marks">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-fit">
          {['upcoming', 'marks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'upcoming' ? 'Upcoming Exams' : 'Marks & Results'}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <>
            {activeTab === 'upcoming' && (
              <div className="card">
                <h3 className="section-title">Upcoming Exams & Practicals</h3>
                {upcomingExams.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No upcoming exams scheduled</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingExams.map((exam) => {
                      const daysLeft = Math.ceil((new Date(exam.exam_date) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={exam.id} className={`p-4 rounded-xl border ${exam.exam_type === 'practical' ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20' : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`badge text-xs ${exam.exam_type === 'practical' ? 'badge-yellow' : 'badge-blue'}`}>
                                {exam.exam_type}
                              </span>
                              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">{exam.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{exam.subject}</p>
                            </div>
                            <div className={`text-right ${daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                              <p className="text-lg font-bold">{daysLeft}d</p>
                              <p className="text-xs">remaining</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>📅 {exam.exam_date}</span>
                            <span>🕐 {exam.start_time}</span>
                            {exam.venue && <span>📍 {exam.venue}</span>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Marks: {exam.total_marks}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'marks' && (
              <div className="card">
                <h3 className="section-title">Exam Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        {['Subject', 'Exam Type', 'Obtained', 'Total', 'Percentage', 'Grade'].map(h => (
                          <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {marks.map((m, i) => {
                        const total = m.exam_details?.total_marks || 100;
                        const pct = ((m.marks_obtained / total) * 100).toFixed(1);
                        const { grade, color } = getGrade(parseFloat(pct));
                        return (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {m.exam_details?.subject || '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="badge badge-blue capitalize">{m.exam_details?.exam_type}</span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{m.marks_obtained}</td>
                            <td className="py-3 px-4 text-gray-500">{total}</td>
                            <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{pct}%</td>
                            <td className={`py-3 px-4 font-bold text-lg ${color}`}>{grade}</td>
                          </tr>
                        );
                      })}
                      {marks.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-gray-400">No marks uploaded yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Exams;

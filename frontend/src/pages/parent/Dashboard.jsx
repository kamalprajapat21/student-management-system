import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { parentService } from '../../services';
import {
  ClipboardDocumentListIcon, CurrencyRupeeIcon,
  AcademicCapIcon, BellIcon, UserIcon
} from '@heroicons/react/24/outline';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ParentDashboard = () => {
  const [childInfo, setChildInfo] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [marks, setMarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [childRes, attRes, feesRes, marksRes, notifRes] = await Promise.allSettled([
          parentService.getChildInfo(),
          parentService.getChildAttendance(),
          parentService.getChildFees(),
          parentService.getChildMarks(),
          parentService.getChildNotifications(),
        ]);
        if (childRes.status === 'fulfilled') setChildInfo(childRes.value.data);
        if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);
        if (feesRes.status === 'fulfilled') setFees(feesRes.value.data);
        if (marksRes.status === 'fulfilled') setMarks(marksRes.value.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const attChart = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [attendance?.summary?.present || 0, attendance?.summary?.absent || 0],
      backgroundColor: ['#22c55e', '#f87171'],
      borderWidth: 0,
    }]
  };

  return (
    <Layout title="Parent Dashboard">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Parent Dashboard 👨‍👩‍👦</h2>
          {childInfo && (
            <div className="mt-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{childInfo.full_name?.[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-white">{childInfo.full_name}</p>
                <p className="text-purple-200 text-sm">{childInfo.roll_number} • {childInfo.class_name} • Sem {childInfo.semester}</p>
              </div>
            </div>
          )}
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Attendance" value={`${attendance?.summary?.percentage || 0}%`}
                icon={ClipboardDocumentListIcon}
                color={attendance?.summary?.percentage >= 75 ? 'green' : 'red'}
                subtitle={attendance?.summary?.status} />
              <StatCard title="Fee Due" value={`₹${fees?.total_due?.toFixed(0) || '0'}`}
                icon={CurrencyRupeeIcon}
                color={fees?.total_due > 0 ? 'red' : 'green'} />
              <StatCard title="Exams Recorded" value={marks.length}
                icon={AcademicCapIcon} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Attendance Chart */}
              <div className="card text-center">
                <h3 className="section-title">Attendance</h3>
                <div className="w-44 h-44 mx-auto">
                  <Doughnut data={attChart} options={{
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom' } }
                  }} />
                </div>
                <p className={`text-2xl font-bold mt-2 ${attendance?.summary?.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                  {attendance?.summary?.percentage || 0}%
                </p>
                <p className="text-sm text-gray-500">{attendance?.summary?.status}</p>
              </div>

              {/* Marks */}
              <div className="card">
                <h3 className="section-title">Recent Marks</h3>
                {marks.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No marks recorded</p>
                ) : (
                  <div className="space-y-3">
                    {marks.slice(0, 5).map((m, i) => {
                      const pct = m.exam_details?.total_marks > 0
                        ? (m.marks_obtained / m.exam_details.total_marks * 100).toFixed(1)
                        : 0;
                      return (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {m.exam_details?.subject || 'Subject'}
                            </p>
                            <p className="text-xs text-gray-500">{m.exam_details?.exam_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {m.marks_obtained}/{m.exam_details?.total_marks}
                            </p>
                            <p className={`text-xs ${pct >= 60 ? 'text-green-600' : 'text-red-600'}`}>{pct}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="card">
                <h3 className="section-title flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-yellow-500" />
                  Alerts
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No alerts</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 rounded-lg ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message?.slice(0, 80)}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.created_at?.slice(0, 10)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fee Details */}
            <div className="card">
              <h3 className="section-title">Fee Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {['Fee Type', 'Amount', 'Paid', 'Due', 'Due Date', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(fees?.fees || []).map((fee) => (
                      <tr key={fee.id}>
                        <td className="py-3 px-4 capitalize text-gray-900 dark:text-white">{fee.fee_type}</td>
                        <td className="py-3 px-4 text-gray-600">₹{fee.amount}</td>
                        <td className="py-3 px-4 text-green-600">₹{fee.amount_paid}</td>
                        <td className="py-3 px-4 text-red-500">₹{fee.due_amount}</td>
                        <td className="py-3 px-4 text-gray-500">{fee.due_date?.slice(0, 10)}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${fee.status === 'paid' ? 'badge-green' : fee.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ParentDashboard;

import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { aiService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { CpuChipIcon, ExclamationTriangleIcon, CheckCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const AIInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      aiService.getAIDashboard(user.id)
        .then(({ data }) => setInsights(data))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const riskColors = { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' };
  const riskBg = { low: 'bg-green-50 dark:bg-green-900/20', medium: 'bg-yellow-50 dark:bg-yellow-900/20', high: 'bg-red-50 dark:bg-red-900/20' };
  const statusColors = { safe: 'text-green-600', warning: 'text-yellow-600', critical: 'text-red-600' };

  return (
    <Layout title="AI Insights">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <CpuChipIcon className="w-10 h-10 text-white/80" />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              <p className="text-purple-100 mt-1">Personalized analysis and recommendations for your academic journey</p>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : !insights ? (
          <div className="card text-center py-12 text-gray-400">Failed to load AI insights</div>
        ) : (
          <>
            {/* Performance Prediction */}
            <div className="card">
              <h3 className="section-title flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-purple-500" />
                Performance Prediction
              </h3>
              <div className={`p-4 rounded-xl ${riskBg[insights.performance_prediction?.risk_level || 'low']}`}>
                <div className="flex items-center gap-3">
                  {insights.performance_prediction?.risk_level === 'low' ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Risk Level: <span className={riskColors[insights.performance_prediction?.risk_level || 'low'] + ' text-xl font-bold capitalize'}>
                        {insights.performance_prediction?.risk_level || 'Unknown'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">Risk Score: {insights.performance_prediction?.risk_score || 0}/100</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { label: 'Attendance', value: `${insights.performance_prediction?.metrics?.attendance_percentage || 0}%` },
                  { label: 'Avg Marks', value: `${insights.performance_prediction?.metrics?.average_marks || 0}%` },
                  { label: 'Assignments', value: `${insights.performance_prediction?.metrics?.assignment_completion || 0}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Weak Subjects */}
              {insights.performance_prediction?.weak_subjects?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Weak Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {insights.performance_prediction.weak_subjects.map((s) => (
                      <span key={s.subject} className="badge badge-red">
                        {s.subject} ({s.average}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.performance_prediction?.recommendations?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {insights.performance_prediction.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">→</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Attendance Prediction */}
            <div className="card">
              <h3 className="section-title">Attendance Trend Prediction</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Current %', value: `${insights.attendance_prediction?.current_percentage || 0}%` },
                  { label: 'Predicted Final', value: `${insights.attendance_prediction?.predicted_final_percentage || 0}%` },
                  { label: 'Classes Attended', value: insights.attendance_prediction?.total_classes_attended || 0 },
                  { label: 'Classes Needed', value: insights.attendance_prediction?.classes_needed_for_75_percent || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="card bg-gray-50 dark:bg-gray-700 shadow-none text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700`}>
                <p className={`font-semibold ${statusColors[insights.attendance_prediction?.status || 'safe']}`}>
                  Status: {insights.attendance_prediction?.status?.toUpperCase() || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insights.attendance_prediction?.message}
                </p>
              </div>
            </div>

            {/* Study Recommendations */}
            {insights.recommendations?.recommendations?.length > 0 && (
              <div className="card">
                <h3 className="section-title flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-blue-500" />
                  Study Recommendations
                </h3>
                <p className="text-sm text-gray-500 mb-4">{insights.recommendations?.overall_suggestion}</p>
                <div className="space-y-4">
                  {insights.recommendations.recommendations.map((rec, i) => (
                    <div key={i} className={`p-4 rounded-xl border-l-4 ${
                      rec.priority === 'urgent' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' :
                      rec.priority === 'high' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                      'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{rec.subject}</h4>
                        <span className={`badge ${rec.priority === 'urgent' ? 'badge-red' : rec.priority === 'high' ? 'badge-yellow' : 'badge-blue'}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Current Score: {rec.current_score}%</p>
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">SUGGESTIONS:</p>
                        <ul className="space-y-1">
                          {rec.suggestions?.map((s, j) => (
                            <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {rec.resources?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">RESOURCES:</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.resources.map((r, j) => (
                              <span key={j} className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                                📚 {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AIInsights;

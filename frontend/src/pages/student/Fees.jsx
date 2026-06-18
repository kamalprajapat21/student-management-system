import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { feeService } from '../../services';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const statusColors = { paid: 'badge-green', pending: 'badge-yellow', overdue: 'badge-red', partial: 'badge-blue' };

const Fees = () => {
  const { user } = useAuth();
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchFees();
  }, [user?.id]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data } = await feeService.getStudentFees(user.id);
      setFeesData(data);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (feeId) => {
    try {
      const { data } = await feeService.downloadReceipt(feeId);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `fee_receipt_${feeId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Receipt downloaded!');
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <Layout title="Fee Management">
      <div className="space-y-6">
        {loading ? <LoadingSpinner className="py-12" /> : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card border-l-4 border-l-green-500">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">₹{feesData?.summary?.total_paid?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="card border-l-4 border-l-red-500">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-3xl font-bold text-red-600">₹{feesData?.summary?.total_due?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {/* Fee List */}
            <div className="card">
              <h3 className="section-title">Fee Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {['Fee Type', 'Total', 'Paid', 'Due', 'Due Date', 'Status', 'Receipt'].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(feesData?.fees || []).map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white capitalize">{fee.fee_type}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{fee.amount}</td>
                        <td className="py-3 px-4 text-green-600">₹{fee.amount_paid}</td>
                        <td className="py-3 px-4 text-red-500">₹{fee.due_amount}</td>
                        <td className="py-3 px-4 text-gray-500">{fee.due_date?.slice(0, 10)}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${statusColors[fee.status] || 'badge-blue'}`}>{fee.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          {(fee.amount_paid > 0) && (
                            <button
                              onClick={() => downloadReceipt(fee.id)}
                              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(feesData?.fees || []).length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">No fee records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History */}
            {feesData?.fees?.some(f => f.payment_history?.length > 0) && (
              <div className="card">
                <h3 className="section-title">Transaction History</h3>
                {feesData.fees.map((fee) =>
                  fee.payment_history?.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">₹{p.amount} - {fee.fee_type}</p>
                        <p className="text-xs text-gray-500">{p.method} • {p.transaction_id || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{p.paid_at?.slice(0, 10)}</p>
                        <span className="badge badge-green">Paid</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Fees;

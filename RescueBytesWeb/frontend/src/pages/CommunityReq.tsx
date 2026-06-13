import React, { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';
import Navbar from '../components/Navbar';
import api_url from '../api.tsx';

interface CommunityReport {
  _id: number;
  type: string;
  description: string;
  createdAt: string;
}

const CommunityReq: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api_url}/getComRepAdm`);
      const data = await response.json();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  const handleApprove = async (id: number) => {
    await fetch(`${api_url}/approveComReq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchReports();
  };

  const handleReject = async (id: number) => {
    await fetch(`${api_url}/comReportsRejected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchReports();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Community Reports</h1>
        <p className="text-sm text-gray-400 mb-8">Review and moderate incoming community reports</p>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No pending reports. All reports have been processed.</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-lg border border-gray-100 px-6 py-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Flag size={15} className="text-yellow-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{report.type}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{report.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(report._id)}
                      className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 active:scale-[0.97] transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(report._id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 active:scale-[0.97] transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityReq;

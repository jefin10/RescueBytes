import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api_url from '../api.tsx';

interface Warning {
  _id: string;
  id: number;
  title: string;
  description: string;
  date: string;
  originalDate: Date;
  severity: string;
  active: boolean;
}

interface AlertItem {
  _id: string;
  title: string;
  description: string;
  time: string;
  severity: string;
  createdAt: string;
}

const Warning = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [severity, setSeverity] = useState('normal');
  const [isLoading, setIsLoading] = useState(true);
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const severityBadge = (s: string) => {
    if (s === 'high') return 'text-red-600 bg-red-50';
    if (s === 'medium') return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const severityCardBg = (s: string) => {
    if (s === 'high') return 'bg-red-50/30';
    return 'bg-white';
  };

  const SeverityIcon = ({ s }: { s: string }) => {
    if (s === 'high') return <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />;
    if (s === 'medium') return <AlertCircle size={15} className="text-yellow-500 shrink-0 mt-0.5" />;
    return <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />;
  };

  const loadWarnings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${api_url}/getAlerts`);
      if (!response.ok) throw new Error();
      const result = await response.json();
      const arr = Array.isArray(result) ? result : result.data ?? [];
      const formatted: Warning[] = arr
        .map((item: AlertItem, index: number) => ({
          _id: item._id || `tmp-${index}`,
          id: index + 1,
          title: item.title || 'Untitled',
          description: item.description || '',
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Unknown date',
          originalDate: item.createdAt ? new Date(item.createdAt) : new Date(),
          active: true,
          severity: item.severity || 'normal',
        }))
        .sort((a: Warning, b: Warning) => b.originalDate.getTime() - a.originalDate.getTime());
      setWarnings(formatted);
    } catch {
      setWarnings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadWarnings(); }, []);

  const sendWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(`${api_url}/addAlert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          severity,
          time: new Date().toLocaleDateString('en-US', { year: 'numeric' }),
          RescueCenterLocation: 'Kottayam',
        }),
      });
      setNewTitle('');
      setNewDescription('');
      setIsModalOpen(false);
      await loadWarnings();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWarning = async (_id: string) => {
    try {
      await fetch(`${api_url}/deleteAlert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      });
      await loadWarnings();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Warnings</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-sm rounded hover:bg-blue-800 active:scale-[0.97] transition-all"
          >
            <Plus size={15} />
            Add Warning
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
        ) : warnings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No warnings. Click "Add Warning" to create one.</div>
        ) : (
          <div className="space-y-4">
            {warnings.map((item) => (
              <div
                key={item._id}
                className={`rounded-lg border border-gray-100 px-6 py-5 ${severityCardBg(item.severity)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <SeverityIcon s={item.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityBadge(item.severity)}`}>
                          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWarning(item._id)}
                    className="text-gray-300 hover:text-red-500 shrink-0 transition-colors p-1 rounded hover:bg-red-50"
                    aria-label="Delete warning"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Add New Warning</h3>
            <form onSubmit={sendWarning} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Warning title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-blue-700 text-white rounded hover:bg-blue-800 active:scale-[0.97] transition-all disabled:opacity-60">
                  {isLoading ? 'Saving…' : 'Issue Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warning;

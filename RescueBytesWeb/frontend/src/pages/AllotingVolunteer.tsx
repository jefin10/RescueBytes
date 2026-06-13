import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import api_url from '../api.tsx';

interface Volunteer {
  id: string;
  name: string;
  phNo: string;
  address: string;
  fieldOfExpertise: string;
  user: { _id: string; email: string; role: string; RescueCenters: string; pfpLink: string; createdAt: string; lastUpdated: string; __v: number; sessionToken: string | null; address: string; phone: string; name: string; password: string; };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const AllotingVolunteer = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  useEffect(() => {
    fetch(`${api_url}/getVolunteers`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((r) => r.json())
      .then(setVolunteers)
      .catch(console.error);
  }, []);

  const filtered = volunteers.filter((v) =>
    [v.name, v.fieldOfExpertise, v.address].some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sendMessage = async () => {
    if (!selected) return;
    const res = await fetch(`${api_url}/addVolunteerMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selected.user._id, message: messageText, subject: messageSubject }),
    });
    const data = await res.json();
    if (data.success) alert(`Message sent to ${selected.name}`);
    setIsModalOpen(false);
    setMessageText('');
    setMessageSubject('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Volunteer Allocation</h1>

        <input
          type="text"
          className="w-full px-4 py-2 text-sm border border-gray-200 rounded mb-6 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Search by name, expertise, or address…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No volunteers match your search.</div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white rounded-lg border border-gray-100 overflow-hidden">
            {filtered.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{v.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{v.fieldOfExpertise} · {v.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{v.phNo}</p>
                </div>
                <button
                  onClick={() => { setSelected(v); setIsModalOpen(true); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Message to {selected.name}</h3>
            <p className="text-xs text-gray-400 mb-5">{selected.phNo} · {selected.fieldOfExpertise}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Your message"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                <button onClick={sendMessage} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllotingVolunteer;

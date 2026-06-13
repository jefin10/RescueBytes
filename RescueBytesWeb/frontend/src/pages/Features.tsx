import { useNavigate } from 'react-router-dom';
import earthBg from '../assets/earth-landing.jpg';

const adminFeatures = [
  { n: '01', title: 'SOS Map', sub: 'Live emergency alerts on a real-time map.' },
  { n: '02', title: 'Alerts', sub: 'Broadcast warnings to the entire community.' },
  { n: '03', title: 'Inventory', sub: 'Track and manage relief supplies.' },
  { n: '04', title: 'Volunteers', sub: 'Assign tasks and message volunteers.' },
  { n: '05', title: 'News', sub: 'Publish updates directly to the mobile app.' },
  { n: '06', title: 'Reports', sub: 'Review and approve crowd-sourced incidents.' },
];

const mobileFeatures = [
  { n: '01', title: 'One-Tap SOS', sub: 'Send your GPS location instantly.' },
  { n: '02', title: 'Safe Navigation', sub: 'AI routes that avoid danger zones.' },
  { n: '03', title: 'Emergency Chat', sub: 'Real-time guidance via Gemini AI.' },
  { n: '04', title: 'Weather', sub: 'Live alerts from your rescue center.' },
  { n: '05', title: 'Report', sub: 'Submit incidents with location and detail.' },
  { n: '06', title: 'Resource Request', sub: 'Request food, medicine, or shelter.' },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar + Hero */}
      <div
        className="relative"
        style={{ backgroundImage: `url(${earthBg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-black/65" />

        <nav className="relative z-10 flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2.5">
            <img src="./rescuebytes-logo.png" alt="RescueBytes" className="w-9 h-9" />
            <span className="text-white font-bold text-lg tracking-wide">RescueBytes</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/')} className="text-white/60 text-sm font-medium">Home</button>
            <button onClick={() => navigate('/features')} className="text-white text-sm font-medium border-b border-white pb-0.5">Features</button>
            <div className="w-px h-4 bg-white/20" />
            <button onClick={() => navigate('/login')} className="text-white text-sm font-medium px-5 py-1.5 border border-white/40 rounded">Login</button>
            <button onClick={() => navigate('/register')} className="bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded">Register</button>
          </div>
        </nav>

        <div className="relative z-10 text-center px-6 pt-16 pb-24">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase mb-4">What we offer</p>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Built for Crisis.
          </h1>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
            Designed for Communities.
          </h1>
        </div>
      </div>

      {/* Admin Section */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-3">Admin Dashboard</p>
            <h2 className="text-4xl font-extrabold text-white">Web Platform</h2>
          </div>
          <span className="text-8xl font-black text-white/[0.04] leading-none select-none">01</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {adminFeatures.map((f) => (
            <div key={f.n}>
              <span className="text-xs font-bold text-blue-500/60 tracking-widest">{f.n}</span>
              <h3 className="mt-1 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-white/5 max-w-5xl mx-auto" />

      {/* Mobile Section */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-3">For Citizens</p>
            <h2 className="text-4xl font-extrabold text-white">Mobile App</h2>
          </div>
          <span className="text-8xl font-black text-white/[0.04] leading-none select-none">02</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {mobileFeatures.map((f) => (
            <div key={f.n}>
              <span className="text-xs font-bold text-emerald-500/60 tracking-widest">{f.n}</span>
              <h3 className="mt-1 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="border-t border-white/5">
        <section className="px-8 py-20 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl font-extrabold text-white">Ready to respond?</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded"
            >
              Admin Login
            </button>
            <a
              href="https://github.com/jefin10/RescueBytes/releases/latest/download/app.apk"
              className="px-7 py-2.5 border border-white/20 text-white text-sm font-semibold rounded"
            >
              Download App
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-gray-700 text-xs">
        2025 RescueBytes
      </div>
    </div>
  );
};

export default Features;

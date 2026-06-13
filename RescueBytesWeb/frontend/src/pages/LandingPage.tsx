import { useNavigate } from 'react-router-dom';
import earthBg from '../assets/earth-landing.jpg';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundImage: `url(${earthBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="./rescuebytes-logo.png" alt="RescueBytes" className="w-9 h-9" />
          <span className="text-white font-bold text-lg tracking-wide">RescueBytes</span>
        </div>

        {/* Right side: nav links + auth buttons */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="text-white text-sm font-medium border-b border-white pb-0.5"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/features')}
            className="text-white/70 text-sm font-medium hover:text-white transition-colors"
          >
            Features
          </button>
          <div className="w-px h-4 bg-white/25" />
          <button
            onClick={() => navigate('/login')}
            className="text-white text-sm font-medium px-5 py-1.5 border border-white/50 rounded hover:bg-white/10 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero — bottom-left */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-12 sm:px-20 pb-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
          Welcome to RescueBytes
        </h1>
        <p className="mt-5 text-base sm:text-lg text-white/75 max-w-md">
          Emergency response and disaster management for communities, anytime, anywhere.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 active:scale-[0.97] transition-all"
          >
            Admin Login
          </button>
          <a
            href="https://github.com/jefin10/RescueBytes/releases/latest/download/app.apk"
            className="px-8 py-3 bg-white/10 border border-white/40 text-white text-sm font-semibold rounded hover:bg-white/20 active:scale-[0.97] transition-all backdrop-blur-sm"
          >
            Download App
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

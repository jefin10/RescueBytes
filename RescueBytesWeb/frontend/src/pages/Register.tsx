import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api_url from '../api.tsx';
import earthBg from '../assets/earth-landing.jpg';

const CommunityRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${api_url}/registercom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, location, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ backgroundImage: `url(${earthBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="./rescuebytes-logo.png" alt="RescueBytes" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white">RescueBytes</h1>
          <p className="text-sm text-white/50 mt-1">Register Your Community</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-8 py-8">
          {error && <p className="mb-4 text-xs text-center text-red-300">{error}</p>}
          {success && (
            <p className="mb-4 text-xs text-center text-green-300">
              Thank you for registering! We will connect with you soon.
            </p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Community Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/25 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
                placeholder="Enter community name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/25 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Location
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/25 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
                placeholder="Enter community location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/25 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
                placeholder="Enter contact number"
                value={phone}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors mt-2"
            >
              Register Community
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/40">Already registered?</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 w-full py-2 text-xs text-white/70 border border-white/20 rounded hover:bg-white/10 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">2025 RescueBytes. All rights reserved.</p>
      </div>
    </div>
  );
};

export default CommunityRegistration;

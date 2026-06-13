import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api_url from "../api.tsx";
import earthBg from "../assets/earth-landing.jpg";

const Logi = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (Cookies.get("session_token")) navigate("/home", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${api_url}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      Cookies.set("session_token", data.token);
      navigate("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: `url(${earthBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="./rescuebytes-logo.png" alt="RescueBytes" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white">RescueBytes</h1>
          <p className="text-sm text-white/50 mt-1">Sign in to the admin dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-8 py-8">
          {error && <p className="text-xs text-red-300 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/25 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/25 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-xs text-white/50 hover:text-white/80"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors mt-2"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/40">Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
              className="mt-2 w-full py-2 text-xs text-white/70 border border-white/20 rounded hover:bg-white/10 transition-colors"
            >
              Register your community
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Logi;

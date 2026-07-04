import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(phone, pin);
    } catch (err) {
      setError('தவறான தொலைபேசி எண் அல்லது PIN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soil-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-soil-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-field-100 rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-field-500" />
          </div>
          <h1 className="text-3xl font-bold text-soil-900">வனம்</h1>
          <p className="text-soil-500 mt-2">உங்கள் வரவு செலவு கணக்கு</p>
        </div>

        {error && <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-2">தொலைபேசி எண்</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 focus:border-field-500 outline-none transition-all text-lg"
              placeholder="9999999999"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-2">PIN (4 இலக்கம்)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="w-full p-4 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 focus:border-field-500 outline-none transition-all text-lg tracking-widest text-center"
              placeholder="••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-field-500 text-white font-bold py-4 rounded-xl hover:bg-field-700 transition-colors shadow-lg shadow-field-500/30 text-lg"
          >
            உள்நுழை
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PiggyBank, Target } from 'lucide-react';

export default function SetTarget() {
  const navigate = useNavigate();
  const [target, setTarget] = useState(null);
  const [newTarget, setNewTarget] = useState({ name: '', amount: '', target_date: '' });

  useEffect(() => {
    fetchActiveTarget();
  }, []);

  const fetchActiveTarget = async () => {
    try {
      const res = await api.get('/api/targets');
      setTarget(res.data);
    } catch (error) {
      console.error('Error fetching target:', error);
    }
  };

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/targets', newTarget);
      setNewTarget({ name: '', amount: '', target_date: '' });
      fetchActiveTarget();
      navigate('/');
    } catch (error) {
      console.error('Error creating target:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b border-soil-200 pb-4">
        <Target size={28} className="text-field-600" />
        <h2 className="text-2xl font-bold text-soil-900">நிதி இலக்கு (Financial Target)</h2>
      </div>

      {target && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200 mb-8">
          <h3 className="text-lg font-bold text-soil-800 mb-2">தற்போதைய இலக்கு (Current Target)</h3>
          <p className="text-soil-700"><strong>பெயர்:</strong> {target.name}</p>
          <p className="text-soil-700"><strong>தொகை:</strong> ₹{parseFloat(target.amount).toLocaleString('en-IN')}</p>
          <p className="text-soil-700"><strong>காலக்கெடு:</strong> {new Date(target.target_date).toLocaleDateString()}</p>
          <p className="text-sm text-soil-500 mt-2">புதிய இலக்கை அமைத்தால் இது மாற்றப்படும்.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
        <h3 className="text-xl font-bold text-soil-900 mb-6">புதிய இலக்கை அமை (Set New Target)</h3>
        
        <form onSubmit={handleCreateTarget} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-2">இலக்கின் பெயர் (Target Name)</label>
            <input
              type="text"
              value={newTarget.name}
              onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
              placeholder="எ.கா: டிராக்டர் வாங்க"
              className="w-full p-4 text-lg rounded-xl border border-soil-300 outline-none focus:ring-2 focus:ring-field-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-2">மொத்த தொகை (₹)</label>
              <input
                type="number"
                value={newTarget.amount}
                onChange={(e) => setNewTarget({ ...newTarget, amount: e.target.value })}
                className="w-full p-4 text-lg rounded-xl border border-soil-300 outline-none focus:ring-2 focus:ring-field-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-2">காலக்கெடு (Deadline)</label>
              <input
                type="date"
                value={newTarget.target_date}
                onChange={(e) => setNewTarget({ ...newTarget, target_date: e.target.value })}
                className="w-full p-4 text-lg rounded-xl border border-soil-300 outline-none focus:ring-2 focus:ring-field-500"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-field-600 text-white font-bold py-4 rounded-xl hover:bg-field-700 transition-colors shadow-lg shadow-field-500/30 text-lg mt-4">
            இலக்கை சேமி (Save Target)
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { queueEntry } from '../lib/offlineSync';
import * as Icons from 'lucide-react';
import { cn } from '../components/Layout';

export default function EntryForm() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [type, setType] = useState('income');
  const [sourceId, setSourceId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [cropPlanId, setCropPlanId] = useState('');
  const [cropPlans, setCropPlans] = useState([]);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await api.get('/api/entries/sources');
        setSources(res.data);
      } catch (error) {
        console.error('Error fetching sources:', error);
      }
    };
    const fetchCropPlans = async () => {
      try {
        const res = await api.get('/api/crop-plans');
        setCropPlans(res.data);
      } catch (error) {
        console.error('Error fetching crop plans:', error);
      }
    };
    fetchSources();
    fetchCropPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceId || !amount) return alert('தேவையான தகவல்களை நிரப்பவும்');

    const entryData = {
      source_id: sourceId,
      type,
      amount: parseFloat(amount),
      entry_date: date,
      note,
      crop_plan_id: cropPlanId || null
    };

    try {
      if (navigator.onLine) {
        await api.post('/api/entries', entryData);
      } else {
        await queueEntry({ action: 'create', data: entryData });
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving entry:', error);
      await queueEntry({ action: 'create', data: entryData });
      navigate('/');
    }
  };

  const getIcon = (iconName) => {
    const Icon = Icons[iconName] || Icons.Circle;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-soil-900 mb-6">புதிய பதிவு</h2>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
        {/* Type Toggle */}
        <div className="flex bg-soil-100 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setType('income')}
            className={cn(
              "flex-1 py-3 text-center rounded-xl font-medium transition-all",
              type === 'income' ? "bg-white shadow-sm text-field-600" : "text-soil-500 hover:text-soil-700"
            )}
          >
            வரவு (Income)
          </button>
          <button
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 py-3 text-center rounded-xl font-medium transition-all",
              type === 'expense' ? "bg-white shadow-sm text-red-600" : "text-soil-500 hover:text-soil-700"
            )}
          >
            செலவு (Expense)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-2">வகை (Category)</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full p-4 text-lg border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
              required
            >
              <option value="" disabled>வகையை தேர்ந்தெடுக்கவும் (Select Category)</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.display_name_ta}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Plan Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-2">பயிர் திட்டம் (Crop Plan - Optional)</label>
            <select
              value={cropPlanId}
              onChange={(e) => setCropPlanId(e.target.value)}
              className="w-full p-4 text-lg border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
            >
              <option value="">திட்டத்தை தேர்ந்தெடுக்கவும் (None)</option>
              {cropPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-2">தொகை (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 text-xl border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-2">தேதி</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-soil-700 mb-2">குறிப்பு (விருப்பமானால்)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
              placeholder="எ.கா: தக்காளி விற்பனை"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-field-500 text-white font-bold py-4 rounded-xl hover:bg-field-600 transition-colors shadow-lg shadow-field-500/30 text-lg mt-8"
          >
            சேமிக்க
          </button>
        </form>
      </div>
    </div>
  );
}

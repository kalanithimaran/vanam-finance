import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Leaf, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../components/Layout';

export default function CropPlans() {
  const [plans, setPlans] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planTimeline, setPlanTimeline] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/crop-plans');
      setPlans(res.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!newPlanName) return;
    try {
      await api.post('/api/crop-plans', { name: newPlanName });
      setNewPlanName('');
      setShowAdd(false);
      fetchPlans();
    } catch (error) {
      console.error('Error adding plan:', error);
    }
  };

  const fetchTimeline = async (id) => {
    try {
      const res = await api.get(`/api/crop-plans/${id}/timeline`);
      setPlanTimeline(res.data);
      setSelectedPlanId(id);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const getTimelineTotals = () => {
    if (!planTimeline) return { income: 0, expense: 0, net: 0 };
    let income = 0;
    let expense = 0;
    planTimeline.entries.forEach(e => {
      if (e.type === 'income') income += parseFloat(e.amount);
      else expense += parseFloat(e.amount);
    });
    return { income, expense, net: income - expense };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-soil-900">பயிர் திட்டம் (Planting Monitor)</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-field-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-field-600 transition-colors"
        >
          <Plus size={20} />
          புதிய திட்டம் (New Plan)
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddPlan} className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200 flex gap-4">
          <input
            type="text"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            className="flex-1 p-4 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
            placeholder="எ.கா: 2026 Groundnut (நிலக்கடலை)"
            required
          />
          <button type="submit" className="bg-field-600 text-white px-8 font-bold rounded-xl hover:bg-field-700">
            சேர்க்க
          </button>
        </form>
      )}

      {!selectedPlanId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => fetchTimeline(plan.id)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200 cursor-pointer hover:border-field-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-field-100 text-field-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Leaf size={24} />
                </div>
                <h3 className="font-bold text-soil-900 text-lg flex-1">{plan.name}</h3>
              </div>
              <p className="text-sm text-soil-500">தொடக்கம்: {new Date(plan.start_date).toLocaleDateString()}</p>
              <div className="mt-4 pt-4 border-t border-soil-100 flex justify-between items-center text-sm font-medium">
                <span className="text-soil-600">பதிவுகள்: {plan.entries.length}</span>
                <span className="text-field-600">பார்க்க &rarr;</span>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full text-center py-12 text-soil-500 bg-white rounded-3xl border border-soil-200">
              திட்டங்கள் எதுவும் இல்லை. புதிய திட்டத்தை உருவாக்கவும்.
            </div>
          )}
        </div>
      ) : planTimeline ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedPlanId(null)}
            className="text-field-600 font-medium hover:underline flex items-center gap-1"
          >
            &larr; பின்செல்ல (Back)
          </button>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
            <h2 className="text-2xl font-bold text-soil-900 mb-6">{planTimeline.name} - சுருக்கம்</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-field-50 p-6 rounded-2xl border border-field-100 flex flex-col justify-center">
                <span className="text-soil-600 font-medium mb-2 flex items-center gap-2"><TrendingUp size={18} className="text-field-600"/> மொத்த வரவு</span>
                <span className="text-2xl font-black text-field-600">₹{getTimelineTotals().income.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col justify-center">
                <span className="text-soil-600 font-medium mb-2 flex items-center gap-2"><TrendingDown size={18} className="text-red-600"/> மொத்த செலவு</span>
                <span className="text-2xl font-black text-red-600">₹{getTimelineTotals().expense.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-sun-50 p-6 rounded-2xl border border-sun-100 flex flex-col justify-center">
                <span className="text-soil-800 font-medium mb-2">லாபம் (Net Profit)</span>
                <span className={`text-3xl font-black ${getTimelineTotals().net >= 0 ? 'text-field-600' : 'text-red-600'}`}>
                  ₹{getTimelineTotals().net.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
            <h3 className="text-xl font-bold text-soil-900 mb-6 border-b border-soil-100 pb-4">காலவரிசை (Timeline)</h3>
            <div className="space-y-4">
              {planTimeline.entries.length > 0 ? (
                <div className="relative border-l-2 border-soil-200 ml-4 pl-6 space-y-8">
                  {planTimeline.entries.map(entry => (
                    <div key={entry.id} className="relative">
                      <div className={cn(
                        "absolute -left-[35px] w-6 h-6 rounded-full border-4 border-white flex items-center justify-center",
                        entry.type === 'income' ? "bg-field-500" : "bg-red-500"
                      )} />
                      <div className="bg-soil-50 p-4 rounded-xl border border-soil-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-soil-500 bg-white px-2 py-1 rounded-md shadow-sm border border-soil-200 mb-2 inline-block">
                              {new Date(entry.entry_date).toLocaleDateString()}
                            </span>
                            <p className="font-medium text-soil-900 text-lg">{entry.note || entry.source.display_name_ta}</p>
                            <p className="text-sm text-soil-500">{entry.type === 'expense' ? 'செலவு' : 'வரவு'}</p>
                          </div>
                          <span className={cn(
                            "text-xl font-bold",
                            entry.type === 'income' ? "text-field-600" : "text-red-600"
                          )}>
                            {entry.type === 'income' ? '+' : '-'}₹{parseFloat(entry.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-soil-500">
                  பதிவுகள் எதுவும் இல்லை (No records found). "புதிய பதிவு" மூலம் பதிவுகளை சேர்க்கும் போது இந்த திட்டத்தை தேர்ந்தெடுக்கவும்.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

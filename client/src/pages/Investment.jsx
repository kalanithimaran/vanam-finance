import { useState, useEffect } from 'react';
import api from '../lib/api';
import { PiggyBank } from 'lucide-react';

export default function Investment() {
  const [plans, setPlans] = useState([]);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, summaryRes] = await Promise.all([
          api.get('/api/investment-plan'),
          api.get(`/api/entries/summary?month=${new Date().toISOString().slice(0, 7)}`)
        ]);
        setPlans(planRes.data);
        setProfit(Math.max(0, summaryRes.data.net));
      } catch (error) {
        console.error('Error fetching investment data:', error);
      }
    };
    fetchData();
  }, []);

  const handlePercentageChange = (index, val) => {
    const newPlans = [...plans];
    newPlans[index].percentage = val;
    setPlans(newPlans);
  };

  const handleSave = async () => {
    const total = plans.reduce((acc, plan) => acc + parseFloat(plan.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      return alert(`மொத்த சதவீதம் 100 ஆக இருக்க வேண்டும். (தற்போதைய மொத்தம்: ${total}%)`);
    }

    try {
      await api.put('/api/investment-plan', plans);
      alert('முதலீட்டு திட்டம் சேமிக்கப்பட்டது!');
    } catch (error) {
      console.error('Error saving plans:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-sun-100 rounded-xl text-sun-600">
          <PiggyBank className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-soil-900">முதலீட்டு திட்டம்</h2>
          <p className="text-soil-500 text-sm">இந்த மாத லாபத்தை பிரித்து சேமிக்கவும்</p>
        </div>
      </div>

      <div className="bg-field-50 border border-field-200 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <p className="text-field-800 text-sm font-medium mb-1">இந்த மாத நிகர லாபம்</p>
          <h3 className="text-3xl font-bold text-field-700">₹{profit.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200 space-y-6">
        {plans.map((plan, idx) => {
          const allocation = profit * (parseFloat(plan.percentage || 0) / 100);
          return (
            <div key={plan.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-soil-100 hover:bg-soil-50 transition-colors">
              <div className="flex-1 flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: plan.color }}
                />
                <span className="font-medium text-soil-900">{plan.category_name_ta}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="number"
                    value={plan.percentage}
                    onChange={(e) => handlePercentageChange(idx, e.target.value)}
                    className="w-24 p-2 text-right pr-8 border border-soil-300 rounded-lg focus:ring-2 focus:ring-sun-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-soil-500 font-medium">%</span>
                </div>
                
                <div className="w-32 text-right">
                  <span className="text-lg font-bold text-soil-900">
                    ₹{allocation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-6 border-t border-soil-200 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-sun-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-sun-600 transition-colors shadow-lg shadow-sun-500/30"
          >
            மாற்றங்களை சேமிக்க
          </button>
        </div>
      </div>
    </div>
  );
}

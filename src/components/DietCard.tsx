import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Trash2, Calculator, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FoodItem {
  id: string;
  name: string;
  amount: number; // in grams or units
  kcal: number;
  unit: 'g' | 'und';
}

const FOOD_DATABASE = {
  arroz: { name: 'Arroz Branco (Cozido)', kcalPer100g: 128, unit: 'g' as const },
  feijao: { name: 'Feijão (Cozido)', kcalPer100g: 76, unit: 'g' as const },
  frango: { name: 'Frango Grelhado', kcalPer100g: 165, unit: 'g' as const },
  ovo: { name: 'Ovo Inteiro', kcalPerUnit: 75, unit: 'und' as const },
  tapioca: { name: 'Tapioca (Goma)', kcalPer100g: 240, unit: 'g' as const },
  farinha_tapioca: { name: 'Farinha de Tapioca', kcalPer100g: 350, unit: 'g' as const },
};

export default function DietCard() {
  const [meals, setMeals] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<keyof typeof FOOD_DATABASE>('arroz');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('diet_data');
    if (saved) {
      try {
        setMeals(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar dieta", e);
      }
    }
  }, []);

  const saveToStorage = (newMeals: FoodItem[]) => {
    localStorage.setItem('diet_data', JSON.stringify(newMeals));
  };

  const addFood = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const foodInfo = FOOD_DATABASE[selectedFood];
    let calculatedKcal = 0;

    if (foodInfo.unit === 'g') {
      calculatedKcal = (parseFloat(amount) / 100) * (foodInfo as any).kcalPer100g;
    } else {
      calculatedKcal = parseFloat(amount) * (foodInfo as any).kcalPerUnit;
    }

    const newItem: FoodItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: foodInfo.name,
      amount: parseFloat(amount),
      kcal: Math.round(calculatedKcal),
      unit: foodInfo.unit,
    };

    const updated = [newItem, ...meals];
    setMeals(updated);
    saveToStorage(updated);
    setAmount('');
  };

  const removeItem = (id: string) => {
    const updated = meals.filter(item => item.id !== id);
    setMeals(updated);
    saveToStorage(updated);
  };

  const totalKcal = meals.reduce((acc, curr) => acc + curr.kcal, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <Utensils size={14} className="text-orange-500" />
          Plano Dietético
        </h3>
        <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full border border-orange-100 uppercase tracking-widest">
          Hoje
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Alimento</label>
          <select 
            value={selectedFood}
            onChange={(e) => setSelectedFood(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="arroz">Arroz Branco</option>
            <option value="feijao">Feijão</option>
            <option value="frango">Peso/Frango</option>
            <option value="ovo">Ovos (Unidade)</option>
            <option value="tapioca">Tapioca (Goma)</option>
            <option value="farinha_tapioca">Farinha de Tapioca</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            Quantidade ({FOOD_DATABASE[selectedFood].unit})
          </label>
          <div className="relative">
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={FOOD_DATABASE[selectedFood].unit === 'g' ? "Ex: 200" : "Ex: 3"}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <button 
              onClick={addFood}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase leading-none mb-1">Total Consumido</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{totalKcal} <span className="text-sm text-slate-400">kcal</span></p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        <AnimatePresence>
          {meals.length > 0 ? (
            meals.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-orange-500 shadow-sm">
                    <Calculator size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{item.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.amount}{item.unit} • {item.kcal} kcal</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 py-10 opacity-50">
              <Utensils size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Nenhum alimento registrado</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

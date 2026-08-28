import React, { useState } from 'react';
import { calculateElevatorQuote, calculateElectricalLoadQuote } from '../utils/calculations';
import { Zap, ArrowUpDown, Cpu, Calculator, CheckCircle } from 'lucide-react';

export const ExpressQView: React.FC = () => {
  // Elevators State
  const [elevStops, setElevStops] = useState<number>(5);
  const [elevCapacity, setElevCapacity] = useState<number>(630);
  const [elevType, setElevType] = useState<'Passenger' | 'Cargo / Freight'>('Passenger');

  // Electrical Load State
  const [elecArea, setElecArea] = useState<number>(350);
  const [elecBuildingCat, setElecBuildingCat] = useState<string>('Residential (سكني)');
  const [elecVoltage, setElecVoltage] = useState<string>('3-Phase (380V)');

  const elevResult = calculateElevatorQuote(elevStops, elevCapacity, elevType);
  const elecResult = calculateElectricalLoadQuote(elecArea, elecBuildingCat, elecVoltage);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-xl border border-indigo-800 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>حاسبة التسعير السريع النقابية (Express_q Rapid Quotations Engine)</span>
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            تقديرات فورية لرسوم ترخيص المصاعد والأحمال الكهربائية معتمدة بأسس نقابة المهندسين 2026
          </p>
        </div>
        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs px-3 py-1 rounded-full font-bold">
          معالجة منخفضة الكمون
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Elevator Quote Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-blue-400" />
              <span>تسعيرة وتدقيق دراسة المصاعد (Elevator Quote)</span>
            </h3>
            <span className="text-[11px] text-blue-300 font-mono">EN 81-20/50</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عدد التوقفات:</label>
                <input 
                  type="number" 
                  value={elevStops} 
                  onChange={(e) => setElevStops(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الحمولة (كغ):</label>
                <input 
                  type="number" 
                  value={elevCapacity} 
                  onChange={(e) => setElevCapacity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نوع المصعد:</label>
                <select 
                  value={elevType} 
                  onChange={(e) => setElevType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium"
                >
                  <option value="Passenger">ركاب (Passenger)</option>
                  <option value="Cargo / Freight">بضائع / مشافي (+30%)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>الرسم الأساسي للمصعد:</span>
                <span className="font-mono font-bold">${elevResult.baseFee}</span>
              </div>
              <div className="flex justify-between">
                <span>رسم التوقفات الإضافية (أكثر من 2):</span>
                <span className="font-mono font-bold">${elevResult.stopsFee}</span>
              </div>
              <div className="flex justify-between">
                <span>رسم سعة الحمولة:</span>
                <span className="font-mono font-bold">${elevResult.capacityFee}</span>
              </div>
              <div className="flex justify-between text-slate-500 border-t border-slate-200 pt-1.5">
                <span>الرسم النقابي الإداري (5%):</span>
                <span className="font-mono font-semibold">${elevResult.syndicateTax}</span>
              </div>
              <div className="flex justify-between bg-blue-900 text-white p-2 rounded font-bold text-sm">
                <span>المجموع الكلي المقدر ($):</span>
                <span className="font-mono text-amber-300">${elevResult.totalFee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Electrical Load Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>حساب الحمولة الكهربائية واللوحات (Electrical Load)</span>
            </h3>
            <span className="text-[11px] text-amber-300 font-mono">IEC 60364</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المساحة م²:</label>
                <input 
                  type="number" 
                  value={elecArea} 
                  onChange={(e) => setElecArea(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تصنيف المنشأة:</label>
                <select 
                  value={elecBuildingCat} 
                  onChange={(e) => setElecBuildingCat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium"
                >
                  <option value="Residential (سكني)">سكني (35 W/m²)</option>
                  <option value="Commercial (تجاري)">تجاري (65 W/m²)</option>
                  <option value="Industrial / Workshop (صناعي / حرفي)">صناعي (100 W/m²)</option>
                  <option value="Administrative / Office (إداري)">إداري (50 W/m²)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نظام التغذية:</label>
                <select 
                  value={elecVoltage} 
                  onChange={(e) => setElecVoltage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium"
                >
                  <option value="3-Phase (380V)">3-Phase (380V)</option>
                  <option value="1-Phase (220V)">1-Phase (220V)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>الحمولة التقديرية (kVA):</span>
                <span className="font-mono font-bold text-blue-900">{elecResult.calculatedKva} kVA</span>
              </div>
              <div className="flex justify-between">
                <span>التيار المقدر (Amps):</span>
                <span className="font-mono font-bold text-blue-900">{elecResult.requiredAmps} A</span>
              </div>
              <div className="flex justify-between">
                <span>شريحة التسعير النقابي:</span>
                <span className="font-mono font-bold">${elecResult.tierRate} / kVA</span>
              </div>
              <div className="flex justify-between text-slate-500 border-t border-slate-200 pt-1.5">
                <span>الرسم النقابي (5%):</span>
                <span className="font-mono font-semibold">${elecResult.totalFee - elecResult.syndicateFee}</span>
              </div>
              <div className="flex justify-between bg-slate-900 text-white p-2 rounded font-bold text-sm">
                <span>المجموع الكلي المقدر ($):</span>
                <span className="font-mono text-amber-300">${elecResult.totalFee}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Bell, Search, Menu, LayoutDashboard, GitPullRequest, 
  Stethoscope, Settings, AlertTriangle, CheckCircle2,
  Clock, X, ChevronRight, LogOut, ArrowUpRight, ArrowDownRight, 
  Target, Scale, Baby, CalendarDays, Thermometer, Syringe, ShieldCheck, Plus, BrainCircuit, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';

// --- DÜVE YETİŞTİRME & ÜREME VERİLERİ (8 Ay - Gebelik) ---
const activityData = [
  { time: '00:00', rumination: 45, activity: 20 },
  { time: '04:00', rumination: 50, activity: 25 },
  { time: '08:00', rumination: 30, activity: 60 },
  { time: '12:00', rumination: 40, activity: 55 },
  { time: '16:00', rumination: 35, activity: 65 },
  { time: '20:00', rumination: 55, activity: 30 },
];

const initialAlerts = [
  { id: 1, cowId: 'TR-45 1234', title: 'Pik Aktivite', type: 'Kızgınlık (İlk)', time: '10 dk', priority: 'high' },
  { id: 2, cowId: 'TR-45 5678', title: 'Kilo Artışı Yetersiz', type: 'Gelişim', time: '1 sa', priority: 'medium' },
  { id: 3, cowId: 'TR-45 9012', title: 'Gebelik Kontrol Zamanı', type: 'Aksiyon', time: '2 sa', priority: 'high' },
];

const initialHeifers = [
  { id: 'TR-45 9001', name: 'Sarı Kız', breed: 'Holstein', ageMonths: 14, weight: 395, targetWeight: 400, reproStatus: 'Puberta (Boş)', health: 98 },
  { id: 'TR-45 9002', name: 'Karakız', breed: 'Holstein', ageMonths: 15, weight: 410, targetWeight: 400, reproStatus: 'Kızgınlıkta', health: 100 },
  { id: 'TR-45 9003', name: 'Benekli', breed: 'Simental', ageMonths: 9, weight: 250, targetWeight: 300, reproStatus: 'Gelişimde', health: 95 },
  { id: 'TR-45 9004', name: 'Şaşı', breed: 'Jersey', ageMonths: 18, weight: 380, targetWeight: 350, reproStatus: 'Gebe (3. Ay)', health: 92 },
  { id: 'TR-45 9015', name: 'Gülüm', breed: 'Holstein', ageMonths: 16, weight: 420, targetWeight: 400, reproStatus: 'Tohumlandı (20. Gün)', health: 95 },
  { id: 'TR-45 9021', name: 'Yıldız', breed: 'Simental', ageMonths: 10, weight: 260, targetWeight: 310, reproStatus: 'Gelişimde', health: 75 },
];

const initialTasks = [
  { id: 'TR-45 9002', action: 'Tohumlama Penceresi (Optimum)', prob: 98, urgency: 'critical', type: 'inseminate' },
  { id: 'TR-45 9015', action: 'Erken Gebelik Tahmini (Aktivite normal)', prob: 85, urgency: 'warning', type: 'check' },
  { id: 'TR-45 8011', action: 'Hedef Kilo Gecikmesi (Rasyon kontrolü)', prob: 0, urgency: 'critical', type: 'health' }
];

const initialTreatments = [
  { id: 'TR-45 8011', diagnosis: 'Solunum Yolu Enf. (BRD)', detail: 'Sensör Ateş: 40.2°C, Geviş: %40 düştü', time: 'Bugün, 08:30', vet: 'Atanmadı', status: 'Kritik Alarm', type: 'critical' },
  { id: 'TR-45 5022', diagnosis: 'Topallık (Arka Sağ)', detail: 'Aktivite asimetrisi tespit edildi', time: 'Dün, 14:15', vet: 'Vet. Ayhan', status: 'Tedavi Sürüyor', type: 'warning' },
  { id: 'TR-45 1109', diagnosis: 'Paraziter İlaçlama', detail: 'Rutin iç-dış parazit dökme', time: '3 Gün Önce', vet: 'Sağlık Ekibi', status: 'Tamamlandı', type: 'info' },
];

const initialVaccines = [
  { id: 1, name: 'BVD / IBR Karma Aşı', target: 'Tohumlama Öncesi Grup (12-14 Ay)', date: 'Yarın, 09:00', totalCows: 18, status: 'upcoming' },
  { id: 2, name: 'Şap (FMD) Rapel', target: 'Genel Sürü (8-18. Ay Arası)', date: '12 Mayıs 2026', totalCows: 142, status: 'planned' },
  { id: 3, name: 'Brucella (S19)', target: 'Yeni 8 Aylıklar', date: '20 Mayıs 2026', totalCows: 12, status: 'planned' },
];

export default function AppLayout() {
  const [activeView, setActiveView] = useState('overview'); 
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  
  const [alerts, setAlerts] = useState(initialAlerts);
  const [heifers, setHeifers] = useState(initialHeifers);
  const [tasks, setTasks] = useState(initialTasks);
  const [treatments, setTreatments] = useState(initialTreatments);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{msg: string, type: string}|null>(null);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: string}>({isOpen: false, type: ''});

  const notify = (msg: string, type = 'success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = (id: string, actionType: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if(actionType === 'inseminate') {
      setHeifers(heifers.map(h => h.id === id ? {...h, reproStatus: 'Tohumlandı (1. Gün)'} : h));
      notify(`${id} küpeli düve tohumlandı olarak kaydedildi. Gebelik takibi başlatıldı.`);
    } else {
      notify(`Aksiyon onaylandı: ${id}`);
    }
  };

  const handleResolveTreatment = (id: string) => {
    setTreatments(prev => prev.map(t => t.id === id ? {...t, status: 'Tamamlandı', type: 'info'} : t));
    notify(`${id} numaralı hayvanın tedavi/takip süreci başarıyla tamamlandı.`);
  }

  const handleAddClinicalRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('cowId') as string;
    const diagnosis = formData.get('diagnosis') as string;
    const detail = formData.get('detail') as string;
    const priority = formData.get('priority') as string;

    const newRecord = {
      id: id || 'TR-45 0000',
      diagnosis: diagnosis || 'Genel Muayene',
      detail: detail || 'Manuel kayıt girildi.',
      time: 'Şimdi',
      vet: 'Vet. Ayhan',
      status: 'Kayıt Alındı',
      type: priority === 'yüksek' ? 'critical' : priority === 'orta' ? 'warning' : 'info'
    };

    setTreatments([newRecord, ...treatments]);
    setModalConfig({isOpen: false, type: ''});
    notify(`Klinik kayıt başarıyla oluşturuldu: ${newRecord.id}`);
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, onClick }: any) => (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }} 
      whileTap={{ scale: 0.98 }}
      className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group ${onClick ? 'cursor-pointer hover:border-blue-200 hover:shadow-xl transition-all' : ''}`}
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${colorClass}`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}>
          <Icon size={24} />
        </div>
        {onClick && (
           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-[10px] uppercase font-bold text-gray-400">
             Git <ChevronRight size={14} className="ml-0.5" />
           </div>
        )}
      </div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
         <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
         {subtitle && <span className="text-sm font-semibold text-gray-400">{subtitle}</span>}
      </div>
    </motion.div>
  );

  const CortexInsightWidget = () => (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-6 rounded-2xl shadow-xl border border-indigo-500/30 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <BrainCircuit size={100} />
      </div>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles size={20} className="text-orange-400" />
        <h3 className="font-bold uppercase tracking-wider text-sm bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">
          Cortex.AI Öngörüleri
        </h3>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
          <div className="text-sm font-medium leading-relaxed">
            <strong className="text-orange-400">TR-45 9003</strong> ve 2 diğer düvede büyüme eğrisi yavaşladı. Puberta gecikmesini önlemek için Rasyon Protein %'si artırılmalı.
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
          <div className="text-sm font-medium leading-relaxed">
            Gelecek hafta <strong className="text-emerald-400">5 adet</strong> yeni düvenin ideal tohumlama ağırlığına (390kg+) ulaşması bekleniyor.
          </div>
        </div>
      </div>
    </div>
  );

  const Views: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard onClick={() => setActiveView('herd')} title="Takipteki Düve (8+ Ay)" value={heifers.length + 142} subtitle="Hayvan" icon={Baby} colorClass="bg-blue-600 text-blue-600" />
          <StatCard onClick={() => setActiveView('reproduction')} title="Tohumlanabilir Boyut" value="18" subtitle="Tohumlama Bekliyor" icon={Target} colorClass="bg-purple-600 text-purple-600" />
          <StatCard onClick={() => setActiveView('reproduction')} title="Aktif Kızgınlık" value="4" subtitle="Kritik Pencere" icon={GitPullRequest} colorClass="bg-orange-500 text-orange-500" />
          <StatCard onClick={() => setActiveView('health')} title="Sürü Sağlık Skoru" value="%98" subtitle="Stabil" icon={ShieldCheck} colorClass="bg-emerald-500 text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Sensör Verisi: Aktivite & Geviş Dinamikleri</h3>
                  <p className="text-sm text-gray-500">Gelişim ve kızgınlık tespiti için anlık yapay zeka analizi</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="rumination" name="Geviş Süresi (Dk/Sa)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRum)" />
                    <Area type="monotone" dataKey="activity" name="Aktivite (Kızgınlık/Hareket) İndeksi" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* YENİ: Aklıma gelmeyen inovatif veri modülü */}
            <CortexInsightWidget />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden h-full max-h-[850px]">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Bekleyen Kritik Aksiyonlar</h3>
              <span className="bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full text-xs">{tasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <AnimatePresence>
                {tasks.map(task => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20, height: 0, margin: 0, padding: 0 }}
                    key={task.id} 
                    className="p-4 m-2 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{task.id}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        task.urgency === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        Hemen Onayla
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{task.action}</p>
                    <button 
                      onClick={() => handleAction(task.id, task.type)}
                      className="w-full bg-gray-900 hover:bg-orange-600 text-white text-sm font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> İşlemi Tamamla
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {tasks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 p-6 text-center">
                  <CheckCircle2 size={48} className="mb-4" />
                  <p>Şu an için acil tohumlama veya sağlık aksiyonu bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    herd: (
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Düve Gelişim Platformu</h2>
            <p className="text-sm text-gray-500">8 aylıktan başlayarak gebelik kesinleşene kadar gelişim takibi.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Küpe numarası ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none w-64 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                <th className="p-4 border-b border-gray-100">İdentifikasyon</th>
                <th className="p-4 border-b border-gray-100">Irk</th>
                <th className="p-4 border-b border-gray-100 text-center">Yaş (Ay)</th>
                <th className="p-4 border-b border-gray-100 text-center">Ağırlık (Mevcut/Hedef)</th>
                <th className="p-4 border-b border-gray-100">Sağlık Skoru</th>
                <th className="p-4 border-b border-gray-100 text-right">Üreme Döngüsü</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {heifers.filter(h => h.id.includes(search) || h.name.toLowerCase().includes(search.toLowerCase())).map((heifer) => (
                <tr key={heifer.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{heifer.id}</div>
                    <div className="text-xs text-gray-500">{heifer.name}</div>
                  </td>
                  <td className="p-4">{heifer.breed}</td>
                  <td className="p-4 text-center font-mono font-bold text-gray-700">
                     {heifer.ageMonths} Ay
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-center">
                       <span className={`font-bold ${heifer.weight >= heifer.targetWeight ? 'text-emerald-600' : 'text-orange-500'}`}>
                         {heifer.weight} kg
                       </span>
                       <span className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">Hedef: {heifer.targetWeight} kg</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden max-w-[100px]">
                        <div className={`h-full rounded-full ${heifer.health > 90 ? 'bg-emerald-500' : heifer.health > 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${heifer.health}%`}}></div>
                      </div>
                      <span className="text-xs font-bold w-6">{heifer.health}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      heifer.reproStatus.includes('Gebe') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 border' :
                      heifer.reproStatus === 'Kızgınlıkta' ? 'bg-orange-50 text-orange-700 border-orange-200 border' :
                      heifer.reproStatus.includes('Tohumlandı') ? 'bg-blue-50 text-blue-700 border-blue-200 border' :
                      'bg-gray-100 text-gray-700 border-gray-200 border'
                    }`}>
                      {heifer.reproStatus === 'Kızgınlıkta' && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping mr-1.5"></div>}
                      {heifer.reproStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    reproduction: (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Üreme ve Gebelik Portalı</h2>
              <p className="text-gray-500">Fiziksel gelişimi tamamlanan düvelerin ergenlik, kızgınlık ve tohumlama yönetimi.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="p-5 bg-purple-50/50 border-b border-purple-100 flex items-center gap-3">
              <Scale className="text-purple-600" />
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Tohumlanabilir Boyut</h3>
            </div>
             <div className="p-4 flex-1">
               <ul className="space-y-3">
                 <li className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-bold text-gray-900">TR-45 9001</div>
                      <div className="text-xs text-gray-500">14 Ay • 395 kg</div>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">Kızgınlık Bekleniyor</span>
                 </li>
                 <li className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-bold text-gray-900">TR-45 8055</div>
                      <div className="text-xs text-gray-500">15 Ay • 405 kg</div>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">Kızgınlık Bekleniyor</span>
                 </li>
               </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col border-t-4 border-t-orange-500">
            <div className="p-5 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitPullRequest className="text-orange-600" />
                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Pik Aktivite (Kızgınlık)</h3>
              </div>
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">1</span>
            </div>
            <div className="p-4 flex-1">
               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                 <div className="flex justify-between mb-2">
                    <span className="font-black text-xl text-gray-900">TR-45 9002</span>
                    <span className="text-orange-600 text-sm font-bold flex items-center"><Clock size={14} className="mr-1"/> Optimum Zaman</span>
                 </div>
                 <div className="text-sm text-gray-700 mb-4">15 Ay • Holstein • 410 kg<br/><span className="text-xs text-gray-500 mt-1 block">Aktivite İndeksi: %250 Artış</span></div>
                 <button onClick={() => handleAction('TR-45 9002', 'inseminate')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors">
                    Tohumlama Kaydı Gir
                 </button>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="p-5 bg-blue-50/50 border-b border-blue-100 flex items-center gap-3">
              <CalendarDays className="text-blue-600" />
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Gebelik Kontrol / Teyit</h3>
            </div>
             <div className="p-4 flex-1">
               <ul className="space-y-3">
                 <li className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-gray-900">TR-45 9015</div>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase">20. Gün</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 mt-2">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <div className="text-[10px] text-gray-400 mb-2">35. Gün Muayenesine 15 Gün Kaldı</div>
                 </li>
                 <li className="p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">TR-45 9004</div>
                        <div className="text-xs text-gray-600">Jersey • 18 Ay</div>
                      </div>
                      <span className="text-[10px] bg-emerald-500 text-white px-2 py-1 rounded font-bold uppercase shadow-sm">Gebe Teyitli</span>
                    </div>
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    health: (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Sensör Ateş Alarmları" value="3" subtitle="Kritik Alarm" icon={Thermometer} colorClass="bg-red-500 text-red-500" />
          <StatCard title="Aktif Tedaviler (Düveler)" value={treatments.filter(t => t.status !== 'Tamamlandı').length} subtitle="Gözlem Altında" icon={Stethoscope} colorClass="bg-amber-500 text-amber-500" />
          <StatCard title="Bu Ayki Aşılamalar" value="3" subtitle="Program" icon={Syringe} colorClass="bg-blue-500 text-blue-500" />
          <StatCard title="Sürü Sağlık Skoru" value="%98" subtitle="Stabil" icon={ShieldCheck} colorClass="bg-emerald-500 text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Clinical Cases & Alarms */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Klinik Kayıtlar & Alarmlar</h3>
                <p className="text-sm text-gray-500 mt-0.5">Yapay zeka tespiti ve veteriner onaylı hastalıklar</p>
              </div>
              <button 
                onClick={() => setModalConfig({isOpen: true, type: 'clinical_entry'})}
                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
              >
                <Plus size={16} /> Klinik Kayıt Gir
              </button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase tracking-widest">
                    <th className="p-4 font-bold">Düve Numarası</th>
                    <th className="p-4 font-bold">Teşhis / Sistem Uyarısı</th>
                    <th className="p-4 font-bold">Güncellenme</th>
                    <th className="p-4 font-bold">Sorumlu Hekim</th>
                    <th className="p-4 font-bold text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  <AnimatePresence>
                    {treatments.map((t) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key={t.id} 
                        className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0 group"
                      >
                        <td className="p-4 font-bold text-gray-900 whitespace-nowrap">{t.id}</td>
                        <td className="p-4 min-w-[250px]">
                          <span className={`font-bold block ${
                            t.type === 'critical' ? 'text-red-600' : t.type === 'warning' ? 'text-amber-600' : 'text-gray-900'
                          }`}>
                            {t.diagnosis}
                          </span>
                          <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{t.detail}</span>
                        </td>
                        <td className="p-4 text-xs whitespace-nowrap text-gray-500 font-medium">{t.time}</td>
                        <td className="p-4 text-xs">{t.vet}</td>
                        <td className="p-4 text-right">
                          {t.status !== 'Tamamlandı' ? (
                            <button 
                              onClick={() => handleResolveTreatment(t.id)}
                              className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-1.5 ml-auto opacity-80 group-hover:opacity-100"
                            >
                              <CheckCircle2 size={14} /> Tedaviyi Bitir
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                              Tamamlandı
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vaccination & Routine Prevention Calendar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-gray-100 bg-blue-50/50 flex items-center gap-3">
              <Syringe className="text-blue-600" />
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Aşı & Koruyucu Hekimlik</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
               <div className="space-y-4">
                 {initialVaccines.map((v) => (
                    <div key={v.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden">
                      {v.status === 'upcoming' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>}
                      <div className="flex justify-between items-start mb-2 pl-1">
                        <h4 className="font-bold text-gray-900 truncate pr-2">{v.name}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap ${
                          v.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {v.date}
                        </span>
                      </div>
                      <div className="pl-1 text-sm text-gray-600 mb-3">
                         Hedef Grup: <span className="font-semibold text-gray-800">{v.target}</span>
                      </div>
                      <div className="pl-1 flex justify-between items-center border-t border-gray-50 pt-3">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{v.totalCows} Hayvan</span>
                         <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                           Listeyi Gör <ChevronRight size={12}/>
                         </button>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  const navMenuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Genel Bakış' },
    { id: 'herd', icon: Activity, label: 'Düve Gelişim Platformu' },
    { id: 'reproduction', icon: Baby, label: 'Üreme & Gebe Bırakma' },
    { id: 'health', icon: Stethoscope, label: 'Klinik & Sağlık' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-gray-800">
      
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-[#0F172A] text-white z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none ${
        isMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-20 flex items-center justify-between px-8 bg-black/20 backdrop-blur shrink-0 border-b border-white/5">
          <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Target size={18} className="text-white" />
             </div>
             <span className="text-2xl font-black tracking-tight text-white">
               AYVET<span className="text-orange-500">SAN</span>
             </span>
          </motion.div>
          <button onClick={() => setIsMobileMenu(false)} className="md:hidden text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          <div className="px-4 mb-4">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Düve & Yetiştirme Modülü</p>
          </div>
          {navMenuItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setIsMobileMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden group ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                {isActive && <motion.div layoutId="navBg" className="absolute inset-0 bg-blue-600/90 rounded-xl" />}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10 tracking-wide">{item.label}</span>
                {isActive && <ChevronRight size={16} className="relative z-10 ml-auto opacity-50" />}
              </button>
            )
          })}
        </nav>
        
        <div className="p-6 bg-black/20 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-800 flex items-center justify-center">
              <span className="text-sm font-bold text-white">YD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Yönetici</p>
              <p className="text-xs text-blue-400 font-medium truncate">Düve Tesisi</p>
            </div>
            <LogOut size={16} className="text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 sm:px-10 shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenu(true)} className="md:hidden text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
              <Menu size={24} />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight capitalize">
               {navMenuItems.find(i => i.id === activeView)?.label}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
               <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Gelişim Takip Devrede</span>
            </div>
            
            <button className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors relative border border-gray-200">
              <Bell size={20} />
              {alerts.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
            </button>
            <button className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 hide-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-[1600px] mx-auto w-full h-full"
            >
              {Views[activeView] || (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Activity size={64} className="mb-4 opacity-30" />
                  <p className="text-lg font-medium text-gray-500">Bu alan henüz hazırlanıyor.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modalConfig.isOpen && modalConfig.type === 'clinical_entry' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setModalConfig({isOpen: false, type: ''})}
            />
            <motion.div 
              initial={{opacity: 0, scale: 0.95, y: 20}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={{opacity: 0, scale: 0.95, y: 20}}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white">
                <div>
                  <h2 className="text-xl font-bold">Klinik Kayıt Gir (Düve)</h2>
                  <p className="text-blue-100 text-sm opacity-90 mt-1">Manuel muayene ve tedavi girişi</p>
                </div>
                <button type="button" onClick={() => setModalConfig({isOpen: false, type: ''})} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddClinicalRecord} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">İdentifikasyon (Küpe No)</label>
                  <select name="cowId" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option value="TR-45 9003">TR-45 9003 (Gelişim Uyarısı)</option>
                    <option value="TR-45 9004">TR-45 9004</option>
                    <option value="TR-45 8011">TR-45 8011 (Genel Tarama)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Teşhis Sınıfı</label>
                  <select name="diagnosis" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option value="Ateş / Enfeksiyon (BRD)">Ateş / Enfeksiyon (BRD Şüphesi)</option>
                    <option value="Gelişim Geriliği / Beslenme">Gelişim Geriliği / Rasyon Düzenlemesi</option>
                    <option value="Topallık / Tırnak">Topallık (Ön/Arka)</option>
                    <option value="Genel Sağlık Kontrolü">Genel Sağlık Kontrolü</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Öncelik Durumu</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input type="radio" name="priority" value="yüksek" className="peer sr-only" defaultChecked />
                      <div className="text-center px-3 py-2 border-2 border-gray-100 rounded-xl peer-checked:border-red-500 peer-checked:bg-red-50 text-gray-600 peer-checked:text-red-700 font-bold transition-all text-sm">
                        Kritik
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="priority" value="orta" className="peer sr-only" />
                      <div className="text-center px-3 py-2 border-2 border-gray-100 rounded-xl peer-checked:border-amber-500 peer-checked:bg-amber-50 text-gray-600 peer-checked:text-amber-700 font-bold transition-all text-sm">
                        Gözlem
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="priority" value="düşük" className="peer sr-only" />
                      <div className="text-center px-3 py-2 border-2 border-gray-100 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 text-gray-600 peer-checked:text-blue-700 font-bold transition-all text-sm">
                        Rutin
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Bulgular ve Notlar</label>
                  <textarea name="detail" rows={3} placeholder="Ateş 40.5, yem tüketimi azaldı..." className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-gray-900/20 text-sm flex justify-center items-center gap-2">
                    <CheckCircle2 size={18} /> Kaydı Tamamla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700"
          >
            <CheckCircle2 size={24} className="text-emerald-400" />
            <p className="font-medium text-sm">{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

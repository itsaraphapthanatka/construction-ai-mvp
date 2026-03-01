'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AIConsultant from './AIConsultant';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  Leaf,
  ShieldCheck,
  Activity,
  Menu,
  X,
  ChevronRight,
  TrendingDown,
  DollarSign,
  Bot,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types
interface Project {
  id: string;
  name: string;
  budget: number;
  status: string;
  riskLevel: string;
  predictedProfit: number;
  actualProfit: number | null;
  alerts: any[];
  esg?: {
    carbonReduction: number;
    safetyScore: number;
    employeeSatisfaction: number;
  };
}

interface BiddingOpportunity {
  id: string;
  name: string;
  client: string;
  estimatedBudget: number;
  estimatedDuration: number;
  aiRiskScore: number;
  aiExpectedMargin: number;
  historicalConfidence: number;
  recommendation: 'GO' | 'NO-GO' | 'REVIEW';
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative';
    description: string;
  }>;
}

interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  avgProfit: string;
  trafficLight: {
    green: number;
    yellow: number;
    red: number;
  };
}

// Mock data
const profitForecastData = [
  { month: 'M1', predicted: 5.2, optimistic: 7.5, pessimistic: 3.0 },
  { month: 'M2', predicted: 6.8, optimistic: 9.0, pessimistic: 4.5 },
  { month: 'M3', predicted: 8.1, optimistic: 11.0, pessimistic: 5.8 },
  { month: 'M4', predicted: 9.5, optimistic: 12.5, pessimistic: 6.5 },
  { month: 'M5', predicted: 10.2, optimistic: 13.0, pessimistic: 7.2 },
  { month: 'M6', predicted: 11.5, optimistic: 14.5, pessimistic: 8.0 },
];

const esgData = [
  { name: 'Environment', value: 85, color: '#10b981' }, // emerald-500
  { name: 'Social', value: 90, color: '#3b82f6' },     // blue-500
  { name: 'Governance', value: 88, color: '#8b5cf6' }, // violet-500
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
        <p className="text-slate-300 mb-2 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm my-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-200">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [biddingOps, setBiddingOps] = useState<BiddingOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  // Default sidebar open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle responsive sidebar behavior on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, projectsRes, biddingRes] = await Promise.all([
        axios.get('/api/dashboard/summary'),
        axios.get('/api/projects'),
        axios.get('/api/bidding-opportunities')
      ]);
      setSummary(summaryRes.data);
      setProjects(projectsRes.data);
      setBiddingOps(biddingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockCSuiteIntel = {
    macroFinancials: {
      totalRevenue: '฿42.5B',
      revenueGrowth: '+14.2%',
      ebitdaMargin: '18.5%',
      ebitdaGrowth: '+2.1%',
      cashRunway: '34 Months',
      debtToEquity: '0.8x'
    },
    aiStrategicDirectives: [
      {
        id: 1,
        category: 'M&A / Market Share',
        directive: 'Aggressively bid Eastern region contracts at 5% discount.',
        rationale: 'Competitor SCC Construction margin compression detected due to supply chain overexposure. Capturing this market share now yields long-term pricing power.',
        impact: 'Est. +฿2.1B Revenue YoY',
        action: 'Authorize Aggressive Bidding'
      },
      {
        id: 2,
        category: 'Capital Allocation',
        directive: 'Lock in fixed-rate financing for "The Riverfront Condo" immediately.',
        rationale: 'Macro models predict a 50 bps interest rate hike within 45 days. Delaying financing will erode project margins by 1.2%.',
        impact: 'Est. ฿12M Cost Savings',
        action: 'Execute Financing Swap'
      },
      {
        id: 3,
        category: 'Resource Optimization',
        directive: 'Invest ฿150M in robotic bricklaying & automated tying machines.',
        rationale: 'Subcontractor labor costs are projected to rise 12% YoY. Capital investment payback period is only 14 months at current burn rates.',
        impact: '-18% Reliance on Manual Labor',
        action: 'Approve CapEx'
      }
    ],
    marketDominance: [
      { competitor: 'TopBuild.AI (Us)', marketShare: 34, growth: 15, winRate: 68 },
      { competitor: 'Legacy Corp', marketShare: 28, growth: -2, winRate: 42 },
      { competitor: 'FastConstruct', marketShare: 15, growth: 8, winRate: 55 },
      { competitor: 'EcoBuilders', marketShare: 12, growth: 22, winRate: 60 },
    ]
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'green': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'yellow': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'red': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getRiskGlow = (level: string) => {
    switch (level) {
      case 'green': return 'shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/50';
      case 'yellow': return 'shadow-[0_0_15px_rgba(245,158,11,0.3)] border-amber-500/50';
      case 'red': return 'shadow-[0_0_15px_rgba(225,29,72,0.3)] border-rose-500/50';
      default: return 'border-white/10';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: t('nav.overview'), icon: Activity },
    { id: 'projects', label: t('nav.projects'), icon: Building2 },
    { id: 'bidding', label: t('nav.bidding'), icon: Target },
    { id: 'c-suite', label: t('nav.cSuiteBoardroom'), icon: Briefcase },
    { id: 'ai-predict', label: t('nav.aiAnalytics'), icon: TrendingUp },
    { id: 'esg', label: t('nav.esg'), icon: Leaf },
    { id: 'alerts', label: t('nav.alerts'), icon: AlertTriangle },
  ];

  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">

      {/* Mobile Sidebar Overlay Background */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Premium Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : (isMobile ? 0 : 80),
          x: isMobile && !sidebarOpen ? -280 : 0
        }}
        className={`relative z-50 flex-shrink-0 border-r border-white/5 bg-slate-900/95 backdrop-blur-xl flex flex-col h-full ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl overflow-hidden' : ''
          }`}
      >
        <div className="p-6 flex items-center justify-between min-w-[280px]">
          <AnimatePresence mode="wait">
            {(sidebarOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight text-white block leading-tight">Construction</span>
                  <span className="text-xs text-blue-400 font-medium tracking-wider">AI INTELLIGENCE</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 absolute right-4 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white ml-auto"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto min-w-[280px]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === item.id
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <AnimatePresence>
                {(sidebarOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-4 font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {(sidebarOpen || isMobile) && activeTab === item.id && (
                <motion.div layoutId="activeNav" className="ml-auto">
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Mini */}
        <div className="p-4 mt-auto border-t border-white/5 min-w-[280px]">
          <div className="flex items-center px-2 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-slate-300">{t('user.role')}</span>
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{t('user.view')}</p>
                <p className="text-xs text-slate-500 truncate">{t('user.access')}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative w-full">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10 space-y-6 md:space-y-8">

          {/* Mobile Topbar */}
          {isMobile && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Construction AI</span>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-300"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Header */}
          <motion.header
            initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                {activeTab === 'overview' && <>Executive <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Overview</span></>}
                {activeTab === 'projects' && <>Project <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Portfolio</span></>}
                {activeTab === 'ai-predict' && <>AI <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Analytics</span></>}
                {activeTab === 'esg' && <>ESG <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Impact</span></>}
                {activeTab === 'alerts' && <>Command <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Center</span></>}
              </h1>
              <p className="text-slate-400 mt-2 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="glass px-4 py-2 rounded-full flex items-center space-x-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium">System Online</span>
              </div>
            </div>
          </motion.header>

          <AnimatePresence mode="wait">

            {/* ----------------- OVERVIEW TAB ----------------- */}
            {activeTab === 'overview' && summary && (
              <motion.div
                key="overview"
                initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="space-y-8"
              >
                {/* Traffic Light System (Billionaire Version) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Green Projects */}
                  <motion.div variants={fadeUp} className={`glass-card relative overflow-hidden group ${getRiskGlow('green')}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldCheck className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-slate-300 font-medium">Optimal Status</h3>
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-bold text-white tracking-tight">{summary.trafficLight.green}</span>
                          <span className="text-slate-400 font-medium">Projects</span>
                        </div>
                        <p className="text-emerald-400 text-sm mt-2 font-medium flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" /> Trending positively
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Yellow Projects */}
                  <motion.div variants={fadeUp} className={`glass-card relative overflow-hidden group ${getRiskGlow('yellow')}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <AlertTriangle className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h3 className="text-slate-300 font-medium">Requires Attention</h3>
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-bold text-white tracking-tight">{summary.trafficLight.yellow}</span>
                          <span className="text-slate-400 font-medium">Projects</span>
                        </div>
                        <p className="text-amber-400 text-sm mt-2 font-medium flex items-center">
                          <Activity className="w-4 h-4 mr-1" /> Minor deviations detected
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Red Projects */}
                  <motion.div variants={fadeUp} className={`glass-card relative overflow-hidden group ${getRiskGlow('red')}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Activity className="w-24 h-24 text-rose-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <Activity className="h-5 w-5" />
                        </div>
                        <h3 className="text-slate-300 font-medium">Critical Risk</h3>
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-bold text-white tracking-tight">{summary.trafficLight.red}</span>
                          <span className="text-slate-400 font-medium">Projects</span>
                        </div>
                        <p className="text-rose-400 text-sm mt-2 font-medium flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" /> Immediate action needed
                        </p>
                      </div>
                    </div>
                  </motion.div>

                </div>

                {/* Portfolio Financials & Predictive Graph */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Stats Column */}
                  <div className="space-y-6 flex flex-col justify-between">
                    <motion.div variants={fadeUp} className="glass-card flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20"><DollarSign className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Capital</span>
                      </div>
                      <h4 className="text-4xl font-bold text-white tracking-tight">{formatCurrency(summary.totalBudget)}</h4>
                      <p className="text-sm text-slate-400 mt-2">Across {summary.totalProjects} active developments</p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="glass-card flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Margin Forecast</span>
                      </div>
                      <h4 className="text-4xl font-bold text-white tracking-tight">{summary.avgProfit}%</h4>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(summary.avgProfit) * 5)}%` }}></div>
                      </div>
                    </motion.div>
                  </div>

                  {/* AI Predictive Graph (Premium) */}
                  <motion.div variants={fadeUp} className="glass-card lg:col-span-2 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">AI Margin Trajectory</h3>
                        <p className="text-sm text-slate-400">6-month forward-looking predictability model</p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-medium">
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>Optimistic</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>Predicted</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-400 mr-2"></div>Conservative</div>
                      </div>
                    </div>

                    <div className="h-72 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={profitForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                          <RechartsTooltip content={<CustomTooltip />} />

                          <Area type="monotone" dataKey="pessimistic" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Low-end" />
                          <Area type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" name="High-end" />
                          <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPredicted)" name="Consensus" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ----------------- PROJECTS TAB ----------------- */}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-4">
                {projects.map((project) => (
                  <motion.div key={project.id} variants={fadeUp} className="glass-card hover:bg-white/10 transition-colors group cursor-pointer border border-white/5 hover:border-white/10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl border ${getRiskColor(project.riskLevel)}`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">{project.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
                            <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 hidden sm:inline-block">{project.id}</span>
                            <span>{formatCurrency(project.budget)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 lg:gap-8 border-t border-slate-800 lg:border-t-0 pt-4 lg:pt-0">
                        <div className="text-left lg:text-right flex-1 sm:flex-none">
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Forecast</p>
                          <p className="text-lg md:text-xl font-bold text-emerald-400">{project.predictedProfit}% Margin</p>
                        </div>
                        <div className="h-10 w-px bg-slate-700 hidden lg:block"></div>
                        <div className="flex flex-col space-y-1 w-full sm:w-32 flex-1 sm:flex-none">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">Carbon</span>
                            <span className="text-emerald-400">-{project.esg?.carbonReduction || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(project.esg?.carbonReduction || 0) * 5}%` }}></div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors hidden sm:block ml-auto" />
                      </div>
                    </div>

                    {project.alerts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2">
                        {project.alerts.map((alert, idx) => (
                          <div key={idx} className={`p-3 rounded-lg flex items-center space-x-3 text-sm border ${alert.type === 'danger' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            }`}>
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span><strong className="text-white mr-2">Alert:</strong>{alert.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ----------------- ESG TAB ----------------- */}
            {activeTab === 'esg' && (
              <motion.div key="esg" initial="hidden" animate="visible" exit="hidden" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
                <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl glass p-8 border-emerald-500/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Leaf className="w-6 h-6" /></div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">ESG Legacy & Impact</h2>
                    </div>
                    <p className="text-emerald-100/70 max-w-xl">Corporate sustainability metrics tracked in real-time for SET compliance and executive reporting.</p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div variants={fadeUp} className="glass-card flex flex-col items-center justify-center text-center p-6 md:p-8 border-t-2 border-t-emerald-500">
                    <div className="p-4 rounded-full bg-emerald-500/10 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <Leaf className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">23<span className="text-lg md:text-xl text-emerald-400 ml-1">Tons</span></h3>
                    <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wider">Carbon Mitigated</p>
                  </motion.div>

                  <motion.div variants={fadeUp} className="glass-card flex flex-col items-center justify-center text-center p-6 md:p-8 border-t-2 border-t-blue-500">
                    <div className="p-4 rounded-full bg-blue-500/10 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                      <ShieldCheck className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">365<span className="text-lg md:text-xl text-blue-400 ml-1">Days</span></h3>
                    <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wider">Zero Incidents</p>
                  </motion.div>

                  <motion.div variants={fadeUp} className="glass-card flex flex-col items-center justify-center text-center p-6 md:p-8 border-t-2 border-t-violet-500">
                    <div className="p-4 rounded-full bg-violet-500/10 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                      <Users className="h-8 w-8 text-violet-400" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">4.5<span className="text-lg md:text-xl text-violet-400 text-slate-500 ml-1">/ 5.0</span></h3>
                    <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wider">Happiness Index</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ----------------- AI ANALYTICS TAB ----------------- */}
            {activeTab === 'ai-predict' && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto mt-4">
                <AIConsultant />
              </motion.div>
            )}

            {/* ----------------- OPPORTUNITY SCANNER (BIDDING) TAB ----------------- */}
            {activeTab === 'bidding' && (
              <motion.div key="bidding" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Target className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t('nav.bidding')}</h2>
                    <p className="text-sm text-slate-400 mt-1">AI-driven risk assessment and margin prediction for upcoming tenders.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {biddingOps.map((op) => (
                    <motion.div key={op.id} variants={fadeUp} className="glass-card relative overflow-hidden group border border-white/5 hover:border-indigo-500/30 transition-all p-6">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors"></div>
                      <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center space-x-3">
                              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded border border-slate-700">{op.id}</span>
                              <h3 className="text-xl font-bold text-white">{op.name}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Client</p>
                                <p className="text-sm text-slate-300 font-medium">{op.client}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Est. Value</p>
                                <p className="text-sm text-slate-300 font-medium">{formatCurrency(op.estimatedBudget)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                                <p className="text-sm text-slate-300 font-medium">{op.estimatedDuration} Months</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Historical Win Rate</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${op.historicalConfidence}%` }}></div>
                                  </div>
                                  <span className="text-sm text-blue-400 font-bold">{op.historicalConfidence}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800 focus-within:ring space-y-3">
                              <p className="text-sm font-semibold text-slate-300 flex items-center"><Activity className="w-4 h-4 mr-2 text-indigo-400" /> Evaluation Factors</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {op.factors.map((factor, idx) => (
                                  <div key={idx} className={`p-3 rounded-lg border flex items-start space-x-3 ${factor.impact === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                    {factor.impact === 'positive' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />}
                                    <div>
                                      <p className={`text-xs font-bold leading-tight mb-1 ${factor.impact === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>{factor.name}</p>
                                      <p className="text-xs text-slate-400 leading-snug">{factor.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-72 bg-slate-900/80 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center text-center">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">AI Decision Matrix</h4>

                            <div className="relative w-32 h-32 mb-6">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" className="text-slate-800" strokeWidth="12" stroke="currentColor" fill="transparent" />
                                <circle cx="64" cy="64" r="56" className={`${op.aiRiskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`} strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * op.aiRiskScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white leading-none">{op.aiRiskScore}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Risk Score</span>
                              </div>
                            </div>

                            <div className="w-full bg-slate-800 rounded-lg p-3 mb-6">
                              <p className="text-xs text-slate-400 uppercase mb-1">Expected Margin</p>
                              <p className="text-2xl font-bold text-emerald-400">{op.aiExpectedMargin}%</p>
                            </div>

                            <div className={`w-full py-3 rounded-xl font-bold text-center uppercase tracking-widest text-sm shadow-xl ${op.recommendation === 'GO' ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/20' :
                                op.recommendation === 'NO-GO' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                  'bg-amber-500 text-slate-900 shadow-amber-500/20'
                              }`}>
                              {op.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ----------------- C-SUITE BOARDROOM TAB ----------------- */}
            {activeTab === 'c-suite' && (
              <motion.div key="c-suite" initial="hidden" animate="visible" exit="hidden" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">

                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Briefcase className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{t('nav.cSuiteBoardroom')}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Macro Financials Grid (Left 2 columns) */}
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-purple-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Revenue (FY)</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.totalRevenue}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> {mockCSuiteIntel.macroFinancials.revenueGrowth} YoY</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-blue-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">EBITDA Margin</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.ebitdaMargin}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> {mockCSuiteIntel.macroFinancials.ebitdaGrowth} Expansion</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-emerald-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Cash Runway</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.cashRunway}</h3>
                      <p className="text-sm text-slate-400 font-medium flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Optimal Liquidity</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-rose-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><AlertTriangle className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Debt-to-Equity</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.debtToEquity}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> Healthy Leverage</p>
                    </motion.div>
                  </div>

                  {/* Market Dominance Radar (Neon Donut Graph) */}
                  <motion.div variants={fadeUp} className="glass-card p-6 flex flex-col relative overflow-hidden items-center justify-center">
                    <h3 className="text-lg font-bold text-white mb-2 w-full text-left flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-400" /> Market Dominance
                    </h3>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="h-48 w-full relative z-10 my-4 text-xs font-medium">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockCSuiteIntel.marketDominance}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="marketShare"
                            stroke="none"
                          >
                            {mockCSuiteIntel.marketDominance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : `hsl(215, 25%, ${40 - index * 10}%)`} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">34%</span>
                        <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">Us</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-between px-2 text-xs">
                      <div className="flex items-center text-slate-300"><div className="w-3 h-3 bg-blue-500 rounded-sm mr-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>TopBuild.AI</div>
                      <div className="flex items-center text-slate-500"><div className="w-3 h-3 bg-slate-600 rounded-sm mr-2"></div>Legacy Corp</div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Strategic Directives */}
                  <motion.div variants={fadeUp} className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                      <Bot className="w-6 h-6 mr-3 text-indigo-400" /> The Genius Insights: Strategic Directives
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockCSuiteIntel.aiStrategicDirectives.map((directive) => (
                        <div key={directive.id} className="glass-card flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

                          <div className="p-6 flex-1 relative z-10">
                            <span className="inline-flex items-center px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black rounded-full mb-4 uppercase tracking-widest">
                              {directive.category}
                            </span>
                            <h4 className="text-lg font-bold text-white mb-3 leading-snug">{directive.directive}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{directive.rationale}</p>
                          </div>

                          <div className="p-6 pt-0 mt-auto relative z-10">
                            <div className="py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 flex items-center space-x-3">
                              <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                              <span className="text-sm font-bold text-emerald-400 leading-tight">{directive.impact}</span>
                            </div>
                            <button className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center uppercase tracking-wider text-xs">
                              <span className="mr-2">{directive.action}</span>
                              <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ----------------- COMMAND CENTER TAB ----------------- */}
            {activeTab === 'alerts' && (
              <motion.div key="alerts" initial="hidden" animate="visible" exit="hidden" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400"><AlertTriangle className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Active Mitigation Center</h2>
                </div>

                {projects.flatMap(p => p.alerts.map(a => ({ ...a, projectName: p.name }))).map((alert, idx) => (
                  <motion.div variants={fadeUp} key={idx} className="glass-card flex flex-col md:flex-row gap-6 p-6 border-l-4 border-l-rose-500">
                    <div className="flex-1">
                      <h4 className="text-rose-400 font-bold uppercase tracking-wider text-xs mb-1">Critical Alert - {alert.projectName}</h4>
                      <p className="text-white text-lg font-medium mb-3">{alert.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span>Live AI Monitoring Active</span>
                      </div>
                    </div>
                    <div className="md:w-5/12 bg-slate-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-3 text-blue-400">
                          <Bot className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">AI Mitigation Strategy</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          กำลังประเมินสถานการณ์ร่วมกับ OpenClaw Engine... แนะนำให้เพิ่มงบประมาณเผื่อฉุกเฉิน 15% และจัดสรรทีมงานทดแทนจากโครงการใกล้เคียงเพื่อลดผลกระทบต่อแผนงานหลัก
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {projects.flatMap(p => p.alerts).length === 0 && (
                  <motion.div variants={fadeUp} className="glass-card py-20 text-center border-t-2 border-t-emerald-500">
                    <ShieldCheck className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Systems Nominal</h3>
                    <p className="text-slate-400">No critical alerts detected across the portfolio.</p>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

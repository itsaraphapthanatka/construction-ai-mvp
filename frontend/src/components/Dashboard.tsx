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
  Briefcase,
  Zap
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
  const { t, language, setLanguage } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [biddingOps, setBiddingOps] = useState<BiddingOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState('c-suite');
  const [activeDrilldown, setActiveDrilldown] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBidding, setSelectedBidding] = useState<BiddingOpportunity | null>(null);
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
      totalRevenue: language === 'th' ? '42.5 พันล้านบาท' : '42.5B THB',
      revenueGrowth: '+14.2%',
      ebitdaMargin: '18.5%',
      ebitdaGrowth: '+2.1%',
      cashRunway: '34 Months',
      debtToEquity: '0.8x'
    },
    aiStrategicDirectives: [
      {
        id: 1,
        category: t('directives.d1Category'),
        directive: t('directives.d1Directive'),
        rationale: t('directives.d1Rationale'),
        impact: t('directives.d1Impact'),
        action: t('directives.d1Action')
      },
      {
        id: 2,
        category: t('directives.d2Category'),
        directive: t('directives.d2Directive'),
        rationale: t('directives.d2Rationale'),
        impact: t('directives.d2Impact'),
        action: t('directives.d2Action')
      },
      {
        id: 3,
        category: t('directives.d3Category'),
        directive: t('directives.d3Directive'),
        rationale: t('directives.d3Rationale'),
        impact: t('directives.d3Impact'),
        action: t('directives.d3Action')
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
    let formatted = new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US', {
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);

    if (language === 'th') {
      formatted = formatted.replace(/B/g, 'พันล้าน').replace(/M/g, 'ล้าน').replace(/K/g, 'พัน');
    }

    return `${formatted} ${language === 'th' ? 'บาท' : 'THB'}`;
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
    { id: 'c-suite', label: t('nav.cSuiteBoardroom'), icon: Briefcase },
    { id: 'overview', label: t('nav.overview'), icon: Activity },
    { id: 'projects', label: t('nav.projects'), icon: Building2 },
    { id: 'bidding', label: t('nav.bidding'), icon: Target },
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
                {activeTab === 'c-suite' && <>{t('header.boardroomTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.boardroomTitle')[1]}</span></>}
                {activeTab === 'overview' && <>{t('header.overviewTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.overviewTitle')[1]}</span></>}
                {activeTab === 'projects' && <>{t('header.projectsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.projectsTitle')[1]}</span></>}
                {activeTab === 'bidding' && <>{t('header.biddingTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('header.biddingTitle')[1]}</span></>}
                {activeTab === 'ai-predict' && <>{t('header.aiAnalyticsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.aiAnalyticsTitle')[1]}</span></>}
                {activeTab === 'esg' && <>{t('header.esgTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.esgTitle')[1]}</span></>}
                {activeTab === 'alerts' && <>{t('header.alertsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.alertsTitle')[1]}</span></>}
              </h1>
              <p className="text-slate-400 mt-2 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                className="glass px-3 py-2 rounded-lg flex items-center space-x-2 text-sm hover:bg-white/10 transition-colors border border-white/5"
              >
                <span className={`font-medium ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>EN</span>
                <span className="text-slate-600">|</span>
                <span className={`font-medium ${language === 'th' ? 'text-white' : 'text-slate-400'}`}>TH</span>
              </button>

              <div className="glass px-4 py-2 rounded-full flex items-center space-x-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium">{t('header.systemOnline')}</span>
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
                        <h3 className="text-slate-300 font-medium">{t('overview.optimalStatus')}</h3>
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-bold text-white tracking-tight">{summary.trafficLight.green}</span>
                          <span className="text-slate-400 font-medium">{t('overview.projects')}</span>
                        </div>
                        <p className="text-emerald-400 text-sm mt-2 font-medium flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" /> {t('overview.trendingPositive')}
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
                        <h3 className="text-slate-300 font-medium">{t('overview.requiresAttention')}</h3>
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-bold text-white tracking-tight">{summary.trafficLight.yellow}</span>
                          <span className="text-slate-400 font-medium">{t('overview.projects')}</span>
                        </div>
                        <p className="text-amber-400 text-sm mt-2 font-medium flex items-center">
                          <Activity className="w-4 h-4 mr-1" /> {t('overview.minorDeviations')}
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
                        <h3 className="text-slate-300 font-medium">{t('overview.criticalRisk')}</h3>
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-bold text-white tracking-tight">{summary.trafficLight.red}</span>
                          <span className="text-slate-400 font-medium">{t('overview.projects')}</span>
                        </div>
                        <p className="text-rose-400 text-sm mt-2 font-medium flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" /> {t('overview.immediateAction')}
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
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('overview.totalCapital')}</span>
                      </div>
                      <h4 className="text-4xl font-bold text-white tracking-tight">{formatCurrency(summary.totalBudget)}</h4>
                      <p className="text-sm text-slate-400 mt-2">{t('overview.activeDevelopments').replace('{count}', summary.totalProjects.toString())}</p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="glass-card flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('overview.marginForecast')}</span>
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
                        <h3 className="text-lg font-semibold text-white">{t('overview.aiMarginTrajectory')}</h3>
                        <p className="text-sm text-slate-400">{t('overview.trajectorySubtext')}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-medium">
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>{t('overview.chart.optimistic')}</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>{t('overview.chart.predicted')}</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-400 mr-2"></div>{t('overview.chart.conservative')}</div>
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

                          <Area type="monotone" dataKey="pessimistic" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="none" name={t('overview.chart.lowEnd')} />
                          <Area type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" name={t('overview.chart.highEnd')} />
                          <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPredicted)" name={t('overview.chart.consensus')} />
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
                  <motion.div key={project.id} variants={fadeUp} onClick={() => setSelectedProject(project)} className="glass-card hover:bg-white/10 transition-all group cursor-pointer border border-white/5 hover:border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-blue-500/15 transition-colors pointer-events-none"></div>
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
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t('project.aiForecast')}</p>
                          <p className="text-lg md:text-xl font-bold text-emerald-400">{project.predictedProfit}% {t('project.margin')}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-700 hidden lg:block"></div>
                        <div className="flex flex-col space-y-1 w-full sm:w-32 flex-1 sm:flex-none">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">{t('project.carbon')}</span>
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
                            <span><strong className="text-white mr-2">{t('project.alert')}</strong>{alert.message}</span>
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

                {/* ESG Header & Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">{t('esg.title')}</h2>
                      <p className="text-xs text-slate-400">{t('esg.subtitle')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-400 whitespace-nowrap">{t('esg.projectFilter')}:</span>
                    <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full md:w-48 p-2">
                      <option>{t('esg.allProjects')}</option>
                      <option>{t('esg.sukhumvitSite')}</option>
                      <option>{t('esg.bangnaSite')}</option>
                    </select>
                  </div>
                </div>

                {/* AI Executive Summary Alert */}
                <motion.div variants={fadeUp} className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-4">
                  <Activity className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">{t('esg.aiExecutiveSummary')}</h4>
                    <p className="text-slate-300 leading-relaxed text-sm">{t('esg.summaryOnTrack')}</p>
                  </div>
                </motion.div>

                {/* Grid for E, S, G */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* CARBON (Environment) */}
                  <motion.div variants={fadeUp} onClick={() => setActiveDrilldown('environment')} className="glass-card flex flex-col p-6 border-t-2 border-t-emerald-500 space-y-6 flex-1 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
                    <div className="relative z-10 flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"><Leaf className="h-5 w-5 text-emerald-400" /></div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Environment</h3>
                      <ChevronRight className="w-4 h-4 text-emerald-500/0 group-hover:text-emerald-500/100 ml-auto transition-all transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <h4 className="text-3xl font-bold text-white">23<span className="text-lg text-emerald-400 ml-1">{t('esg.tons')}</span></h4>
                        <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3 mr-1" /> 12% {t('esg.vsLastMonth')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">{t('esg.carbonMitigated')}</p>

                      {/* Target Progress Bar */}
                      <div className="space-y-1 mt-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>23 / 100 {t('esg.annualTarget')}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 mt-auto">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{t('esg.carbonForecast')}</p>
                      <div className="h-24 w-full bg-slate-800/50 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden relative">
                        <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                          <polyline points="0,35 20,30 40,25 60,15 80,10 100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                        </svg>
                        <div className="absolute right-2 top-1 text-[10px] text-rose-400/80 font-medium bg-slate-900/50 px-1 rounded">{t('esg.setComplianceThreshold')}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* SAFETY (Social) */}
                  <motion.div variants={fadeUp} onClick={() => setActiveDrilldown('social')} className="glass-card flex flex-col p-6 border-t-2 border-t-amber-500 space-y-6 flex-1 cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
                    <div className="relative z-10 flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors"><ShieldCheck className="h-5 w-5 text-amber-400" /></div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Social (Safety)</h3>
                      <ChevronRight className="w-4 h-4 text-amber-500/0 group-hover:text-amber-500/100 ml-auto transition-all transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <h4 className="text-3xl font-bold text-amber-400">78<span className="text-lg text-slate-500 ml-1">/100</span></h4>
                        <span className="text-xs font-bold text-rose-400 flex items-center bg-rose-500/10 px-2 py-1 rounded-full">
                          <TrendingDown className="w-3 h-3 mr-1" /> +15% Risk
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{t('esg.predictiveRiskScore')}</p>
                      <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-white/5 mt-3">{t('esg.moderateRisk')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">{t('esg.nearMisses')}</p>
                        <p className="text-xl font-bold text-white mt-1">3 <span className="text-[10px] text-slate-500 font-normal ml-1">This Mo.</span></p>
                      </div>
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">{t('esg.anomalyDetection')}</p>
                        <p className="text-xl font-bold text-rose-400 mt-1">1 <span className="text-[10px] text-slate-500 font-normal ml-1">Active</span></p>
                      </div>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs text-rose-300 flex items-start space-x-2 mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{t('esg.anomalyFuel')}</span>
                    </div>
                  </motion.div>

                  {/* PEOPLE & GOVERNANCE */}
                  <motion.div variants={fadeUp} onClick={() => setActiveDrilldown('governance')} className="glass-card flex flex-col p-6 border-t-2 border-t-violet-500 space-y-6 flex-1 cursor-pointer hover:border-violet-500/50 hover:bg-slate-800/80 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-violet-500/20 transition-colors pointer-events-none"></div>
                    <div className="relative z-10 flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors"><Users className="h-5 w-5 text-violet-400" /></div>
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">People & Gov</h3>
                      <ChevronRight className="w-4 h-4 text-violet-500/0 group-hover:text-violet-500/100 ml-auto transition-all transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-3xl font-bold text-white mb-1">4.5<span className="text-lg text-slate-500 ml-1">/ 5.0</span></h4>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('esg.happinessIndex')}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-2xl font-bold text-emerald-400 mb-1">82%</h4>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{t('esg.wasteManagement')}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex-1">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">{t('esg.sentimentAnalysis')}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">{t('esg.keywordGoodConditions')} (42%)</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">{t('esg.keywordSafetyFirst')} (38%)</span>
                        <span className="px-2 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">{t('esg.keywordOverworked')} (12%)</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('esg.regulatoryCompliance')}</p>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">{t('esg.ready')}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 shadow-inner">
                        <div className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* AI Recommendations Panel */}
                <motion.div variants={fadeUp} className="glass-card p-6 border border-indigo-500/30 bg-gradient-to-r from-slate-900 to-indigo-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Zap className="w-5 h-5 text-indigo-400 mr-2" />
                      {t('esg.aiRecommendations')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors flex items-start space-x-4 group cursor-pointer">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0 group-hover:bg-emerald-500/30 transition-colors"><Leaf className="w-5 h-5" /></div>
                        <div>
                          <h4 className="text-white text-sm font-semibold mb-1">Carbon Mitigation</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{t('esg.recConcrete')}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors flex items-start space-x-4 group cursor-pointer">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0 group-hover:bg-amber-500/30 transition-colors"><AlertTriangle className="w-5 h-5" /></div>
                        <div>
                          <h4 className="text-white text-sm font-semibold mb-1">Risk Prevention</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{t('esg.recMachinery')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>


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
                    <motion.div key={op.id} variants={fadeUp} onClick={() => setSelectedBidding(op)} className="glass-card relative overflow-hidden group border border-white/5 hover:border-indigo-500/30 transition-all p-6 cursor-pointer">
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

                {/* Bidding Drilldown Modal */}
                <AnimatePresence>
                  {selectedBidding && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                      onClick={() => setSelectedBidding(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 custom-scrollbar"
                      >
                        <button
                          onClick={() => setSelectedBidding(null)}
                          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors z-10"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-6">
                          {/* Header */}
                          <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Target className="w-6 h-6" /></div>
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-white">{selectedBidding.name}</h2>
                              <div className="flex items-center space-x-3 mt-1 flex-wrap gap-y-1">
                                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{selectedBidding.id}</span>
                                <span className="text-slate-400 text-sm">{selectedBidding.client}</span>
                                <span className="text-slate-400 text-sm">{formatCurrency(selectedBidding.estimatedBudget)}</span>
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-widest ${selectedBidding.recommendation === 'GO' ? 'bg-emerald-500 text-slate-900' :
                              selectedBidding.recommendation === 'NO-GO' ? 'bg-rose-500 text-white' :
                                'bg-amber-500 text-slate-900'
                              }`}>{selectedBidding.recommendation}</div>
                          </div>

                          {/* KPI Row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-4 text-center border-indigo-500/20">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Risk Score</p>
                              <p className={`text-2xl font-bold ${selectedBidding.aiRiskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedBidding.aiRiskScore}/100</p>
                            </div>
                            <div className="glass-card p-4 text-center border-emerald-500/20">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Margin</p>
                              <p className="text-2xl font-bold text-emerald-400">{selectedBidding.aiExpectedMargin}%</p>
                            </div>
                            <div className="glass-card p-4 text-center border-blue-500/20">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Probability</p>
                              <p className="text-2xl font-bold text-blue-400">{selectedBidding.historicalConfidence}%</p>
                            </div>
                            <div className="glass-card p-4 text-center border-violet-500/20">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                              <p className="text-2xl font-bold text-violet-400">{selectedBidding.estimatedDuration} Mo.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Margin Simulation Chart */}
                            <div className="glass-card p-6 border-emerald-500/20">
                              <h3 className="text-white font-medium mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-emerald-400" /> Margin Simulation (6-Month Projection)</h3>
                              <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={[
                                    { m: 'M1', best: selectedBidding.aiExpectedMargin * 1.2, base: selectedBidding.aiExpectedMargin * 0.6, worst: selectedBidding.aiExpectedMargin * 0.3 },
                                    { m: 'M2', best: selectedBidding.aiExpectedMargin * 1.15, base: selectedBidding.aiExpectedMargin * 0.7, worst: selectedBidding.aiExpectedMargin * 0.35 },
                                    { m: 'M3', best: selectedBidding.aiExpectedMargin * 1.1, base: selectedBidding.aiExpectedMargin * 0.8, worst: selectedBidding.aiExpectedMargin * 0.4 },
                                    { m: 'M4', best: selectedBidding.aiExpectedMargin * 1.08, base: selectedBidding.aiExpectedMargin * 0.88, worst: selectedBidding.aiExpectedMargin * 0.5 },
                                    { m: 'M5', best: selectedBidding.aiExpectedMargin * 1.05, base: selectedBidding.aiExpectedMargin * 0.95, worst: selectedBidding.aiExpectedMargin * 0.6 },
                                    { m: 'M6', best: selectedBidding.aiExpectedMargin * 1.0, base: selectedBidding.aiExpectedMargin, worst: selectedBidding.aiExpectedMargin * 0.7 }
                                  ]}>
                                    <defs>
                                      <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis dataKey="m" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                    <Area type="monotone" dataKey="best" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Best Case" />
                                    <Area type="monotone" dataKey="base" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBase)" name="Base Case" />
                                    <Area type="monotone" dataKey="worst" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Worst Case" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Competitor Landscape */}
                            <div className="glass-card p-6 border-slate-700">
                              <h3 className="text-white font-medium mb-4 flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-400" /> Competitive Landscape</h3>
                              <div className="space-y-4">
                                {[
                                  { name: 'Your Company', share: selectedBidding.historicalConfidence, color: 'bg-blue-500' },
                                  { name: 'SCC Construction', share: Math.max(15, 85 - selectedBidding.historicalConfidence), color: 'bg-amber-500' },
                                  { name: 'THAIBUILD Public', share: Math.max(10, 70 - selectedBidding.historicalConfidence), color: 'bg-rose-500' }
                                ].map((c, i) => (
                                  <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className={`${i === 0 ? 'text-white font-semibold' : 'text-slate-400'}`}>{c.name}</span>
                                      <span className="text-white font-medium">{c.share}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                      <div className={`${c.color} h-2 rounded-full ${i === 0 ? 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} style={{ width: `${c.share}%` }}></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Evaluation Factors */}
                          <div className="glass-card p-6 border-indigo-500/20">
                            <h3 className="text-white font-medium mb-4 flex items-center"><Activity className="w-4 h-4 mr-2 text-indigo-400" /> Full Evaluation Factor Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedBidding.factors.map((factor, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-3 ${factor.impact === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'} transition-colors`}>
                                  {factor.impact === 'positive' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />}
                                  <div>
                                    <p className={`text-sm font-bold mb-1 ${factor.impact === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>{factor.name}</p>
                                    <p className="text-sm text-slate-400 leading-relaxed">{factor.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.totalRevenue')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.totalRevenue}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> {mockCSuiteIntel.macroFinancials.revenueGrowth} {t('boardroom.yoy')}</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-blue-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.ebitdaMargin')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.ebitdaMargin}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> {mockCSuiteIntel.macroFinancials.ebitdaGrowth} {t('boardroom.expanding')}</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-emerald-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.cashRunway')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.cashRunway}</h3>
                      <p className="text-sm text-slate-400 font-medium flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Optimal Liquidity</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6 border-t-2 border-t-rose-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><AlertTriangle className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.debtToEquity')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.debtToEquity}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> Healthy Leverage</p>
                    </motion.div>
                  </div>

                  {/* Market Dominance Radar (Neon Donut Graph) */}
                  <motion.div variants={fadeUp} className="glass-card p-6 flex flex-col relative overflow-hidden items-center justify-center">
                    <h3 className="text-lg font-bold text-white mb-2 w-full text-left flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-400" /> {t('boardroom.marketCapture')}
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
                      <Bot className="w-6 h-6 mr-3 text-indigo-400" /> {t('boardroom.geniusInsights')}
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

      {/* Drilldown Modals (Rendered outside main to cover sidebar) */}
      {/* Project Drilldown Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 custom-scrollbar"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
                  <div className={`p-3 rounded-xl border ${getRiskColor(selectedProject.riskLevel)}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{selectedProject.id}</span>
                      <span className="text-slate-400 text-sm">{formatCurrency(selectedProject.budget)}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${selectedProject.riskLevel === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                        selectedProject.riskLevel === 'yellow' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>{selectedProject.status}</span>
                    </div>
                  </div>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center border-emerald-500/20">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('project.profitForecast')}</p>
                    <p className="text-2xl font-bold text-emerald-400">{selectedProject.predictedProfit}%</p>
                  </div>
                  <div className="glass-card p-4 text-center border-blue-500/20">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('project.safetyScore')}</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedProject.esg?.safetyScore || 92}/100</p>
                  </div>
                  <div className="glass-card p-4 text-center border-violet-500/20">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('project.satisfaction')}</p>
                    <p className="text-2xl font-bold text-violet-400">{selectedProject.esg?.employeeSatisfaction || 4.2}/5</p>
                  </div>
                  <div className="glass-card p-4 text-center border-emerald-500/20">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('project.carbon')}</p>
                    <p className="text-2xl font-bold text-emerald-400">-{selectedProject.esg?.carbonReduction || 0}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget Breakdown */}
                  <div className="glass-card p-6 border-slate-700">
                    <h3 className="text-white font-medium mb-4 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-emerald-400" /> {t('project.budgetBreakdown')}</h3>
                    <div className="space-y-4">
                      {[
                        { name: t('project.laborCost'), pct: 40, color: 'bg-blue-500' },
                        { name: t('project.materialCost'), pct: 35, color: 'bg-emerald-500' },
                        { name: t('project.equipmentCost'), pct: 15, color: 'bg-amber-500' },
                        { name: t('project.overheadCost'), pct: 10, color: 'bg-violet-500' }
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{item.name}</span>
                            <span className="text-white font-medium">{item.pct}% ({formatCurrency(selectedProject.budget * item.pct / 100)})</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Milestones */}
                  <div className="glass-card p-6 border-slate-700">
                    <h3 className="text-white font-medium mb-4 flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-400" /> {t('project.timelineProgress')}</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Foundation & Piling', date: 'Jan 2026', done: true },
                        { name: 'Structural Framework', date: 'Apr 2026', done: true },
                        { name: 'MEP Installation', date: 'Jul 2026', done: false },
                        { name: 'Interior & Finishing', date: 'Oct 2026', done: false },
                        { name: 'Final Handover', date: 'Dec 2026', done: false }
                      ].map((ms, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${ms.done ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700 border border-slate-600'}`}></div>
                            <span className={`text-sm ${ms.done ? 'text-white' : 'text-slate-400'}`}>{ms.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-slate-500">{ms.date}</span>
                            {ms.done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Risk & Profit Chart */}
                <div className="glass-card p-6 border-blue-500/20">
                  <h3 className="text-white font-medium mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-blue-400" /> {t('project.riskAnalysis')} — {t('project.profitForecast')}</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { m: 'M1', profit: selectedProject.predictedProfit * 0.3, risk: 35 },
                        { m: 'M2', profit: selectedProject.predictedProfit * 0.5, risk: 30 },
                        { m: 'M3', profit: selectedProject.predictedProfit * 0.65, risk: 28 },
                        { m: 'M4', profit: selectedProject.predictedProfit * 0.8, risk: 22 },
                        { m: 'M5', profit: selectedProject.predictedProfit * 0.9, risk: 18 },
                        { m: 'M6', profit: selectedProject.predictedProfit, risk: 15 }
                      ]}>
                        <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRiskP" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="m" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name={t('project.profitForecast')} />
                        <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorRiskP)" name={t('project.riskAnalysis')} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Active Alerts */}
                {selectedProject.alerts.length > 0 && (
                  <div className="glass-card p-6 border-rose-500/20">
                    <h3 className="text-white font-medium mb-4 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-rose-400" /> {t('project.activeAlerts')} ({selectedProject.alerts.length})</h3>
                    <div className="space-y-3">
                      {selectedProject.alerts.map((alert, idx) => (
                        <div key={idx} className={`p-3 rounded-lg flex items-center space-x-3 text-sm border ${alert.type === 'danger' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <span>{alert.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESG Drilldown Modals */}
      <AnimatePresence>
        {activeDrilldown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setActiveDrilldown(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 custom-scrollbar"
            >
              <button
                onClick={() => setActiveDrilldown(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ENVIRONMENT DRILLDOWN */}
              {activeDrilldown === 'environment' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Leaf className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t('esg.drilldownEnvTitle')}</h2>
                      <p className="text-slate-400 text-sm mt-1">Detailed analysis of cross-site carbon mitigation and emission sources.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-emerald-500/20">
                      <h3 className="text-white font-medium mb-4 flex items-center"><Activity className="w-4 h-4 mr-2 text-emerald-400" /> {t('esg.dailyTrajectory')}</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { day: '01', mt: 1 }, { day: '05', mt: 3 }, { day: '10', mt: 8 }, { day: '15', mt: 12 }, { day: '20', mt: 18 }, { day: '25', mt: 23 }
                          ]}>
                            <defs>
                              <linearGradient id="colorMt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#10b981' }} />
                            <Area type="monotone" dataKey="mt" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMt)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="glass-card p-6 border-slate-700">
                      <h3 className="text-white font-medium mb-4 flex items-center"><Target className="w-4 h-4 mr-2 text-slate-400" /> {t('esg.emissionSources')}</h3>
                      <div className="space-y-4">
                        {[
                          { name: t('esg.materials'), val: 65, color: 'bg-emerald-500' },
                          { name: t('esg.machinery'), val: 25, color: 'bg-amber-500' },
                          { name: t('esg.transport'), val: 10, color: 'bg-blue-500' }
                        ].map((src, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-300">{src.name}</span>
                              <span className="text-white font-medium">{src.val}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div className={`${src.color} h-2 rounded-full`} style={{ width: `${src.val}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SOCIAL DRILLDOWN */}
              {activeDrilldown === 'social' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><ShieldCheck className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t('esg.drilldownSocTitle')}</h2>
                      <p className="text-slate-400 text-sm mt-1">Cross-site safety analysis, predictive risk mapping, and active anomalies.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-amber-500/20">
                      <h3 className="text-white font-medium mb-4 flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-amber-400" /> {t('esg.riskTrend')}</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { day: 'W1', risk: 85 }, { day: 'W2', risk: 86 }, { day: 'W3', risk: 82 }, { day: 'W4', risk: 78 }
                          ]}>
                            <defs>
                              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#f59e0b' }} />
                            <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="glass-card p-6 border-rose-500/20">
                      <h3 className="text-white font-medium mb-4 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-rose-400" /> {t('esg.anomalyLog')}</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-rose-400 uppercase">High Priority</span>
                            <span className="text-xs text-slate-500">2h ago</span>
                          </div>
                          <p className="text-sm text-slate-300">{t('esg.anomalyFuel')}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-amber-400 uppercase">Near Miss</span>
                            <span className="text-xs text-slate-500">1d ago</span>
                          </div>
                          <p className="text-sm text-slate-300">Scaffold stabilization warning triggered at Sukhumvit Site by IoT sensors.</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-amber-400 uppercase">Near Miss</span>
                            <span className="text-xs text-slate-500">3d ago</span>
                          </div>
                          <p className="text-sm text-slate-300">Unauthorized personnel entry detected in Zone C outside operating hours.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GOVERNANCE DRILLDOWN */}
              {activeDrilldown === 'governance' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                    <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400"><Users className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t('esg.drilldownGovTitle')}</h2>
                      <p className="text-slate-400 text-sm mt-1">Labor sentiment breakdown and regulatory compliance readiness checklist.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-slate-700">
                      <h3 className="text-white font-medium mb-4 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> {t('esg.setChecklist')}</h3>
                      <div className="space-y-3">
                        {[
                          { req: 'Corporate Governance Policy', status: true },
                          { req: 'Business Value Chain & Suppliers', status: true },
                          { req: 'Environmental Performance Data', status: true },
                          { req: 'Social Performance & Safety', status: true },
                          { req: 'Audited Financial Statements', status: false }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <span className="text-sm text-slate-300">{item.req}</span>
                            {item.status ? (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">{t('esg.ready')}</span>
                            ) : (
                              <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-full border border-rose-500/20">Pending</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card p-6 border-violet-500/20 flex flex-col items-center justify-center">
                      <h3 className="text-white font-medium mb-4 flex items-center self-start"><Activity className="w-4 h-4 mr-2 text-violet-400" /> {t('esg.sentimentChart')}</h3>
                      <div className="w-48 h-48 rounded-full border-8 border-slate-800 flex items-center justify-center relative shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-emerald-500 border-r-emerald-500 transform rotate-45"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-b-blue-500 transform -rotate-12"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-l-rose-500 transform -rotate-[60deg] clip-quarter"></div>
                        <div className="text-center">
                          <span className="block text-3xl font-bold text-white">4.5</span>
                          <span className="block text-xs text-slate-500">/ 5.0</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6 text-sm">
                        <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div><span className="text-slate-300">42%</span></div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div><span className="text-slate-300">38%</span></div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-rose-500 rounded-full mr-2"></div><span className="text-slate-300">12%</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bidding Opportunity Drilldown Modal */}
      <AnimatePresence>
        {selectedBidding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setSelectedBidding(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 custom-scrollbar"
            >
              <button
                onClick={() => setSelectedBidding(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedBidding.name}</h2>
                      <p className="text-slate-400 text-sm mt-1">{selectedBidding.client} • {formatCurrency(selectedBidding.estimatedBudget)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Recommendation:</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${selectedBidding.riskScore < 40 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                      {selectedBidding.riskScore < 40 ? 'Go / High Priority' : 'Caution / Review'}
                    </span>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Risk Score</p>
                    <p className={`text-2xl font-bold ${selectedBidding.riskScore < 40 ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedBidding.riskScore}/100</p>
                  </div>
                  <div className="glass-card p-4 border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Margin</p>
                    <p className="text-2xl font-bold text-indigo-400">{selectedBidding.predictedMargin}%</p>
                  </div>
                  <div className="glass-card p-4 border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Probability</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedBidding.historicalConfidence}%</p>
                  </div>
                  <div className="glass-card p-4 border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project Duration</p>
                    <p className="text-2xl font-bold text-white">{selectedBidding.estimatedDuration} Mo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Margin Simulation */}
                  <div className="glass-card p-6 border-slate-700">
                    <h3 className="text-white font-medium mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-indigo-400" /> Margin Simulation (6-Month Projection)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { month: 'M1', best: 18, base: 17, worst: 15 },
                          { month: 'M2', best: 19, base: 17.5, worst: 14 },
                          { month: 'M3', best: 20, base: 18, worst: 13 },
                          { month: 'M4', best: 21, base: 18.2, worst: 12 },
                          { month: 'M5', best: 22, base: 18.2, worst: 11 },
                          { month: 'M6', best: 22.5, base: 18.5, worst: 10.5 },
                        ]}>
                          <defs>
                            <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                          <Area type="monotone" dataKey="best" stroke="#10b981" fill="none" strokeDasharray="5 5" />
                          <Area type="monotone" dataKey="base" stroke="#6366f1" fillOpacity={1} fill="url(#colorBase)" strokeWidth={3} />
                          <Area type="monotone" dataKey="worst" stroke="#f43f5e" fill="none" strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Competitive Landscape */}
                  <div className="glass-card p-6 border-slate-700">
                    <h3 className="text-white font-medium mb-4 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-400" /> Competitive Landscape (Market Share)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Our Firm', value: 35 },
                              { name: 'Competitor A', value: 25 },
                              { name: 'Competitor B', value: 20 },
                              { name: 'Others', value: 20 },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#6366f1" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#1e293b" />
                            <Cell fill="#334155" />
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {[
                        { name: 'Our Firm', color: 'bg-indigo-500' },
                        { name: 'Competitor A', color: 'bg-blue-500' },
                        { name: 'Competitor B', color: 'bg-slate-800' },
                        { name: 'Others', color: 'bg-slate-700' }
                      ].map((c, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${c.color}`}></div>
                          <span className="text-xs text-slate-400">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expanded Evaluation Factors */}
                <div className="glass-card p-6 border-indigo-500/20">
                  <h3 className="text-white font-medium mb-4 flex items-center"><Activity className="w-4 h-4 mr-2 text-indigo-400" /> Full Evaluation Factor Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedBidding.factors.map((factor, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-3 ${factor.impact === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'} transition-colors`}>
                        {factor.impact === 'positive' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />}
                        <div>
                          <p className={`text-sm font-bold mb-1 ${factor.impact === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>{factor.name}</p>
                          <p className="text-sm text-slate-400 leading-relaxed">{factor.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

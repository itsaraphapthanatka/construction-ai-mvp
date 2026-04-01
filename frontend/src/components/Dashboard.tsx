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
  Globe,
  Search,
  Radar,
  Zap,
  Camera,
  HardHat,
  ClipboardList,
  FileSpreadsheet,
  FileText
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
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Legend,
  ReferenceLine
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
  executeAction?: string;
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
  portfolioNarrative?: string;
  riskMatrix?: Array<{
    id: number;
    label: string;
    probability: number;
    impact: number;
    project: string;
    mitigation?: string;
  }>;
  healthPillers?: Array<{
    name: string;
    score: number;
    status: string;
  }>;
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

const duringConScurveData = [
  { q: "Q1 '25", planned: 1.8, actual: 1.65, esgCo2: 1.55 },
  { q: "Q2 '25", planned: 3.4, actual: 3.1, esgCo2: 2.9 },
  { q: "Q3 '25", planned: 5.2, actual: 5.0, esgCo2: 4.6 },
  { q: "Q4 '25", planned: 6.8, actual: 6.4, esgCo2: 6.0 },
  { q: "Q1 '26", planned: 8.2, actual: 6.9, esgCo2: 7.0 },
];

const duringConScopeColors = ['#34d399', '#22d3ee', '#a78bfa'];

type PreConFilter = 'boq' | 'vendor' | 'contracts';
type FinancialsView = 'invoices' | 'progress-billing' | 'retention';

const preConBoqRows = [
  { code: 'A.01', desc: 'งานโครงสร้างคอนกรีต', unit: 'ตร.ม.', qty: 2400, unitPrice: 4200, status: 'approved' as const },
  { code: 'A.02', desc: 'งานก่ออิฐ/ฉาบ', unit: 'ตร.ม.', qty: 380, unitPrice: 28000, status: 'approved' as const },
  { code: 'B.01', desc: 'งานสถาปัตยกรรม', unit: 'ตร.ม.', qty: 8500, unitPrice: 3500, status: 'risk' as const },
  { code: 'C.01', desc: 'ระบบไฟฟ้าและแสงสว่าง', unit: 'จุด', qty: 1200, unitPrice: 4200, status: 'pending' as const },
  { code: 'C.02', desc: 'ระบบปรับอากาศ (HVAC)', unit: 'ชุด', qty: 240, unitPrice: 35000, status: 'pending' as const },
  { code: 'D.01', desc: 'งานภูมิทัศน์และภายนอก', unit: 'ตร.ม.', qty: 3200, unitPrice: 1800, status: 'risk' as const },
];

const financialsCashflow = [
  { m: 'Jan', cashIn: 18.2, cashOut: 14.6 },
  { m: 'Feb', cashIn: 16.9, cashOut: 15.8 },
  { m: 'Mar', cashIn: 20.1, cashOut: 18.4 },
  { m: 'Apr', cashIn: 17.4, cashOut: 19.2 },
  { m: 'May', cashIn: 22.8, cashOut: 17.1 },
  { m: 'Jun', cashIn: 21.6, cashOut: 18.9 },
].map((r) => ({ ...r, net: +(r.cashIn - r.cashOut).toFixed(1) }));

const financialsPayables = [
  { vendor: 'SCG Materials', invoice: 'INV-2403-1182', amount: 4.8, due: '12 Apr', risk: 'low' as const },
  { vendor: 'PowerGrid Co.', invoice: 'INV-2403-2044', amount: 3.1, due: '18 Apr', risk: 'medium' as const },
  { vendor: 'HVAC Prime', invoice: 'INV-2403-3310', amount: 5.6, due: '27 Apr', risk: 'high' as const },
  { vendor: 'Concrete Works', invoice: 'INV-2403-0907', amount: 2.4, due: '02 May', risk: 'low' as const },
];

const financialInvoices = [
  { id: 'INV-2025-041', project: 'Bangna', vendor: 'Thai Steel Co.', boq: 8.2, wht: 0.2472, net: 7.99, date: '15 Mar 2025', etax: 'ET-20250315-001', status: 'approved' as const },
  { id: 'INV-2025-042', project: 'EEC', vendor: 'Siam Cement', boq: 4.5, wht: 0.1360, net: 4.37, date: '20 Mar 2025', etax: 'ET-20250320-002', status: 'queued' as const },
  { id: 'INV-2025-043', project: 'U‑Tapao', vendor: 'AutoBuild Systems', boq: 2.3, wht: 0.0690, net: 2.23, date: '25 Mar 2025', etax: '—', status: 'queued' as const },
  { id: 'INV-2025-044', project: 'Bangna', vendor: 'Eastern Electrical', boq: 1.8, wht: 0.0540, net: 1.75, date: '01 Apr 2025', etax: '—', status: 'pending' as const },
  { id: 'INV-2025-045', project: 'EEC', vendor: 'Premium Tiles TH', boq: 0.95, wht: 0.0285, net: 0.92, date: '05 Apr 2025', etax: '—', status: 'pending' as const },
];

const preConVendorRows = [
  { vendor: 'SCG Materials', type: 'Materials', status: 'bidding', score: 85, bidAmount: 4.8 },
  { vendor: 'Thai Steel Co.', type: 'Steel', status: 'awarded', score: 92, bidAmount: 12.5 },
  { vendor: 'Green Build Ltd', type: 'Architecture', status: 'rejected', score: 65, bidAmount: 3.2 },
  { vendor: 'Eastern Electrical', type: 'Systems', status: 'reviewing', score: 78, bidAmount: 5.1 },
];

const preConContractRows = [
  { contractId: 'CTR-2025-001', vendor: 'Thai Steel Co.', type: 'Lump Sum', value: 12.5, status: 'active', signedDate: '10 Feb 2025' },
  { contractId: 'CTR-2025-002', vendor: 'SCG Materials', type: 'Unit Price', value: 4.8, status: 'draft', signedDate: '-' },
  { contractId: 'CTR-2025-003', vendor: 'Eastern Electrical', type: 'Lump Sum', value: 5.1, status: 'pending', signedDate: '-' },
];

const financialsProgressBillingRows = [
  { period: 'Period 1 (Jan 25)', project: 'Bangna', claimedAmount: 2.5, certifiedAmount: 2.5, status: 'paid' },
  { period: 'Period 2 (Feb 25)', project: 'Bangna', claimedAmount: 3.2, certifiedAmount: 3.0, status: 'approved' },
  { period: 'Period 1 (Feb 25)', project: 'EEC Phase 2', claimedAmount: 5.1, certifiedAmount: 4.8, status: 'reviewing' },
];

const financialsRetentionRows = [
  { project: 'Bangna', vendor: 'Thai Steel Co.', retainedAmount: 0.625, releaseDate: '15 Dec 2025', status: 'held' },
  { project: 'EEC Phase 2', vendor: 'Siam Cement', retainedAmount: 0.218, releaseDate: '20 Jan 2026', status: 'held' },
  { project: 'Q-Tower', vendor: 'Concrete Works', retainedAmount: 1.200, releaseDate: '10 Mar 2025', status: 'processing' },
];

const postConChecklist = [
  { key: 'inspections' as const, done: true },
  { key: 'asBuilt' as const, done: true },
  { key: 'punchList' as const, done: false },
  { key: 'training' as const, done: false },
  { key: 'retentionRelease' as const, done: false },
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
  const [summary, setSummary] = useState<DashboardSummary | null>({
    totalProjects: 12,
    activeProjects: 8,
    totalBudget: 42500000000,
    avgProfit: '18.5',
    trafficLight: {
      green: 9,
      yellow: 2,
      red: 1
    },
    portfolioNarrative: t('overview.portfolioNarrative'),
    healthPillers: [
      { name: 'Environment', score: 92, status: 'Excellent' },
      { name: 'Social', score: 85, status: 'Stable' },
      { name: 'Governance', score: 95, status: 'Excellent' }
    ]
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [biddingOps, setBiddingOps] = useState<BiddingOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState('during-con');
  const [esgSummary, setEsgSummary] = useState<any>(null);
  const [activeDrilldown, setActiveDrilldown] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBidding, setSelectedBidding] = useState<BiddingOpportunity | null>(null);
  const [strategicDrilldown, setStrategicDrilldown] = useState<{ type: string; data: any } | null>(null);
  const [cSuiteIntel, setCSuiteIntel] = useState<any>(null);
  // Default sidebar open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [liveEventIndex, setLiveEventIndex] = useState(0);
  const [preConFilter, setPreConFilter] = useState<PreConFilter>('boq');
  const [financialsView, setFinancialsView] = useState<FinancialsView>('invoices');
  const [postConMode, setPostConMode] = useState<'punch-list' | 'warranty'>('punch-list');
  const [punchListFilter, setPunchListFilter] = useState('all');

  const mockPunchList = [
    { id: 'PL-001', zone: t('postCon.zoneA'), task: t('postCon.item1'), priority: 'high', responsible: 'ช่างวิชัย', due: '20 Mar', status: 'doing', dot: '#eab308' },
    { id: 'PL-002', zone: t('postCon.zoneA'), task: t('postCon.item2'), priority: 'medium', responsible: 'ช่างสมศักดิ์', due: '22 Mar', status: 'done', dot: '#22c55e' },
    { id: 'PL-003', zone: t('postCon.zoneB'), task: t('postCon.item3'), priority: 'critical', responsible: 'Eastern Electrical', due: '18 Mar', status: 'doing', dot: '#ef4444' },
    { id: 'PL-004', zone: t('postCon.zoneC'), task: t('postCon.item4'), priority: 'high', responsible: 'Thai Waterproof Co.', due: '25 Mar', status: 'pending', dot: '#eab308' },
    { id: 'PL-005', zone: t('postCon.zoneD'), task: t('postCon.item5'), priority: 'medium', responsible: 'ช่างพิมพ์', due: '30 Mar', status: 'todo', dot: '#3b82f6' },
    { id: 'PL-006', zone: t('postCon.zoneD'), task: t('postCon.item6'), priority: 'high', responsible: 'HVAC Service', due: '21 Mar', status: 'done', dot: '#22c55e' },
  ];

  const mockWarrantyList = [
    { id: 'WR-001', system: language === 'th' ? 'ระบบปรับอากาศ' : 'HVAC System', issue: language === 'th' ? 'คอมเพรสเซอร์มีเสียงดัง' : 'Compressor Noise', expiry: '15 Mar 2026', vendor: 'AirCool Co.', status: 'doing', dot: '#3b82f6' },
    { id: 'WR-002', system: language === 'th' ? 'หลังคาโซน B' : 'Roofing Zone B', issue: language === 'th' ? 'น้ำซึม' : 'Minor Leakage', expiry: '02 Jun 2028', vendor: 'Thai Waterproof Co.', status: 'todo', dot: '#ef4444' },
    { id: 'WR-003', system: language === 'th' ? 'ลิฟต์ตัวที่ 3' : 'Elevator #3', issue: language === 'th' ? 'เซ็นเซอร์ประตูขัดข้อง' : 'Door Sensor Fault', expiry: '20 Nov 2027', vendor: 'Otis System', status: 'done', dot: '#22c55e' },
    { id: 'WR-004', system: language === 'th' ? 'ระบบปั๊มน้ำ' : 'Water Pump Set', issue: language === 'th' ? 'แรงดันตก' : 'Pressure Drop', expiry: '10 Jan 2030', vendor: 'PlumbMaster TH', status: 'pending', dot: '#eab308' }
  ];

  // Cycle live AI events
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEventIndex((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://appreview.cloud' : 'http://localhost:4001');
      const [summaryRes, projectsRes, biddingRes, esgRes, intelRes] = await Promise.all([
        axios.get(`${API_BASE}/api/dashboard/summary`),
        axios.get(`${API_BASE}/api/projects`),
        axios.get(`${API_BASE}/api/bidding-opportunities`),
        axios.get(`${API_BASE}/api/esg/summary`),
        axios.get(`${API_BASE}/api/c-suite-intel`)
      ]);

      const mockRiskMatrixFallback = [
        { id: 1, label: language === 'th' ? 'ค่าวัสดุผันผวน' : 'Material Volatility', probability: 75, impact: 85, project: 'Network wide', mitigation: 'AI Procurement Locking' },
        { id: 2, label: language === 'th' ? 'ขาดแคลนแรงงาน' : 'Labor Shortage', probability: 60, impact: 50, project: 'EEC Phase 2', mitigation: 'Automated Rostering' },
        { id: 3, label: language === 'th' ? 'สภาพอากาศแปรปรวน' : 'Weather Delays', probability: 35, impact: 40, project: 'Q-Tower', mitigation: 'Dynamic Scheduling' },
        { id: 4, label: language === 'th' ? 'ห่วงโซ่อุปทานล่าช้า' : 'Supply Chain Snags', probability: 80, impact: 90, project: 'Sukhumvit A', mitigation: 'Alternative Routing' },
        { id: 5, label: language === 'th' ? 'ความเสี่ยงด้านการออกแบบ' : 'Design Clashes', probability: 20, impact: 95, project: 'U-Tapao', mitigation: 'BIM Clash Detection' }
      ];

      const mockHealthPillersFallback = [
        { name: language === 'th' ? 'สิ่งแวดล้อม (E)' : 'Environment', score: 92, status: language === 'th' ? 'ดีเยี่ยม' : 'Excellent' },
        { name: language === 'th' ? 'สังคม (S)' : 'Social', score: 85, status: language === 'th' ? 'คงที่' : 'Stable' },
        { name: language === 'th' ? 'ธรรมาภิบาล (G)' : 'Governance', score: 95, status: language === 'th' ? 'ดีเยี่ยม' : 'Excellent' }
      ];

      setSummary({
        ...summaryRes.data,
        riskMatrix: summaryRes.data.riskMatrix?.length ? summaryRes.data.riskMatrix : mockRiskMatrixFallback,
        healthPillers: summaryRes.data.healthPillers?.length ? summaryRes.data.healthPillers : mockHealthPillersFallback
      });
      setProjects(projectsRes.data);
      setBiddingOps(biddingRes.data);
      setEsgSummary(esgRes.data);
      setCSuiteIntel(intelRes.data);
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
    ],
    macroHeadwinds: {
      interestRateTrend: '+50 bps forecast',
      materialInflation: '8.2% YoY',
      laborCostIndex: '112.5 (Rising)',
      consumerSentiment: 'Stable',
      historicalTrends: [
        { month: 'Jan', steel: 24000, cement: 175, inflation: 2.1 },
        { month: 'Feb', steel: 24500, cement: 178, inflation: 2.4 },
        { month: 'Mar', steel: 25000, cement: 180, inflation: 2.8 },
        { month: 'Apr', steel: 25800, cement: 182, inflation: 3.2 },
        { month: 'May', steel: 26500, cement: 185, inflation: 3.5 },
        { month: 'Jun', steel: 27200, cement: 188, inflation: 4.1 },
      ]
    },
    competitiveInsight: {
      marketShift: 'Competitors shifting focus to "Green Mini-Condos" in EEC zone.',
      vulnerability: 'Small contractors experiencing 20% default increase due to credit tightening.',
      competitorTactics: [
        { name: 'Legacy Corp', tactic: 'Aggressive pricing in public infra', risk: 'High' },
        { name: 'EcoBuilders', tactic: 'Niche focus on zero-waste sites', risk: 'Medium' },
      ]
    }
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

  const navPillClass = (id: string) => {
    if (activeTab !== id) return 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent';
    if (id === 'during-con') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]';
    }
    if (id === 'pre-con') {
      return 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-[inset_0_0_20px_rgba(245,158,11,0.08)]';
    }
    if (id === 'financials') {
      return 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shadow-[inset_0_0_20px_rgba(34,211,238,0.08)]';
    }
    if (id === 'post-con') {
      return 'bg-violet-500/10 text-violet-300 border border-violet-500/25 shadow-[inset_0_0_20px_rgba(167,139,250,0.08)]';
    }
    return 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]';
  };

  const groupedNavItems = [
    {
      group: t('nav.groupPhase'),
      items: [
        { id: 'during-con', label: t('nav.duringCon'), icon: HardHat, badge: 3 },
        { id: 'pre-con', label: t('nav.preCon'), icon: ClipboardList, badge: 1 },
        { id: 'financials', label: t('nav.financials'), icon: DollarSign },
        { id: 'post-con', label: t('nav.postCon'), icon: CheckCircle2, badge: 2 },
      ]
    },
    {
      group: t('nav.groupStrategic'),
      items: [
        { id: 'c-suite', label: t('nav.cSuiteBoardroom'), icon: Briefcase },
        { id: 'overview', label: t('nav.overview'), icon: Activity },
      ]
    },
    {
      group: t('nav.groupOperations'),
      items: [
        { id: 'projects', label: t('nav.projects'), icon: Building2 },
        { id: 'bidding', label: t('nav.bidding'), icon: Target },
      ]
    },
    {
      group: t('nav.groupIntelligence'),
      items: [
        { id: 'ai-predict', label: t('nav.aiAnalytics'), icon: TrendingUp },
        { id: 'esg', label: t('nav.esg'), icon: Leaf },
        { id: 'alerts', label: t('nav.alerts'), icon: AlertTriangle },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">

      {/* Premium Sidebar (Hidden on Mobile) */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x: 0
        }}
        className="hidden md:flex relative z-40 flex-shrink-0 border-r border-white/5 bg-slate-900/95 backdrop-blur-xl flex-col h-full"
      >
        <div className="p-6 flex items-center justify-between min-w-[280px]">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 absolute right-4 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-8 overflow-y-auto min-w-[280px]">
          {groupedNavItems.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              {sidebarOpen && (
                <div className="px-4 mb-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{group.group}</p>
                </div>
              )}
              {!sidebarOpen && groupIdx > 0 && (
                <div className="mx-4 h-px bg-white/5 mb-4" />
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group ${navPillClass(item.id)}`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-4 font-medium whitespace-nowrap flex items-center gap-2"
                      >
                        {item.label}
                        {'badge' in item && item.badge != null && (
                          <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {sidebarOpen && activeTab === item.id && (
                    <motion.div layoutId="activeNav" className={`ml-auto ${item.id === 'during-con' ? 'text-emerald-400' : ''}`}>
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile Mini */}
        <div className="p-4 mt-auto border-t border-white/5 min-w-[280px]">
          <div className="flex items-center px-2 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-slate-300">{t('user.role')}</span>
            </div>
            {sidebarOpen && (
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
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-full border border-blue-500/30">Field Mode</span>
              </div>
            </div>
          )}

          {/* Header */}
          <motion.header
            initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                {activeTab === 'during-con' && <>{t('header.duringConTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{t('header.duringConTitle')[1]}</span></>}
                {activeTab === 'pre-con' && <>{t('header.preConTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300">{t('header.preConTitle')[1]}</span></>}
                {activeTab === 'financials' && <>{t('header.financialsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">{t('header.financialsTitle')[1]}</span></>}
                {activeTab === 'post-con' && <>{t('header.postConTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-emerald-300">{t('header.postConTitle')[1]}</span></>}
                {activeTab === 'c-suite' && <>{t('header.boardroomTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.boardroomTitle')[1]}</span></>}
                {activeTab === 'overview' && <>{t('header.overviewTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.overviewTitle')[1]}</span></>}
                {activeTab === 'projects' && <>{t('header.projectsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.projectsTitle')[1]}</span></>}
                {activeTab === 'bidding' && <>{t('header.biddingTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('header.biddingTitle')[1]}</span></>}
                {activeTab === 'ai-predict' && <>{t('header.aiAnalyticsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.aiAnalyticsTitle')[1]}</span></>}
                {activeTab === 'esg' && <>{t('header.esgTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.esgTitle')[1]}</span></>}
                {activeTab === 'alerts' && <>{t('header.alertsTitle')[0]} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('header.alertsTitle')[1]}</span></>}
              </h1>
              <p className="text-slate-400 mt-2 font-medium">
                {activeTab === 'during-con'
                  ? t('duringCon.subtitle')
                  : activeTab === 'pre-con'
                    ? t('preCon.subtitle')
                    : activeTab === 'financials'
                      ? t('financials.subtitle')
                      : activeTab === 'post-con'
                        ? t('postCon.subtitle')
                        : new Date().toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4 sm:gap-0">
              {activeTab === 'during-con' && (
                <div className="flex flex-wrap items-center gap-2 order-first sm:order-none">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('duringCon.aiLive')}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {t('duringCon.serverTp')}
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#00ff9d]/15 border border-[#00ff9d]/30 text-[#00ff9d] text-sm font-black tabular-nums">
                    87
                  </div>
                </div>
              )}
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

            {/* ----------------- FINANCIALS (การเงินโครงการ) ----------------- */}
            {activeTab === 'financials' && (
              <motion.div
                key="financials"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-6"
              >
                {/* Top Summary Cards */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: t('financials.totalPayable'), value: '฿9.3M', sub: language === 'th' ? '4 invoices pending' : '4 invoices pending', accent: 'border-amber-500/25 from-amber-500/10 to-transparent', valCls: 'text-amber-200' },
                    { title: t('financials.whtCollected'), value: '฿534K', sub: language === 'th' ? 'Auto 1% & 3%' : 'Auto 1% & 3%', accent: 'border-emerald-500/25 from-emerald-500/10 to-transparent', valCls: 'text-emerald-300' },
                    { title: t('financials.retentionHold'), value: '฿20.6M', sub: language === 'th' ? '3 Projects · 5% escrow' : '3 Projects · 5% escrow', accent: 'border-cyan-500/25 from-cyan-500/10 to-transparent', valCls: 'text-cyan-200' },
                    { title: t('financials.eTaxSync'), value: '2/5', sub: language === 'th' ? 'รอเอกสารแนบอีก 3' : '3 blocked by docs', accent: 'border-violet-500/25 from-violet-500/10 to-transparent', valCls: 'text-violet-200' },
                  ].map((c) => (
                    <div key={c.title} className={`glass-card p-4 border bg-gradient-to-br ${c.accent}`}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{c.title}</p>
                      <p className={`text-2xl md:text-3xl font-black tabular-nums tracking-tight ${c.valCls}`}>{c.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Thai Financial Engine Strip */}
                <motion.div variants={fadeUp} className="glass-card p-5 border-white/10">
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {t('financials.engineTitle')}
                      </p>
                      <p className="text-sm text-slate-300 mt-1 mb-4 leading-relaxed">
                        {t('financials.engineDesc')}
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                        {[
                          { title: language === 'th' ? 'WHT 3% (บุคคลธรรมดา)' : 'WHT 3% (Individual)', status: 'AUTO ✓', statusCls: 'text-emerald-400' },
                          { title: language === 'th' ? 'WHT 1% (นิติบุคคล)' : 'WHT 1% (Corporate)', status: 'AUTO ✓', statusCls: 'text-emerald-400' },
                          { title: 'E-Tax API', status: 'CONNECTED', statusCls: 'text-cyan-400' },
                          { title: 'Retention 5%', status: 'TRACKING', statusCls: 'text-amber-500' },
                          { title: 'Thai Compliance', status: '100%', statusCls: 'text-emerald-400' },
                        ].map((badge, i) => (
                          <div key={i} className="flex flex-col bg-[#0f172a] border border-slate-700/50 rounded-xl p-3 shadow-sm hover:border-slate-500/50 transition-colors">
                            <span className="text-[10px] text-slate-500 font-mono tracking-wider mb-2">{badge.title}</span>
                            <span className={`text-sm font-black tracking-widest uppercase ${badge.statusCls}`}>{badge.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {[
                      { id: 'invoices' as const, label: t('financials.viewInvoices') },
                      { id: 'progress-billing' as const, label: t('financials.viewProgressBilling') },
                      { id: 'retention' as const, label: t('financials.viewRetention') },
                    ].map((v) => {
                      const on = financialsView === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setFinancialsView(v.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-colors ${on ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : 'bg-slate-900/40 border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Invoice Management Table */}
                <motion.div variants={fadeUp} className="glass-card p-5 border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-300" />
                      {t('financials.invoiceManagement')}
                    </h3>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                    >
                      + {t('financials.newInvoice')}
                    </button>
                  </div>

                  {financialsView === 'invoices' && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[980px] text-sm">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="text-left py-3 px-3">{t('financials.colInvoiceId')}</th>
                            <th className="text-left py-3 px-3">{t('financials.colProject')}</th>
                            <th className="text-left py-3 px-3">{t('financials.colVendor')}</th>
                            <th className="text-right py-3 px-3">{t('financials.colBoq')}</th>
                            <th className="text-right py-3 px-3">{t('financials.colWht')}</th>
                            <th className="text-right py-3 px-3">{t('financials.colNet')}</th>
                            <th className="text-left py-3 px-3">{t('financials.colDate')}</th>
                            <th className="text-left py-3 px-3">{t('financials.colETax')}</th>
                            <th className="text-left py-3 px-3">{t('financials.colStatus')}</th>
                            <th className="text-right py-3 px-3">{t('financials.colAction')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialInvoices.map((r) => {
                            const status =
                              r.status === 'approved'
                                ? { label: t('financials.statusApproved'), cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
                                : r.status === 'queued'
                                  ? { label: t('financials.statusQueued'), cls: 'bg-amber-500/10 text-amber-200 border-amber-500/20' }
                                  : { label: t('financials.statusPending'), cls: 'bg-slate-800/60 text-slate-300 border-white/10' };
                            return (
                              <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 font-mono text-xs text-cyan-300">{r.id}</td>
                                <td className="py-3 px-3 text-slate-200">{r.project}</td>
                                <td className="py-3 px-3 text-slate-200">{r.vendor}</td>
                                <td className="py-3 px-3 text-right font-mono text-slate-200">฿{r.boq.toFixed(2)}M</td>
                                <td className="py-3 px-3 text-right font-mono text-amber-200">฿{r.wht.toFixed(4)}M</td>
                                <td className="py-3 px-3 text-right font-mono text-emerald-300">฿{r.net.toFixed(2)}M</td>
                                <td className="py-3 px-3 text-slate-400 font-mono text-xs">{r.date}</td>
                                <td className="py-3 px-3 font-mono text-xs text-emerald-200">{r.etax}</td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${status.cls}`}>
                                    {status.label}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                  >
                                    {t('financials.actionApprove')}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {financialsView === 'progress-billing' && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-sm">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="text-left py-3 px-3">Period</th>
                            <th className="text-left py-3 px-3">Project</th>
                            <th className="text-right py-3 px-3">Claimed</th>
                            <th className="text-right py-3 px-3">Certified</th>
                            <th className="text-left py-3 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialsProgressBillingRows.map((r, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3 text-emerald-300 font-mono text-xs">{r.period}</td>
                              <td className="py-3 px-3 text-slate-200">{r.project}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-300">฿{r.claimedAmount.toFixed(2)}M</td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-300">฿{r.certifiedAmount.toFixed(2)}M</td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${r.status === 'paid' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : r.status === 'approved' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-amber-500/10 text-amber-200 border-amber-500/20'}`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {financialsView === 'retention' && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-sm">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="text-left py-3 px-3">Project</th>
                            <th className="text-left py-3 px-3">Vendor</th>
                            <th className="text-right py-3 px-3">Amount</th>
                            <th className="text-left py-3 px-3">Release Date</th>
                            <th className="text-left py-3 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialsRetentionRows.map((r, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3 text-slate-200">{r.project}</td>
                              <td className="py-3 px-3 text-cyan-300">{r.vendor}</td>
                              <td className="py-3 px-3 text-right font-mono text-amber-200">฿{r.retainedAmount.toFixed(3)}M</td>
                              <td className="py-3 px-3 text-slate-400 font-mono text-xs">{r.releaseDate}</td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${r.status === 'held' ? 'bg-slate-800/60 text-slate-300 border-white/10' : 'bg-amber-500/10 text-amber-200 border-amber-500/20'}`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ----------------- POST-CON (หลังส่งมอบ) ----------------- */}
            {activeTab === 'post-con' && (
              <motion.div
                key="post-con"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-6"
              >
                {/* 1. Summary Cards */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: t('postCon.punchListItems'), value: '2/6', sub: t('postCon.completedCount'), accent: 'border-emerald-500/30 shadow-emerald-500/5', icon: ClipboardList, iconColor: 'text-emerald-400' },
                    { title: t('postCon.criticalIssuesTitle'), value: '1', sub: t('postCon.mustFixNow'), accent: 'border-rose-500/30 shadow-rose-500/5', icon: AlertTriangle, iconColor: 'text-rose-400' },
                    { title: t('postCon.warrantiesActiveTitle'), value: '4/5', sub: t('postCon.pendingItem'), accent: 'border-blue-500/30 shadow-blue-500/5', icon: ShieldCheck, iconColor: 'text-blue-400' },
                    { title: t('postCon.handoverTitle'), value: '85%', sub: t('postCon.readyForHandover'), accent: 'border-amber-500/30 shadow-amber-500/5', icon: CheckCircle2, iconColor: 'text-amber-400' },
                  ].map((c) => (
                    <div key={c.title} className={`glass-card p-5 border-l-4 bg-slate-900/40 ${c.accent}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.title}</p>
                        <c.icon className={`w-4 h-4 ${c.iconColor} opacity-50`} />
                      </div>
                      <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{c.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                    </div>
                  ))}
                </motion.div>

                {/* 2. Post-Construction Completion Section */}
                <motion.div variants={fadeUp} className="glass-card p-6 border-white/5 bg-slate-900/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('postCon.completionTitle')}</h3>
                    <span className="text-sm font-black text-emerald-400">33%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '33%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs text-slate-300 font-bold">{t('postCon.legendDone')}: <span className="text-white">2</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-xs text-slate-300 font-bold">{t('postCon.legendDoing')}: <span className="text-white">2</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="text-xs text-slate-300 font-bold">{t('postCon.legendTodo')}: <span className="text-white">2</span></span>
                    </div>
                  </div>
                </motion.div>

                {/* 3. Toggles */}
                <motion.div variants={fadeUp} className="flex gap-2 p-1 bg-slate-900/60 rounded-xl border border-white/5 w-fit">
                  <button
                    onClick={() => setPostConMode('punch-list')}
                    className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${postConMode === 'punch-list' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <div className={`w-2 h-2 rounded-full animate-pulse ${postConMode === 'punch-list' ? 'bg-white' : 'bg-slate-700'}`} />
                    {t('postCon.digitalPunchList')}
                  </button>
                  <button
                    onClick={() => setPostConMode('warranty')}
                    className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${postConMode === 'warranty' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {t('postCon.warrantyTracking')}
                  </button>
                </motion.div>

                {/* 4. Detailed Table Section */}
                <motion.div variants={fadeUp} className="glass-card border-white/5 bg-slate-900/30 overflow-hidden">
                  {/* Table Header Area */}
                  <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg"><ClipboardList className="w-4 h-4 text-slate-400" /></div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('postCon.bangnaHeader')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs font-bold text-slate-300 flex items-center gap-2 hover:bg-slate-700 transition-colors uppercase tracking-widest">
                        <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> {t('postCon.exportPdf')}
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-900 text-xs font-black flex items-center gap-2 hover:brightness-110 transition-all uppercase tracking-widest">
                        + {t('postCon.addItem')}
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-white/5 bg-black/10">
                    {[
                      { id: 'all', label: t('postCon.all') },
                      { id: 'done', label: t('postCon.legendDone') },
                      { id: 'doing', label: t('postCon.legendDoing') },
                      { id: 'todo', label: t('postCon.legendTodo') },
                      { id: 'pending', label: t('postCon.waitingApproval') },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPunchListFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${punchListFilter === f.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Table Body */}
                  <div className="overflow-x-auto">
                    {postConMode === 'punch-list' && (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/[0.02]">
                            <th className="px-6 py-4">{t('postCon.colId')}</th>
                            <th className="px-6 py-4">{t('postCon.colZone')}</th>
                            <th className="px-6 py-4">{t('postCon.colTask')}</th>
                            <th className="px-6 py-4">{t('postCon.colPriority')}</th>
                            <th className="px-6 py-4">{t('postCon.colResponsibility')}</th>
                            <th className="px-6 py-4">{t('postCon.colDueDate')}</th>
                            <th className="px-6 py-4">{t('postCon.colStatus')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockPunchList.filter(item => punchListFilter === 'all' || item.status === punchListFilter).map((item) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-5 font-mono text-xs text-cyan-400/70">{item.id}</td>
                              <td className="px-6 py-5 text-xs text-slate-400">{item.zone}</td>
                              <td className="px-6 py-5 font-medium text-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.dot, boxShadow: `0 0 8px ${item.dot}` }} />
                                  {item.task}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className={`text-[10px] font-black uppercase tracking-widest tabular-nums italic ${item.priority === 'critical' ? 'text-rose-500' : item.priority === 'high' ? 'text-amber-500' : 'text-cyan-400'}`}>
                                  {t(`postCon.prio${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`)}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-xs text-slate-400">{item.responsible}</td>
                              <td className="px-6 py-5 text-xs text-slate-500 font-mono tracking-tighter">{item.due}</td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${item.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    item.status === 'doing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                      item.status === 'pending' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                        'bg-slate-800 border-white/10 text-slate-500'
                                    }`}>
                                    {t(item.status === 'done' ? 'postCon.legendDone' : item.status === 'doing' ? 'postCon.legendDoing' : item.status === 'pending' ? 'postCon.waitingApproval' : 'postCon.legendTodo')}
                                  </span>
                                  {item.status !== 'done' && (
                                    <button className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                                      {t('postCon.doneBtn')}
                                    </button>
                                  )}
                                  {item.status === 'done' && (
                                    <div className="w-5 h-5 rounded bg-slate-800 border border-white/5 flex items-center justify-center text-slate-600 opacity-50"><CheckCircle2 className="w-3 h-3" /></div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {postConMode === 'warranty' && (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/[0.02]">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">System / Item</th>
                            <th className="px-6 py-4">Issue Description</th>
                            <th className="px-6 py-4">Expiry Date</th>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockWarrantyList.filter(item => punchListFilter === 'all' || item.status === punchListFilter).map((item) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-5 font-mono text-xs text-blue-400/70">{item.id}</td>
                              <td className="px-6 py-5 font-medium text-slate-200">{item.system}</td>
                              <td className="px-6 py-5 text-xs text-slate-300">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.dot, boxShadow: `0 0 8px ${item.dot}` }} />
                                  {item.issue}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-xs text-slate-400 font-mono tracking-tighter">{item.expiry}</td>
                              <td className="px-6 py-5 text-xs text-slate-400">{item.vendor}</td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${item.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    item.status === 'doing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                      item.status === 'pending' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                        'bg-slate-800 border-white/10 text-slate-500'
                                    }`}>
                                    {t(item.status === 'done' ? 'postCon.legendDone' : item.status === 'doing' ? 'postCon.legendDoing' : item.status === 'pending' ? 'postCon.waitingApproval' : 'postCon.legendTodo')}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ----------------- PRE-CON (ก่อนก่อสร้าง) ----------------- */}
            {activeTab === 'pre-con' && (
              <motion.div
                key="pre-con"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-6"
              >
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: t('preCon.totalBoqValue'), value: '฿69.4M', sub: 'BANGNA PH.1', accent: 'border-emerald-500/20 from-emerald-500/10 to-transparent' },
                    { title: t('preCon.vendorBidding'), value: '3/5', sub: language === 'th' ? 'รอผู้ขาย 2 ราย' : '2 vendors pending', accent: 'border-blue-500/20 from-blue-500/10 to-transparent' },
                    { title: t('preCon.contractsActive'), value: '2', sub: language === 'th' ? 'กำลังร่าง 1' : '1 pending', accent: 'border-cyan-500/20 from-cyan-500/10 to-transparent' },
                    { title: t('preCon.bidProgress'), value: '72%', sub: language === 'th' ? 'ก่อนเริ่มก่อสร้าง' : 'Phase: Pre-con', accent: 'border-amber-500/25 from-amber-500/10 to-transparent' },
                  ].map((c) => (
                    <div key={c.title} className={`glass-card p-4 border bg-gradient-to-br ${c.accent}`}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{c.title}</p>
                      <p className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">{c.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="glass-card p-5 border-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-amber-300" />
                        {t('preCon.boqTitle', { project: 'Bangna' })}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-900/60 border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-slate-300" />
                        {t('preCon.exportExcel')}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                      >
                        {t('preCon.approveAi')}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {[
                      { id: 'boq' as const, label: t('preCon.filterBoq') },
                      { id: 'vendor' as const, label: t('preCon.filterVendorBidding') },
                      { id: 'contracts' as const, label: t('preCon.filterContracts') },
                    ].map((f) => {
                      const on = preConFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setPreConFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-colors ${on ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : 'bg-slate-900/40 border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    {preConFilter === 'boq' && (
                      <table className="w-full min-w-[860px] text-sm">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="text-left py-3 px-3">{t('preCon.colCode')}</th>
                            <th className="text-left py-3 px-3">{t('preCon.colDescription')}</th>
                            <th className="text-left py-3 px-3">{t('preCon.colUnit')}</th>
                            <th className="text-right py-3 px-3">{t('preCon.colQty')}</th>
                            <th className="text-right py-3 px-3">{t('preCon.colUnitPrice')}</th>
                            <th className="text-right py-3 px-3">{t('preCon.colTotal')}</th>
                            <th className="text-left py-3 px-3">{t('preCon.colStatus')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preConBoqRows.map((r) => {
                            const total = r.qty * r.unitPrice;
                            const status =
                              r.status === 'approved'
                                ? { label: t('preCon.statusApproved'), cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
                                : r.status === 'pending'
                                  ? { label: t('preCon.statusPending'), cls: 'bg-amber-500/10 text-amber-200 border-amber-500/20' }
                                  : { label: t('preCon.statusRisk'), cls: 'bg-rose-500/10 text-rose-200 border-rose-500/20' };
                            return (
                              <tr key={r.code} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 font-mono text-xs text-emerald-300">{r.code}</td>
                                <td className="py-3 px-3 text-slate-200">{r.desc}</td>
                                <td className="py-3 px-3 text-slate-400">{r.unit}</td>
                                <td className="py-3 px-3 text-right font-mono text-slate-200">{r.qty.toLocaleString()}</td>
                                <td className="py-3 px-3 text-right font-mono text-slate-200">{r.unitPrice.toLocaleString()}</td>
                                <td className="py-3 px-3 text-right font-mono text-emerald-300">{(total / 1_000_000).toFixed(2)}M</td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${status.cls}`}>
                                    {status.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}

                    {preConFilter === 'vendor' && (
                      <table className="w-full min-w-[860px] text-sm">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="text-left py-3 px-3">Vendor</th>
                            <th className="text-left py-3 px-3">Work Type</th>
                            <th className="text-right py-3 px-3">Bid Amount</th>
                            <th className="text-right py-3 px-3">AI Score</th>
                            <th className="text-left py-3 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preConVendorRows.map((r, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3 text-cyan-300">{r.vendor}</td>
                              <td className="py-3 px-3 text-slate-200">{r.type}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-200">฿{r.bidAmount.toFixed(1)}M</td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-300">{r.score}/100</td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${r.status === 'awarded' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : r.status === 'rejected' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'}`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {preConFilter === 'contracts' && (
                      <table className="w-full min-w-[860px] text-sm">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="text-left py-3 px-3">Contract ID</th>
                            <th className="text-left py-3 px-3">Vendor</th>
                            <th className="text-left py-3 px-3">Type</th>
                            <th className="text-right py-3 px-3">Value</th>
                            <th className="text-left py-3 px-3">Date</th>
                            <th className="text-left py-3 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preConContractRows.map((r, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3 font-mono text-xs text-emerald-300">{r.contractId}</td>
                              <td className="py-3 px-3 text-slate-200">{r.vendor}</td>
                              <td className="py-3 px-3 text-slate-400">{r.type}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-200">฿{r.value.toFixed(1)}M</td>
                              <td className="py-3 px-3 text-slate-400 font-mono text-xs">{r.signedDate}</td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${r.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : r.status === 'draft' ? 'bg-slate-800/60 text-slate-300 border-white/10' : 'bg-amber-500/10 text-amber-200 border-amber-500/20'}`}>
                                  {r.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ----------------- DURING-CON (ระหว่างก่อสร้าง) ----------------- */}
            {activeTab === 'during-con' && (
              <motion.div
                key="during-con"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-6"
              >
                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 glass-card p-4 border-emerald-500/20"
                >
                  {[
                    { label: t('duringCon.safety'), pct: 94, color: 'bg-emerald-500' },
                    { label: t('duringCon.budget'), pct: 87, color: 'bg-cyan-400' },
                    { label: t('duringCon.timeline'), pct: 78, color: 'bg-amber-400' },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        <span>{row.label}</span>
                        <span className="text-white tabular-nums">{row.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${row.color} shadow-[0_0_12px_rgba(52,211,153,0.35)]`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: t('duringCon.portfolioHealth'),
                      value: '87',
                      sub: t('duringCon.vitality'),
                      accent: 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/30',
                    },
                    {
                      title: t('duringCon.activeProjects'),
                      value: '3',
                      sub: t('duringCon.activeProjectsSub', { count: 3, value: '16.2' }),
                      accent: 'from-blue-500/15 to-indigo-500/10 border-blue-500/25',
                    },
                    {
                      title: t('duringCon.co2Ytd'),
                      value: '2,847',
                      sub: t('duringCon.co2Target', { target: '4,050' }),
                      accent: 'from-teal-500/15 to-emerald-500/10 border-teal-500/25',
                    },
                    {
                      title: t('duringCon.compliance'),
                      value: '100%',
                      sub: t('duringCon.complianceDetail'),
                      accent: 'from-violet-500/15 to-purple-500/10 border-violet-500/25',
                    },
                  ].map((c) => (
                    <div
                      key={c.title}
                      className={`glass-card p-4 rounded-2xl border bg-gradient-to-br ${c.accent}`}
                    >
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{c.title}</p>
                      <p className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">{c.value}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">{c.sub}</p>
                    </div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <motion.div variants={fadeUp} className="xl:col-span-4 space-y-4">
                    <div className="glass-card p-5 border-white/10">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                        {t('duringCon.portfolioListTitle', { count: 3 })}
                      </h3>
                      <div className="space-y-3">
                        {[
                          { nameKey: 'projectBangna' as const, score: 92, pct: 68, ok: true },
                          { nameKey: 'projectEec' as const, score: 74, pct: 41, ok: false, wk: 2 },
                          { nameKey: 'projectUtapao' as const, score: 81, pct: 29, ok: true },
                        ].map((p) => (
                          <div
                            key={p.nameKey}
                            className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/20 transition-colors cursor-pointer"
                            onClick={() => {
                              const match = projects.find((pr) =>
                                pr.name.toLowerCase().includes(p.nameKey.replace('project', '').toLowerCase())
                              );
                              if (match) setSelectedProject(match);
                            }}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="font-bold text-white text-sm">
                                {t(`duringCon.${p.nameKey}`)}
                              </span>
                              <span className="text-emerald-400 text-sm font-black tabular-nums">{p.score}/100</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-800 mb-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${p.ok ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${p.pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">{t('duringCon.completeLabel', { pct: p.pct })}</span>
                              <span className={p.ok ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                {p.ok ? t('duringCon.onTrack') : t('duringCon.delayWeeks', { n: p.wk ?? 2 })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-5 border-emerald-500/20">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">
                        {t('duringCon.healthBreakdown')}
                      </h3>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl font-black text-white tabular-nums">87</span>
                        <div className="text-xs text-slate-400 space-y-1 flex-1">
                          <div className="flex justify-between">
                            <span>{t('duringCon.safetyIndex')}</span>
                            <span className="text-emerald-400 font-bold">94</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('duringCon.budgetVariance')}</span>
                            <span className="text-cyan-400 font-bold">87</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('duringCon.timelineScore')}</span>
                            <span className="text-amber-400 font-bold">78</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('duringCon.esgRating')}</span>
                            <span className="text-violet-400 font-bold">A-</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {t('duringCon.vitalityIndex')}
                      </p>
                      {[
                        { label: t('duringCon.safety'), pct: 94, bar: 'bg-emerald-500' },
                        { label: t('duringCon.budget'), pct: 87, bar: 'bg-cyan-400' },
                        { label: t('duringCon.timeline'), pct: 78, bar: 'bg-amber-400' },
                      ].map((v) => (
                        <div key={v.label} className="mb-2 last:mb-0">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>{v.label}</span>
                            <span>{v.pct}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full ${v.bar}`} style={{ width: `${v.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="xl:col-span-5 space-y-4">
                    <div className="glass-card p-5 border-cyan-500/15 overflow-hidden">
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-white">{t('duringCon.twinTrackTitle')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('duringCon.twinTrackSub')} — {t('duringCon.projectBangna')}</p>
                      </div>
                      <div className="h-64 w-full mt-2 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={duringConScurveData} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0c" />
                            <XAxis dataKey="q" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                              contentStyle={{
                                background: 'rgba(15,23,42,0.95)',
                                border: '1px solid rgba(56,189,248,0.25)',
                                borderRadius: '12px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <ReferenceLine
                              x="Q4 '25"
                              stroke="#00ff9d"
                              strokeDasharray="4 4"
                              label={{ value: t('duringCon.now'), fill: '#00ff9d', fontSize: 10, position: 'top' }}
                            />
                            <Line type="monotone" dataKey="planned" name={t('duringCon.plannedCost')} stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="actual" name={t('duringCon.actualCost')} stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="esgCo2" name={t('duringCon.esgCo2')} stroke="#34d399" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-card p-5 border-teal-500/20 overflow-hidden">
                      <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-2">
                        {t('duringCon.co2Meter')}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">{t('duringCon.toTarget', { pct: 70 })}</p>
                      <div className="flex flex-col sm:flex-row gap-5 sm:items-center min-w-0">
                        <div className="relative h-36 w-36 mx-auto sm:mx-0 shrink-0 overflow-hidden rounded-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                              <Pie
                                data={[
                                  { name: t('duringCon.scope1'), value: 420 },
                                  { name: t('duringCon.scope2'), value: 890 },
                                  { name: t('duringCon.scope3'), value: 1537 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius="58%"
                                outerRadius="82%"
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                              >
                                {duringConScopeColors.map((col, i) => (
                                  <Cell key={i} fill={col} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                            <span className="text-xl font-black text-white leading-none">70%</span>
                            <span className="text-[8px] text-slate-500 uppercase font-bold mt-1">{t('duringCon.tco2')}</span>
                          </div>
                        </div>
                        <div className="text-xs space-y-2 flex-1 min-w-0">
                          {[
                            { name: t('duringCon.scope1'), val: '420', color: 'bg-emerald-400' },
                            { name: t('duringCon.scope2'), val: '890', color: 'bg-cyan-400' },
                            { name: t('duringCon.scope3'), val: '1,537', color: 'bg-violet-400' },
                          ].map((s) => (
                            <div key={s.name} className="flex justify-between items-center gap-2">
                              <span className="flex items-center gap-2 text-slate-400 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                                <span className="truncate">{s.name}</span>
                              </span>
                              <span className="font-mono text-slate-200 shrink-0">{s.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-5 border-indigo-500/20">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {t('duringCon.agenticFeed')}
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-wide mb-1">{t('duringCon.costSave')}</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{t('duringCon.costSaveBody')}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                          <p className="text-xs font-black text-cyan-400 uppercase tracking-wide mb-1">{t('duringCon.esgWin')}</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{t('duringCon.esgWinBody')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-5 border-[#00ff9d]/25 bg-gradient-to-br from-[#00ff9d]/5 to-transparent">
                      <h3 className="text-lg font-bold text-white mb-1">{t('duringCon.askTREE')}</h3>
                      <p className="text-xs text-slate-400 mb-4">{t('duringCon.askHint')}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {language === 'th' ? (
                          <>
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">วิเคราะห์ความเสี่ยงไซต์</span>
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">ลด CO₂ ด่วน</span>
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">ทางเลือกซัพพลาย</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">Site risk scan</span>
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">CO₂ quick wins</span>
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">Vendor options</span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ai-predict')}
                        className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest bg-[#00ff9d] text-slate-900 hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,255,157,0.25)]"
                      >
                        {t('duringCon.openChat')}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="xl:col-span-3 space-y-4">
                    <div className="glass-card p-5 border-amber-500/20">
                      <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">
                        {t('duringCon.thaiMaterialIndex')}
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'steelRebar' as const, price: '24,850', change: '+1.98%', pos: true },
                          { key: 'cementTpi' as const, price: '3,120', change: '-1.27%', pos: false },
                          { key: 'copperLme' as const, price: '312,400', change: '+0.38%', pos: true },
                        ].map((m) => (
                          <div
                            key={m.key}
                            className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-white/5"
                          >
                            <div>
                              <p className="text-xs font-bold text-white">{t(`duringCon.${m.key}`)}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider">THB / unit</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono font-bold text-white">{m.price}</p>
                              <p className={`text-xs font-bold ${m.pos ? 'text-emerald-400' : 'text-rose-400'}`}>{m.change}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ----------------- OVERVIEW TAB ----------------- */}
            {activeTab === 'overview' && summary && (
              <motion.div
                key="overview"
                initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="space-y-8"
              >
                {/* Narrative AI Layer */}
                <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bot className="w-16 h-16" />
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">{t('ai.liveInsights')}</h3>
                      <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
                        {summary.portfolioNarrative || t('overview.portfolioNarrative')}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Risk & Impact Matrix (Executive Decision Matrix) */}
                <motion.div
                  variants={fadeUp}
                  className="glass-card p-6 border-indigo-500/20 relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (summary?.riskMatrix && summary.riskMatrix.length > 0) {
                      const highestRisk = [...summary.riskMatrix].sort((a, b) => (b.impact * b.probability) - (a.impact * a.probability))[0];
                      setStrategicDrilldown({ type: 'risk_matrix', data: highestRisk });
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Radar className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t('esg.riskMatrix')}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>{t('esg.highImpact')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>{t('esg.medium')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-64 md:h-80 border-l border-b border-slate-700/50 mb-4 bg-slate-900/30 rounded-bl-xl mt-6">
                    {/* Grid Labels (Behind) */}
                    <div className="absolute left-3 top-3 text-[10px] font-black uppercase text-rose-500/80 tracking-tighter z-0">{t('esg.criticalThreat')}</div>
                    <div className="absolute right-3 bottom-3 text-[10px] font-black uppercase text-emerald-500/80 tracking-tighter z-0">{t('esg.operationalTarget')}</div>

                    {/* Quadrant Backgrounds with Clipping */}
                    <div className="absolute inset-0 rounded-bl-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-15">
                        <div className="border-r border-b border-slate-700 bg-rose-500"></div>
                        <div className="border-b border-slate-700 bg-amber-500"></div>
                        <div className="border-r border-slate-700 bg-amber-500"></div>
                        <div className="bg-emerald-500"></div>
                      </div>
                    </div>

                    {/* Axis Labels */}
                    <div className="absolute -left-12 top-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('esg.impact')} →</div>
                    <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('esg.probability')} →</div>

                    {/* Matrix Axis Lines */}
                    <div className="absolute inset-0 pointer-events-none border border-slate-700/30">
                      <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-600/50" />
                      <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-600/50" />
                    </div>

                    {/* Data Points (Overflow Visible) */}
                    {summary?.riskMatrix && summary.riskMatrix.length > 0 ? (
                      summary.riskMatrix.map((point: any) => (
                        <div
                          key={point.id}
                          className="absolute group z-20 animate-pulse-glow"
                          style={{ left: `${point.probability}%`, bottom: `${point.impact}%` }}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-lg cursor-pointer transform -translate-x-1/2 translate-y-1/2 transition-all hover:scale-150 border-2 border-slate-900 ${point.impact > 80 ? 'bg-rose-500 shadow-rose-500/50' :
                            point.impact > 60 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-500 shadow-blue-500/50'
                            }`}
                            onClick={(e) => { e.stopPropagation(); setStrategicDrilldown({ type: 'risk_matrix', data: point }); }}
                          >
                            <div className="absolute inset-0 w-full h-full rounded-full animate-ping opacity-75" style={{ backgroundColor: point.impact > 80 ? '#f43f5e' : point.impact > 60 ? '#f59e0b' : '#3b82f6' }}></div>

                            {/* Point Label Text (always visible on desktop) */}
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-bold text-slate-300 pointer-events-none hidden md:block mix-blend-screen drop-shadow-md">
                              {point.label}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-30">
                              <p className="text-[11px] font-black text-white leading-tight mb-2 uppercase tracking-wide">{point.label}</p>
                              <div className="flex flex-col gap-1 text-[9px]">
                                <span className="text-slate-400">{t('esg.project')}: <b className="text-slate-200">{point.project}</b></span>
                                <div className="flex justify-between mt-1 pt-1 border-t border-slate-800">
                                  <span className="text-rose-400 font-bold">{t('esg.impact')}: {point.impact}%</span>
                                  <span className="text-blue-400 font-bold">{t('esg.probability')}: {point.probability}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="absolute inset-0 flex p-4 items-center justify-center text-slate-500 text-xs text-center z-10 animate-pulse">
                        Analyzing risk dynamics & building operational impact model...<br />Awaiting AI compilation.
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Portfolio Health Summary Card (Premium) */}
                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 cursor-pointer"
                  onClick={() => setStrategicDrilldown({ type: 'health', data: summary?.healthPillers })}
                >
                  <div className="md:col-span-1 glass-card bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/30 flex flex-col items-center justify-center py-8">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                        <circle cx="48" cy="48" r="40" className="text-blue-500" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 84) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">84</span>
                        <span className="text-[8px] text-blue-300 font-bold uppercase tracking-widest leading-none">{t('esg.health')}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">{t('esg.portfolioIndex')}</p>
                    <p className="text-xs text-blue-400 font-medium">+2.4% {t('esg.vsLastWeek')}</p>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card p-4 border-emerald-500/20 flex flex-col justify-center">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('esg.safetyLeader')}</p>
                      <p className="text-sm font-bold text-white truncate">สุขุมวิท ไซต์งาน A</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '98%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">98%</span>
                      </div>
                    </div>
                    <div className="glass-card p-4 border-amber-500/20 flex flex-col justify-center">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('esg.marginAtRisk')}</p>
                      <p className="text-sm font-bold text-white">฿1.2M ({t('esg.materials')})</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-amber-400">{t('esg.low')}</span>
                      </div>
                    </div>
                    <div className="glass-card p-4 border-blue-500/20 flex flex-col justify-center">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('esg.upcomingMilestones')}</p>
                      <p className="text-sm font-bold text-white">12 {t('esg.in30Days')}</p>
                      <div className="mt-2 flex items-center space-x-2 text-xs font-bold text-blue-400">
                        <Activity className="w-3 h-3" />
                        <span>74% {t('esg.onSchedule')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Macro Economic Intelligence & Headwinds */}
                    <motion.div
                      variants={fadeUp}
                      className="glass-card p-6 border-blue-500/20 cursor-pointer"
                      onClick={() => setStrategicDrilldown({ type: 'macro_intel', data: (cSuiteIntel || mockCSuiteIntel)?.macroHeadwinds })}
                    >
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t('esg.macroHeadwinds')}</h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                          { label: t('esg.interestRateTrend'), val: '+50 bps forecast', trend: 'down', color: 'text-amber-400' },
                          { label: t('esg.materialInflation'), val: '8.2% YoY', trend: 'up', color: 'text-rose-400' },
                          { label: t('esg.laborCostIndex'), val: '112.5 (Rising)', trend: 'up', color: 'text-rose-400' },
                          { label: t('esg.consumerSentiment'), val: t('esg.stable'), trend: 'side', color: 'text-blue-400' }
                        ].map((m, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                            <p className={`text-sm font-black ${m.color}`}>{m.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Competitive Insights */}
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Search className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
                          <Activity className="w-3 h-3 mr-1.5" />
                          {t('esg.marketInsight')}
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                          {t('esg.competitorInsight')}
                        </p>
                      </div>
                    </motion.div>
                  </div>
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

                    <motion.div
                      variants={fadeUp}
                      className="glass-card flex-1 flex flex-col justify-center cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setStrategicDrilldown({ type: 'margin_detail', data: {} })}
                    >
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

                {/* ESG Opportunity Insight (The TREE.life style) */}
                {esgSummary?.carbon?.opportunity && (
                  <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Leaf className="w-24 h-24 text-emerald-400" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-emerald-400 mb-2 flex items-center">
                          {esgSummary.carbon.opportunity.title}
                        </h3>
                        <p className="text-slate-300 text-lg leading-relaxed mb-1">
                          {esgSummary.carbon.opportunity.description}
                        </p>
                        <p className="text-emerald-400 font-bold text-xl">
                          {esgSummary.carbon.opportunity.estimatedSavings}
                        </p>
                      </div>
                      <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm whitespace-nowrap">
                        {esgSummary.carbon.opportunity.action}
                      </button>
                    </div>
                  </motion.div>
                )}

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
                  <motion.div
                    variants={fadeUp}
                    onClick={() => setStrategicDrilldown({ type: 'carbon_detail', data: {} })}
                    className="glass-card flex flex-col p-6 border-t-2 border-t-emerald-500 space-y-6 flex-1 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
                    <div className="relative z-10 flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"><Leaf className="h-5 w-5 text-emerald-400" /></div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{t('esg.environment')}</h3>
                      <ChevronRight className="w-4 h-4 text-emerald-500/0 group-hover:text-emerald-500/100 ml-auto transition-all transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <h4 className="text-3xl font-bold text-white">-12<span className="text-lg text-emerald-400 ml-1">{t('esg.tons')}</span></h4>
                        <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3 mr-1" /> 18% {t('esg.vsLastMonth')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">{t('esg.carbonCredit')}</p>

                      {/* Target Progress Bar */}
                      <div className="space-y-1 mt-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{t('esg.progress')}</span>
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
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{t('esg.socialSafety')}</h3>
                      <ChevronRight className="w-4 h-4 text-amber-500/0 group-hover:text-amber-500/100 ml-auto transition-all transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <h4 className="text-3xl font-bold text-amber-400">78<span className="text-lg text-slate-500 ml-1">/100</span></h4>
                        <span className="text-xs font-bold text-rose-400 flex items-center bg-rose-500/10 px-2 py-1 rounded-full">
                          <TrendingDown className="w-3 h-3 mr-1" /> +15% {t('esg.risk')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{t('esg.predictiveRiskScore')}</p>
                      <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-white/5 mt-3">{t('esg.moderateRisk')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">{t('esg.nearMisses')}</p>
                        <p className="text-xl font-bold text-white mt-1">3 <span className="text-[10px] text-slate-500 font-normal ml-1">{t('esg.thisMonth')}</span></p>
                      </div>
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">{t('esg.anomalyDetection')}</p>
                        <p className="text-xl font-bold text-rose-400 mt-1">1 <span className="text-[10px] text-slate-500 font-normal ml-1">{t('esg.active')}</span></p>
                      </div>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs text-rose-300 flex items-start space-x-2 mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{t('esg.anomalyFuel')}</span>
                    </div>
                  </motion.div>

                  {/* PEOPLE & GOVERNANCE */}
                  <motion.div
                    variants={fadeUp}
                    onClick={() => setStrategicDrilldown({ type: 'happiness_detail', data: {} })}
                    className="glass-card flex flex-col p-6 border-t-2 border-t-violet-500 space-y-6 flex-1 cursor-pointer hover:border-violet-500/50 hover:bg-slate-800/80 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-violet-500/20 transition-colors pointer-events-none"></div>
                    <div className="relative z-10 flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors"><Users className="h-5 w-5 text-violet-400" /></div>
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">{t('esg.peopleGov')}</h3>
                      <ChevronRight className="w-4 h-4 text-violet-500/0 group-hover:text-violet-500/100 ml-auto transition-all transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-3xl font-bold text-white mb-1">4.8<span className="text-lg text-slate-500 ml-1">/ 5.0</span></h4>
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
                          <h4 className="text-white text-sm font-semibold mb-1">{t('esg.carbonMitigation')}</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{t('esg.recConcrete')}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors flex items-start space-x-4 group cursor-pointer">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0 group-hover:bg-amber-500/30 transition-colors"><AlertTriangle className="w-5 h-5" /></div>
                        <div>
                          <h4 className="text-white text-sm font-semibold mb-1">{t('esg.riskPrevention')}</h4>
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
                    <p className="text-sm text-slate-400 mt-1">{t('bidding.subtitle')}</p>
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
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('bidding.client')}</p>
                                <p className="text-sm text-slate-300 font-medium">{op.client}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('bidding.estValue')}</p>
                                <p className="text-sm text-slate-300 font-medium">{formatCurrency(op.estimatedBudget)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('bidding.duration')}</p>
                                <p className="text-sm text-slate-300 font-medium">{op.estimatedDuration} {t('bidding.months')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('bidding.winRate')}</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${op.historicalConfidence}%` }}></div>
                                  </div>
                                  <span className="text-sm text-blue-400 font-bold">{op.historicalConfidence}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800 focus-within:ring space-y-3">
                              <p className="text-sm font-semibold text-slate-300 flex items-center"><Activity className="w-4 h-4 mr-2 text-indigo-400" /> {t('bidding.evalFactors')}</p>
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
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">{t('bidding.aiDecisionMatrix')}</h4>

                            <div className="relative w-32 h-32 mb-6">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" className="text-slate-800" strokeWidth="12" stroke="currentColor" fill="transparent" />
                                <circle cx="64" cy="64" r="56" className={`${op.aiRiskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`} strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * op.aiRiskScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white leading-none">{op.aiRiskScore}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t('bidding.riskScore')}</span>
                              </div>
                            </div>

                            <div className="w-full bg-slate-800 rounded-lg p-3 mb-6">
                              <p className="text-xs text-slate-400 uppercase mb-1">{t('bidding.expectedMargin')}</p>
                              <p className="text-2xl font-bold text-emerald-400">{op.aiExpectedMargin}%</p>
                            </div>

                            <div className={`w-full py-3 rounded-xl font-bold text-center uppercase tracking-widest text-sm shadow-xl ${op.recommendation === 'GO' ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/20' :
                              op.recommendation === 'NO-GO' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                'bg-amber-500 text-slate-900 shadow-amber-500/20'
                              }`}>
                              {op.recommendation}
                            </div>

                            {op.executeAction && (
                              <button className="w-full mt-4 py-3 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                                [ {op.executeAction} ]
                              </button>
                            )}
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
                    <motion.div
                      variants={fadeUp}
                      className="glass-card p-6 border-t-2 border-t-purple-500 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group"
                      onClick={() => setStrategicDrilldown({ type: 'macro_intel', data: mockCSuiteIntel.macroHeadwinds })}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><DollarSign className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.totalRevenue')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.totalRevenue}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> {mockCSuiteIntel.macroFinancials.revenueGrowth} {t('boardroom.yoy')}</p>
                    </motion.div>
                    <motion.div
                      variants={fadeUp}
                      className="glass-card p-6 border-t-2 border-t-blue-500 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group"
                      onClick={() => setStrategicDrilldown({ type: 'margin_detail', data: {} })}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><TrendingUp className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.ebitdaMargin')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.ebitdaMargin}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> {mockCSuiteIntel.macroFinancials.ebitdaGrowth} {t('boardroom.expanding')}</p>
                    </motion.div>
                    <motion.div
                      variants={fadeUp}
                      className="glass-card p-6 border-t-2 border-t-emerald-500 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group"
                      onClick={() => setStrategicDrilldown({ type: 'macro_intel', data: mockCSuiteIntel.macroHeadwinds })}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Activity className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.cashRunway')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.cashRunway}</h3>
                      <p className="text-sm text-slate-400 font-medium flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> {t('boardroom.optimalLiquidity')}</p>
                    </motion.div>
                    <motion.div
                      variants={fadeUp}
                      className="glass-card p-6 border-t-2 border-t-rose-500 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors group"
                      onClick={() => setStrategicDrilldown({ type: 'macro_intel', data: mockCSuiteIntel.macroHeadwinds })}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><AlertTriangle className="w-20 h-20" /></div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{t('boardroom.debtToEquity')}</p>
                      <h3 className="text-4xl font-bold text-white mb-2">{mockCSuiteIntel.macroFinancials.debtToEquity}</h3>
                      <p className="text-sm text-emerald-400 font-medium flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> {t('boardroom.healthyLeverage')}</p>
                    </motion.div>
                  </div>

                  {/* Market Dominance Radar (Neon Donut Graph) */}
                  <motion.div
                    variants={fadeUp}
                    className="glass-card p-6 flex flex-col relative overflow-hidden items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
                    onClick={() => setStrategicDrilldown({ type: 'market_intel', data: mockCSuiteIntel.marketDominance })}
                  >
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
                        <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">{t('boardroom.us')}</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-between px-2 text-xs">
                      <div className="flex items-center text-slate-300"><div className="w-3 h-3 bg-blue-500 rounded-sm mr-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>TopBuild.AI</div>
                      <div className="flex items-center text-slate-500"><div className="w-3 h-3 bg-slate-600 rounded-sm mr-2"></div>{t('boardroom.legacyCorp')}</div>
                    </div>
                  </motion.div>
                </div>

                {/* Live AI Insights Feed (Wide Card) */}
                <motion.div
                  variants={fadeUp}
                  className="glass-card p-6 border border-blue-500/30 bg-blue-500/5 relative overflow-hidden cursor-pointer hover:bg-blue-500/10 transition-all group"
                  onClick={() => setStrategicDrilldown({ type: 'strategic_insights', data: {} })}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/30">
                          <Bot className="w-6 h-6 animate-pulse" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-slate-900"></span>
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">{t('ai.liveInsights')}</h3>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">{t('ai.activeMonitoring')}</p>
                      </div>
                    </div>

                    <div className="flex-1 max-w-2xl bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex items-center overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-4 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0"></div>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={liveEventIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="text-slate-200 font-mono text-sm tracking-tight"
                        >
                          <span className="text-blue-400 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                          {t(`ai.event${liveEventIndex + 1}`)}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                      {t('ai.neuralStrategy')}
                    </button>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6">


                  {/* Strategic Directives */}
                  <motion.div variants={fadeUp} className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                      <Bot className="w-6 h-6 mr-3 text-indigo-400" /> {t('boardroom.geniusInsights')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockCSuiteIntel.aiStrategicDirectives.map((directive) => (
                        <div
                          key={directive.id}
                          className="group bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all flex flex-col relative cursor-pointer"
                          onClick={() => setStrategicDrilldown({ type: 'directive', data: directive })}
                        >
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
                            <button
                              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center uppercase tracking-wider text-xs group/btn relative overflow-hidden"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStrategicDrilldown({ type: 'directive', data: directive });
                              }}
                            >
                              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                              <span className="mr-2 relative z-10">{directive.action}</span>
                              <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover/btn:opacity-100 transition-opacity relative z-10" />
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
                  <h2 className="text-2xl font-bold text-white tracking-tight">{t('alerts.mitigationCenter')}</h2>
                </div>

                {projects.flatMap(p => p.alerts.map(a => ({ ...a, projectName: p.name }))).map((alert, idx) => (
                  <motion.div variants={fadeUp} key={idx} className="glass-card flex flex-col md:flex-row gap-6 p-6 border-l-4 border-l-rose-500">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${alert.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                          {alert.priority === 'high' ? t('alerts.highPriority') : t('alerts.mediumPriority')}
                        </span>
                        <h4 className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{alert.projectName}</h4>
                      </div>
                      <p className="text-white text-lg font-medium mb-3">{alert.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${alert.priority === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></span>
                        <span>{alert.priority === 'high' ? t('alerts.liveMonitoring') : t('alerts.activeMonitoring')}</span>
                      </div>
                    </div>
                    <div className="md:w-5/12 bg-slate-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-3 text-blue-400">
                          <Bot className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">{t('alerts.aiMitigation')}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {t('alerts.mitigationStrategy')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {projects.flatMap(p => p.alerts).length === 0 && (
                  <motion.div variants={fadeUp} className="glass-card py-20 text-center border-t-2 border-t-emerald-500">
                    <ShieldCheck className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">{t('alerts.systemsNominal')}</h3>
                    <p className="text-slate-400">{t('alerts.noAlerts')}</p>
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
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('project.roi')}</p>
                    <p className="text-2xl font-bold text-blue-400">18.4%</p>
                  </div>
                  <div className="glass-card p-4 text-center border-violet-500/20">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('project.cashFlow')}</p>
                    <p className="text-2xl font-bold text-violet-400">{t('project.strong')}</p>
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
      {/* Strategic Intelligence Drilldown Modal (Boardroom / Overview) */}
      <AnimatePresence>
        {strategicDrilldown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-xl"
            onClick={() => setStrategicDrilldown(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 md:p-10 custom-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={() => setStrategicDrilldown(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all z-50"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-8">

                {/* 1. STRATEGIC DIRECTIVE DRILLDOWN */}
                {strategicDrilldown.type === 'directive' && (
                  <div className="space-y-8">
                    {/* Header: Directive Identity */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                      <div className="flex items-center space-x-5">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-full uppercase tracking-[0.2em] mb-2 inline-block">
                            {strategicDrilldown.data.category}
                          </span>
                          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{strategicDrilldown.data.directive}</h2>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t('boardroom.predictedRoi')}</span>
                        <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          <span className="text-xl font-black text-emerald-400">{strategicDrilldown.data.impact}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Logic & Multi-Project Mapping */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-8 border-white/5 bg-white/[0.02]">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Radar className="w-5 h-5 mr-3 text-indigo-400" /> {t('directives.directiveRationale')}
                          </h3>
                          <p className="text-slate-300 leading-relaxed text-lg font-light italic">
                            "{strategicDrilldown.data?.rationale}"
                          </p>
                          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">{t('directives.targetProject')}</p>
                              <div className="flex items-center space-x-3 text-white font-medium">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                <span>{strategicDrilldown.data?.id === 2 ? 'The Riverfront Condo' : 'All Portfolio Assets'}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">{t('directives.confidenceLevel')}</p>
                              <div className="flex items-center space-x-3">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: '92%' }}></div>
                                </div>
                                <span className="text-sm font-bold text-blue-400">92%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Benchmarking */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: t('directives.npv'), val: '฿124M', icon: DollarSign, color: 'text-indigo-400' },
                            { label: t('directives.irr'), val: '24.2%', icon: TrendingUp, color: 'text-emerald-400' },
                            { label: t('directives.payback'), val: '14 Mo', icon: Activity, color: 'text-blue-400' },
                          ].map((stat, i) => (
                            <div key={i} className="glass-card p-5 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                              <stat.icon className={`w-4 h-4 mb-3 ${stat.color}`} />
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                              <p className="text-xl font-bold text-white">{stat.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Simulation & Final Action */}
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
                          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-yellow-400" /> {t('directives.directiveModeling')}
                          </h3>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[
                                { x: 'Q1', y: 10 }, { x: 'Q2', y: 35 }, { x: 'Q3', y: 65 }, { x: 'Q4', y: 100 }
                              ]}>
                                <Area type="monotone" dataKey="y" stroke="#6366f1" fill="#6366f120" strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                            {t('directives.impactForecast')}: Implementation triggers an immediate liquidity delta of +฿45M within 30 days.
                          </p>
                        </div>
                        <button
                          className={`w-full py-5 px-6 rounded-2xl transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center group overflow-hidden relative font-black shadow-lg ${executing === strategicDrilldown.data?.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'
                            }`}
                          onClick={() => {
                            if (executing) return;
                            setExecuting(strategicDrilldown.data?.id);
                            setTimeout(() => {
                              setExecuting(null);
                              setStrategicDrilldown(null);
                            }, 2000);
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          {executing === strategicDrilldown.data?.id ? (
                            <span className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 mr-3 animate-bounce" /> EXECUTING AGENT...
                            </span>
                          ) : (
                            strategicDrilldown.data?.action
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MACRO INTELLIGENCE DRILLDOWN */}
                {strategicDrilldown.type === 'macro_intel' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Globe className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('directives.marketDeepDive')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('directives.protocolActive')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card p-8 border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6 underline decoration-blue-500/30 underline-offset-8 decoration-2">{t('directives.historicalTrends')}</h3>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { m: 'Jan', val: 4.5 }, { m: 'Feb', val: 4.6 }, { m: 'Mar', val: 4.8 }, { m: 'Apr', val: 5.2 }, { m: 'May', val: 5.1 }, { m: 'Jun', val: 5.4 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                              <XAxis dataKey="m" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                              <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f620" strokeWidth={4} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-white/5 bg-slate-800/20">
                          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">{t('directives.executiveSummary')}</h3>
                          <p className="text-slate-300 leading-relaxed italic">
                            "{mockCSuiteIntel.competitiveInsight.marketShift}"
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-slate-800/40 rounded-3xl border border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{t('directives.volatilityScore')}</p>
                            <p className="text-2xl font-black text-rose-400">High (8.4)</p>
                          </div>
                          <div className="p-6 bg-slate-800/40 rounded-3xl border border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{t('directives.confidenceLevel')}</p>
                            <p className="text-2xl font-black text-emerald-400">95%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.5 MARKET INTELLIGENCE DRILLDOWN */}
                {strategicDrilldown.type === 'market_intel' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Target className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('boardroom.marketCapture')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('directives.competitiveBenchmark')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Market Share Table */}
                      <div className="lg:col-span-2 glass-card p-8 border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6 underline decoration-indigo-500/30 underline-offset-8 decoration-2">{t('directives.peerComparison')}</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] pb-2 border-b border-white/5">
                            <div className="col-span-1">{t('directives.competitor')}</div>
                            <div className="text-right">{t('directives.marketShare')}</div>
                            <div className="text-right">{t('directives.growth')}</div>
                            <div className="text-right">{t('directives.winRate')}</div>
                          </div>
                          {mockCSuiteIntel.marketDominance.map((peer, idx) => (
                            <div key={idx} className={`grid grid-cols-4 py-4 items-center ${idx === 0 ? 'bg-indigo-500/5 -mx-4 px-4 rounded-xl border border-indigo-500/20' : 'border-b border-white/5'}`}>
                              <div className="col-span-1 flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-3 ${idx === 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`}></div>
                                <span className={`font-bold ${idx === 0 ? 'text-white' : 'text-slate-300'}`}>{peer.competitor}</span>
                              </div>
                              <div className="text-right font-mono text-white">{peer.marketShare}%</div>
                              <div className={`text-right font-mono ${peer.growth > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{peer.growth > 0 ? '+' : ''}{peer.growth}%</div>
                              <div className="text-right font-mono text-blue-400">{peer.winRate}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Tactical Insight */}
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
                          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
                            <Bot className="w-4 h-4 mr-2" /> {t('directives.vulnerabilityScan')}
                          </h3>
                          <p className="text-white text-base font-light italic leading-relaxed">
                            "{mockCSuiteIntel.competitiveInsight.vulnerability}"
                          </p>
                        </div>
                        <div className="p-6 bg-slate-800/40 rounded-3xl border border-white/5">
                          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{t('directives.growthProjection')}</h4>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={mockCSuiteIntel.marketDominance}>
                                <Bar dataKey="growth" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <XAxis dataKey="competitor" hide />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PORTFOLIO HEALTH DRILLDOWN */}
                {strategicDrilldown.type === 'health' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('directives.healthBreakdown')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('directives.integrityProtocol')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div className="flex justify-center h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={summary?.healthPillers || []}
                              dataKey="score"
                              nameKey="name"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                            >
                              {(summary?.healthPillers || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : index === 2 ? '#f43f5e' : '#8b5cf6'} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        <div className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5">
                          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
                            <Bot className="w-4 h-4 mr-2" /> {t('directives.aiAuditor')}
                          </h3>
                          <p className="text-white text-lg font-light leading-relaxed">
                            {summary?.portfolioNarrative}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {(summary?.healthPillers || []).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                              <span className="text-slate-200 font-medium">{t(`directives.${p.name.toLowerCase()}`)}</span>
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs font-bold uppercase ${p.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {p.score > 90 ? t('directives.excellent') : p.score > 80 ? t('directives.stable') : t('directives.atrisk')}
                                </span>
                                <span className="text-white font-black">{p.score}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. RISK MATRIX DRILLDOWN */}
                {strategicDrilldown.type === 'risk_matrix' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('directives.mitigationDetail')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('alerts.liveMonitor')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card p-6 border-white/10 bg-slate-800/40">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-white font-bold">{strategicDrilldown.data?.label}</h3>
                          <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black rounded-full uppercase tracking-widest">{t('directives.atrisk')}</span>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('directives.riskSeverity')}</p>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500" style={{ width: `${strategicDrilldown.data?.impact}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('directives.targetProject')}</p>
                            <p className="text-white font-bold flex items-center"><Building2 className="w-4 h-4 mr-2 text-blue-400" /> {strategicDrilldown.data?.project}</p>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card p-8 border-blue-500/20 bg-blue-500/5 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center"><Zap className="w-5 h-5 mr-3" /> AI Tactical Mitigation</h3>
                        <p className="text-white text-xl font-light italic leading-relaxed">
                          "{strategicDrilldown.data?.mitigation}"
                        </p>
                        <button className="mt-8 py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Close Mitigated Thread</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MARGIN DETAIL DRILLDOWN */}
                {strategicDrilldown.type === 'margin_detail' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('overview.marginDetailTitle')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('overview.marginDetailSub')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card p-6 border-white/10 bg-slate-800/40">
                        <h3 className="text-white font-bold mb-6">EBITDA Trajectory by Project</h3>
                        <div className="space-y-4">
                          {[
                            { name: 'The Riverfront Condo', margin: '21.2%', trend: '+2.4%' },
                            { name: 'Sukhumvit Luxury Hub', margin: '19.5%', trend: '+1.1%' },
                            { name: 'Chiang Mai Eco-Resort', margin: '14.8%', trend: '-0.5%' },
                            { name: 'Bangna Logistics Park', margin: '18.5%', trend: '+0.8%' }
                          ].map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-slate-300 font-medium">{p.name}</span>
                              <div className="text-right">
                                <span className="text-white font-bold block">{p.margin}</span>
                                <span className={`text-[10px] ${p.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{p.trend} vs target</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center"><Zap className="w-5 h-5 mr-3" /> AI Margin Optimization</h3>
                        <p className="text-white text-xl font-light italic leading-relaxed">
                          "Current predictive model shows a 1.2% uplift opportunity by re-allocating idle equipment from Chiang Mai to the Bangna site, reducing operational overhead by ฿2.4M."
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CARBON DETAIL DRILLDOWN */}
                {strategicDrilldown.type === 'carbon_detail' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Leaf className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('esg.carbonDetailTitle')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('esg.carbonDetailSub')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card p-8 border-white/10 bg-slate-800/20">
                        <h3 className="text-lg font-bold text-white mb-6 underline decoration-emerald-500/30 underline-offset-8 decoration-2">Net Emissions Performance</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { m: 'Jan', val: -8 }, { m: 'Feb', val: -9 }, { m: 'Mar', val: -10 }, { m: 'Apr', val: -12 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                              <XAxis dataKey="m" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} unit=" T" />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                              <Bar dataKey="val" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-white/5 bg-slate-800/20">
                          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Carbon Credit Sources</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Solar Array Offset (Phase 1)</span>
                              <span className="text-white font-mono">-4.5 Tons</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Low-Carbon Concrete (Purchase Order)</span>
                              <span className="text-white font-mono">-5.2 Tons</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">EV Fleet Transition</span>
                              <span className="text-white font-mono">-2.3 Tons</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                          <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-1">Compliance Status</p>
                          <p className="text-2xl font-black text-white">SET Top-Tier Performer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. HAPPINESS DETAIL DRILLDOWN */}
                {strategicDrilldown.type === 'happiness_detail' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('esg.happinessDetailTitle')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('esg.happinessDetailSub')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card p-8 border-amber-500/20 bg-amber-500/5">
                        <h3 className="text-lg font-bold text-white mb-6">Site Satisfaction Breakdown</h3>
                        <div className="space-y-6">
                          {[
                            { site: 'Sukhumvit Site', score: 4.9, status: 'Excellent' },
                            { site: 'Bangna Site', score: 4.2, status: 'Good' },
                            { site: 'Riverfront', score: 5.0, status: 'Perfect' },
                            { site: 'Chiang Mai', score: 4.6, status: 'Excellent' }
                          ].map((s, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300 font-bold">{s.site}</span>
                                <span className="text-white">{s.score} / 5.0</span>
                              </div>
                              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${s.score > 4.5 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${s.score * 20}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-card p-6 border-white/5 bg-slate-800/20 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">Sentiment Word Cloud Trends</h3>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 text-lg font-bold">Safety First</span>
                          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 text-base">New Equipment</span>
                          <span className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30 text-xl font-black">AI Efficiency</span>
                          <span className="px-4 py-2 bg-rose-500/10 text-rose-400/50 rounded-full border border-rose-500/10 text-xs">Overtime</span>
                          <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 text-sm">Clear Instructions</span>
                        </div>
                        <div className="mt-10 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <p className="text-xs text-amber-500 font-bold uppercase mb-2">AI Recommendation</p>
                          <p className="text-sm text-slate-300">Maintain current transparency levels. 82% of workforce reported AI-assisted scheduling reduced stress by 15%.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. NEURAL STRATEGY DRILLDOWN */}
                {strategicDrilldown.type === 'strategic_insights' && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5 border-b border-white/5 pb-8">
                      <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Zap className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t('ai.reasoningTitle')}</h2>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">{t('ai.reasoningSub')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Reasoning Flow */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-8 border-white/5 bg-slate-800/40 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Radar className="w-48 h-48 text-blue-500" /></div>
                          <h3 className="text-lg font-bold text-white mb-8 flex items-center underline decoration-blue-500/30 underline-offset-8 decoration-2">
                            Neural Logic Chain
                          </h3>

                          <div className="space-y-12 relative">
                            {/* Connector Line */}
                            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>

                            {[
                              { title: 'Data Ingestion', desc: 'Real-time monitoring of 1,200+ material SKUs and macro-economic volatility indices.', status: 'COMPLETED', color: 'text-blue-400' },
                              { title: 'Constraint Mapping', desc: 'Cross-referencing site labor availability with Q4 delivery milestones.', status: 'ACTIVE', color: 'text-indigo-400' },
                              { title: 'Strategy Synthesis', desc: 'Executing Monte Carlo simulations for margin protection directives.', status: 'IN-PROGRESS', color: 'text-yellow-400' },
                              { title: 'Action Authorization', desc: 'Pushing tactical interventions to project managers via mobile edge.', status: 'PENDING', color: 'text-slate-500' }
                            ].map((step, i) => (
                              <div key={i} className="flex items-start space-x-8 relative group">
                                <div className={`p-4 rounded-2xl bg-slate-900 border border-white/10 z-10 ${step.color} group-hover:scale-110 transition-transform`}>
                                  {i === 0 ? <Globe className="w-5 h-5" /> : i === 1 ? <Target className="w-5 h-5" /> : i === 2 ? <Zap className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-3 mb-1">
                                    <h4 className="text-white font-bold">{step.title}</h4>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${i === 1 ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                      {step.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-400 max-w-md leading-relaxed">{step.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* AI Performance Metrics */}
                      <div className="space-y-6">
                        <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20">
                          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6">Processing Dynamics</h3>
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                                <span>inference latency</span>
                                <span className="text-white">124ms</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                                <span>data coverage</span>
                                <span className="text-white">99.8%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '99%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                                <span>decision confidence</span>
                                <span className="text-white">94.2%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '94%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
                          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Strategic Recommendation</h4>
                          <p className="text-white text-base italic leading-relaxed">
                            "Correlation analysis suggests a 30% probability of regional cement shortages. Authorization requested to pre-purchase 5,000 tons under current price lock protocol."
                          </p>
                          <button className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/30">
                            AUTHORIZE PRE-EMPTIVE BUY
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
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
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${selectedBidding.aiRiskScore < 40 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                      {selectedBidding.aiRiskScore < 40 ? 'Go / High Priority' : 'Caution / Review'}
                    </span>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Risk Score</p>
                    <p className={`text-2xl font-bold ${selectedBidding.aiRiskScore < 40 ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedBidding.aiRiskScore}/100</p>
                  </div>
                  <div className="glass-card p-4 border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Margin</p>
                    <p className="text-2xl font-bold text-indigo-400">{selectedBidding.aiExpectedMargin}%</p>
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
                          { month: 'M1', best: selectedBidding.aiExpectedMargin * 1.2, base: selectedBidding.aiExpectedMargin * 0.6, worst: selectedBidding.aiExpectedMargin * 0.3 },
                          { month: 'M2', best: selectedBidding.aiExpectedMargin * 1.15, base: selectedBidding.aiExpectedMargin * 0.7, worst: selectedBidding.aiExpectedMargin * 0.35 },
                          { month: 'M3', best: selectedBidding.aiExpectedMargin * 1.1, base: selectedBidding.aiExpectedMargin * 0.8, worst: selectedBidding.aiExpectedMargin * 0.4 },
                          { month: 'M4', best: selectedBidding.aiExpectedMargin * 1.08, base: selectedBidding.aiExpectedMargin * 0.88, worst: selectedBidding.aiExpectedMargin * 0.5 },
                          { month: 'M5', best: selectedBidding.aiExpectedMargin * 1.05, base: selectedBidding.aiExpectedMargin * 0.95, worst: selectedBidding.aiExpectedMargin * 0.6 },
                          { month: 'M6', best: selectedBidding.aiExpectedMargin * 1.0, base: selectedBidding.aiExpectedMargin, worst: selectedBidding.aiExpectedMargin * 0.7 }
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

      {/* Floating Action Button (FAB) - Mobile Only */}
      {isMobile && (
        <button className="md:hidden fixed z-40 bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center text-white focus:outline-none focus:ring-4 focus:ring-blue-500/30 overflow-hidden group">
          <Camera className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="sr-only">{t('field.captureHazard')}</span>
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform rounded-full"></div>
        </button>
      )}

      {/* Mobile Bottom Navigation - Sticky */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 pb-env-safe">
          <div className="flex items-center justify-around h-20 px-2 pb-2">
            {[
              { id: 'during-con', icon: HardHat, label: t('nav.duringConShort') },
              { id: 'pre-con', icon: ClipboardList, label: t('nav.preConShort') },
              { id: 'financials', icon: DollarSign, label: t('nav.financialsShort') },
              { id: 'post-con', icon: CheckCircle2, label: t('nav.postConShort') },
            ].map((item) => {
              const mobileActive = activeTab === item.id;
              const emerald = item.id === 'during-con' && mobileActive;
              const amber = item.id === 'pre-con' && mobileActive;
              const cyan = item.id === 'financials' && mobileActive;
              const violet = item.id === 'post-con' && mobileActive;
              const activeColor = emerald ? 'text-emerald-400' : amber ? 'text-amber-300' : cyan ? 'text-cyan-300' : violet ? 'text-violet-300' : 'text-blue-400';
              const activeBg = emerald ? 'bg-emerald-500/20' : amber ? 'bg-amber-500/20' : cyan ? 'bg-cyan-500/20' : violet ? 'bg-violet-500/20' : 'bg-blue-500/20';
              const activeLine = emerald ? 'bg-emerald-400' : amber ? 'bg-amber-300' : cyan ? 'bg-cyan-300' : violet ? 'bg-violet-300' : 'bg-blue-400';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileActive ? activeColor : 'text-slate-500'}`}
                >
                  <div className={`p-1.5 rounded-xl transition-all overflow-hidden relative ${mobileActive ? `${activeBg} shadow-inner` : ''}`}>
                    <item.icon className={`h-5 w-5 ${mobileActive ? 'relative z-10' : ''}`} />
                    {mobileActive && <div className={`absolute bottom-0 left-0 w-full h-0.5 blur-[2px] ${activeLine}`}></div>}
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Padding to allow content scrolling behind the bottom nav on mobile */}
      {isMobile && <div className="h-24 shrink-0 md:hidden" />}

    </div>
  );
}

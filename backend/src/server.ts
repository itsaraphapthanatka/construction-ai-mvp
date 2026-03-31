import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8100';

app.use(cors());
app.use(express.json());

// Mock Database
const projects = [
  {
    id: 'PROJ-001',
    name: 'คอนโด High-Rise สุขุมวิท',
    budget: 500000000,
    duration: 18,
    status: 'active',
    riskLevel: 'green',
    predictedProfit: 12.5,
    actualProfit: 11.8,
    alerts: [],
    esg: {
      carbonReduction: 15,
      safetyScore: 98,
      employeeSatisfaction: 4.5
    }
  },
  {
    id: 'PROJ-002',
    name: 'โรงงาน EEC ระยอง',
    budget: 800000000,
    duration: 24,
    status: 'active',
    riskLevel: 'yellow',
    predictedProfit: 8.2,
    actualProfit: 6.5,
    alerts: [
      { type: 'warning', message: 'ต้นทุนวัสดุเพิ่มขึ้น 5% จากแผน', timestamp: '2026-02-27' }
    ],
    esg: {
      carbonReduction: 8,
      safetyScore: 92,
      employeeSatisfaction: 4.2
    }
  },
  {
    id: 'PROJ-003',
    name: 'โรงพยาบาลเชียงใหม่',
    budget: 1200000000,
    duration: 30,
    status: 'planning',
    riskLevel: 'red',
    predictedProfit: 3.5,
    actualProfit: null,
    alerts: [
      { type: 'danger', message: 'กำลังคนไม่เพียงพอสำหรับ Timeline', timestamp: '2026-02-28' },
      { type: 'warning', message: 'Client มีประวัติจ่ายเงินล่าชา 20%', timestamp: '2026-02-25' }
    ],
    esg: {
      carbonReduction: 0,
      safetyScore: 0,
      employeeSatisfaction: 0
    }
  }
];

const materials = [
  { id: 1, name: 'เหล็กเส้น SD40', stock: 150, unit: 'ตัน', minStock: 100, price: 25000 },
  { id: 2, name: 'ปูนซีเมนต์', stock: 500, unit: 'ถุง', minStock: 300, price: 180 },
  { id: 3, name: 'คอนกรีตผสมเสร็จ', stock: 200, unit: 'ลบ.ม.', minStock: 150, price: 3200 },
];

const employees = [
  { id: 'EMP001', name: 'สมชาย ใจดี', position: 'วิศวกรโยธา', project: 'PROJ-001', happiness: 4.8, hoursThisWeek: 45 },
  { id: 'EMP002', name: 'สมหญิง รักงาน', position: 'โฟร์แมน', project: 'PROJ-002', happiness: 4.2, hoursThisWeek: 52 },
  { id: 'EMP003', name: 'มานี ขยัน', position: 'ช่างก่อสร้าง', project: 'PROJ-001', happiness: 3.9, hoursThisWeek: 58 },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard Summary
app.get('/api/dashboard/summary', (req, res) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const avgProfit = projects.reduce((sum, p) => sum + p.predictedProfit, 0) / projects.length;
  const alerts = projects.flatMap(p => p.alerts.map(a => ({ ...a, projectId: p.id, projectName: p.name })));

  res.json({
    totalProjects,
    activeProjects,
    totalBudget,
    avgProfit: avgProfit.toFixed(2),
    alerts,
    trafficLight: {
      green: projects.filter(p => p.riskLevel === 'green').length,
      yellow: projects.filter(p => p.riskLevel === 'yellow').length,
      red: projects.filter(p => p.riskLevel === 'red').length,
    }
  });
});

// Projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// AI Prediction - Pre Project
app.post('/api/ai/predict-project', async (req, res) => {
  const { projectData } = req.body;

  try {
    // Call AI Service
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
      type: 'pre_project',
      data: projectData
    });

    res.json(response.data);
  } catch (error) {
    // Fallback to mock
    res.json({
      prediction: {
        shouldAccept: Math.random() > 0.3,
        predictedProfit: (Math.random() * 15 + 2).toFixed(2),
        riskScore: Math.floor(Math.random() * 100),
        confidence: 0.85,
        factors: [
          { name: 'Client History', score: 85, impact: 'positive' },
          { name: 'Material Cost Trend', score: 65, impact: 'negative' },
          { name: 'Labor Availability', score: 90, impact: 'positive' },
        ],
        recommendation: Math.random() > 0.3 ? 'ACCEPT' : 'NEGOTIATE'
      }
    });
  }
});

// AI Prediction - Profit Forecast
app.post('/api/ai/forecast-profit', async (req, res) => {
  const { projectId, months } = req.body;

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/forecast`, {
      type: 'profit',
      projectId,
      months
    });

    res.json(response.data);
  } catch (error) {
    // Generate mock forecast
    const forecast = [];
    let currentProfit = 5.0;

    for (let i = 0; i < (months || 12); i++) {
      currentProfit += (Math.random() - 0.4) * 2;
      forecast.push({
        month: i + 1,
        predicted: Math.max(0, currentProfit).toFixed(2),
        optimistic: (currentProfit + 2).toFixed(2),
        pessimistic: Math.max(0, currentProfit - 2).toFixed(2)
      });
    }

    res.json({
      forecast,
      summary: {
        avgProfit: (forecast.reduce((s, f) => s + parseFloat(f.predicted), 0) / forecast.length).toFixed(2),
        trend: forecast[forecast.length - 1].predicted > forecast[0].predicted ? 'UP' : 'DOWN',
        confidence: 0.88
      }
    });
  }
});

// Inventory
app.get('/api/inventory', (req, res) => {
  res.json(materials);
});

// Employees
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// ESG Dashboard
app.get('/api/esg/summary', (req, res) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  res.json({
    carbon: {
      totalReduction: activeProjects.reduce((s, p) => s + p.esg.carbonReduction, 0),
      target: 50,
      unit: 'tons'
    },
    safety: {
      avgScore: (activeProjects.reduce((s, p) => s + p.esg.safetyScore, 0) / activeProjects.length).toFixed(1),
      incidents: 0,
      daysWithoutAccident: 365
    },
    happiness: {
      avgScore: (employees.reduce((s, e) => s + e.happiness, 0) / employees.length).toFixed(2),
      totalEmployees: employees.length,
      atRisk: employees.filter(e => e.happiness < 4.0).length
    }
  });
});

// Real-time Alerts
app.get('/api/alerts', (req, res) => {
  const allAlerts = projects.flatMap(p =>
    p.alerts.map(a => ({
      ...a,
      projectId: p.id,
      projectName: p.name,
      timestamp: new Date().toISOString()
    }))
  );

  res.json(allAlerts);
});

// Bidding Opportunities (Opportunity Scanner)
const biddingOpportunities = [
  {
    id: 'BID-001',
    name: 'สปอร์ตคลับครบวงจร ภูเก็ต',
    client: 'Phuket Health & Wellness Co., Ltd.',
    estimatedBudget: 350000000,
    estimatedDuration: 12, // months
    aiRiskScore: 25, // 0-100 (Lower is better)
    aiExpectedMargin: 18.5,
    historicalConfidence: 92,
    recommendation: 'GO',
    factors: [
      { name: 'ประวัติเจ้าของโครงการ (Client History)', impact: 'positive', description: 'จ่ายเงินตรงเวลาใน 3 โครงการที่ผ่านมา' },
      { name: 'ความเชี่ยวชาญ (Domain Expertise)', impact: 'positive', description: 'บริษัทมีผลงานเทียบเท่า 5 โครงการในพื้นที่' },
      { name: 'สภาพอากาศ (Weather Risk)', impact: 'negative', description: 'เริ่มงานหน้าฝน มีสถิติล่าช้า 15%' }
    ]
  },
  {
    id: 'BID-002',
    name: 'ส่วนต่อขยายทางด่วน พระราม 2',
    client: 'กระทรวงคมนาคม',
    estimatedBudget: 2500000000,
    estimatedDuration: 36, // months
    aiRiskScore: 78, // 0-100
    aiExpectedMargin: 4.2,
    historicalConfidence: 85,
    recommendation: 'NO-GO',
    factors: [
      { name: 'การเบิกจ่ายภาครัฐ (Payment Cycle)', impact: 'negative', description: 'ประวัติการเบิกจ่ายล่าช้าเฉลี่ย 45 วัน' },
      { name: 'ต้นทุนวัสดุผันผวน (Material Volatility)', impact: 'negative', description: 'แนวโน้มเหล็กเส้นราคาขึ้น 10% ในปีหน้า' },
      { name: 'ผลงานอ้างอิง (Portfolio Value)', impact: 'positive', description: 'ช่วยเพิ่มมูลค่าแบรนด์พอร์ตโฟลิโอ 40%' }
    ]
  },
  {
    id: 'BID-003',
    name: 'โกดังสินค้าอัตโนมัติ (Automated Warehouse)',
    client: 'Global Logistics Supply Chain',
    estimatedBudget: 850000000,
    estimatedDuration: 14, // months
    aiRiskScore: 45, // 0-100
    aiExpectedMargin: 11.0,
    historicalConfidence: 78,
    recommendation: 'REVIEW',
    factors: [
      { name: 'เทคโนโลยีใหม่ (New Tech Risk)', impact: 'negative', description: 'ต้องการผู้รับเหมาช่วง (Sub-contractor) เฉพาะทาง' },
      { name: 'ระยะเวลา (Timeline Pressure)', impact: 'negative', description: 'ค่าปรับ (Penalty) สูงถึง 0.1% ต่อวัน' },
      { name: 'งบประมาณ (Budget)', impact: 'positive', description: 'งบประมาณตั้งไว้สูงกว่าราคากลางตลาด 12%' }
    ]
  }
];

app.get('/api/bidding-opportunities', (req, res) => {
  res.json(biddingOpportunities);
});

// Mock C-Suite Intelligence
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

app.get('/api/c-suite-intel', (req, res) => {
  res.json(mockCSuiteIntel);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

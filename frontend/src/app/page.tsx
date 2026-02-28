import Dashboard from '../components/Dashboard';
import FloatingAIEsgWidget from '../components/FloatingAIEsgWidget';
import IntegrityAlerts from '../components/IntegrityAlerts';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-900">
      <IntegrityAlerts />
      <Dashboard />
      <FloatingAIEsgWidget />
    </main>
  );
}

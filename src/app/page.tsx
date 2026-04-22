import Dashboard from '@/components/Dashboard';
import DashboardV2 from '@/components/v2/DashboardV2';

export default function Home() {
  const v2 = process.env.NEXT_PUBLIC_DASHBOARD_V2 === 'true';
  return v2 ? <DashboardV2 /> : <Dashboard />;
}

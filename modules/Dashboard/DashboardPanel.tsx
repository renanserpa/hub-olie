import { useDashboard } from './useDashboard';
import DashboardKPI from './DashboardKPI';
import DashboardAIInsights from './DashboardAIInsights';
import DashboardSystemStatus from './DashboardSystemStatus';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';

export default function DashboardPanel() {
  const { data, loading, reload } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button onClick={reload} variant="outline" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
          Recarregar
        </Button>
      </div>

      <DashboardSystemStatus status={data.systemStatus} />
      
      {loading ? (
          <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      ) : (
        <>
            <DashboardKPI kpis={data.kpis} />
            <DashboardAIInsights insights={data.insights} />
        </>
      )}
    </div>
  );
}
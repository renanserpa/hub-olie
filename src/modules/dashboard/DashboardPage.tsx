import { Order } from '../../types';

  title,
  value,
  helper,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    {helper && <p className="text-xs text-slate-500">{helper}</p>}
  </div>
);

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const meta = ORDER_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badgeClass} ${meta.textClass}`}
    >
      {meta.label}
    </span>
  );
};


// -----------------------------
// Dashboard Page Component
// -----------------------------
const DashboardPage: React.FC = () => {
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useOrders();
  const { data: productionData, loading: productionLoading, error: productionError } = useProductionOrders();

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const isLoading = ordersLoading || productionLoading;
  const errorMessage = ordersError || productionError;


  // -----------------------------
  // Filtering Logic
  // -----------------------------
  const matchesPeriod = (order: Order, filter: PeriodFilter) => {
    if (filter === 'all') return true;

    const createdAt = new Date(order.created_at);
    if (Number.isNaN(createdAt.getTime())) return false;

    const now = new Date();

  // -----------------------------
  // KPIs
  // -----------------------------
  const activeOrdersCount = filteredOrders.filter(
    (o) => o.status !== 'fulfilled' && o.status !== 'cancelled'
  ).length;

  const activeProductionCount = productionData.filter(
    (prod) => prod.status !== 'completed'
  ).length;

 }


  // -----------------------------
  // Render UI
  // -----------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Visão geral</p>
          <h1 className="text-2xl font-semibold">Dashboard operacional</h1>
        </div>

        <Link to="/orders">
          <Button variant="secondary">Ir para pedidos</Button>
        </Link>
      </div>

       </div>

   </div>
  );
};

export default DashboardPage;

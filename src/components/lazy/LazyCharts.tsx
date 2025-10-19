import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/Skeleton';

// Lazy load chart components with loading skeleton
export const LazyLineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});

export const LazyBarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});

export const LazyPieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});

export const LazyAreaChart = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});

// Lazy load all recharts components at once
export const LazyRecharts = dynamic(() => import('recharts'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});

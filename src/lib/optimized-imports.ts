// Optimized imports for better tree-shaking and bundle size

// Heroicons - Import only what we need
export {
  // Common icons
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  Bars3Icon,
  // Admin icons
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  // Product icons
  PhotoIcon,
  PlusIcon,
  MinusIcon,
  // Navigation icons
  HomeIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  // Blog icons
  BookOpenIcon,
  // Chat icons
  ChatBubbleLeftRightIcon,
  // Other icons
  ScaleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// Recharts - Import only chart components we use
export {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Date-fns - Import only functions we use
export {
  format,
  parseISO,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from 'date-fns';

// React - Import only what we need
export {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  createContext,
  ReactNode,
  ComponentType,
  FC,
  memo,
  lazy,
  Suspense,
} from 'react';

// Next.js - Import only what we need
export {
  default as Link,
  default as Image,
  default as Router,
  useRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';

export { default as dynamic } from 'next/dynamic';

// SWR
export { default as useSWR, mutate } from 'swr';

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Performance utilities
export const requestIdleCallback = (callback: () => void, options?: { timeout?: number }) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  return setTimeout(callback, 1);
};

export const cancelIdleCallback = (id: number) => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
};

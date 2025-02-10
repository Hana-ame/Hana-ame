
// components/Layout.tsx
import { useNotifications } from '../contexts/NotificationContext';
import  NotificationCenter from './NotificationCenter';
import { useDeviceFeatures } from '../hooks/useDeviceFeatures';

export function Layout({ children }: { children: React.ReactNode }) {
  const { requestPermission } = useNotifications();
  useDeviceFeatures();

  return (
    <div className="min-h-screen">
      <nav className="p-4 bg-blue-600 text-white">
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg"
        >
          启用通知
        </button>
      </nav>
      
      <main className="p-4">{children}</main>
      <NotificationCenter />
    </div>
  );
}
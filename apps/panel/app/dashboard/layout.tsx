import DashboardNav from './_components/DashboardNav';
import styles from './layout.module.css';
import { RealtimeProvider } from '../../lib/realtime/realtime-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider>
      <div className={styles.shell}>
        <DashboardNav />
        <div className={styles.contentArea}>{children}</div>
      </div>
    </RealtimeProvider>
  );
}

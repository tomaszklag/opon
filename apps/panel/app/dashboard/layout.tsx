import DashboardNav from './_components/DashboardNav';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <DashboardNav />
      <div className={styles.contentArea}>{children}</div>
    </div>
  );
}

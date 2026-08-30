import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main-view">
          <div className="dashboard-content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
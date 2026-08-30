import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import './MainLayout.css';

export const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => (
  <div
    className="min-h-screen flex"
    style={{
      background: `
        radial-gradient(ellipse 80% 50% at 10% 0%, rgba(37,99,235,.06) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 90% 100%, rgba(99,102,241,.05) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 50% 50%, rgba(14,165,233,.03) 0%, transparent 60%),
        #f0f2f7
      `,
    }}
  >
    <Sidebar />
    <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '220px' }}>
      <Topbar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginTop: '52px', padding: '28px 32px 40px' }}
      >
        <Outlet />
      </main>
    </div>
  </div>
);

export default MainLayout;

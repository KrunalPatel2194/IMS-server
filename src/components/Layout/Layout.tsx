import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
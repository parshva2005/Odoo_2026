import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4"
         style={{
           backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.04) 0%, transparent 50%)',
         }}
    >
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}

import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRouter          from './routes/AppRouter';
import ToastContainer     from './components/common/Toast';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}

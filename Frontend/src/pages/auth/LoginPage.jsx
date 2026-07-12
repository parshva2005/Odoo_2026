import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back to AssetFlow!');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 animate-slide-in-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20
                        flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-primary">AF</span>
        </div>
        <h1 className="text-2xl font-bold text-content-primary">AssetFlow</h1>
        <p className="text-sm text-content-muted mt-1">Enterprise Asset Management</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          icon={HiMail}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type={showPwd ? 'text' : 'password'}
          placeholder="••••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          icon={HiLockClosed}
          iconRight={showPwd ? HiEyeOff : HiEye}
          required
          autoComplete="current-password"
        />

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            className="text-xs text-primary hover:text-primary-400 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-xs text-content-muted">New here?</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Register */}
      <div className="card p-3 bg-surface-elevated mb-4">
        <p className="text-xs text-content-secondary text-center leading-relaxed">
          Sign up creates an employee account.<br />
          Admin roles assigned later.
        </p>
      </div>
      <Link to={ROUTES.REGISTER}>
        <Button variant="secondary" className="w-full">
          Create Account
        </Button>
      </Link>
    </div>
  );
}

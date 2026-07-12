import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser } from 'react-icons/hi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../constants/routes';
import authService from '../../services/authService';

export default function RegisterPage() {
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name)            e.name = 'Full name is required';
    if (!form.email)           e.email = 'Email is required';
    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created! Admin will assign your role.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="card p-8 animate-slide-in-up">
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/20
                        flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-bold text-primary">AF</span>
        </div>
        <h1 className="text-xl font-bold text-content-primary">Create Account</h1>
        <p className="text-xs text-content-muted mt-1">Join your organization on AssetFlow</p>
      </div>

      <div className="card p-3 mb-5 bg-info/5 border-info/20">
        <p className="text-xs text-info text-center">
          This creates an <strong>employee account</strong>. Admin roles are assigned by your administrator.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Full Name"        type="text"     placeholder="Your full name"        icon={HiUser}      value={form.name}            onChange={set('name')}            error={errors.name}            required />
        <Input label="Work Email"       type="email"    placeholder="name@company.com"      icon={HiMail}      value={form.email}           onChange={set('email')}           error={errors.email}           required />
        <Input label="Password"         type="password" placeholder="Min 8 characters"      icon={HiLockClosed} value={form.password}         onChange={set('password')}         error={errors.password}        required />
        <Input label="Confirm Password" type="password" placeholder="Repeat password"       icon={HiLockClosed} value={form.confirmPassword}  onChange={set('confirmPassword')}  error={errors.confirmPassword} required />

        <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-content-muted mt-5">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

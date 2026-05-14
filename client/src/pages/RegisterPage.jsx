import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiUserPlus, FiTruck, FiShield, FiStar } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Registration successful! Please sign in.', {
        duration: 4000,
        style: {
          background: '#111',
          color: '#fff',
          fontWeight: 700,
          borderRadius: '12px'
        }
      });
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/login?redirect=${redirect}` : '/login');
    } catch (err) {}
  };

  const perkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.5rem',
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #f0f0ec',
    transition: 'all 0.3s'
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem 1rem 3.5rem',
    borderRadius: '14px',
    border: '1px solid #f0f0ec',
    background: '#f9fafb',
    fontSize: '0.9rem',
    fontWeight: 700,
    outline: 'none',
    transition: 'all 0.3s'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', background: '#fff' }}>
      
      {/* Left: Perks */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', background: '#fdfdfc', borderRight: '1px solid #f0f0ec' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
           <div style={{ marginBottom: '3.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3d7a28', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Membership</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3.5rem', fontWeight: 900, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                 Join the <br /><span style={{ color: '#d1d5db' }}>Community.</span>
              </h2>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '4rem' }}>
              {[
                { icon: FiStar, title: 'Exclusive Access', desc: 'Be the first to shop our seasonal collections.' },
                { icon: FiTruck, title: 'Fast Delivery', desc: 'Complimentary shipping on orders over 5,000 ETB.' },
                { icon: FiShield, title: 'Buyer Protection', desc: 'Secure payments and dedicated support for every order.' }
              ].map((perk, i) => (
                <div key={i} style={perkStyle}>
                  <div style={{ width: '48px', height: '48px', background: '#f0fdf4', color: '#16a34a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <perk.icon size={20} />
                  </div>
                  <div>
                     <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111', textTransform: 'uppercase' }}>{perk.title}</h4>
                     <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>{perk.desc}</p>
                  </div>
                </div>
              ))}
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                 {[1,2,3].map(i => (
                    <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #fdfdfc', marginLeft: i === 1 ? 0 : '-12px', overflow: 'hidden', background: '#f3f4f6' }}>
                       <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                 ))}
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #fdfdfc', marginLeft: '-12px', background: '#111', color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    +10k
                 </div>
              </div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase' }}>Joined by the minimalist collective</p>
           </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#111', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Create Account</h1>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 500 }}>Enter your details to get started</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <FiAlertCircle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} size={16} />
                <input {...formRegister('name')} style={inputStyle} placeholder="Your name" />
              </div>
              {errors.name && <p style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, paddingLeft: '0.5rem' }}>{errors.name.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} size={16} />
                <input {...formRegister('email')} style={inputStyle} placeholder="email@example.com" />
              </div>
              {errors.email && <p style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, paddingLeft: '0.5rem' }}>{errors.email.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} size={16} />
                <input
                  {...formRegister('password')}
                  type={showPassword ? 'text' : 'password'}
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, paddingLeft: '0.5rem' }}>{errors.password.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} size={16} />
                <input
                  {...formRegister('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, paddingLeft: '0.5rem' }}>{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                height: '56px', 
                background: '#111', 
                color: '#fff', 
                borderRadius: '16px', 
                border: 'none', 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem', 
                marginTop: '1rem',
                transition: 'all 0.3s',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? <div style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <>Sign Up <FiArrowRight /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>
            Already have an account? <Link to={`/login${window.location.search}`} style={{ color: '#111', fontWeight: 800, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RegisterPage;

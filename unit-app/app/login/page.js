'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'FINANCIER') {
        const financierUrl = process.env.NEXT_PUBLIC_FINANCIER_URL || 'http://localhost:3001';
        window.location.href = financierUrl;
      } else {
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await login(email.trim(), password);
      if (res.success && res.user) {
        if (res.user.role === 'FINANCIER') {
          const financierUrl = process.env.NEXT_PUBLIC_FINANCIER_URL || 'http://localhost:3001';
          window.location.href = financierUrl;
        } else {
          router.push('/');
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      if (err.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Unable to connect to TrustFlow. Please check if backend is running on port 5000.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#543310] text-[#F8F4E1] font-bold text-2xl shadow-md mb-1">
            TF
          </div>
          <h1 className="text-2xl font-bold text-[#543310] tracking-tight">TrustFlow</h1>
          <p className="text-xs text-[#74512D] font-medium uppercase tracking-wider">
            MSME Receivables & Financing Readiness Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-[#AF8F6F]/40 shadow-md">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#543310]">Welcome Back</h2>
              <p className="text-xs text-[#74512D]">Sign in to access your unit dashboard and receivables engine.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-900 flex items-start gap-2">
                <span className="text-rose-600 text-sm font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                label="Email Address"
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                }}
                required
                error={fieldErrors.email}
                autoComplete="email"
              />

              <div className="space-y-1.5 relative">
                <label htmlFor="password" className="block text-xs font-semibold text-[#543310]">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                    }}
                    required
                    autoComplete="current-password"
                    className={`w-full pl-3.5 pr-10 py-2 text-sm bg-white border ${
                      fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#AF8F6F]'
                    } rounded-lg text-[#543310] placeholder-[#AF8F6F]/70 focus:outline-none focus:ring-2 focus:ring-[#74512D] focus:border-[#74512D] transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AF8F6F] hover:text-[#543310] transition-colors p-1"
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full font-bold justify-center"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span>Sign In &rarr;</span>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-[#74512D] border-t border-[#E2D4C3]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-[#543310] hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </Card>

        {/* Demo Accounts Panel */}
        <Card className="bg-[#FAF6E9] border-[#AF8F6F]/30 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#543310]">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-700" />
              <span>Development Demo Accounts</span>
            </div>
            <p className="text-[11px] text-[#74512D]">
              Click a demo account below to auto-populate test credentials for quick evaluation:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('msme@trustflow.demo', 'TrustFlow@123')}
                className="p-2.5 rounded-lg bg-white border border-[#AF8F6F]/40 hover:border-[#74512D] text-left transition-all group"
              >
                <div className="font-bold text-[#543310] text-[11px] flex items-center gap-1">
                  <span>🏭 Demo MSME</span>
                </div>
                <span className="text-[10px] text-[#AF8F6F] font-mono block truncate">msme@trustflow.demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('financier@trustflow.demo', 'TrustFlow@123')}
                className="p-2.5 rounded-lg bg-white border border-[#AF8F6F]/40 hover:border-[#74512D] text-left transition-all group"
              >
                <div className="font-bold text-[#543310] text-[11px] flex items-center gap-1">
                  <span>💰 Demo Financier</span>
                </div>
                <span className="text-[10px] text-[#AF8F6F] font-mono block truncate">financier@trustflow.demo</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

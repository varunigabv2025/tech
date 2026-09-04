'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import { EyeIcon, EyeOffIcon, CheckCircleIcon } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(''); // Require explicit selection

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
    if (!name.trim()) {
      errors.name = 'Full name or company name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!role) {
      errors.role = 'Please select an account type (MSME or Financier)';
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
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });

      if (res.success && res.user) {
        if (res.user.role === 'FINANCIER') {
          const financierUrl = process.env.NEXT_PUBLIC_FINANCIER_URL || 'http://localhost:3001';
          window.location.href = financierUrl;
        } else {
          router.push('/');
        }
      } else {
        setError(res.message || 'Registration failed. Please check details.');
      }
    } catch (err) {
      if (err.status === 409) {
        setError('An account with this email address already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Unable to connect to TrustFlow. Please check backend status.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#543310] text-[#F8F4E1] font-bold text-2xl shadow-md mb-1">
            TF
          </div>
          <h1 className="text-2xl font-bold text-[#543310] tracking-tight">TrustFlow</h1>
          <p className="text-xs text-[#74512D] font-medium uppercase tracking-wider">
            Create Your Account
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-[#AF8F6F]/40 shadow-md">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#543310]">Get Started</h2>
              <p className="text-xs text-[#74512D]">Join TrustFlow for automated receivable verification & financing.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-900 flex items-start gap-2">
                <span className="text-rose-600 text-sm font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                label="Full Name / Entity Name"
                id="name"
                type="text"
                placeholder="e.g. Kumar Knitwear Works"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                }}
                required
                error={fieldErrors.name}
                autoComplete="name"
              />

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
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                    }}
                    required
                    autoComplete="new-password"
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

              {/* Role Selection Cards */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#543310]">
                  Account Type <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('MSME');
                      if (fieldErrors.role) setFieldErrors({ ...fieldErrors, role: null });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'MSME'
                        ? 'border-[#74512D] bg-[#FAF6E9] ring-2 ring-[#74512D]/20 shadow-sm'
                        : 'border-[#AF8F6F]/40 bg-white hover:border-[#74512D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#543310]">🏭 MSME</span>
                      {role === 'MSME' && <CheckCircleIcon className="w-4 h-4 text-[#74512D]" />}
                    </div>
                    <p className="text-[11px] text-[#74512D] mt-1 leading-snug">
                      Manage orders, invoices, and TReDS financing readiness.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('FINANCIER');
                      if (fieldErrors.role) setFieldErrors({ ...fieldErrors, role: null });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'FINANCIER'
                        ? 'border-[#74512D] bg-[#FAF6E9] ring-2 ring-[#74512D]/20 shadow-sm'
                        : 'border-[#AF8F6F]/40 bg-white hover:border-[#74512D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#543310]">💰 Financier</span>
                      {role === 'FINANCIER' && <CheckCircleIcon className="w-4 h-4 text-[#74512D]" />}
                    </div>
                    <p className="text-[11px] text-[#74512D] mt-1 leading-snug">
                      Evaluate TReDS factoring packages and disburse advances.
                    </p>
                  </button>
                </div>
                {fieldErrors.role && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.role}</p>
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
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span>Create Account &rarr;</span>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-[#74512D] border-t border-[#E2D4C3]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#543310] hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

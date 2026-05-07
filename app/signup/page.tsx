'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
        return;
      }

      // Sign in automatically
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Account created, but failed to sign in');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <header className="border-b border-[#e4ebf5] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b79ff] text-sm font-bold text-white">
              F
            </div>
            <span className="text-lg font-semibold text-[#101826]">Frontpage</span>
          </Link>
          <Link href="/" className="text-sm text-[#64748b] hover:text-[#101826]">
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md items-center p-4 pt-10">
        <div className="w-full rounded-xl border border-[#e4ebf5] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">Create Account</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Join Frontpage and start aggregating content
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-[#9fc1ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-[#9fc1ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] px-3 pr-10 text-sm outline-none transition focus:border-[#9fc1ff]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#7890ad] hover:bg-[#eef4ff] hover:text-[#2b79ff]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg bg-[#2b79ff] text-sm font-medium text-white transition hover:bg-[#1869f2] disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-[#64748b]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2b79ff] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

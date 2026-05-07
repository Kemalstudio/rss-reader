'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AddFeedPage() {
  const router = useRouter();
  const [feedUrl, setFeedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl, title, categoryId: categoryId || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add feed');
        return;
      }

      setSuccess('Feed added successfully!');
      setFeedUrl('');
      setTitle('');
      setCategoryId('');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        {/* Demo Feeds Quick Link */}
        <div className="mb-6">
          <Link
            href="/dashboard/feeds/demo"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#dce6f3] bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#101826]">Quick Start with Demo Feeds</p>
              <p className="text-sm text-[#64748b]">Add 6 curated feeds in one click</p>
            </div>
          </Link>
        </div>

        {/* Manual Add Feed Form */}
        <div className="rounded-xl border border-[#e4ebf5] bg-white p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">Add Feed</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Subscribe to a new RSS or Atom feed
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Feed URL *</label>
              <input
                type="url"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                required
                className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-[#9fc1ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leave blank to use feed title"
                className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-[#9fc1ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category (optional)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-[#9fc1ff]"
              >
                <option value="">Uncategorized</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#2b79ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1869f2] disabled:opacity-60"
              >
                {loading ? 'Adding...' : 'Add Feed'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-[#dce6f3] px-4 py-2 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

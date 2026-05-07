'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function DemoFeedsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<{
    added: string[];
    existing: string[];
    failed: string[];
  } | null>(null);

  async function handleLoadDemoFeeds() {
    setError('');
    setSuccess('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('/api/feeds/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add demo feeds');
        return;
      }

      setResult({
        added: data.added,
        existing: data.existing,
        failed: data.failed,
      });

      if (data.added.length > 0) {
        setSuccess(`Successfully added ${data.added.length} demo feeds!`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">
              Demo Feeds
            </h1>
          </div>
          <p className="text-sm text-[#64748b]">
            Quickly populate your reader with 6 curated demo feeds from different categories
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-[#e4ebf5] bg-white p-8 mb-6">
          {/* Demo Feeds Preview */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#101826] mb-4">Feeds that will be added:</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f0f4fa] border border-[#dce6f3]">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#101826]">CSS-Tricks</p>
                  <p className="text-xs text-[#64748b]">Frontend</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f0f4fa] border border-[#dce6f3]">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#101826]">Smashing Magazine</p>
                  <p className="text-xs text-[#64748b]">Frontend</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f0f4fa] border border-[#dce6f3]">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#101826]">Sidebar.io</p>
                  <p className="text-xs text-[#64748b]">Design</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f0f4fa] border border-[#dce6f3]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#101826]">The GitHub Blog</p>
                  <p className="text-xs text-[#64748b]">Backend & DevOps</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f0f4fa] border border-[#dce6f3]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#101826]">Vercel Blog</p>
                  <p className="text-xs text-[#64748b]">Backend & DevOps</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f0f4fa] border border-[#dce6f3]">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#101826]">Simon Willison's Weblog</p>
                  <p className="text-xs text-[#64748b]">AI & ML</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              ✓ {success}
            </div>
          )}

          {result && (
            <div className="mb-6 space-y-3">
              {result.added.length > 0 && (
                <div className="rounded border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-900 mb-2">Added ({result.added.length}):</p>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    {result.added.map((feed) => (
                      <li key={feed}>• {feed}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.existing.length > 0 && (
                <div className="rounded border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900 mb-2">Already subscribed ({result.existing.length}):</p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {result.existing.map((feed) => (
                      <li key={feed}>• {feed}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.failed.length > 0 && (
                <div className="rounded border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-900 mb-2">Failed ({result.failed.length}):</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    {result.failed.map((feed) => (
                      <li key={feed}>• {feed}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLoadDemoFeeds}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Load Demo Feeds
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg border border-[#dce6f3] text-[#101826] hover:bg-[#f5f8fc] transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-[#f0f4fa] border border-[#dce6f3] p-4">
          <p className="text-sm text-[#64748b]">
            💡 <strong>Tip:</strong> Demo feeds are organized into categories (Frontend, Design, Backend & DevOps, AI & ML). 
            You can remove any feeds from your dashboard at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

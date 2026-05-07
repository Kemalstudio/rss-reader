'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface DigestEntry {
  title: string;
  description: string;
  date: string;
}

export default function DigestPage() {
  const [digests, setDigests] = useState<DigestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDigests();
  }, []);

  async function loadDigests() {
    try {
      setLoading(true);
      // In a real app, fetch from API
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      setDigests([
        {
          title: 'Week of ' + formatDate(lastWeek),
          description: 'Your personalized digest of the week\'s best content from all your subscribed feeds.',
          date: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function generateNewDigest() {
    setGenerating(true);
    try {
      // Simulate generating a digest
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newDigest: DigestEntry = {
        title: 'New Digest - ' + formatDate(new Date()),
        description: 'Latest content from your feeds summarized',
        date: new Date().toISOString(),
      };
      setDigests([newDigest, ...digests]);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
        <div className="flex items-center justify-between border-b border-[#edf2f8] px-6 py-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">Weekly Digest</h1>
            <p className="mt-1 text-sm text-[#8395ad]">
              Catch up on the best content you might have missed
            </p>
          </div>
          <button
            onClick={generateNewDigest}
            disabled={generating}
            className="rounded-lg bg-[#2b79ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1869f2] disabled:opacity-60"
          >
            {generating ? 'Generating...' : 'Generate Digest'}
          </button>
        </div>

        <div className="space-y-3 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#dce6f3] border-t-[#2b79ff]" />
            </div>
          ) : digests.length === 0 ? (
            <p className="py-12 text-center text-[#64748b]">
              No digests yet. Generate your first digest!
            </p>
          ) : (
            digests.map((digest, i) => (
              <div key={i} className="rounded-lg border border-[#e7edf7] bg-white p-4">
                <h3 className="mb-1 text-xl font-semibold tracking-tight text-[#101826]">{digest.title}</h3>
                <p className="mb-4 text-sm text-[#54657d]">{digest.description}</p>
                <button className="rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]">
                  Read Digest
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

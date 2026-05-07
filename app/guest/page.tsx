'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutList } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import sampleFeeds from '@/data/sample-feeds.json';

interface Article {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  pubDate?: Date;
  feedTitle: string;
  feedImage?: string;
}

interface Category {
  name: string;
  feeds: Array<{
    title: string;
    feedUrl: string;
    siteUrl?: string;
    description?: string;
  }>;
}

export default function GuestPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSampleFeedsData();
  }, []);

  async function loadSampleFeedsData() {
    try {
      setLoading(true);
      const allArticles: Article[] = [];

      // Fetch articles from multiple feeds (limit to speed up)
      const categories = (sampleFeeds as any).categories.slice(0, 3);

      for (const category of categories) {
        // Limit to 2 feeds per category for guest
        const feeds = category.feeds.slice(0, 2);

        for (const feed of feeds) {
          try {
            // Simple fetch with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
              `https://api.allorigins.win/get?url=${encodeURIComponent(feed.feedUrl)}&json`,
              { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const data = await response.json();
            // Parse RSS/Atom (simplified)
            // Note: In production, use server-side parsing

            allArticles.push({
              id: `${feed.title}-1`,
              title: feed.title,
              description: feed.description,
              link: feed.siteUrl,
              feedTitle: feed.title,
              pubDate: new Date(),
            });
          } catch (err) {
            console.error(`Failed to fetch ${feed.title}:`, err);
          }
        }
      }

      setArticles(allArticles);
    } finally {
      setLoading(false);
    }
  }

  const categories = (sampleFeeds as any).categories as Category[];
  const filteredArticles = selectedCategory
    ? articles.filter((article) =>
        categories
          .find((category) => category.name === selectedCategory)
          ?.feeds.some((feed) => feed.title === article.feedTitle)
      )
    : articles;

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1e2430]">
      <header className="border-b border-[#e4ebf5] bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2b79ff] text-sm font-bold text-white">
              F
            </div>
            <div>
              <h1 className="text-lg font-semibold">Frontpage Guest</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="rounded-lg border border-[#dce6f3] px-4 py-2 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]">
                Sign In
              </span>
            </Link>
            <Link href="/signup">
              <span className="rounded-lg bg-[#2b79ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1869f2]">
                Create Account
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 overflow-auto border-r border-[#e4ebf5] bg-white p-4 lg:block">
          <div className="mb-6 space-y-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === null
                  ? 'bg-[#eef4ff] text-[#2b79ff]'
                  : 'text-[#4f5f75] hover:bg-[#f5f8fc]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <LayoutList className="h-4 w-4" />
                All Articles
              </span>
            </button>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#8ea1ba]">
              CATEGORIES
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-[#eef4ff] text-[#2b79ff]'
                      : 'text-[#4f5f75] hover:bg-[#f5f8fc]'
                  }`}
                >
                  {cat.name} ({cat.feeds.length})
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
            <div className="border-b border-[#edf2f8] px-6 py-5">
              <h2 className="text-3xl font-semibold tracking-tight text-[#101826]">All Items</h2>
              <p className="mt-1 text-sm text-[#8395ad]">Preview content from sample feeds</p>
            </div>
            <div className="space-y-4 p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#dce6f3] border-t-[#2b79ff]" />
                  <p className="mt-4 text-[#64748b]">Loading sample feeds...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="mb-4 text-[#64748b]">No articles available</p>
                  <Link href="/signup">
                    <span className="rounded-lg bg-[#2b79ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1869f2]">
                      Create your own feed reader
                    </span>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-[#64748b]">
                      {filteredArticles.length} articles
                      {selectedCategory && ` in ${selectedCategory}`}
                    </p>
                  </div>
                  {filteredArticles.map((article) => (
                    <GuestArticleCard key={article.id} article={article} />
                  ))}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function GuestArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-[#e7edf7] bg-white p-4 transition hover:bg-[#fbfdff]"
    >
      <h3 className="mb-1 text-xl font-semibold tracking-tight text-[#101826] transition hover:text-[#2b79ff]">
        {article.title}
      </h3>
      <p className="text-sm text-[#8395ad]">
        {article.feedTitle}
        {article.pubDate && ` • ${formatRelativeTime(new Date(article.pubDate))}`}
      </p>
      {article.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[#54657d]">
          {article.description}
        </p>
      )}
    </a>
  );
}

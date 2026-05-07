'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  pubDate?: Date;
  feed: { title: string; imageUrl?: string };
  isRead: boolean;
  isBookmarked: boolean;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    } else {
      setArticles([]);
      setLoading(false);
    }
  }, [searchQuery]);

  async function performSearch() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/articles?search=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch();
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
        <div className="border-b border-[#edf2f8] px-6 py-5">
          <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">Search</h1>
          <p className="mt-1 text-sm text-[#8395ad]">Find articles across your feeds</p>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa1ba]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
                className="h-10 w-full rounded-lg border border-[#dce6f3] bg-[#fbfdff] pl-9 pr-3 text-sm outline-none transition focus:border-[#9fc1ff]"
            />
            </div>
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#2b79ff] px-6 text-sm font-medium text-white transition hover:bg-[#1869f2]"
            >
              Search
            </button>
          </form>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#dce6f3] border-t-[#2b79ff]" />
            </div>
          ) : articles.length === 0 ? (
            <p className="py-12 text-center text-[#64748b]">
              {searchQuery ? 'No articles found' : 'Enter a search query'}
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-[#64748b]">
                Found {articles.length} articles
              </p>
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
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
        {article.feed.title} • {formatRelativeTime(new Date(article.pubDate || Date.now()))}
      </p>
      {article.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[#54657d]">
          {article.description}
        </p>
      )}
    </a>
  );
}

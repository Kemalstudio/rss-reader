'use client';

import { useEffect, useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  pubDate?: Date;
  feed: { title: string };
  isBookmarked: boolean;
}

export default function BookmarksPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      const response = await fetch('/api/articles?onlyBookmarked=true');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveBookmark(articleId: string) {
    try {
      await fetch(`/api/articles/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked: false }),
      });
      setArticles(articles.filter((a) => a.id !== articleId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
        <div className="border-b border-[#edf2f8] px-6 py-5">
          <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">Saved</h1>
          <p className="mt-1 text-sm text-[#8395ad]">Your bookmarked articles</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#dce6f3] border-t-[#2b79ff]" />
            </div>
          ) : articles.length === 0 ? (
            <p className="py-12 text-center text-[#64748b]">
              No bookmarks yet. Start bookmarking articles!
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-[#64748b]">
                {articles.length} bookmarked articles
              </p>
              <div className="space-y-3">
                {articles.map((article) => (
                  <BookmarkCard
                    key={article.id}
                    article={article}
                    onRemove={() => handleRemoveBookmark(article.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface BookmarkCardProps {
  article: Article;
  onRemove: () => void;
}

function BookmarkCard({ article, onRemove }: BookmarkCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[#e7edf7] bg-white p-4 transition hover:bg-[#fbfdff]">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1"
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
      <button
        onClick={onRemove}
        className="flex-shrink-0 rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm font-medium text-[#5a6f8c] transition hover:bg-[#f3f7fd]"
      >
        Remove
      </button>
    </div>
  );
}

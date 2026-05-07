'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  LayoutList,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Feed {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface Article {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  pubDate?: Date;
  feed: Feed;
  isRead: boolean;
  isBookmarked: boolean;
}

type ViewMode = 'all' | 'saved' | 'category';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [markAllReadLoading, setMarkAllReadLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const savedSidebarState = localStorage.getItem('frontpage-sidebar-collapsed');
    if (savedSidebarState === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session, selectedCategory, viewMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const nextValue = !current;
      localStorage.setItem('frontpage-sidebar-collapsed', String(nextValue));
      return nextValue;
    });
  }

  async function fetchData() {
    try {
      setLoading(true);

      const [categoriesRes, articlesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(
          `/api/articles?page=1${selectedCategory ? `&categoryId=${selectedCategory}` : ''
          }${viewMode === 'saved' ? '&onlyBookmarked=true' : ''}`
        ),
      ]);

      if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        setCategories(cats);
      }

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: '/' });
    router.push('/');
  }

  async function markAllRead() {
    if (articles.length === 0) {
      return;
    }

    setMarkAllReadLoading(true);

    try {
      await Promise.all(
        articles
          .filter((article) => !article.isRead)
          .map((article) =>
            fetch(`/api/articles/${article.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true }),
            })
          )
      );
      setArticles((current) => current.map((article) => ({ ...article, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    } finally {
      setMarkAllReadLoading(false);
    }
  }

  const visibleArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      return articles;
    }

    const query = searchQuery.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.feed.title.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  const unreadCount = visibleArticles.filter((article) => !article.isRead).length;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || 'U';
  const isGridMode = layoutMode === 'grid';
  const profileName = session?.user?.name || session?.user?.email || 'User';

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dce6f3] border-t-[#2b79ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1e2430]">
      <header className="sticky top-0 z-20 border-b border-[#e4ebf5] bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2b79ff] text-sm font-bold text-white">
                F
              </div>
              <span className="text-lg font-semibold">Frontpage</span>
            </Link>
            <nav className="hidden items-center gap-2 md:flex">
              <button className="rounded-md bg-[#eef4ff] px-3 py-1.5 text-sm font-semibold text-[#2b79ff]">
                Feed
              </button>
              <Link
                href="/dashboard/digest"
                className="rounded-md px-3 py-1.5 text-sm text-[#64748b] transition hover:bg-[#f1f5fb] hover:text-[#1e2430]"
              >
                Digest
              </Link>
              <Link
                href="/dashboard/search"
                className="rounded-md px-3 py-1.5 text-sm text-[#64748b] transition hover:bg-[#f1f5fb] hover:text-[#1e2430]"
              >
                Discover
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa1ba]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search articles..."
                className="h-9 w-64 rounded-lg border border-[#dce6f3] bg-[#fbfdff] pl-9 pr-3 text-sm outline-none transition focus:border-[#9fc1ff]"
              />
            </div>
            <button
              onClick={() => router.push('/dashboard/feeds/add')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce6f3] bg-white text-[#64748b] transition hover:bg-[#f3f7fd]"
              aria-label="Add feed"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#dce6f3] bg-white px-3 text-sm text-[#64748b] transition hover:bg-[#f3f7fd]"
            >
              <LogOut className="h-4 w-4" />
              Exit
            </button>
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5b6ce1] text-sm font-semibold text-white transition hover:ring-2 hover:ring-[#2b79ff]/30"
                aria-label="Open profile menu"
              >
                {userInitial}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-3xl border border-[#e4ebf5] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                  <p className="text-sm font-semibold text-[#101826]">{profileName}</p>
                  <p className="mt-1 text-xs text-[#64748b]">{session?.user?.email}</p>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/dashboard/settings');
                        setProfileOpen(false);
                      }}
                      className="w-full rounded-2xl border border-[#dce6f3] px-3 py-2 text-left text-sm text-[#4f5f75] transition hover:bg-[#f3f7fd]"
                    >
                      Profile settings
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-2xl bg-[#2b79ff] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1869f2]"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <aside
          className={`hidden border-r border-[#e4ebf5] bg-white p-4 transition-all lg:block ${
            sidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          <div className="mb-3 flex justify-end">
            <button
              onClick={toggleSidebar}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#dce6f3] text-[#5a6f8c] transition hover:bg-[#f3f7fd]"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <button
              title="All items"
              onClick={() => {
                setViewMode('all');
                setSelectedCategory(null);
              }}
              className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${viewMode === 'all' ? 'bg-[#eef4ff] text-[#2b79ff]' : 'text-[#4f5f75] hover:bg-[#f5f8fc]'
                }`}
            >
              <span className="inline-flex items-center gap-2">
                <LayoutList className="h-4 w-4" />
                {!sidebarCollapsed && 'All items'}
              </span>
              {!sidebarCollapsed && <span className="text-xs">{articles.length}</span>}
              {sidebarCollapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#101826] px-2 py-1 text-xs text-white opacity-0 transition duration-200 group-hover:opacity-100">
                  All items
                </span>
              )}
            </button>
            <button
              title="Saved articles"
              onClick={() => {
                setViewMode('saved');
                setSelectedCategory(null);
              }}
              className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${viewMode === 'saved' ? 'bg-[#eef4ff] text-[#2b79ff]' : 'text-[#4f5f75] hover:bg-[#f5f8fc]'
                }`}
            >
              <span className="inline-flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4" />
                {!sidebarCollapsed && 'Saved'}
              </span>
              {sidebarCollapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#101826] px-2 py-1 text-xs text-white opacity-0 transition duration-200 group-hover:opacity-100">
                  Saved
                </span>
              )}
            </button>
          </div>

          <div className="mt-7">
            {!sidebarCollapsed && (
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-[#8ea1ba]">
                Categories
              </p>
            )}
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setViewMode('category');
                    setSelectedCategory(category.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selectedCategory === category.id
                      ? 'bg-[#eef4ff] text-[#2b79ff]'
                      : 'text-[#4f5f75] hover:bg-[#f5f8fc]'
                    }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color || '#87a1c6' }}
                    />
                    {!sidebarCollapsed && category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full rounded-lg border border-[#dce6f3] px-3 py-2 text-sm text-[#4f5f75] transition hover:bg-[#f5f8fc]"
            >
              {sidebarCollapsed ? '⚙' : 'Open settings'}
            </button>
            {!sidebarCollapsed && <p className="mt-5 text-sm text-[#52a16a]">All feeds healthy</p>}
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <section className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
            <div className="border-b border-[#edf2f8] px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-semibold leading-none tracking-tight">All Items</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setLayoutMode((mode) => (mode === 'grid' ? 'list' : 'grid'))}
                    className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition ${isGridMode ? 'border-[#2b79ff] bg-[#eef4ff] text-[#2b79ff]' : 'border-[#dce6f3] text-[#4f5f75] hover:bg-[#f5f8fc]'}`}
                  >
                    <Grid2x2 className={`h-4 w-4 ${isGridMode ? 'text-[#2b79ff]' : ''}`} />
                    {isGridMode ? 'List' : 'Grid'}
                  </button>
                  <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-1 rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm text-[#4f5f75] transition hover:bg-[#f5f8fc]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={markAllRead}
                    disabled={markAllReadLoading || unreadCount === 0}
                    className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition ${markAllReadLoading || unreadCount === 0 ? 'border-[#dce6f3] bg-[#f9fafb] text-[#94a3b8] cursor-not-allowed' : 'border-[#dce6f3] text-[#4f5f75] hover:bg-[#f5f8fc]'}`}
                  >
                    <Star className="h-4 w-4" />
                    Mark all read
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#8ea1ba]">{unreadCount} unread</p>
            </div>

            {visibleArticles.length > 0 && (
              <div className="border-b border-[#edf2f8] bg-[#f8fbff] px-6 py-2 text-center text-sm font-medium text-[#2b79ff]">
                ↑ {Math.min(visibleArticles.length, 5)} new items since your last visit
              </div>
            )}

            <div className={isGridMode ? 'grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3' : 'divide-y divide-[#edf2f8]'}>
              {visibleArticles.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-[#5c6f87]">No articles for this filter yet.</p>
                  <button
                    onClick={() => router.push('/dashboard/feeds/add')}
                    className="mt-4 rounded-lg bg-[#2b79ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1869f2]"
                  >
                    Add feed
                  </button>
                </div>
              ) : (
                visibleArticles.map((article) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    layoutMode={layoutMode}
                    onUpdate={(nextArticle) => {
                      setArticles((current) =>
                        current.map((item) => (item.id === nextArticle.id ? nextArticle : item))
                      );
                    }}
                  />
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

interface ArticleRowProps {
  article: Article;
  layoutMode: 'list' | 'grid';
  onUpdate: (article: Article) => void;
}

function ArticleRow({ article, layoutMode, onUpdate }: ArticleRowProps) {
  const [working, setWorking] = useState(false);
  const cardClassName = layoutMode === 'grid'
    ? 'rounded-3xl border border-[#edf2f8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-[#d1e4ff]'
    : 'px-6 py-5 transition hover:bg-[#fbfdff]';

  async function updateArticle(payload: Partial<Pick<Article, 'isRead' | 'isBookmarked'>>) {
    try {
      setWorking(true);
      await fetch(`/api/articles/${article.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      onUpdate({ ...article, ...payload });
    } catch (error) {
      console.error('Failed to update article:', error);
    } finally {
      setWorking(false);
    }
  }

  return (
    <article className={cardClassName}>
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#2b79ff]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#8ea1ba]">
            <span className="font-medium text-[#5a6f8c]">{article.feed.title}</span>
            {' · '}
            {formatRelativeTime(new Date(article.pubDate || Date.now()))}
          </p>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-[30px]/[1.2] font-bold tracking-tight text-[#101826] transition hover:text-[#2b79ff] md:text-[34px]"
            onClick={() => {
              if (!article.isRead) {
                void updateArticle({ isRead: true });
              }
            }}
          >
            {article.title}
          </a>
          {article.description && (
            <p className="mt-2 line-clamp-2 text-[17px] text-[#4f6078]">{article.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#f2f6fc] px-2 py-1 text-xs font-medium text-[#6d7f98]">
              {article.feed.title}
            </span>
            <button
              onClick={() => void updateArticle({ isBookmarked: !article.isBookmarked })}
              disabled={working}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition disabled:opacity-60 ${article.isBookmarked ? 'border-[#f5c228] bg-[#fffbeb] text-[#b45309]' : 'border-[#dce6f3] text-[#5a6f8c] hover:bg-[#f3f7fd]'}`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${article.isBookmarked ? 'text-[#f59e0b]' : 'text-[#5a6f8c]'}`} />
              {article.isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => void updateArticle({ isRead: !article.isRead })}
              disabled={working}
              className="rounded-md border border-[#dce6f3] px-2 py-1 text-xs text-[#5a6f8c] transition hover:bg-[#f3f7fd] disabled:opacity-60"
            >
              {article.isRead ? 'Mark unread' : 'Mark read'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

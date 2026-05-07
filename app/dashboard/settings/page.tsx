'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'import' | 'export'>('general');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('frontpage-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }

    const savedSidebar = localStorage.getItem('frontpage-sidebar-collapsed');
    setSidebarCollapsed(savedSidebar === 'true');
  }, []);

  function applyTheme(nextTheme: 'system' | 'light' | 'dark') {
    setTheme(nextTheme);
    if (nextTheme === 'system') {
      localStorage.removeItem('frontpage-theme');
      document.documentElement.removeAttribute('data-theme');
      return;
    }

    localStorage.setItem('frontpage-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  }

  function applySidebar(nextCollapsed: boolean) {
    setSidebarCollapsed(nextCollapsed);
    localStorage.setItem('frontpage-sidebar-collapsed', String(nextCollapsed));
  }

  async function handleExportOPML() {
    try {
      setLoading(true);
      const response = await fetch('/api/opml/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'frontpage-feeds.opml';
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImportOPML(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/opml/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Import failed: ${data.error}`);
        return;
      }

      alert(
        `Successfully imported ${data.imported} feeds${data.skipped > 0 ? ` (${data.skipped} already subscribed)` : ''}`
      );
      router.refresh();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
        <div className="border-b border-[#edf2f8] px-6 py-5">
          <h1 className="text-3xl font-semibold tracking-tight text-[#101826]">Settings</h1>
        </div>

        <div className="p-6">
          <div className="mb-6 flex gap-4 border-b border-[#edf2f8]">
              {(['general', 'import', 'export'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#2b79ff] text-[#2b79ff]'
                      : 'border-transparent text-[#64748b] hover:text-[#101826]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
          </div>

            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-[#e7edf7] bg-white p-5">
                  <h2 className="text-xl font-semibold text-[#101826]">Personal Cabinet</h2>
                  <p className="mt-1 text-sm text-[#64748b]">Your account information</p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <p>
                      <span className="text-[#8395ad]">Name:</span>{' '}
                      <span className="font-medium text-[#101826]">{session?.user?.name || 'No name'}</span>
                    </p>
                    <p>
                      <span className="text-[#8395ad]">Email:</span>{' '}
                      <span className="font-medium text-[#101826]">{session?.user?.email || 'No email'}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e7edf7] bg-white p-5">
                  <h3 className="mb-2 font-semibold text-[#101826]">Theme</h3>
                  <p className="mb-4 text-sm text-[#64748b]">Switch between light and dark mode</p>
                  <div className="flex flex-wrap gap-2">
                    {(['system', 'light', 'dark'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => applyTheme(option)}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${
                          theme === option
                            ? 'border-[#2b79ff] bg-[#eef4ff] text-[#2b79ff]'
                            : 'border-[#dce6f3] text-[#5a6f8c] hover:bg-[#f3f7fd]'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#e7edf7] bg-white p-5">
                  <h3 className="mb-2 font-semibold text-[#101826]">Sidebar</h3>
                  <p className="mb-4 text-sm text-[#64748b]">Choose default sidebar width</p>
                  <button
                    onClick={() => applySidebar(!sidebarCollapsed)}
                    className="rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]"
                  >
                    {sidebarCollapsed ? 'Default: Collapsed' : 'Default: Expanded'}
                  </button>
                  <p className="mt-2 text-xs text-[#8395ad]">Applied on dashboard main page</p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-[#101826]">Quick links</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]"
                    >
                      Go to feed
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/feeds/add')}
                      className="rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]"
                    >
                      Add feed
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[#101826]">Import OPML File</h3>
                <p className="text-sm text-[#64748b]">
                  Upload an OPML file to import subscriptions from another reader
                </p>
                <div className="rounded-lg border-2 border-dashed border-[#dce6f3] p-8 text-center">
                  <input
                    type="file"
                    accept=".opml,.xml"
                    onChange={handleImportOPML}
                    disabled={loading}
                    id="opml-file"
                    className="hidden"
                  />
                  <label htmlFor="opml-file" className="cursor-pointer">
                    <span className="inline-flex rounded-md border border-[#dce6f3] px-3 py-1.5 text-sm text-[#5a6f8c] transition hover:bg-[#f3f7fd]">
                      {loading ? 'Importing...' : 'Choose File'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[#101826]">Export Subscriptions</h3>
                <p className="text-sm text-[#64748b]">
                  Download your subscriptions as an OPML file
                </p>
                <button
                  onClick={handleExportOPML}
                  disabled={loading}
                  className="rounded-lg bg-[#2b79ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1869f2] disabled:opacity-60"
                >
                  {loading ? 'Exporting...' : 'Download OPML'}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

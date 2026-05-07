import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/button';
import { Container } from '@/components/layout';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      {/* Header */}
      <header className="border-b border-[#e4ebf5] bg-white">
        <Container className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b79ff]">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-xl font-semibold text-[#101826]">Frontpage</span>
          </Link>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </Container>
      </header>

      {/* Hero */}
      <main>
        <Container className="py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-[#101826] md:text-6xl">
                Your personalized front page for tech content
              </h1>
              <p className="mb-8 text-lg text-[#54657d]">
                Subscribe to your favorite blogs and news sources. Stay updated with everything that matters to you, all in one place.
              </p>
              <div className="flex gap-4">
                <Link href="/signup">
                  <Button size="lg">Create Free Account</Button>
                </Link>
                <Link href="/guest">
                  <Button variant="outline" size="lg">
                    Try as Guest
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-[#e4ebf5] bg-white p-8">
              <div className="space-y-4">
                <div className="h-32 animate-pulse rounded-lg bg-[#eef3fb]" />
                <div className="h-4 w-3/4 rounded bg-[#eef3fb]" />
                <div className="h-4 w-1/2 rounded bg-[#eef3fb]" />
              </div>
            </div>
          </div>
        </Container>

        {/* Features */}
        <Container className="py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#101826]">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Subscribe Anywhere',
                description:
                  'Add RSS and Atom feeds from your favorite blogs, news sources, and publications',
              },
              {
                title: 'Organize Your Feeds',
                description:
                  'Create custom categories to keep your content organized exactly how you want it',
              },
              {
                title: 'Never Miss an Article',
                description:
                  'Search across all your feeds, bookmark important articles, and track what you read',
              },
              {
                title: 'Customizable Layout',
                description:
                  'Choose your preferred view: grid, list, or compact mode for the perfect reading experience',
              },
              {
                title: 'Import/Export',
                description:
                  'Import your OPML subscriptions or export your feeds to move them anywhere',
              },
              {
                title: 'Stay Updated',
                description:
                  'Get a weekly digest of the best content you might have missed',
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border border-[#e4ebf5] bg-white p-6 transition hover:shadow-sm">
                <h3 className="mb-2 font-semibold text-[#101826]">{feature.title}</h3>
                <p className="text-sm text-[#54657d]">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>

        {/* CTA */}
        <Container className="py-16">
          <div className="rounded-lg border border-[#d9e7ff] bg-[#eef4ff] p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#101826]">Ready to get started?</h2>
            <p className="mb-8 text-lg text-[#54657d]">
              Create your account today and start building your personalized content aggregator
            </p>
            <Link href="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#e4ebf5] bg-white py-8">
        <Container className="text-center text-sm text-[#64748b]">
          <p>
            Built with Next.js and React. Open source on{' '}
            <a href="https://github.com" className="hover:text-[#101826]">
              GitHub
            </a>
            .
          </p>
        </Container>
      </footer>
    </div>
  );
}

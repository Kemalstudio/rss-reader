import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { feeds, categories, articles } from '@/lib/schema';
import { parseFeedUrl } from '@/lib/feed-parser';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

// Demo feeds - 6 popular feeds from different categories
const DEMO_FEEDS = [
  {
    title: 'CSS-Tricks',
    feedUrl: 'https://css-tricks.com/feed/',
    siteUrl: 'https://css-tricks.com/',
    description: 'Tips, Tricks, and Techniques on using Cascading Style Sheets.',
    category: 'Frontend',
  },
  {
    title: 'Smashing Magazine',
    feedUrl: 'https://www.smashingmagazine.com/feed/',
    siteUrl: 'https://www.smashingmagazine.com/',
    description: 'For web designers and developers.',
    category: 'Frontend',
  },
  {
    title: 'Sidebar.io',
    feedUrl: 'https://sidebar.io/feed.xml',
    siteUrl: 'https://sidebar.io/',
    description: 'The five best design links, every day.',
    category: 'Design',
  },
  {
    title: 'The GitHub Blog',
    feedUrl: 'https://github.blog/feed/',
    siteUrl: 'https://github.blog/',
    description: 'Updates, ideas, and inspiration from GitHub.',
    category: 'Backend & DevOps',
  },
  {
    title: 'Vercel Blog',
    feedUrl: 'https://vercel.com/atom',
    siteUrl: 'https://vercel.com/blog',
    description: 'Updates from Vercel.',
    category: 'Backend & DevOps',
  },
  {
    title: "Simon Willison's Weblog",
    feedUrl: 'https://simonwillison.net/atom/everything/',
    siteUrl: 'https://simonwillison.net/',
    description: 'Simon Willison\'s weblog, covering AI, Python, and web development.',
    category: 'AI & ML',
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const addedFeeds = [];
    const failedFeeds = [];
    const existingFeeds = [];

    // Get or create categories for demo feeds
    const categoryMap: Record<string, string> = {};
    for (const feed of DEMO_FEEDS) {
      const categoryName = feed.category;
      if (!categoryMap[categoryName]) {
        // Try to find existing category
        let category = await db.query.categories.findFirst({
          where: (cat, { eq, and }) =>
            and(
              eq(cat.userId, userId),
              eq(cat.name, categoryName)
            ),
        });

        if (!category) {
          // Create new category
          const categoryId = generateId();
          await db.insert(categories).values({
            id: categoryId,
            userId,
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
            color: getCategoryColor(categoryName),
          });
          categoryMap[categoryName] = categoryId;
        } else {
          categoryMap[categoryName] = category.id;
        }
      }
    }

    // Add each demo feed
    for (const demoFeed of DEMO_FEEDS) {
      try {
        // Check if feed already exists
        const existingFeed = await db.query.feeds.findFirst({
          where: (f, { eq, and }) =>
            and(
              eq(f.userId, userId),
              eq(f.feedUrl, demoFeed.feedUrl)
            ),
        });

        if (existingFeed) {
          existingFeeds.push(demoFeed.title);
          continue;
        }

        // Parse feed
        const parsedFeed = await parseFeedUrl(demoFeed.feedUrl);

        const feedId = generateId();
        const categoryId = categoryMap[demoFeed.category];

        // Create feed record
        await db.insert(feeds).values({
          id: feedId,
          userId,
          categoryId,
          title: demoFeed.title,
          description: demoFeed.description,
          feedUrl: demoFeed.feedUrl,
          siteUrl: demoFeed.siteUrl,
          imageUrl: parsedFeed.image || undefined,
        });

        // Insert initial articles for this feed
        for (const item of parsedFeed.items) {
          await db.insert(articles).values({
            id: generateId(),
            feedId,
            title: item.title,
            description: item.description,
            content: item.content,
            author: item.author,
            link: item.link,
            imageUrl: item.image,
            guid: item.guid,
            pubDate: item.pubDate,
          }).catch(() => {
            // Ignore duplicate article insert errors
          });
        }

        addedFeeds.push(demoFeed.title);
      } catch (error) {
        console.error(`Failed to add feed ${demoFeed.title}:`, error);
        failedFeeds.push(demoFeed.title);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedFeeds,
      failed: failedFeeds,
      existing: existingFeeds,
      message: `Added ${addedFeeds.length} demo feeds${existingFeeds.length > 0 ? `. ${existingFeeds.length} already exist.` : '.'}${failedFeeds.length > 0 ? ` Failed to add: ${failedFeeds.join(', ')}` : ''}`,
    });
  } catch (error) {
    console.error('Error adding demo feeds:', error);
    return NextResponse.json(
      { error: 'Failed to add demo feeds' },
      { status: 500 }
    );
  }
}

function getCategoryColor(categoryName: string): string {
  const colors: Record<string, string> = {
    'Frontend': '#3b82f6',
    'Design': '#8b5cf6',
    'Backend & DevOps': '#10b981',
    'General Tech': '#f59e0b',
    'AI & ML': '#ec4899',
  };
  return colors[categoryName] || '#6b7280';
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { feeds, articles, categories } from '@/lib/schema';
import { parseFeedUrl } from '@/lib/feed-parser';
import { generateId } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userFeeds = await db.query.feeds.findMany({
      where: (feeds, { eq }) => eq(feeds.userId, session.user.id),
      with: {
        category: true,
      },
    });

    return NextResponse.json(userFeeds);
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeds' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { feedUrl, categoryId, title } = body;

    if (!feedUrl) {
      return NextResponse.json(
        { error: 'Feed URL is required' },
        { status: 400 }
      );
    }

    // Check if feed already subscribed
    const existingFeed = await db.query.feeds.findFirst({
      where: and(
        eq(feeds.userId, session.user.id),
        eq(feeds.feedUrl, feedUrl)
      ),
    });

    if (existingFeed) {
      return NextResponse.json(
        { error: 'Already subscribed to this feed' },
        { status: 409 }
      );
    }

    // Parse feed
    const parsedFeed = await parseFeedUrl(feedUrl);

    const feedId = generateId();

    // Create feed record
    await db.insert(feeds).values({
      id: feedId,
      userId: session.user.id,
      categoryId: categoryId || null,
      title: title || parsedFeed.title,
      description: parsedFeed.description,
      feedUrl,
      siteUrl: parsedFeed.link,
      imageUrl: parsedFeed.image,
    });

    // Insert articles
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
        // Ignore duplicate article errors
      });
    }

    return NextResponse.json(
      { id: feedId, message: 'Feed added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding feed:', error);
    return NextResponse.json(
      { error: `Failed to add feed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

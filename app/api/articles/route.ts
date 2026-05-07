import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { articles, articleReadState, feeds } from '@/lib/schema';
import { generateId } from '@/lib/utils';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const feedId = searchParams.get('feedId');
    const onlyUnread = searchParams.get('onlyUnread') === 'true';
    const onlyBookmarked = searchParams.get('onlyBookmarked') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    // Get user's feeds
    const userFeeds = await db.query.feeds.findMany({
      where: (feedsTable, { eq, and }) =>
        categoryId
          ? and(
              eq(feedsTable.userId, session.user.id),
              eq(feedsTable.categoryId, categoryId)
            )
          : eq(feedsTable.userId, session.user.id),
    });

    const userFeedIds = userFeeds.map((f) => f.id);

    if (userFeedIds.length === 0) {
      return NextResponse.json({ articles: [], total: 0 });
    }

    const articlesData = await db.query.articles.findMany({
      where: (articlesTable, { inArray }) =>
        inArray(articlesTable.feedId, userFeedIds),
      orderBy: [desc(articles.pubDate)],
      limit,
      offset: (page - 1) * limit,
    });

    const feedIds = Array.from(new Set(articlesData.map((article) => article.feedId)));
    const feedMap = new Map(
      (feedIds.length > 0
        ? await db.query.feeds.findMany({
            where: (feedsTable, { inArray }) =>
              inArray(feedsTable.id, feedIds),
          })
        : [])
        .map((feed) => [feed.id, feed])
    );

    // Get read state
    const articleIds = articlesData.map((a) => a.id);
    const readStates =
      articleIds.length > 0
        ? await db.query.articleReadState.findMany({
            where: (articleReadStateTable, { and, inArray, eq }) =>
              and(
                eq(articleReadStateTable.userId, session.user.id),
                inArray(articleReadStateTable.articleId, articleIds)
              ),
          })
        : [];

    const readStateMap = new Map(readStates.map((rs) => [rs.articleId, rs]));

    // Apply filters
    let filtered = articlesData.map((article) => ({
      ...article,
      feed: feedMap.get(article.feedId) || null,
      isRead: readStateMap.get(article.id)?.isRead ?? false,
      isBookmarked: readStateMap.get(article.id)?.isBookmarked ?? false,
    }));

    if (onlyUnread) {
      filtered = filtered.filter((a) => !a.isRead);
    }

    if (onlyBookmarked) {
      filtered = filtered.filter((a) => a.isBookmarked);
    }

    if (feedId) {
      filtered = filtered.filter((a) => a.feedId === feedId);
    }

    return NextResponse.json({
      articles: filtered,
      page,
      limit,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

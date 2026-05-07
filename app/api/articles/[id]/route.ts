import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { articleReadState } from '@/lib/schema';
import { generateId } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await params;
    const body = await req.json();
    const { isRead, isBookmarked } = body;

    // Check if read state exists
    const existing = await db.query.articleReadState.findFirst({
      where: and(
        eq(articleReadState.userId, session.user.id),
        eq(articleReadState.articleId, articleId)
      ),
    });

    if (existing) {
      await db
        .update(articleReadState)
        .set({
          ...(isRead !== undefined && { isRead }),
          ...(isBookmarked !== undefined && { isBookmarked }),
          updatedAt: new Date(),
        })
        .where(eq(articleReadState.id, existing.id));
    } else {
      await db.insert(articleReadState).values({
        id: generateId(),
        userId: session.user.id,
        articleId,
        isRead: isRead ?? false,
        isBookmarked: isBookmarked ?? false,
      });
    }

    return NextResponse.json({ message: 'Article state updated' });
  } catch (error) {
    console.error('Error updating article state:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { feeds } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify feed belongs to user
    const feed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, id), eq(feeds.userId, session.user.id)),
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    await db.delete(feeds).where(eq(feeds.id, id));

    return NextResponse.json({ message: 'Feed deleted' });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json(
      { error: 'Failed to delete feed' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { categoryId, title } = body;

    // Verify feed belongs to user
    const feed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, id), eq(feeds.userId, session.user.id)),
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    await db.update(feeds).set({
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(title && { title }),
    }).where(eq(feeds.id, id));

    return NextResponse.json({ message: 'Feed updated' });
  } catch (error) {
    console.error('Error updating feed:', error);
    return NextResponse.json(
      { error: 'Failed to update feed' },
      { status: 500 }
    );
  }
}

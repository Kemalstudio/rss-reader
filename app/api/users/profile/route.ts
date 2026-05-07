import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, layoutPreferences } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    const preferences = await db.query.layoutPreferences.findFirst({
      where: eq(layoutPreferences.userId, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      preferences: {
        theme: preferences?.theme || 'system',
        language: preferences?.language || 'en',
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, theme, language } = body;

    if (!name && !theme && !language) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    if (name) {
      await db.update(users)
        .set({ name })
        .where(eq(users.id, session.user.id));
    }

    if (theme || language) {
      const updatePayload: Record<string, string> = {};
      if (theme) {
        updatePayload.theme = theme === 'auto' ? 'system' : theme;
      }
      if (language) {
        updatePayload.language = language;
      }

      await db.update(layoutPreferences)
        .set(updatePayload)
        .where(eq(layoutPreferences.userId, session.user.id));
    }

    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { generateId, generateSlug } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCategories = await db.query.categories.findMany({
      where: (categories, { eq }) => eq(categories.userId, session.user.id),
    });

    return NextResponse.json(userCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const categoryId = generateId();

    await db.insert(categories).values({
      id: categoryId,
      userId: session.user.id,
      name,
      slug: generateSlug(name),
      color: color || '#6B7280',
    });

    return NextResponse.json(
      { id: categoryId, message: 'Category created' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

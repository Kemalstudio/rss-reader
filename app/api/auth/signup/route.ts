import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, categories, layoutPreferences } from '@/lib/schema';
import { generateId, generateSlug } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    // Create user
    await db.insert(users).values({
      id: userId,
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
    });

    // Create default categories
    const defaultCategories = [
      { name: 'Frontend', color: '#3B82F6' },
      { name: 'Backend & DevOps', color: '#10B981' },
      { name: 'Design', color: '#F59E0B' },
      { name: 'AI & ML', color: '#8B5CF6' },
    ];

    for (const category of defaultCategories) {
      await db.insert(categories).values({
        id: generateId(),
        userId,
        name: category.name,
        slug: generateSlug(category.name),
        color: category.color,
      });
    }

    // Create layout preferences
    await db.insert(layoutPreferences).values({
      id: generateId(),
      userId,
      layout: 'grid',
      itemsPerPage: 20,
      theme: 'auto',
      sortBy: 'newest',
    });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

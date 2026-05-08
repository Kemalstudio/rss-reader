import { sql } from 'drizzle-orm';
import {
  text,
  integer,
  real,
  sqliteTable,
  primaryKey,
  index,
  unique,
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('users_email_idx').on(table.email),
  ]
);

// Categories table
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    color: text('color'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('categories_user_id_idx').on(table.userId),
    unique('categories_user_id_slug_unique').on(table.userId, table.slug),
  ]
);

// Feeds table
export const feeds = sqliteTable(
  'feeds',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .references(() => categories.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    feedUrl: text('feed_url').notNull(),
    siteUrl: text('site_url'),
    imageUrl: text('image_url'),
    lastFetched: integer('last_fetched', { mode: 'timestamp' }),
    nextFetch: integer('next_fetch', { mode: 'timestamp' }).default(sql`(current_timestamp)`),
    errorCount: integer('error_count').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('feeds_user_id_idx').on(table.userId),
    index('feeds_category_id_idx').on(table.categoryId),
    unique('feeds_user_id_url_unique').on(table.userId, table.feedUrl),
  ]
);

// Articles table
export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    feedId: text('feed_id')
      .notNull()
      .references(() => feeds.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    content: text('content'),
    author: text('author'),
    imageUrl: text('image_url'),
    link: text('link'),
    guid: text('guid'),
    pubDate: integer('pub_date', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('articles_feed_id_idx').on(table.feedId),
    index('articles_pub_date_idx').on(table.pubDate),
    unique('articles_feed_id_guid_unique').on(table.feedId, table.guid),
  ]
);

// Article reading state (per user)
export const articleReadState = sqliteTable(
  'article_read_state',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    articleId: text('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    isRead: integer('is_read', { mode: 'boolean' }).default(false),
    isBookmarked: integer('is_bookmarked', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('article_read_state_user_id_idx').on(table.userId),
    index('article_read_state_article_id_idx').on(table.articleId),
    unique('article_read_state_unique').on(table.userId, table.articleId),
  ]
);

// Digest summaries (cached)
export const digestSummaries = sqliteTable(
  'digest_summaries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dateStart: integer('date_start', { mode: 'timestamp' }).notNull(),
    dateEnd: integer('date_end', { mode: 'timestamp' }).notNull(),
    summary: text('summary').notNull(),
    topArticles: text('top_articles').notNull(), // JSON array
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('digest_summaries_user_id_idx').on(table.userId),
    unique('digest_summaries_user_date_unique').on(table.userId, table.dateStart),
  ]
);

// Layout preferences
export const layoutPreferences = sqliteTable(
  'layout_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    layout: text('layout').default('grid'), // 'grid', 'list', 'compact'
    itemsPerPage: integer('items_per_page').default(20),
    theme: text('theme').default('system'), // 'system', 'light', 'dark'
    language: text('language').default('en'), // 'en', 'ru', 'tk'
    sortBy: text('sort_by').default('newest'), // 'newest', 'oldest', 'trending'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('layout_preferences_user_id_idx').on(table.userId),
  ]
);

// OPML exports history
export const opmlExports = sqliteTable(
  'opml_exports',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index('opml_exports_user_id_idx').on(table.userId),
  ]
);
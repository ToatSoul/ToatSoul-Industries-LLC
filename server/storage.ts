import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  threads, type Thread, type InsertThread,
  comments, type Comment, type InsertComment,
  files, type File, type InsertFile,
  votes, type Vote, type InsertVote,
  tags, type Tag, type InsertTag,
  threadTags, type ThreadTag, type InsertThreadTag,
  rewardItems, userRewards, type RewardItem, type UserReward
} from "@shared/schema";
import crypto from "crypto";
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace('.us-east-2', '-pooler.us-east-2'),
  max: 10
});

const db = drizzle(pool);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, amount: number): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Thread operations
  getThreads(options?: { categoryId?: number, limit?: number, offset?: number }): Promise<Thread[]>;
  getThread(id: number): Promise<Thread | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  updateThreadViews(id: number): Promise<Thread | undefined>;
  searchThreads(query: string): Promise<Thread[]>;

  // Comment operations
  getCommentsByThreadId(threadId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // File operations
  getFilesByThreadId(threadId: number): Promise<File[]>;
  createFile(file: InsertFile & { filename: string }): Promise<File>;
  getFile(id: number): Promise<File | undefined>;

  // Vote operations
  getVotesByThreadId(threadId: number): Promise<Vote[]>;
  getVotesByCommentId(commentId: number): Promise<Vote[]>;
  getUserVoteOnThread(userId: number, threadId: number): Promise<Vote | undefined>;
  getUserVoteOnComment(userId: number, commentId: number): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote): Promise<Vote>;

  // Tag operations
  getTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;

  // Thread-Tag operations
  getTagsByThreadId(threadId: number): Promise<Tag[]>;
  addTagToThread(threadTag: InsertThreadTag): Promise<ThreadTag>;

  // User authentication
  validateUser(username: string, password: string): Promise<User | undefined>;

  // Reward operations
  getRewardItems(): Promise<RewardItem[]>;
  getRewardItem(id: number): Promise<RewardItem | undefined>;
  createUserReward(data: { userId: number; rewardId: number }): Promise<UserReward>;
}

export class PostgresStorage implements IStorage {
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = this.hashPassword(user.password);
    const results = await db.insert(users).values({
      ...user,
      password: hashedPassword,
      reputation: 0,
      isAdmin: false
    }).returning();
    return results[0];
  }

  async updateUserReputation(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const results = await db
      .update(users)
      .set({ reputation: user.reputation + amount })
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const results = await db.select().from(categories).where(eq(categories.id, id));
    return results[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const results = await db.insert(categories).values(category).returning();
    return results[0];
  }

  async getThreads(options: { categoryId?: number, limit?: number, offset?: number } = {}): Promise<Thread[]> {
    let query = db.select().from(threads);

    if (options.categoryId) {
      query = query.where(eq(threads.categoryId, options.categoryId));
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return query;
  }

  async getThread(id: number): Promise<Thread | undefined> {
    const results = await db.select().from(threads).where(eq(threads.id, id));
    return results[0];
  }

  async createThread(thread: InsertThread): Promise<Thread> {
    const results = await db.insert(threads).values({
      ...thread,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return results[0];
  }

  async updateThreadViews(id: number): Promise<Thread | undefined> {
    const thread = await this.getThread(id);
    if (!thread) return undefined;

    const results = await db
      .update(threads)
      .set({ views: thread.views + 1 })
      .where(eq(threads.id, id))
      .returning();
    return results[0];
  }

  async searchThreads(query: string): Promise<Thread[]> {
      const lowercaseQuery = query.toLowerCase();
      return db.select().from(threads).where(
          (thread) => thread.title.toLowerCase().like(`%${lowercaseQuery}%`) || thread.content.toLowerCase().like(`%${lowercaseQuery}%`)
      );
  }

  async getCommentsByThreadId(threadId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.threadId, threadId));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const results = await db.insert(comments).values({
      ...comment,
      createdAt: new Date()
    }).returning();
    return results[0];
  }

  async getFilesByThreadId(threadId: number): Promise<File[]> {
    return db.select().from(files).where(eq(files.threadId, threadId));
  }

  async createFile(file: InsertFile & { filename: string }): Promise<File> {
    const results = await db.insert(files).values({
      ...file,
      createdAt: new Date()
    }).returning();
    return results[0];
  }

  async getFile(id: number): Promise<File | undefined> {
    const results = await db.select().from(files).where(eq(files.id, id));
    return results[0];
  }

  async getVotesByThreadId(threadId: number): Promise<Vote[]> {
    return db.select().from(votes).where(eq(votes.threadId, threadId));
  }

  async getVotesByCommentId(commentId: number): Promise<Vote[]> {
    return db.select().from(votes).where(eq(votes.commentId, commentId));
  }

  async getUserVoteOnThread(userId: number, threadId: number): Promise<Vote | undefined> {
    const results = await db.select().from(votes).where(
      and(eq(votes.userId, userId), eq(votes.threadId, threadId))
    );
    return results[0];
  }

  async getUserVoteOnComment(userId: number, commentId: number): Promise<Vote | undefined> {
    const results = await db.select().from(votes).where(
      and(eq(votes.userId, userId), eq(votes.commentId, commentId))
    );
    return results[0];
  }

  async createOrUpdateVote(vote: InsertVote): Promise<Vote> {
    const existingVote = vote.threadId
      ? await this.getUserVoteOnThread(vote.userId, vote.threadId)
      : await this.getUserVoteOnComment(vote.userId, vote.commentId!);

    if (existingVote) {
      const results = await db
        .update(votes)
        .set({ value: vote.value })
        .where(eq(votes.id, existingVote.id))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(votes).values({
        ...vote,
        createdAt: new Date()
      }).returning();
      return results[0];
    }
  }

  async getTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const results = await db.select().from(tags).where(eq(tags.id, id));
    return results[0];
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const results = await db.insert(tags).values(tag).returning();
    return results[0];
  }

  async getTagsByThreadId(threadId: number): Promise<Tag[]> {
    const results = await db.select({tag: tags.name, tagId: tags.id}).from(tags).innerJoin(threadTags, eq(threadTags.tagId, tags.id)).where(eq(threadTags.threadId, threadId));
    return results;
  }

  async addTagToThread(threadTag: InsertThreadTag): Promise<ThreadTag> {
    const results = await db.insert(threadTags).values(threadTag).returning();
    return results[0];
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    const user = results[0];
    if (!user) return undefined;

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) return undefined;

    return user;
  }

  async getRewardItems(): Promise<RewardItem[]> {
    return db.select().from(rewardItems);
  }

  async getRewardItem(id: number): Promise<RewardItem | undefined> {
    const results = await db.select().from(rewardItems).where(eq(rewardItems.id, id));
    return results[0];
  }

  async createUserReward({ userId, rewardId }: { userId: number; rewardId: number }): Promise<UserReward> {
    const results = await db.insert(userRewards).values({
      userId,
      rewardId,
      createdAt: new Date(),
      active: true
    }).returning();
    return results[0];
  }
}

export const storage = new PostgresStorage();
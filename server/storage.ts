import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  threads, type Thread, type InsertThread,
  comments, type Comment, type InsertComment,
  files, type File, type InsertFile,
  votes, type Vote, type InsertVote,
  tags, type Tag, type InsertTag,
  threadTags, type ThreadTag, type InsertThreadTag,
  rewardItems, userRewards, type RewardItem, type UserReward,
  blogPosts, blogAuthors, type BlogPost, type BlogAuthor
} from "@shared/schema";
import crypto from "crypto";
import { eq, and, like, sql, or } from 'drizzle-orm';
import { db } from './db';
import { generateToken } from './tokenUtils';
import { hashPassword } from './passwordUtils';
import nodemailer from 'nodemailer';

// Create a transporter object using SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});


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

  // Email Verification and Password Reset
  verifyEmail(token: string): Promise<boolean>;
  createPasswordReset(email: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
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

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    const verificationToken = generateToken();
    
    // Create insertion data with all required fields
    const insertData = {
      ...userData,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      reputation: 0,
      avatarUrl: null,
      bio: null
    };
    
    const user = await db.insert(users).values(insertData).returning();

    // Send verification email
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: 'Verify your email',
      html: `Please click <a href="${verificationLink}">here</a> to verify your email.`
    });

    return user[0];
  }

  async updateUserReputation(id: number, amount: number, tx?: any): Promise<User | undefined> {
    const queryBuilder = tx || db;
    const user = await this.getUser(id);
    if (!user) return undefined;

    const results = await queryBuilder
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

    return await query;
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
      return await db.select().from(threads).where(
          or(
              like(sql`LOWER(${threads.title})`, `%${lowercaseQuery}%`),
              like(sql`LOWER(${threads.content})`, `%${lowercaseQuery}%`)
          )
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
    const results = await db.select().from(tags)
      .innerJoin(threadTags, eq(threadTags.tagId, tags.id))
      .where(eq(threadTags.threadId, threadId));
    return results.map(row => ({
      id: row.tags.id,
      name: row.tags.name,
      color: row.tags.color
    }));
  }

  async addTagToThread(threadTag: InsertThreadTag): Promise<ThreadTag> {
    const results = await db.insert(threadTags).values(threadTag).returning();
    return results[0];
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    const user = results[0];
    if (!user) return undefined;

    const hashedPassword = await hashPassword(password); // Use the async version
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

  async createUserReward({ userId, rewardId }: { userId: number; rewardId: number }, tx?: any): Promise<UserReward> {
    const queryBuilder = tx || db;
    const results = await queryBuilder.insert(userRewards).values({
      userId,
      rewardId,
      createdAt: new Date(),
      active: true
    }).returning();
    return results[0];
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);

    if (!user || user.length === 0) return false;

    await db.update(users)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(users.id, user[0].id));

    return true;
  }

  async createPasswordReset(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;

    const resetToken = generateToken();
    await db.update(users)
      .set({ resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) })
      .where(eq(users.id, user.id));

    // Send reset email
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html: `Please click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.`
    });

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user with valid reset token that hasn't expired
    const now = new Date();
    const user = await db.select().from(users).where(
      and(
        eq(users.resetToken, token),
        sql`${users.resetTokenExpiry} > ${now}`
      )
    ).limit(1);

    if (!user || user.length === 0) return false;

    const hashedPassword = await hashPassword(newPassword);
    await db.update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, user[0].id));

    return true;
  }
}

export const storage = new PostgresStorage();
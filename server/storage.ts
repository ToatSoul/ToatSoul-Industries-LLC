import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  threads, type Thread, type InsertThread,
  comments, type Comment, type InsertComment,
  files, type File, type InsertFile,
  votes, type Vote, type InsertVote,
  tags, type Tag, type InsertTag,
  threadTags, type ThreadTag, type InsertThreadTag
} from "@shared/schema";
import crypto from "crypto";
import { randomBytes } from "crypto";
import path from "path";
import fs from "fs/promises";

// Interface for storage operations
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private threads: Map<number, Thread>;
  private comments: Map<number, Comment>;
  private files: Map<number, File>;
  private votes: Map<number, Vote>;
  private tags: Map<number, Tag>;
  private threadTags: Map<number, ThreadTag>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private threadIdCounter: number;
  private commentIdCounter: number;
  private fileIdCounter: number;
  private voteIdCounter: number;
  private tagIdCounter: number;
  private threadTagIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.threads = new Map();
    this.comments = new Map();
    this.files = new Map();
    this.votes = new Map();
    this.tags = new Map();
    this.threadTags = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.threadIdCounter = 1;
    this.commentIdCounter = 1;
    this.fileIdCounter = 1;
    this.voteIdCounter = 1;
    this.tagIdCounter = 1;
    this.threadTagIdCounter = 1;
    
    // Initialize with default data
    this.initializeData();
  }
  
  private async initializeData() {
    // Create default categories
    const categories = [
      { name: "Development", description: "Programming, Web, Mobile", icon: "laptop-code" },
      { name: "Design", description: "UI/UX, Graphics, Illustration", icon: "paint-brush" },
      { name: "General Discussion", description: "Industry News, Careers", icon: "globe" },
      { name: "Help & Support", description: "Questions, Troubleshooting", icon: "question-circle" },
      { name: "Announcements", description: "Updates, Events", icon: "bullhorn" }
    ];
    
    for (const category of categories) {
      await this.createCategory(category);
    }
    
    // Create default tags
    const tags = [
      { name: "Announcement", color: "#22c55e" },
      { name: "Question", color: "#eab308" },
      { name: "Discussion", color: "#3b82f6" },
      { name: "Resource", color: "#a855f7" }
    ];
    
    for (const tag of tags) {
      await this.createTag(tag);
    }
  }
  
  // Helper function to hash passwords
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const hashedPassword = this.hashPassword(user.password);
    
    const newUser: User = {
      ...user,
      id,
      password: hashedPassword,
      reputation: 0,
      isAdmin: false,
      avatarUrl: undefined,
      bio: undefined
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUserReputation(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      reputation: user.reputation + amount
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Thread operations
  async getThreads(options: { categoryId?: number, limit?: number, offset?: number } = {}): Promise<Thread[]> {
    let threads = Array.from(this.threads.values());
    
    // Filter by category if provided
    if (options.categoryId) {
      threads = threads.filter(thread => thread.categoryId === options.categoryId);
    }
    
    // Sort by creation date (newest first)
    threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    if (options.offset !== undefined && options.limit !== undefined) {
      threads = threads.slice(options.offset, options.offset + options.limit);
    }
    
    return threads;
  }
  
  async getThread(id: number): Promise<Thread | undefined> {
    return this.threads.get(id);
  }
  
  async createThread(thread: InsertThread): Promise<Thread> {
    const id = this.threadIdCounter++;
    const now = new Date();
    
    const newThread: Thread = {
      ...thread,
      id,
      createdAt: now,
      updatedAt: now,
      views: 0
    };
    
    this.threads.set(id, newThread);
    return newThread;
  }
  
  async updateThreadViews(id: number): Promise<Thread | undefined> {
    const thread = await this.getThread(id);
    if (!thread) return undefined;
    
    const updatedThread: Thread = {
      ...thread,
      views: thread.views + 1
    };
    
    this.threads.set(id, updatedThread);
    return updatedThread;
  }
  
  async searchThreads(query: string): Promise<Thread[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.threads.values()).filter(thread => 
      thread.title.toLowerCase().includes(lowercaseQuery) || 
      thread.content.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Comment operations
  async getCommentsByThreadId(threadId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: now
    };
    
    this.comments.set(id, newComment);
    return newComment;
  }
  
  // File operations
  async getFilesByThreadId(threadId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.threadId === threadId);
  }
  
  async createFile(file: InsertFile & { filename: string }): Promise<File> {
    const id = this.fileIdCounter++;
    const now = new Date();
    
    const newFile: File = {
      ...file,
      id,
      createdAt: now
    };
    
    this.files.set(id, newFile);
    return newFile;
  }
  
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  // Vote operations
  async getVotesByThreadId(threadId: number): Promise<Vote[]> {
    return Array.from(this.votes.values())
      .filter(vote => vote.threadId === threadId);
  }
  
  async getVotesByCommentId(commentId: number): Promise<Vote[]> {
    return Array.from(this.votes.values())
      .filter(vote => vote.commentId === commentId);
  }
  
  async getUserVoteOnThread(userId: number, threadId: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      vote => vote.userId === userId && vote.threadId === threadId
    );
  }
  
  async getUserVoteOnComment(userId: number, commentId: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      vote => vote.userId === userId && vote.commentId === commentId
    );
  }
  
  async createOrUpdateVote(vote: InsertVote): Promise<Vote> {
    // Check if user already voted on this thread/comment
    let existingVote: Vote | undefined;
    
    if (vote.threadId) {
      existingVote = await this.getUserVoteOnThread(vote.userId, vote.threadId);
    } else if (vote.commentId) {
      existingVote = await this.getUserVoteOnComment(vote.userId, vote.commentId!);
    }
    
    if (existingVote) {
      // Update existing vote
      const updatedVote: Vote = {
        ...existingVote,
        value: vote.value
      };
      
      this.votes.set(existingVote.id, updatedVote);
      return updatedVote;
    } else {
      // Create new vote
      const id = this.voteIdCounter++;
      const now = new Date();
      
      const newVote: Vote = {
        ...vote,
        id,
        createdAt: now
      };
      
      this.votes.set(id, newVote);
      return newVote;
    }
  }
  
  // Tag operations
  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }
  
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.tagIdCounter++;
    const newTag: Tag = { ...tag, id };
    this.tags.set(id, newTag);
    return newTag;
  }
  
  // Thread-Tag operations
  async getTagsByThreadId(threadId: number): Promise<Tag[]> {
    const threadTagRelations = Array.from(this.threadTags.values())
      .filter(threadTag => threadTag.threadId === threadId);
    
    const tagIds = threadTagRelations.map(relation => relation.tagId);
    return Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
  }
  
  async addTagToThread(threadTag: InsertThreadTag): Promise<ThreadTag> {
    const id = this.threadTagIdCounter++;
    const newThreadTag: ThreadTag = { ...threadTag, id };
    this.threadTags.set(id, newThreadTag);
    return newThreadTag;
  }
  
  // User authentication
  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) return undefined;
    
    return user;
  }
}

export const storage = new MemStorage();

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  reputation: integer("reputation").default(0).notNull(),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  icon: true,
});

// Thread schema
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
});

export const insertThreadSchema = createInsertSchema(threads).pick({
  title: true,
  content: true,
  userId: true,
  categoryId: true,
});

// Comment schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  threadId: integer("thread_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  threadId: true,
});

// File schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  originalFilename: true,
  mimeType: true,
  size: true,
  threadId: true,
  userId: true,
});

// Vote schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  userId: integer("user_id").notNull(),
  threadId: integer("thread_id"),
  commentId: integer("comment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  value: true,
  userId: true,
  threadId: true,
  commentId: true,
});

// Tag schema for categorizing threads
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  color: true,
});

// Thread-tag relationship
export const threadTags = pgTable("thread_tags", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

export const insertThreadTagSchema = createInsertSchema(threadTags).pick({
  threadId: true,
  tagId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertThreadTag = z.infer<typeof insertThreadTagSchema>;
export type ThreadTag = typeof threadTags.$inferSelect;

// Reward item schema
export const rewardItems = pgTable("reward_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'flair', 'title', etc.
  cost: integer("cost").notNull(),
  icon: text("icon"),
});

// User rewards schema
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertRewardItemSchema = createInsertSchema(rewardItems);
export const insertUserRewardSchema = createInsertSchema(userRewards);

export type RewardItem = typeof rewardItems.$inferSelect;
export type UserReward = typeof userRewards.$inferSelect;

// Blog post schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: text("slug").notNull().unique(),
  userId: integer("user_id").notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blog author permissions schema
export const blogAuthors = pgTable("blog_authors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  content: true,
  slug: true,
  userId: true,
  published: true,
});

export const insertBlogAuthorSchema = createInsertSchema(blogAuthors).pick({
  userId: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogAuthor = typeof blogAuthors.$inferSelect;

import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
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
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
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
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  threadId: integer("thread_id").references(() => threads.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Create unique indexes to ensure a user can only vote once per thread or comment
    userThreadVote: uniqueIndex("user_thread_vote_idx").on(table.userId, table.threadId),
    userCommentVote: uniqueIndex("user_comment_vote_idx").on(table.userId, table.commentId)
  };
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
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    threadTagUnique: uniqueIndex("thread_tag_unique_idx").on(table.threadId, table.tagId)
  };
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rewardId: integer("reward_id").notNull().references(() => rewardItems.id, { onDelete: "cascade" }),
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blog author permissions schema
export const blogAuthors = pgTable("blog_authors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
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

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  comments: many(comments),
  votes: many(votes),
  files: many(files),
  userRewards: many(userRewards),
  blogPosts: many(blogPosts),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [threads.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  files: many(files),
  votes: many(votes),
  tags: many(threadTags),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [comments.threadId],
    references: [threads.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [votes.threadId],
    references: [threads.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  uploader: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [files.threadId],
    references: [threads.id],
  }),
}));

export const threadTagsRelations = relations(threadTags, ({ one }) => ({
  thread: one(threads, {
    fields: [threadTags.threadId],
    references: [threads.id],
  }),
  tag: one(tags, {
    fields: [threadTags.tagId], 
    references: [tags.id],
  }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, {
    fields: [userRewards.userId],
    references: [users.id],
  }),
  reward: one(rewardItems, {
    fields: [userRewards.rewardId],
    references: [rewardItems.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.userId],
    references: [users.id],
  }),
}));

export const blogAuthorsRelations = relations(blogAuthors, ({ one }) => ({
  user: one(users, {
    fields: [blogAuthors.userId],
    references: [users.id],
  }),
}));

// Project schemas
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in-progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  maxMembers: integer("max_members").notNull().default(5),
});

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueMembership: uniqueIndex("unique_project_member_idx").on(table.projectId, table.userId)
  };
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  members: many(projectMembers),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;

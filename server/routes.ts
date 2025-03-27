import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertThreadSchema, insertCommentSchema, insertVoteSchema, insertBlogPostSchema, insertBlogAuthorSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express from "express";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Multer setup for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
// Ensure uploads directory exists
try {
  fs.mkdir(uploadsDir, { recursive: true });
} catch (err) {
  console.error("Failed to create uploads directory", err);
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup sessions and Passport for authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.validateUser(username, password);

      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      // Don't return the password to the client
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }

      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }

    res.status(401).json({ message: 'Unauthorized - Please log in to access this resource' });
  };

  // Error handling middleware for Zod validation errors
  const handleZodError = (error: any, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: error.message || 'Internal server error' });
  };

  // Register API routes

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = await storage.createUser(userData);

      // Don't return the password to the client
      const { password: _, ...userWithoutPassword } = user;

      // Log the user in automatically after registration
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to login after registration' });
        }

        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }

      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/current-user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json(req.user);
  });

  app.post("/api/auth/set-admin", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.setUserAsAdmin("ToatSoul");
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id, 10);
      const category = await storage.getCategory(categoryId);

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });

  // Thread routes
  app.get('/api/threads', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const threads = await storage.getThreads({ categoryId, limit, offset });

      // Augment threads with additional data
      const threadsWithData = await Promise.all(threads.map(async (thread) => {
        const author = await storage.getUser(thread.userId);
        const votes = await storage.getVotesByThreadId(thread.id);
        const commentCount = (await storage.getCommentsByThreadId(thread.id)).length;
        const tags = await storage.getTagsByThreadId(thread.id);
        const files = await storage.getFilesByThreadId(thread.id);

        // Calculate total votes
        const upvotes = votes.filter(v => v.value > 0).length;
        const downvotes = votes.filter(v => v.value < 0).length;
        const voteScore = upvotes - downvotes;

        // Don't include the author's password
        const { password: _, ...authorWithoutPassword } = author || {};

        return {
          ...thread,
          author: authorWithoutPassword,
          voteScore,
          upvotes,
          downvotes,
          commentCount,
          tags,
          files
        };
      }));

      res.json(threadsWithData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch threads' });
    }
  });

  app.get('/api/threads/:id', async (req, res) => {
    try {
      const threadId = parseInt(req.params.id, 10);
      const thread = await storage.getThread(threadId);

      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }

      // Increment view count
      await storage.updateThreadViews(threadId);

      // Get additional data
      const author = await storage.getUser(thread.userId);
      const votes = await storage.getVotesByThreadId(thread.id);
      const comments = await storage.getCommentsByThreadId(thread.id);
      const tags = await storage.getTagsByThreadId(thread.id);
      const files = await storage.getFilesByThreadId(thread.id);

      // Calculate votes
      const upvotes = votes.filter(v => v.value > 0).length;
      const downvotes = votes.filter(v => v.value < 0).length;
      const voteScore = upvotes - downvotes;

      // Get user's vote if authenticated
      let userVote = undefined;
      if (req.isAuthenticated()) {
        userVote = await storage.getUserVoteOnThread((req.user as any).id, thread.id);
      }

      // Don't include the author's password
      const { password: _, ...authorWithoutPassword } = author || {};

      // Get comments with authors and votes
      const commentsWithData = await Promise.all(comments.map(async (comment) => {
        const commentAuthor = await storage.getUser(comment.userId);
        const commentVotes = await storage.getVotesByCommentId(comment.id);

        // Calculate votes for comment
        const commentUpvotes = commentVotes.filter(v => v.value > 0).length;
        const commentDownvotes = commentVotes.filter(v => v.value < 0).length;
        const commentVoteScore = commentUpvotes - commentDownvotes;

        // Get user's vote on comment if authenticated
        let userCommentVote = undefined;
        if (req.isAuthenticated()) {
          userCommentVote = await storage.getUserVoteOnComment((req.user as any).id, comment.id);
        }

        // Don't include the comment author's password
        const { password: _, ...commentAuthorWithoutPassword } = commentAuthor || {};

        return {
          ...comment,
          author: commentAuthorWithoutPassword,
          voteScore: commentVoteScore,
          upvotes: commentUpvotes,
          downvotes: commentDownvotes,
          userVote: userCommentVote
        };
      }));

      const response = {
        ...thread,
        author: authorWithoutPassword,
        voteScore,
        upvotes,
        downvotes,
        userVote,
        comments: commentsWithData,
        tags,
        files
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch thread' });
    }
  });

  app.post('/api/threads', isAuthenticated, async (req, res) => {
    try {
      const threadData = insertThreadSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });

      const thread = await storage.createThread(threadData);

      // Add tags if provided
      if (req.body.tagIds && Array.isArray(req.body.tagIds)) {
        for (const tagId of req.body.tagIds) {
          await storage.addTagToThread({
            threadId: thread.id,
            tagId
          });
        }
      }

      res.status(201).json(thread);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.post('/api/threads/:id/files', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const threadId = parseInt(req.params.id, 10);
      const thread = await storage.getThread(threadId);

      if (!thread) {
        // Delete the uploaded file
        await fs.unlink(req.file.path);
        return res.status(404).json({ message: 'Thread not found' });
      }

      // Check if the thread belongs to the user
      if (thread.userId !== (req.user as any).id) {
        // Delete the uploaded file
        await fs.unlink(req.file.path);
        return res.status(403).json({ message: 'You can only upload files to your own threads' });
      }

      const fileData = {
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        threadId,
        userId: (req.user as any).id
      };

      const file = await storage.createFile(fileData);

      res.status(201).json(file);
    } catch (error) {
      if (req.file) {
        // Delete the uploaded file if there was an error
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete file after error', unlinkError);
        }
      }

      res.status(500).json({ message: error.message || 'Failed to upload file' });
    }
  });

  app.get('/api/files/:id', async (req, res) => {
    try {
      const fileId = parseInt(req.params.id, 10);
      const file = await storage.getFile(fileId);

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      const filePath = path.join(uploadsDir, file.filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (err) {
        return res.status(404).json({ message: 'File not found on server' });
      }

      // Set headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalFilename)}"`);

      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch file' });
    }
  });

  // Comment routes
  app.post('/api/threads/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const threadId = parseInt(req.params.id, 10);
      const thread = await storage.getThread(threadId);

      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }

      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
        threadId
      });

      const comment = await storage.createComment(commentData);

      // Get author data for response
      const author = await storage.getUser(comment.userId);
      const { password: _, ...authorWithoutPassword } = author || {};

      const response = {
        ...comment,
        author: authorWithoutPassword,
        voteScore: 0,
        upvotes: 0,
        downvotes: 0
      };

      res.status(201).json(response);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  // Vote routes
  app.post('/api/votes', isAuthenticated, async (req, res) => {
    try {
      // Validate that either threadId or commentId is provided, but not both
      if ((req.body.threadId && req.body.commentId) || (!req.body.threadId && !req.body.commentId)) {
        return res.status(400).json({ message: 'Provide either threadId or commentId, but not both or neither' });
      }

      // Validate vote value
      if (req.body.value !== 1 && req.body.value !== -1) {
        return res.status(400).json({ message: 'Vote value must be 1 (upvote) or -1 (downvote)' });
      }

      const voteData = insertVoteSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });

      // Check if the target exists
      if (voteData.threadId) {
        const thread = await storage.getThread(voteData.threadId);
        if (!thread) {
          return res.status(404).json({ message: 'Thread not found' });
        }
      } else if (voteData.commentId) {
        // Get the comment and check if it exists
        const comments = Array.from((await storage.getCommentsByThreadId(voteData.commentId!)) || []);
        const comment = comments.find(c => c.id === voteData.commentId);
        if (!comment) {
          return res.status(404).json({ message: 'Comment not found' });
        }
      }

      // Create or update the vote
      const vote = await storage.createOrUpdateVote(voteData);

      // Update user reputation for the target's author
      if (voteData.threadId) {
        const thread = await storage.getThread(voteData.threadId);
        if (thread && thread.userId !== voteData.userId) {
          await storage.updateUserReputation(thread.userId, voteData.value);
        }
      } else if (voteData.commentId) {
        const comments = Array.from((await storage.getCommentsByThreadId(voteData.commentId!)) || []);
        const comment = comments.find(c => c.id === voteData.commentId);
        if (comment && comment.userId !== voteData.userId) {
          await storage.updateUserReputation(comment.userId, voteData.value);
        }
      }

      res.status(201).json(vote);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  // Tag routes
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tags' });
    }
  });

  // User profile route
  app.put('/api/users/:id', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Check if user is updating their own profile
    if (userId !== (req.user as any).id) {
      return res.status(403).json({ message: 'Can only update your own profile' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData: Partial<User> = {};

    // Handle basic fields
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateData.username = req.body.username;
    }

    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      updateData.email = req.body.email;
    }

    // Handle password update
    if (req.body.currentPassword && req.body.newPassword) {
      const validUser = await storage.validateUser(user.username, req.body.currentPassword);
      if (!validUser) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      updateData.password = req.body.newPassword;
    }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists
      if (user.avatarUrl) {
        try {
          const oldAvatarPath = path.join(uploadsDir, path.basename(user.avatarUrl));
          await fs.unlink(oldAvatarPath);
        } catch (error) {
          console.error('Failed to delete old avatar:', error);
        }
      }
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }

    // Update user data
    const updatedUser = await storage.updateUser(userId, updateData);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;

      // Get user's threads
      const allThreads = await storage.getThreads();
      const userThreads = allThreads.filter(thread => thread.userId === userId);

      // Get vote counts and comment counts for threads
      const threadsWithCounts = await Promise.all(userThreads.map(async thread => {
        const votes = await storage.getVotesByThreadId(thread.id);
        const comments = await storage.getCommentsByThreadId(thread.id);

        const upvotes = votes.filter(v => v.value > 0).length;
        const downvotes = votes.filter(v => v.value < 0).length;
        const voteScore = upvotes - downvotes;

        return {
          ...thread,
          voteScore,
          commentCount: comments.length
        };
      }));

      // Sort by creation date (newest first)
      threadsWithCounts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        user: userWithoutPassword,
        threads: threadsWithCounts
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  // Search route
  // Rewards routes
  app.get('/api/rewards', async (req, res) => {
    try {
      const rewards = await storage.getRewardItems();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rewards' });
    }
  });

  app.post('/api/rewards/purchase', isAuthenticated, async (req, res) => {
    try {
      const { rewardId } = req.body;
      const userId = (req.user as any).id;

      const reward = await storage.getRewardItem(rewardId);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }

      const user = await storage.getUser(userId);
      if (user.reputation < reward.cost) {
        return res.status(400).json({ message: 'Not enough reputation points' });
      }

      // Start transaction
      await storage.db.transaction(async (tx) => {
        // Deduct reputation
        await storage.updateUserReputation(userId, -reward.cost);
        // Add reward to user
        await storage.createUserReward({ userId, rewardId });
      });

      res.json({ message: 'Reward purchased successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to purchase reward' });
    }
  });

  // Blog routes
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        const author = await storage.getUser(post.userId);
        const { password: _, ...authorWithoutPassword } = author || {};
        return { ...post, author: authorWithoutPassword };
      }));
      res.json(postsWithAuthors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      const author = await storage.getUser(post.userId);
      const { password: _, ...authorWithoutPassword } = author || {};
      res.json({ ...post, author: authorWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog post' });
    }
  });

  app.post('/api/blog', isAuthenticated, async (req, res) => {
    try {
      // Check if user is an author
      const isAuthor = await storage.isBlogAuthor((req.user as any).id);
      if (!isAuthor) {
        return res.status(403).json({ message: 'Only blog authors can create posts' });
      }

      const postData = insertBlogPostSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
        slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });

      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/blog/:id', isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id, 10);
      const post = await storage.getBlogPost(postId);

      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // Check if user is the author of the post or an admin
      const user = req.user as any;
      if (post.userId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: 'Can only edit your own posts' });
      }

      const updatedPost = await storage.updateBlogPost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update blog post' });
    }
  });

  // Blog author management routes
  app.get('/api/blog/authors', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Only admins can view authors' });
      }

      const authors = await storage.getBlogAuthors();
      const authorsWithDetails = await Promise.all(authors.map(async (author) => {
        const user = await storage.getUser(author.userId);
        const { password: _, ...userWithoutPassword } = user || {};
        return { ...author, user: userWithoutPassword };
      }));

      res.json(authorsWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog authors' });
    }
  });

  app.post('/api/blog/authors', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Only admins can add authors' });
      }

      const authorData = insertBlogAuthorSchema.parse(req.body);
      const author = await storage.createBlogAuthor(authorData);
      res.status(201).json(author);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.delete('/api/blog/authors/:userId', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Only admins can remove authors' });
      }

      const userId = parseInt(req.params.userId, 10);
      await storage.removeBlogAuthor(userId);
      res.json({ message: 'Author removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove author' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const threads = await storage.searchThreads(query);

      // Augment threads with additional data
      const threadsWithData = await Promise.all(threads.map(async (thread) => {
        const author = await storage.getUser(thread.userId);
        const votes = await storage.getVotesByThreadId(thread.id);
        const commentCount = (await storage.getCommentsByThreadId(thread.id)).length;
        const tags = await storage.getTagsByThreadId(thread.id);

        // Calculate total votes
        const upvotes = votes.filter(v => v.value > 0).length;
        const downvotes = votes.filter(v => v.value < 0).length;
        const voteScore = upvotes - downvotes;

        // Don't include the author's password
        const { password: _, ...authorWithoutPassword } = author || {};

        return {
          ...thread,
          author: authorWithoutPassword,
          voteScore,
          commentCount,
          tags
        };
      }));

      res.json(threadsWithData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search threads' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
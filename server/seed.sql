INSERT INTO reward_items (name, description, type, cost, icon) VALUES
('Gold Star Badge', 'Show off your expertise with a shiny gold star!', 'badge', 100, '⭐'),
('Expert Title', 'Get the "Expert" title displayed on your profile', 'title', 250, '👑'),
('Rainbow Name', 'Make your username appear in rainbow colors', 'style', 500, '🌈'),
('Custom Banner', 'Add a custom banner to your profile', 'banner', 750, '🎨'),
('Verified Badge', 'Get a special verified badge next to your name', 'badge', 1000, '✓');

-- Add initial categories
INSERT INTO categories (name, description, icon) VALUES
('General Discussion', 'General discussions about technology and programming', 'MessageSquare'),
('Project Showcase', 'Share and discuss your projects', 'Code'),
('Help & Support', 'Get help with coding problems', 'HelpCircle'),
('Tutorials', 'Share and find programming tutorials', 'BookOpen'),
('News & Updates', 'Latest tech news and updates', 'Newspaper');
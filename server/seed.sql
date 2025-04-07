INSERT INTO reward_items (name, description, type, cost, icon) VALUES
('Newcomer', 'Welcome to the community!', 'badge', 100, '👋'),
('Helper', 'Assisted other community members', 'badge', 250, '🤝'),
('Builder', 'Created valuable content', 'badge', 500, '🏗️'),
('Expert', 'Demonstrated deep knowledge', 'badge', 750, '🎓'),
('Champion', 'Outstanding community contributor', 'badge', 1000, '🏆'),
('Innovator', 'Brought fresh ideas to life', 'badge', 1500, '💡'),
('Guardian', 'Helped maintain community standards', 'badge', 2000, '🛡️');

-- Add initial categories
INSERT INTO categories (name, description, icon) VALUES
('General Discussion', 'General discussions about technology and programming', 'MessageSquare'),
('Project Showcase', 'Share and discuss your projects', 'Code'),
('Help & Support', 'Get help with coding problems', 'HelpCircle'),
('Tutorials', 'Share and find programming tutorials', 'BookOpen'),
('News & Updates', 'Latest tech news and updates', 'Newspaper');
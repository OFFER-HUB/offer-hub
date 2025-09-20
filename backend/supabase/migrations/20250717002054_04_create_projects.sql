CREATE TABLE projects (

  -- Unique identifier for the project (auto-generated UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to the client who created the project (foreign key to users table)
  -- Cascades deletion when the referenced user is deleted
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Title or name of the project (required)
  title TEXT NOT NULL,

  -- Detailed description of the project (optional)
  description TEXT,

  -- Category or type of the project for classification (optional)
  category TEXT,

  -- Project budget amount in decimal format (required)
  budget DECIMAL NOT NULL,

  -- Current status of the project (default: 'pending')
  status TEXT DEFAULT 'pending',

  -- Timestamp when the project was created (default: current timestamp)
  created_at TIMESTAMP DEFAULT NOW()
);

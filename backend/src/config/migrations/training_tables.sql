-- Migration script for training module tables

-- Create training_modules table
CREATE TABLE IF NOT EXISTS training_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 1,
    notes JSONB NOT NULL, -- Array of notes in the module
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    notes_played JSONB NOT NULL, -- Array of notes played with timestamps and correctness
    accuracy NUMERIC(5,2) DEFAULT 0, -- Percentage of correct notes
    duration INTEGER DEFAULT 0, -- Duration in seconds
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_module_id ON training_sessions(module_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_level ON training_modules(level);

-- Add sample training module data
INSERT INTO training_modules (title, description, level, notes, created_by)
VALUES 
('Basic Scale Training', 'Learn the C major scale', 1, 
 '[{"note":"C4", "duration": 1, "order": 1}, 
   {"note":"D4", "duration": 1, "order": 2},
   {"note":"E4", "duration": 1, "order": 3},
   {"note":"F4", "duration": 1, "order": 4},
   {"note":"G4", "duration": 1, "order": 5},
   {"note":"A4", "duration": 1, "order": 6},
   {"note":"B4", "duration": 1, "order": 7},
   {"note":"C5", "duration": 1, "order": 8}]'::jsonb, 
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO training_modules (title, description, level, notes, created_by)
VALUES 
('Minor Scale Exercise', 'Practice the A minor scale', 2, 
 '[{"note":"A4", "duration": 1, "order": 1}, 
   {"note":"B4", "duration": 1, "order": 2},
   {"note":"C5", "duration": 1, "order": 3},
   {"note":"D5", "duration": 1, "order": 4},
   {"note":"E5", "duration": 1, "order": 5},
   {"note":"F5", "duration": 1, "order": 6},
   {"note":"G5", "duration": 1, "order": 7},
   {"note":"A5", "duration": 1, "order": 8}]'::jsonb, 
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING; 
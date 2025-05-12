-- Cleanup script for unused tables
-- Use CASCADE to handle dependencies automatically

-- First drop tables with foreign key relationships in reverse order
DROP TABLE IF EXISTS user_lesson_progress CASCADE;
DROP TABLE IF EXISTS user_exercise_progress CASCADE;
DROP TABLE IF EXISTS roadmap_items CASCADE;
DROP TABLE IF EXISTS learning_roadmaps CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS skill_levels CASCADE;

-- Return success confirmation (this will always return one row)
SELECT 'Unused tables successfully removed' AS message; 
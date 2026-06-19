-- Add rating column to tickets table
ALTER TABLE tickets ADD COLUMN rating smallint DEFAULT NULL CHECK (rating >= 1 AND rating <= 5);

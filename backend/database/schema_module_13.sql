-- MODULE 13: PERFORMANCE OPTIMIZATIONS
USE adaptive_learning;

-- MySQL older versions don't support IF NOT EXISTS for CREATE INDEX.
-- We will just try to create them and let it fail if they exist.
-- (Or better, let's just rely on FK indexes which are already there)

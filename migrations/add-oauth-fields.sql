-- Aggiunge campi OAuth alla tabella users esistente
-- Esegui questo SQL nel tuo database SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email', -- 'email', 'google', 'facebook'
ADD COLUMN IF NOT EXISTS provider_id TEXT, -- ID utente dal provider OAuth
ADD COLUMN IF NOT EXISTS provider_email TEXT, -- Email dal provider (può differire da email)
ADD COLUMN IF NOT EXISTS avatar_url TEXT; -- URL avatar dal provider

-- Modifica password_hash per essere nullable (OAuth users non hanno password)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_provider_email ON users(provider_email);

-- Verifica le modifiche
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND (column_name LIKE '%provider%' OR column_name = 'avatar_url');


CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    full_name VARCHAR(120),
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profiles_email_unique UNIQUE (email),
    CONSTRAINT profiles_role_valid CHECK (role IN ('CLIENT', 'ADMIN'))
);
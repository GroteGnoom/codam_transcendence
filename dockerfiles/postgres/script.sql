
CREATE DATABASE transcendence_db;

\c transcendence_db;

CREATE TABLE IF NOT EXISTS transcendence_table (n int4 PRIMARY KEY);

ALTER ROLE postgres WITH PASSWORD 'transcendence123';

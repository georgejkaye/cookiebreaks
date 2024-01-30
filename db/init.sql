CREATE TABLE Break (
    break_id SERIAL PRIMARY KEY,
    break_host TEXT,
    break_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    break_location TEXT NOT NULL,
    holiday_text TEXT,
    break_announced TIMESTAMP WITHOUT TIME ZONE,
    break_cost DECIMAL,
    host_reimbursed TIMESTAMP WITHOUT TIME ZONE
);
CREATE TABLE Claim (
    claim_id SERIAL PRIMARY KEY,
    claim_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    claim_reimbursed TIMESTAMP WITHOUT TIME ZONE
);
CREATE TABLE ClaimItem (
    claim_id INT NOT NULL,
    break_id INT NOT NULL,
    FOREIGN KEY(claim_id) REFERENCES Claim(claim_id) ON DELETE CASCADE,
    FOREIGN KEY(break_id) REFERENCES Break(break_id) ON DELETE CASCADE
);
CREATE TABLE Host (
    user_name TEXT PRIMARY KEY,
    hashed_password TEXT NOT NULL,
    admin BOOLEAN NOT NULL,
    email TEXT NOT NULL
);
INSERT INTO Host (user_name, hashed_password, admin, email) VALUES (
    'admin',
    '$2b$12$nstgZNzQWP5vWThNoxG.pOuTrqpgvxsoztJOZXE2gSVx8dD8OySkW',
    'true', 'admin@cookies.com'
)
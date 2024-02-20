CREATE TABLE Settings (
    day INT NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    budget DECIMAL,
    CONSTRAINT max_day CHECK (day between 0 and 6)
);
INSERT INTO Settings (day, time, location, budget) VALUES (
    2, '14:30', 'LG06a', 15.0
);
CREATE TABLE Person (
    user_name TEXT PRIMARY KEY,
    admin BOOLEAN NOT NULL,
    hashed_password TEXT NOT NULL,
    email TEXT NOT NULL
);
CREATE TABLE Break (
    break_id SERIAL PRIMARY KEY,
    break_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    break_location TEXT NOT NULL,
    host_name TEXT,
    host_email TEXT,
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
INSERT INTO Person (user_name, hashed_password, admin, email) VALUES (
    'admin',
    '$2b$12$nstgZNzQWP5vWThNoxG.pOuTrqpgvxsoztJOZXE2gSVx8dD8OySkW',
    'true',
    'admin@cookies.com'
);
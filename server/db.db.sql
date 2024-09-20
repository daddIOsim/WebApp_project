-- database: db.db
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "user" (
    "user_id"   INTEGER,
    "username" VARCHAR,
    "password" VARCHAR,
    "salt" TEXT,
    "IsLoyal" INTEGER NOT NULL,
    PRIMARY KEY ("user_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "theatre"(
    "theatre_id" INTEGER,
    "size" VARCHAR,
    "row" INT,
    "seats" INT,
    PRIMARY KEY ("theatre_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "concert"(
    "concert_id" INTEGER,
    "title" TEXT,
    "date" TEXT,
    "theatre_id" INT,
    PRIMARY KEY ("concert_id" AUTOINCREMENT),
    FOREIGN KEY ("theatre_id") REFERENCES theatre("theatre_id")

);
CREATE TABLE IF NOT EXISTS "seat"(
    "seat_id" INTEGER,
    "row" INT,
    "position" VARCHAR,
    "concert_id" INT,
    "status" VARCHAR,
    PRIMARY KEY ("seat_id" AUTOINCREMENT),
    FOREIGN KEY ("concert_id") REFERENCES concert("concert_id")
);
CREATE TABLE IF NOT EXISTS "reservation"(
    "reservation_id" INTEGER,
    "concert_id" INT,
    "user_id" INT,
    PRIMARY KEY ("reservation_id" AUTOINCREMENT),
    FOREIGN KEY ("concert_id") REFERENCES concert("concert_id")
    FOREIGN KEY ("user_id") REFERENCES user("user_id")
);
CREATE TABLE IF NOT EXISTS "reservation_seat"(
    "reservation_seat_id" INTEGER,
    "reservation_id" INT,
    "seat_id" INT,
    PRIMARY KEY ("reservation_seat_id" AUTOINCREMENT),
    FOREIGN KEY ("reservation_id") REFERENCES reservation("reservation_id"),
    FOREIGN KEY ("seat_id") REFERENCES seat("seat_id")
);


INSERT INTO "user" ("username", "password", "salt", "IsLoyal") VALUES
('user1', '1be443560fd331a23eb9f3d2bdbbd10ce25e484849b596e5520bb873b5d8221b', '50gLu8X0cJln3sCU', 0),
('user2', '23d191befa013ebe00f74da8f7ee3504de4c0ec62086d68d5a72287d32716b0d', 'uj43mn3FgGnGAt5W', 1),
('user3', '1048f88e0aa35fbc793864feac2bd6c515e669ea485943d1559934ebc782ac51', '4tSlrG63CMqJhQXX', 0),
('user4', 'bf4d6e4e939faee7a2b483601755830bed2d3108fa0eca51117ad5c5c5c9240f', 'f4ar9JZE9iJV8vFD', 1);




-- Popola la tabella "theatre" con i tre tipi di teatro
INSERT INTO "theatre" ("size","row", "seats") VALUES
('small', 4, 8),
('medium', 6, 10),
('large', 9, 14),
('small', 4, 8),
('medium', 6, 10);

INSERT INTO "concert" ("title", "date", "theatre_id") VALUES
('Rock Night', '2024-10-01', 1),  
('Classical Evening', '2024-10-10', 2),  
('Jazz Fusion', '2024-10-20', 3),
('Pop Extravaganza', '2024-10-25', 4),  
('Opera Gala', '2024-11-05', 5); 

INSERT INTO "seat" ("row", "position", "concert_id", "status") VALUES
(1, 'A', 1, 'occupied'), (1, 'B', 1, 'occupied'), (1, 'C', 1, 'available'), (1, 'D', 1, 'available'),
(1, 'E', 1, 'occupied'), (1, 'F', 1, 'available'), (1, 'G', 1, 'available'), (1, 'H', 1, 'available'),
(2, 'A', 1, 'available'), (2, 'B', 1, 'available'), (2, 'C', 1, 'available'), (2, 'D', 1, 'available'),
(2, 'E', 1, 'available'), (2, 'F', 1, 'available'), (2, 'G', 1, 'available'), (2, 'H', 1, 'available'),
(3, 'A', 1, 'available'), (3, 'B', 1, 'available'), (3, 'C', 1, 'available'), (3, 'D', 1, 'available'),
(3, 'E', 1, 'available'), (3, 'F', 1, 'available'), (3, 'G', 1, 'available'), (3, 'H', 1, 'available'),
(4, 'A', 1, 'available'), (4, 'B', 1, 'available'), (4, 'C', 1, 'available'), (4, 'D', 1, 'available'),
(4, 'E', 1, 'available'), (4, 'F', 1, 'available'), (4, 'G', 1, 'available'), (4, 'H', 1, 'available');

INSERT INTO "seat" ("row", "position", "concert_id", "status") VALUES
(1, 'A', 2, 'occupied'), (1, 'B', 2, 'occupied'), (1, 'C', 2, 'occupied'), (1, 'D', 2, 'available'),
(1, 'E', 2, 'available'), (1, 'F', 2, 'available'), (1, 'G', 2, 'occupied'), (1, 'H', 2, 'occupied'),
(1, 'I', 2, 'occupied'), (1, 'J', 2, 'occupied'),

(2, 'A', 2, 'available'), (2, 'B', 2, 'available'), (2, 'C', 2, 'available'), (2, 'D', 2, 'available'),
(2, 'E', 2, 'available'), (2, 'F', 2, 'available'), (2, 'G', 2, 'available'), (2, 'H', 2, 'available'),
(2, 'I', 2, 'available'), (2, 'J', 2, 'available'),

(3, 'A', 2, 'available'), (3, 'B', 2, 'available'), (3, 'C', 2, 'available'), (3, 'D', 2, 'available'),
(3, 'E', 2, 'available'), (3, 'F', 2, 'available'), (3, 'G', 2, 'available'), (3, 'H', 2, 'available'),
(3, 'I', 2, 'available'), (3, 'J', 2, 'available'),

(4, 'A', 2, 'available'), (4, 'B', 2, 'available'), (4, 'C', 2, 'available'), (4, 'D', 2, 'available'),
(4, 'E', 2, 'available'), (4, 'F', 2, 'available'), (4, 'G', 2, 'available'), (4, 'H', 2, 'available'),
(4, 'I', 2, 'available'), (4, 'J', 2, 'available'),

(5, 'A', 2, 'available'), (5, 'B', 2, 'available'), (5, 'C', 2, 'available'), (5, 'D', 2, 'available'),
(5, 'E', 2, 'available'), (5, 'F', 2, 'available'), (5, 'G', 2, 'available'), (5, 'H', 2, 'available'),
(5, 'I', 2, 'available'), (5, 'J', 2, 'available'),

(6, 'A', 2, 'available'), (6, 'B', 2, 'available'), (6, 'C', 2, 'available'), (6, 'D', 2, 'available'),
(6, 'E', 2, 'available'), (6, 'F', 2, 'available'), (6, 'G', 2, 'available'), (6, 'H', 2, 'available'),
(6, 'I', 2, 'available'), (6, 'J', 2, 'available');


INSERT INTO "seat" ("row", "position", "concert_id", "status") VALUES
(1, 'A', 3, 'available'), (1, 'B', 3, 'available'), (1, 'C', 3, 'occupied'), (1, 'D', 3, 'occupied'),
(1, 'E', 3, 'occupied'), (1, 'F', 3, 'occupied'), (1, 'G', 3, 'available'), (1, 'H', 3, 'available'),
(1, 'I', 3, 'available'), (1, 'J', 3, 'available'), (1, 'K', 3, 'available'), (1, 'L', 3, 'available'),
(1, 'M', 3, 'available'), (1, 'N', 3, 'available'),

(2, 'A', 3, 'available'), (2, 'B', 3, 'available'), (2, 'C', 3, 'available'), (2, 'D', 3, 'available'),
(2, 'E', 3, 'available'), (2, 'F', 3, 'available'), (2, 'G', 3, 'available'), (2, 'H', 3, 'available'),
(2, 'I', 3, 'available'), (2, 'J', 3, 'available'), (2, 'K', 3, 'available'), (2, 'L', 3, 'available'),
(2, 'M', 3, 'available'), (2, 'N', 3, 'available'),

(3, 'A', 3, 'available'), (3, 'B', 3, 'available'), (3, 'C', 3, 'available'), (3, 'D', 3, 'available'),
(3, 'E', 3, 'available'), (3, 'F', 3, 'available'), (3, 'G', 3, 'available'), (3, 'H', 3, 'available'),
(3, 'I', 3, 'available'), (3, 'J', 3, 'available'), (3, 'K', 3, 'available'), (3, 'L', 3, 'available'),
(3, 'M', 3, 'available'), (3, 'N', 3, 'available'),

(4, 'A', 3, 'available'), (4, 'B', 3, 'available'), (4, 'C', 3, 'available'), (4, 'D', 3, 'available'),
(4, 'E', 3, 'available'), (4, 'F', 3, 'available'), (4, 'G', 3, 'available'), (4, 'H', 3, 'available'),
(4, 'I', 3, 'available'), (4, 'J', 3, 'available'), (4, 'K', 3, 'available'), (4, 'L', 3, 'available'),
(4, 'M', 3, 'available'), (4, 'N', 3, 'available'),

(5, 'A', 3, 'available'), (5, 'B', 3, 'available'), (5, 'C', 3, 'available'), (5, 'D', 3, 'available'),
(5, 'E', 3, 'available'), (5, 'F', 3, 'available'), (5, 'G', 3, 'available'), (5, 'H', 3, 'available'),
(5, 'I', 3, 'available'), (5, 'J', 3, 'available'), (5, 'K', 3, 'available'), (5, 'L', 3, 'available'),
(5, 'M', 3, 'available'), (5, 'N', 3, 'available'),

(6, 'A', 3, 'available'), (6, 'B', 3, 'available'), (6, 'C', 3, 'available'), (6, 'D', 3, 'available'),
(6, 'E', 3, 'available'), (6, 'F', 3, 'occupied'), (6, 'G', 3, 'occupied'), (6, 'H', 3, 'occupied'),
(6, 'I', 3, 'available'), (6, 'J', 3, 'available'), (6, 'K', 3, 'available'), (6, 'L', 3, 'available'),
(6, 'M', 3, 'available'), (6, 'N', 3, 'available'),

(7, 'A', 3, 'available'), (7, 'B', 3, 'available'), (7, 'C', 3, 'available'), (7, 'D', 3, 'available'),
(7, 'E', 3, 'available'), (7, 'F', 3, 'available'), (7, 'G', 3, 'available'), (7, 'H', 3, 'available'),
(7, 'I', 3, 'available'), (7, 'J', 3, 'available'), (7, 'K', 3, 'available'), (7, 'L', 3, 'available'),
(7, 'M', 3, 'available'), (7, 'N', 3, 'available'),

(8, 'A', 3, 'available'), (8, 'B', 3, 'available'), (8, 'C', 3, 'available'), (8, 'D', 3, 'available'),
(8, 'E', 3, 'available'), (8, 'F', 3, 'available'), (8, 'G', 3, 'available'), (8, 'H', 3, 'available'),
(8, 'I', 3, 'available'), (8, 'J', 3, 'available'), (8, 'K', 3, 'available'), (8, 'L', 3, 'available'),
(8, 'M', 3, 'available'), (8, 'N', 3, 'available'),

(9, 'A', 3, 'available'), (9, 'B', 3, 'available'), (9, 'C', 3, 'available'), (9, 'D', 3, 'available'),
(9, 'E', 3, 'available'), (9, 'F', 3, 'available'), (9, 'G', 3, 'available'), (9, 'H', 3, 'available'),
(9, 'I', 3, 'available'), (9, 'J', 3, 'available'), (9, 'K', 3, 'available'), (9, 'L', 3, 'available'),
(9, 'M', 3, 'available'), (9, 'N', 3, 'available');



INSERT INTO "seat" ("row", "position", "concert_id", "status") VALUES
(1, 'A', 4, 'available'), (1, 'B', 4, 'available'), (1, 'C', 4, 'available'), (1, 'D', 4, 'available'),
(1, 'E', 4, 'available'), (1, 'F', 4, 'available'), (1, 'G', 4, 'available'), (1, 'H', 4, 'available'),
(2, 'A', 4, 'occupied'), (2, 'B', 4, 'occupied'), (2, 'C', 4, 'occupied'), (2, 'D', 4, 'occupied'),
(2, 'E', 4, 'occupied'), (2, 'F', 4, 'occupied'), (2, 'G', 4, 'occupied'), (2, 'H', 4, 'occupied'),
(3, 'A', 4, 'available'), (3, 'B', 4, 'available'), (3, 'C', 4, 'available'), (3, 'D', 4, 'available'),
(3, 'E', 4, 'available'), (3, 'F', 4, 'available'), (3, 'G', 4, 'available'), (3, 'H', 4, 'available'),
(4, 'A', 4, 'available'), (4, 'B', 4, 'available'), (4, 'C', 4, 'occupied'), (4, 'D', 4, 'occupied'),
(4, 'E', 4, 'occupied'), (4, 'F', 4, 'available'), (4, 'G', 4, 'available'), (4, 'H', 4, 'available');


INSERT INTO "seat" ("row", "position", "concert_id", "status") VALUES
(1, 'A', 5, 'occupied'), (1, 'B', 5, 'occupied'), (1, 'C', 5, 'occupied'), (1, 'D', 5, 'occupied'),
(1, 'E', 5, 'available'), (1, 'F', 5, 'available'), (1, 'G', 5, 'available'), (1, 'H', 5, 'available'),
(1, 'I', 5, 'available'), (1, 'J', 5, 'available'),

(2, 'A', 5, 'available'), (2, 'B', 5, 'available'), (2, 'C', 5, 'available'), (2, 'D', 5, 'available'),
(2, 'E', 5, 'available'), (2, 'F', 5, 'available'), (2, 'G', 5, 'available'), (2, 'H', 5, 'available'),
(2, 'I', 5, 'available'), (2, 'J', 5, 'available'),

(3, 'A', 5, 'available'), (3, 'B', 5, 'available'), (3, 'C', 5, 'available'), (3, 'D', 5, 'available'),
(3, 'E', 5, 'available'), (3, 'F', 5, 'available'), (3, 'G', 5, 'available'), (3, 'H', 5, 'available'),
(3, 'I', 5, 'available'), (3, 'J', 5, 'available'),

(4, 'A', 5, 'available'), (4, 'B', 5, 'available'), (4, 'C', 5, 'available'), (4, 'D', 5, 'available'),
(4, 'E', 5, 'available'), (4, 'F', 5, 'available'), (4, 'G', 5, 'available'), (4, 'H', 5, 'available'),
(4, 'I', 5, 'available'), (4, 'J', 5, 'available'),

(5, 'A', 5, 'available'), (5, 'B', 5, 'available'), (5, 'C', 5, 'available'), (5, 'D', 5, 'available'),
(5, 'E', 5, 'available'), (5, 'F', 5, 'available'), (5, 'G', 5, 'available'), (5, 'H', 5, 'available'),
(5, 'I', 5, 'available'), (5, 'J', 5, 'available'),

(6, 'A', 5, 'available'), (6, 'B', 5, 'available'), (6, 'C', 5, 'available'), (6, 'D', 5, 'available'),
(6, 'E', 5, 'occupied'), (6, 'F', 5, 'occupied'), (6, 'G', 5, 'occupied'), (6, 'H', 5, 'occupied'),
(6, 'I', 5, 'available'), (6, 'J', 5, 'available');




INSERT INTO "reservation" ("concert_id", "user_id") VALUES
(1, 1), -- Reservation 1: user1 prenota il Concerto 1 (Teatro Piccolo)

-- user_id 2 prenota il Concerto 2
(2, 2), -- Reservation 2: user2 prenota il Concerto 2 (Teatro Medio)

-- user_id 1 prenota il Concerto 3
(3, 1), -- Reservation 3: user1 prenota il Concerto 3 (Teatro Grande)

-- user_id 2 prenota il Concerto 1
(1, 2), -- Reservation 4: user2 prenota il Concerto 1 (Teatro Piccolo)
(2, 1), --5
(3, 2),--6
(4, 1),--7
(5, 1),--8
(4, 2),
(5, 2);

-- Popola la tabella "reservation_seat"
-- Prenotazione di 2 posti per Reservation 1
INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(1, 1),  -- Reservation 1, posto 1 (row 1, position A, Concerto 1)
(1, 2);  -- Reservation 1, posto 2 (row 1, position B, Concerto 1)
-- Prenotazione di 3 posti per Reservation 2
INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(2, 33),  
(2, 34),  
(2, 35);  
INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(3, 95),  -- Reservation 3, posto 95 (row 7, position A, Concerto 3)
(3, 96),  -- Reservation 3, posto 96 (row 7, position B, Concerto 3)
(3, 97),  -- Reservation 3, posto 97 (row 7, position C, Concerto 3)
(3, 98);  -- Reservation 3, posto 98 (row 7, position D, Concerto 3)
-- Prenotazione di 1 posto per Reservation 4
INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(4, 5);  -- Reservation 4, posto 5 (row 1, position E, Concerto 1)
INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(5, 39), 
(5, 40),  
(5, 41),  
(5, 42);

INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(6, 168), 
(6, 169),  
(6, 170);

INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(7, 227), 
(7, 228),  
(7, 229),  
(7, 230),
(7, 231), 
(7, 232),  
(7, 233),  
(7, 234);

INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(8, 251), 
(8, 252),  
(8, 253),  
(8, 254);

INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(9, 245), 
(9, 246),  
(9, 247);

INSERT INTO "reservation_seat" ("reservation_id", "seat_id") VALUES
(10, 305), 
(10, 306),  
(10, 307),  
(10, 308);


COMMIT;




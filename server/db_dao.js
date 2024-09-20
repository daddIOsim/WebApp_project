'use strict';

const sqlite = require('sqlite3');

const db = new sqlite.Database('db.db', (err) => {
    if (err) throw err;
})



const convertConcertFromRecord = (record) => {
    const concert = {};
    concert.concert_id = record.concert_id;
    concert.title = record.title;
    concert.date = record.date;
    concert.theatre_id = record.theatre_id;

    return concert;
}

const convertSeatFromRecord = (record) => {
    const seat = {};
    seat.seat_id = record.seat_id;
    seat.row = record.row;
    seat.position = record.position;
    seat.concert_id = record.concert_id;
    seat.status = record.status;

    return seat;
}

exports.listConcerts = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM concert';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            }

            const concerts = rows.map((e) => {
                const concert = convertConcertFromRecord(e);
                return concert;
            })
            resolve(concerts);
        })
    })
}

exports.getSeatsFromConcert = (id_concert) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM seat WHERE concert_id = ?';
        db.all(sql, [id_concert], (err, rows) => {
            if (err) {
                console.log(err);
                reject({ code: 500, error: 'Database error', details: err });
                return;
            }

            // If no rows are found (empty array), return a 404 error with a message
            if (!rows || rows.length === 0) {
                reject({ code: 404, error: 'Seats not found for this concert' });
                return;
            }

            // Convert rows to seat objects
            const seats = rows.map((e) => {
                const seat = convertSeatFromRecord(e);
                return seat;
            });

            resolve(seats);
        });
    });
};

exports.getAvailableSeatsForConcert = (concertId) => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT seat_id, row, position FROM seat WHERE concert_id = ? AND status = 'available'`;

        db.all(sql, [concertId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getReservationsFromUser = (id_user) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT r.*, s.seat_id, s.row AS seat_row, s.position, s.status 
            FROM reservation r
            LEFT JOIN reservation_seat rs ON r.reservation_id = rs.reservation_id
            LEFT JOIN seat s ON rs.seat_id = s.seat_id
            WHERE r.user_id = ?;
        `;
        db.all(sql, [id_user], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
            } else if (rows.length === 0) {
                resolve({ error: 'Reservations not found.' });
            } else {
                // Group seats by reservation: reduce iterates over each row. reservation_id is used as the key in the acc object.
                //If the reservation doesn't already exist in acc, create a new entry for that reservationId

                const reservations = rows.reduce((acc, row) => {
                    const reservationId = row.reservation_id;
                    const seat = {
                        seat_id: row.seat_id,
                        row: row.seat_row,
                        position: row.position,
                        status: row.status
                    };

                    if (!acc[reservationId]) {
                        acc[reservationId] = {
                            reservation_id: row.reservation_id,
                            concert_id: row.concert_id,
                            user_id: row.user_id,
                            seats: []
                        };
                    }

                    if (seat.seat_id) {  // Only push valid seats
                        acc[reservationId].seats.push(seat);
                    }

                    return acc;
                }, {});

                resolve(Object.values(reservations));
            }
        });
    });
}


exports.deleteReservationById = (reservation_id, user_id) => {
    return new Promise((resolve, reject) => {
        // Step 1: Get all seat IDs associated with the reservation
        const sqlGetSeatIds = 'SELECT seat_id FROM reservation_seat WHERE reservation_id = ?';
        const sqlDeleteReservationSeats = 'DELETE FROM reservation_seat WHERE reservation_id = ?';
        const sqlDeleteReservation = 'DELETE FROM reservation WHERE reservation_id = ? AND user_id = ?';
        const sqlUpdateSeatStatus = 'UPDATE seat SET status = "available" WHERE seat_id = ?';

        db.serialize(() => {
            // Step 1: Retrieve the seat IDs
            db.all(sqlGetSeatIds, [reservation_id], (err, rows) => {
                if (err) {
                    console.error("Error retrieving seat IDs:", err);
                    return reject(err);
                }

                // Step 2: Delete the seat reservations
                db.run(sqlDeleteReservationSeats, [reservation_id], function (err) {
                    if (err) {
                        console.error("Error deleting seat reservations:", err);
                        return reject(err);
                    }

                    //console.log(`${this.changes} seat reservations deleted for reservation ${reservation_id}.`);

                    // Step 3: Update the seat status to available
                    rows.forEach(row => {
                        db.run(sqlUpdateSeatStatus, [row.seat_id], function (err) {
                            if (err) {
                                console.error(`Error updating status for seat ${row.seat_id}:`, err);
                                return reject(err);
                            }

                            //console.log(`Seat ${row.seat_id} marked as available.`);
                        });
                    });

                    // Step 4: Delete the reservation itself
                    db.run(sqlDeleteReservation, [reservation_id, user_id], function (err) {
                        if (err) {
                            console.error("Error deleting reservation:", err);
                            return reject(err);
                        }

                        //console.log(`${this.changes} reservation deleted with ID ${reservation_id} for user ${user_id}.`);

                        if (this.changes === 0) {
                            return reject(new Error("No reservation found with the given ID or you are not authorized to delete it"));
                        }

                        resolve();
                    });
                });
            });
        });
    });
};

exports.getReservationsWithSeatsAndConcertInfo = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                r.reservation_id,
                r.concert_id,
                r.user_id,
                c.title AS concert_title,
                c.date AS concert_date,
                s.seat_id,
                s.row AS seat_row,
                s.position AS seat_position,
                s.status AS seat_status
            FROM 
                reservation r
            JOIN 
                concert c ON r.concert_id = c.concert_id
            JOIN 
                reservation_seat rs ON r.reservation_id = rs.reservation_id
            JOIN 
                seat s ON rs.seat_id = s.seat_id
            WHERE 
                r.user_id = ?
        `;

        db.all(sql, [user_id], (err, rows) => {
            if (err) {
                console.error("Error fetching reservations with concert and seat info:", err);
                return reject(err);
            }

            let reservations = {};

            rows.forEach(row => {
                if (!reservations[row.reservation_id]) {
                    reservations[row.reservation_id] = {
                        reservation_id: row.reservation_id,
                        concert_id: row.concert_id,
                        user_id: row.user_id,
                        concert_title: row.concert_title,
                        concert_date: row.concert_date,
                        seats: []
                    };
                }
                reservations[row.reservation_id].seats.push({
                    seat_id: row.seat_id,
                    row: row.seat_row,
                    position: row.seat_position,
                    status: row.seat_status
                });
            });

            resolve(Object.values(reservations));
        });
    });
};


exports.getConcertById = (concertId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM concert WHERE concert_id = ?';
        db.get(sql, [concertId], (err, row) => {
            if (err) {
                reject(err);
            }
            if (row == undefined) {
                resolve({ error: 'Concert not found.' });
            } else {
                const concert = convertConcertFromRecord(row);
                resolve(concert);
            }
        });
    });
}

exports.bookSeats = (userId, concertId, seatIds) => {
    return new Promise((resolve, reject) => {

        // Start a transaction
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                return reject(err);  // Reject the promise if there's an error starting the transaction
            }

            // Step 1: Insert a new reservation
            const reservationSql = 'INSERT INTO reservation (concert_id, user_id) VALUES (?, ?)';
            db.run(reservationSql, [concertId, userId], function (err) {
                if (err) {
                    return db.run('ROLLBACK', () => {
                        reject(err);
                    });
                }

                const reservationId = this.lastID;

                // Step 2: Update seat status and link seats to reservation
                const seatSql = 'UPDATE seat SET status = ? WHERE seat_id = ? AND concert_id = ? AND status != ?';
                const reservationSeatSql = 'INSERT INTO reservation_seat (reservation_id, seat_id) VALUES (?, ?)';

                const promises = seatIds.map(seatId => {
                    return new Promise((resolve, reject) => {
                        // Update seat status
                        db.run(seatSql, ['occupied', seatId, concertId, 'occupied'], function (err) {
                            if (err) {
                                return reject(err);  // Reject the promise if there's an error updating the seat
                            }

                            // Link the seat to the reservation
                            db.run(reservationSeatSql, [reservationId, seatId], function (err) {
                                if (err) {
                                    return reject(err);  // Reject the promise if there's an error linking the seat
                                }

                                resolve();  // Resolve the promise after successfully booking the seat
                            });
                        });
                    });
                });

                // Step 3: Commit the transaction after all seats have been processed
                Promise.all(promises)
                    .then(() => {
                        db.run('COMMIT', (err) => {
                            if (err) {
                                return reject(err);  // Reject the promise if there's an error committing the transaction
                            }

                            resolve({ success: true, reservationId });  // Resolve the promise with the reservation ID
                        });
                    })
                    .catch(err => {
                        db.run('ROLLBACK', () => {
                            reject(err);  // Rollback the transaction if any error occurred
                        });
                    });
            });
        });
    });
};


exports.getOccupiedSeats = (concertId, seatIds) => {
    return new Promise((resolve, reject) => {
        const placeholders = seatIds.map(() => '?').join(',');
        const sql = `
        SELECT seat_id 
        FROM seat 
        WHERE concert_id = ? 
          AND seat_id IN (${placeholders}) 
          AND status = 'occupied'
      `;

        db.all(sql, [concertId, ...seatIds], (err, rows) => {
            if (err) {
                return reject(err);
            }

            const occupiedSeats = rows.map(row => row.seat_id);
            resolve(occupiedSeats);
        });
    });
};

exports.checkUserReservation = (userId, concertId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) as count FROM reservation WHERE user_id = ? AND concert_id = ?`;

        db.get(sql, [userId, concertId], (err, row) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return reject('Failed to check user reservation');
            }

            // Return true if the user already has a reservation, false otherwise
            resolve(row.count > 0);
        });
    });
};

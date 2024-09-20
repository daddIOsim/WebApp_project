import React from 'react';
import { Seat } from './Seat';

function SeatsGrid(props) {
  const rows = props.seats.reduce((acc, seat) => {
    if (!acc[seat.row])     //groups seats by their row property.
      acc[seat.row] = []; //For each seat, it checks if the row already exists in the accumulator object. If it doesn’t, it creates an array for that row.
    acc[seat.row].push(seat);   //seat is added to the appropriate row.
    return acc;
  }, {}); //{} is the initial value of the acc object
  //At the end, rows is an object where the keys are the row numbers, and the values are arrays of seat objects belonging to that row.
  return (
    <>
      {Object.keys(rows).map(row => (
        <div key={row} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {rows[row].map(seat => (
              <Seat
                key={seat.seat_id}
                seat={seat}
                handleSeatClick={props.handleSeatClick}
                selectedSeats={props.selectedSeats}
                loggedIn={props.loggedIn}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

//For each row, it renders a <div> that contains another <div> to align the seats of that row horizontally 
//Inside the second <div>, it maps over the seats in that row, rendering each seat using the Seat component

export { SeatsGrid };
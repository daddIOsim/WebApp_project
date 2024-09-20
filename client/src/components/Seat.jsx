import React from 'react';

function Seat(props) {
  return (
    <div
      onClick={() => props.handleSeatClick(props.seat)}
      style={{
        width: '80px',
        height: '40px',
        margin: '5px',
        backgroundColor: props.seat.status === 'occupied'
          ? 'red'
          : props.seat.status === 'conflict'
            ? 'blue'
            : props.selectedSeats.some(s => s.seat_id === props.seat.seat_id)
              ? 'yellow'
              : 'green',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '5px',
        cursor: props.seat.status === 'occupied' || !props.loggedIn ? 'default' : 'pointer',
      }}
    >
      {`${props.seat.row}${props.seat.position}`}
    </div>
  );
}

export { Seat };
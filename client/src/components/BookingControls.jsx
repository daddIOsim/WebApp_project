import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

export function BookingControls(props) {
  return (
    <>
      <Form.Group controlId="numSeats">
        <Form.Label>Number of seats to book</Form.Label>
        <Form.Control
          type="number"
          value={props.numSeats}
          onChange={props.handleNumSeatsChange} //updates the selected number of seats when the user changes the input 
          min="1"
          max={props.availableSeatsCount}
        />
      </Form.Group>
      <Button variant="primary" className="mt-3" onClick={props.handleRandomBooking}>
        Book {props.numSeats} Random Seat(s)
      </Button>
      <Button
        variant="success"
        className="mt-3 ms-2"
        onClick={props.handleConfirmBooking}
        disabled={props.selectedSeats.length === 0}
      >
        Confirm Selection ({props.selectedSeats.length})
      </Button>
      {props.discount !== null && (
        <Alert variant="info" className="mt-3">
          Congratulations! You received a discount of {props.discount}% on your next purchase.
        </Alert>
      )}
    </>
  );
}
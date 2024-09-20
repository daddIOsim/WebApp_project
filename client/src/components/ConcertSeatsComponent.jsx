import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import { SeatsGrid } from './SeatsGrid';
import { BookingControls } from './BookingControls';

function ConcertSeats(props) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [concertTitle, setConcertTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(''); // New state for general messages
  const [numSeats, setNumSeats] = useState(1);
  const [discount, setDiscount] = useState(null);
  const navigate = useNavigate();
  const [dirty, setDirty] = useState(true);

  // Fetch seats data function
  const fetchSeatsData = async () => {
    try {
      const seatData = await API.getSeatsConcert(props.concertId);
      if (seatData.error) {
        setErrorMessage(seatData.error);
      } else {
        setSeats(seatData);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch seat data');
    }
  };

  const fetchConcertTitle = async () => {
    try {
      const concertInfo = await API.getConcertInfo(props.concertId);
      if (concertInfo.error) {
        setErrorMessage(concertInfo.error);
      } else {
        setConcertTitle(concertInfo.title);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch concert information');
    }
  };

  useEffect(() => {
    if (props.concertId) {
      fetchConcertTitle();
    }
  }, [props.concertId]);

  // UseEffect to handle re-fetch when dirty is set to true
  useEffect(() => {
    if (dirty && props.concertId) {
      setLoading(true);
      fetchSeatsData().finally(() => {
        setLoading(false);
        setDirty(false);  // Reset dirty state after fetching
      });
    }
  }, [dirty, props.concertId]);

  // Handle seat click
  const handleSeatClick = (seat) => {
    if (seat.status === 'occupied' || !props.loggedIn) return;

    setSelectedSeats(prevSelectedSeats => {
      const seatExists = prevSelectedSeats.find(s => s.seat_id === seat.seat_id);
      if (seatExists) {
        return prevSelectedSeats.filter(s => s.seat_id !== seat.seat_id);
      } else {
        return [...prevSelectedSeats, { seat_id: seat.seat_id, row: seat.row }];
      }
    });
  };

  // Handle confirm booking
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to reserve.');
      return;
    }

    try {
      const result = await API.bookSeats(props.user.user_id, props.concertId, selectedSeats.map(s => s.seat_id));

      if (result.error) {
        if (result.error === 'You already have a reservation for this concert.') {
          setSelectedSeats([]); // Deselect all the seats
          setErrorMessage(result.error);  // Display error message

        } else if (result.occupiedSeats) {
          // Highlight conflicting seats and clear selected seats
          setSeats(prevSeats => prevSeats.map(seat => ({
            ...seat,
            status: result.occupiedSeats.includes(seat.seat_id) ? 'conflict' : seat.status
          })));
          setSelectedSeats([]);  // Clear the selected seats

          // Refresh seat data after 5 seconds
          setTimeout(() => {
            setDirty(true);  // Trigger the dirty state to refresh seat data
          }, 5000);
        } else {
          setErrorMessage('Failed to reserve some seats: ' + result.error);
        }
      } else {
        const rowNumbers = selectedSeats.map(s => s.row);
        const discountResponse = await API.getDiscount(props.authToken, props.user.IsLoyal, rowNumbers);
        if (!discountResponse.error) setDiscount(discountResponse.discount);

        setDirty(true);  // Set dirty to true to refresh seat data after successful booking
        setSelectedSeats([]);  // Clear selected seats
        setMessage(`Successfully reserved ${selectedSeats.length} seat(s)!`);  // Display success message
      }
    } catch (error) {
      console.error('Error during booking:', error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    }
  };

  // Handle random booking
  const handleRandomBooking = async () => {
    const numSeatsParsed = parseInt(numSeats, 10);
  
    // Validate the input before proceeding (ensure numSeats is not NaN and greater than or equal to 0)
    if (Number.isNaN(numSeatsParsed) || numSeatsParsed < 1) {
      setErrorMessage('Please enter a valid number of seats.');
      return;
    }
  
    try {
      // Proceed with booking if validation passes
      const result = await API.bookRandomSeats(props.user.user_id, props.concertId, numSeatsParsed, props.authToken);
  
      if (result.error) {
        setErrorMessage('Failed to book some seats: ' + result.error);
      } else {
        const rowNumbers = result.bookedSeats.map(seat => seat.row);
        const discountResponse = await API.getDiscount(props.authToken, props.user.IsLoyal, rowNumbers);
        if (!discountResponse.error) setDiscount(discountResponse.discount);
  
        setDirty(true);  // Set dirty to true to refresh seat data
        setMessage(`Successfully booked ${numSeatsParsed} seat(s)!`);  // Display success message
      }
    } catch (error) {
      console.error('Error during booking:', error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    }
  };

  const handleCancelSelectedSeats = () => {
    setSelectedSeats([]); // Clear the selected seats array
  };

  const handleNumSeatsChange = (e) => {
    const value = e.target.value; 
    setNumSeats(value); 
  };

  const handleBackClick = () => navigate('/');

  const availableSeatsCount = seats.filter(seat => seat.status !== 'occupied').length;

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {/* Display the message at the top */}
          {message && (
            <Alert variant="success" className="mb-3" dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          <Button variant="secondary" className="mb-3" onClick={handleBackClick}>
            Back
          </Button>

          <h2>{concertTitle}</h2>

          {loading ? (
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          ) : errorMessage ? (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p>Total Seats: {seats.length}</p>
              <p>Occupied Seats: {seats.filter(seat => seat.status === 'occupied').length}</p>
              <p>Available Seats: {availableSeatsCount}</p>

              <SeatsGrid
                seats={seats}
                handleSeatClick={handleSeatClick}
                selectedSeats={selectedSeats}
                loggedIn={props.loggedIn}
              />

              {props.loggedIn && (
                <>
                  <BookingControls
                    numSeats={numSeats}
                    handleNumSeatsChange={handleNumSeatsChange}
                    handleRandomBooking={handleRandomBooking}
                    handleConfirmBooking={handleConfirmBooking}
                    selectedSeats={selectedSeats}
                    discount={discount}
                    availableSeatsCount={availableSeatsCount}
                  />

                  {selectedSeats.length > 0 && (
                    <div className="my-1">
                      <Button
                        variant="danger"
                        onClick={handleCancelSelectedSeats}
                      >
                        Cancel All Selected Seats
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export { ConcertSeats };
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import API from '../API';
import { useNavigate } from 'react-router-dom';

function Reservation(props) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message
  const [dirty, setDirty] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (dirty && props.user && props.user.user_id) {
      setLoading(true);
      API.getReservationsWithSeatsAndConcertInfo(props.user.user_id)
        .then((res) => {
          if (res.error) {
            setErrorMessage(res.error);
          } else {
            setReservations(res);
          }
        })
        .catch((err) => {
          setErrorMessage('Failed to load reservations');
        })
        .finally(() => {
          setLoading(false);  // Ensure loading is turned off after fetching
          setDirty(false);    // Reset dirty after fetching
        });
    } else if (!props.user || !props.user.user_id) {
      setErrorMessage('User not logged in');
      setLoading(false);
    }
  }, [dirty, props.user]);

  const handleDelete = async (reservationId) => {
    try {
      setLoading(true);

      // Delete reservation from the server
      await API.deleteReservation(reservationId, props.user.user_id);

      // Set dirty state to true to trigger refetching of reservations
      setDirty(true);

      // Show success message after deletion
      setSuccessMessage('Reservation successfully deleted.');
      setErrorMessage('');
    } catch (err) {
      console.error('Failed to delete reservation:', err);
      setErrorMessage('Failed to delete reservation');
      setSuccessMessage('');
    } finally {
      setLoading(false);  // Ensure loading state is set to false after deletion
    }
  };

  const handleBackClick = () => {
    navigate('/');  // Navigate back to the home page
  };

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {/* Back Button */}
          <Button variant="dark" className="mb-3" onClick={handleBackClick}>
            Back
          </Button>

          {/* Success Message */}
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {loading ? (
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          ) : errorMessage ? (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          ) : reservations.length > 0 ? (
            reservations.map((reservation) => (
              <Card key={reservation.reservation_id} className="mb-3">
                <Card.Header as="h5">
                  {reservation.concert_title}
                  <Button
                    variant="danger"
                    className="float-end"
                    onClick={() => handleDelete(reservation.reservation_id)}
                  >
                    Delete
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    <strong>Date:</strong> {reservation.concert_date}
                  </Card.Text>
                  <Card.Text>
                    <strong>Seats:</strong>
                  </Card.Text>
                  <ListGroup variant="flush">
                    {reservation.seats.map((seat) => (
                      <ListGroup.Item key={seat.seat_id}>
                        Row: {seat.row}, Position: {seat.position}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No reservations found.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export { Reservation };
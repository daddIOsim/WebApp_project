import { useState, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Col, Container, Row, Table, Navbar, Button } from 'react-bootstrap';
import API from './API.js';
import { BrowserRouter, Route, Routes, Outlet, Link } from 'react-router-dom'
import { LoginForm } from './components/AuthComponent.jsx';
import { Reservation } from './components/ReservationComponent.jsx';
import { useNavigate } from 'react-router-dom';
import { ConcertSeats } from './components/ConcertSeatsComponent.jsx';

function MyHeader(props) {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand className="mx-2">
        <i className="bi bi-music-note" />
        {props.appName || "ConcertList"}
      </Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        {props.loggedIn && (
          <>
            <Navbar.Text className='text-white mx-3'>
              Welcome, {props.user.username}! <br />
              Loyal Status: {props.user.IsLoyal === 0 ? 'False' : 'True'}
            </Navbar.Text>
            <Link to='/reservation'>
              <Button variant='primary' className='mx-2' onClick={props.onNewButtonClick}>
                My Reservations
              </Button>
            </Link>
            <Button variant='danger' onClick={() => props.logout()}>Logout</Button>
          </>
        )}
        {!props.loggedIn && (
          <Link to='/login'>
            <Button variant='info'>Login</Button>
          </Link>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}



function ConcertRow(props) {
  const navigate = useNavigate();
  const concert = props.concertData;

  const handleConcertClick = () => {
    props.setSelectedConcertId(concert.concert_id); // Set the selected concert ID
    navigate('/concert/seats'); // Navigate to the ConcertSeats component
  };

  return (
    <tr onClick={handleConcertClick} style={{ cursor: 'pointer' }}>
      <td>{concert.title}</td>
      <td>{concert.date}</td>
    </tr>
  );
}

function ConcertRoute(props) {
  return (
    <Table>
      <thead>
        <tr>
          <th> Upcoming concerts</th>
          <th> Date </th>
        </tr>
      </thead>
      <tbody>
        {props.listOfConcerts.map((concert) => (
          <ConcertRow concertData={concert} key={concert.concert_id} setSelectedConcertId={props.setSelectedConcertId} />))}
      </tbody>
    </Table>
  );
}


function MyFooter() {
  return (
    <footer>
      <p>&copy; ConcertsApp</p>
    </footer>
  );
}




function App() {
  const [concerts, setConcerts] = useState([]);
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedConcertId, setSelectedConcertId] = useState(null); // State to hold selected concert ID
  const [authToken, setAuthToken] = useState(null);


  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setAuthToken(null);
  };

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    API.getAuthToken().then((resp) => setAuthToken(resp.token));
  };

  useEffect(() => {
    API.getConcerts()
      .then((concertList) => {
        setConcerts(concertList);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (loggedIn) {
      const interval = setInterval(() => {
        if (authToken) {
          API.getAuthToken()
            .then((resp) => {
              setAuthToken(resp.token);
            })
            .catch((err) => {
              console.error('Failed to renew token:', err);
            });
        }
      }, 60000); // Refresh token every 60 seconds

      return () => clearInterval(interval);
    }
  }, [authToken, loggedIn]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout user={user} loggedIn={loggedIn} logout={doLogOut} />}>
          <Route index element={<ConcertRoute listOfConcerts={concerts} setSelectedConcertId={setSelectedConcertId} />} />
        </Route>
        <Route path='/reservation' element={<Reservation user={user} />} />
        <Route path='/concert/seats' element={<ConcertSeats concertId={selectedConcertId} loggedIn={loggedIn} user={user} authToken={authToken} />} />
        <Route path='/login' element={<LoginForm loginSuccessful={loginSuccessful} />} />
        <Route path='/*' element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );
}


function Layout(props) {
  return (
    <Container fluid>
      <Row>
        <Col>
          <MyHeader appName='Concerts' user={props.user} loggedIn={props.loggedIn} logout={props.logout} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Outlet />
        </Col>
      </Row>
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  );
}

function DefaultRoute() {
  return (
    <Container fluid>
      <p className='my-2'> No data here: this is not  a valid page! </p>
      <Link to='/'> Please go back to main page</Link>
    </Container>
  );
}
export default App

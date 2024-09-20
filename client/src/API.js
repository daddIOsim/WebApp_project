const URL = "http://localhost:3001/api";

async function getConcerts() {
  //Call API /api/concerts
  const response = await fetch(URL + '/concerts');
  const concerts = await response.json();
  if (response.ok) {
    return concerts.map((e) =>
      ({ concert_id: e.concert_id, title: e.title, date: e.date, theatre_id: e.theatre_id })
    );
  }
  else {
    throw concerts;
  }
}

async function getReservationsWithSeatsAndConcertInfo(user_id) {
  try {
    // Fetch reservations for the given user with seats already included
    let response = await fetch(`${URL}/user/${user_id}/reservations`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const reservations = await response.json();

    if (response.ok) {
      return reservations; // Return the reservations with attached seats directly
    } else {
      console.error("Failed to fetch reservations");
      return { error: "Failed to fetch reservations" };
    }
  } catch (err) {
    console.error("Error in fetching reservations: ", err);
    return { error: "An error occurred" };
  }
}

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    // Ensure user contains isLoyal
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}


export const deleteReservation = async (reservationId, userId) => {
  const response = await fetch(`${URL}/reservations/${reservationId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }) // Send the user_id in the request body
  });

  if (response.status === 204) {
    return null; // No content to return
  }

  const result = await response.json();

  if (response.ok) {
    return result; // Return the parsed JSON result
  } else {
    throw result; // Throw the error object
  }
};





async function getSeatsConcert(concert_id) {
  try {
    // Fetch concert information with seats
    let response = await fetch(`${URL}/concerts/${concert_id}/seats`);
    const data = await response.json();

    if (response.ok) {
      return data; // Return the concert information with attached seats directly
    }
    else {
      console.error("Failed to fetch concert information with seats");
      return { error: "Failed to fetch concert information with seats" };
    }
  } catch (err) {
    console.error("Error in fetching concert information with seats: ", err);
    return { error: "An error occurred while fetching concert information with seats" };
  }
}

async function getConcertInfo(concert_id) {
  try {
    // Fetch concert information for the given concert ID
    let response = await fetch(`${URL}/concerts/${concert_id}`);
    const data = await response.json();

    if (response.ok) {
      return data; // Return the concert information directly
    } else {
      console.error("Failed to fetch concert information");
      return { error: "Failed to fetch concert information" };
    }
  } catch (err) {
    console.error("Error in fetching concert information: ", err);
    return { error: "An error occurred while fetching concert information" };
  }
}


async function bookSeats(userId, concertId, seatIds) {
  try {

    // Validate input
    if (!userId) {
      console.error('Invalid input data: userId is missing');
      return { error: 'Invalid input data: userId is missing' };
    }
    if (!concertId) {
      console.error('Invalid input data: concertId is missing');
      return { error: 'Invalid input data: concertId is missing' };
    }
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      console.error('Invalid input data: seatIds are missing or invalid');
      return { error: 'Invalid input data: seatIds are missing or invalid' };
    }

    // Prepare the request payload
    const payload = {
      userId: userId,
      seatIds: seatIds
    };

    // Make the POST request to book the seats
    const response = await fetch(`${URL}/concerts/${concertId}/book`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Parse the response
    const data = await response.json();

    if (response.ok) {
      return data; // Return the successful booking result
    } else if (response.status === 403) {
      // Handle 403 Forbidden: user already has a reservation
      console.error('User already has a reservation for this concert');
      return { error: 'You already have a reservation for this concert.' };
    } else if (response.status === 409) {
      // Handle 409 Conflict: return the list of occupied seats
      console.error('Some seats are already occupied:', data.occupiedSeats);
      return {
        error: 'Some seats are already occupied',
        occupiedSeats: data.occupiedSeats
      };
    } else {
      console.error('Failed to book seats:', data.error);
      return { error: 'Failed to book seats' };
    }
  } catch (err) {
    console.error('Error booking seats:', err);
    return { error: 'An error occurred while booking seats' };
  }
}

async function bookRandomSeats(userId, concertId, numSeats, authToken) {
  try {
    const response = await fetch(`${URL}/concerts/${concertId}/book-random`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId, numSeats }),
    });

    const data = await response.json();

    if (response.ok) {
      return data; // Return the successful booking result
    } else if (response.status === 403) {
      // Handle 403 Forbidden: user already has a reservation
      console.error('User already has a reservation for this concert');
      return { error: 'You already have a reservation for this concert.' };
    } else {
      console.error('Failed to book random seats:', data.error);
      return { error: data.error };
    }
  } catch (err) {
    console.error('Error booking random seats:', err);
    return { error: 'An error occurred while booking random seats' };
  }
}
async function getAuthToken() {
  const response = await fetch(URL + '/auth-token', {
    credentials: 'include'
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw token;  // an object with the error coming from the server
  }
}



async function getDiscount(authToken, isLoyal, rowNumbers) {
  try {

    const response = await fetch(`http://localhost:3002/api/discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ isLoyal, rowNumbers }), // Pass the row numbers
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      return { error: error.message };
    }
  } catch (err) {
    console.error('Error fetching discount:', err);
    return { error: 'An error occurred while fetching the discount.' };
  }
}





const API = { getConcerts, logIn, logOut, getUserInfo, getReservationsWithSeatsAndConcertInfo, deleteReservation, getSeatsConcert, getConcertInfo, bookSeats, bookRandomSeats, getAuthToken, getDiscount };
export default API;


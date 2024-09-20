[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/XYY1fduM)
# WEB APPLICATION EXAM


## React Client Application Routes

- Route `/`: main page with the list of concerts and the logIn button. For logged in users there is an additional button to check their own reservations.
- Route `/reservation`: page with the list of reservations for a user
- Route `/concert/seats`: page with the view of all the seats for the concert. Logged in users have the possibility to book by either selecting what seats they want, or by entering the number of desired seats and book automatically (randomly).
- Route `/login`: page with login form.

## API Server

* **GET `/api/concerts`** :Get the full list of concerts.
  - **Response body**: JSON object with the list of concerts:
    ```
    [ {"concert_id": 1, "title": "Rock Night", date":"2024-09-01", "theatre_id": 1 }, ... ]
    ```
  - Codes: `200 OK`, `500 Internal Server Error`.

*  **GET `/api/concerts/:id`** : Get concert by ID.
  - **Response body**: JSON object with a concert:
    ```
    [ {"concert_id": 2, "title": "Classical Evening", date":"2024-09-10", "theatre_id": 2 } ]
    ```
  - Codes: `200 OK`, `404 Not Found`, `500 Internal Server Error`.


* **GET `/api/concerts/:id/seats`**: Get the information about seats for a specific concert.
  - **Response body**: JSON object with the list of seats:
    ```
    [ {"seat_id": 1, "row": 1, "position": "A", "concert_id": 1, "status": "occupied" } ,...]
    ```
  - Codes: `200 OK`, `404 Not found`, `500 Internal Server Error`.


* **DELETE `/api/reservations/:id`**: Delete a reservation by passing its ID (**AUTH**)
  - **Response body**: Empty on success, otherwise a JSON object with the error.
  - Codes: `204 OK`, `401 Unauthorized`, `404 Not found`, `500 Internal Server Error`.

* **GET `/api/user/:id/reservations`**: get reservations given a user_id. It returns reservations and the seats attached to it (**AUTH**)
  - **Response body**: JSON object with the list of seats:
    ```
    [
    {
    "reservation_id": 1,
    "concert_id": 1,
    "user_id": 1,
    "concert_title": "Rock Night",
    "concert_date": "2024-09-01",
    "seats": [
      {
        "seat_id": 1,
        "row": 1,
        "position": "A",
        "status": "occupied"
      },
      {
        "seat_id": 2,
        "row": 1,
        "position": "B",
        "status": "occupied"
      }
    ]
    }
    ]
    ```
  - Codes: `200 OK`, `400 Bad Request`, `403 Unauthorized`, `404 Not found`, `500 Internal Server Error`.


* **POST `/api/concerts/:id/book`**: Book seats, by also checking if the user already has a reservation for that concert and if the seats are available (**AUTH**)
  - **Request**: JSON object with _userId_ and _seatIds_ (list of seats):   
    ```
    { "userId": 2,
      "seatIds": [10,11,12] }
    ```
  - **Response body**:
    ```
    { "reservationId": 7,
      "message": "Seats booked succesfully" }
    ``` 
  - Codes: `200 OK`, `401 Unauthorized`, `400 Bad Request`, `403 User already has a reservation for this concert`, `409 Some seats are already occupied` (if some selected seats have been booked in the meantime by another user), `500 Internal Server Error`.


* **POST `/api/concerts/:id/book-random`**: Same as /book, but manages the random booking proces (**AUTH**)
  - **Request**: JSON object with _userId_ and _numSeats_:   
    ```
    { "userId": 1,
      "numSeats": 2 }
    ```
  - **Response body**:
    
    ```
    { "message": "Seats booked successfully",
      "bookedSeats": [
        {
          "seat_id": 187,
          "row": 7,
          "position": "K"
        },
        {
          "seat_id": 116,
          "row": 2,
          "position": "J"
        }
      ]
      }
    ``` 
  - Codes: `200 OK`, `401 Unauthorized`, `400 Bad Request` (invalid request body), `403 User already has a reservation for this concert`, `500 Internal Server Error`.


* **GET `/api/auth-token`**: Creates a token of the authenticated user (**AUTH**)
  - **Response body**: JSON object with token
  - **Token payload**; isLoyal flag and userID

      ```
    { "IsLoyal": 1,
      "authID": 2
      }
    ```

  - Codes: `200 OK`, `401 Not authorized`, `401 User ID status not found`, `500 Internal Server Error`.



### Authentication APIs

* **POST `/api/sessions`**: Authenticate and login the user.
  - **Request**: JSON object with _username_ and _password_:   
    ```
    { "username": "user1", "password": "pwd" }
    ```
  - **Response body**: JSON object with the user's info and the IsLoyal flag; or a description of the errors:   
    ```
    { "user_id": 1,
      "username": "user1",
      "IsLoyal": 0 
      }
    ```
  - Codes: `200 OK`, `401 Unauthorized` (incorrect email and/or password), `400 Bad Request` (invalid request body), `500 Internal Server Error`.

* **DELETE `/api/sessions/current`**: Logout the user.
  - Codes: `200 OK`, `401 Unauthorized`.

* **GET `/api/sessions/current`**: Get info on the logged in user.
  - Codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.
  - **Response body**: JSON object with the same info as in login:   
    ```
    { "user_id": 1,
      "username": "user1",
      "IsLoyal": 0 
      }
    ```


## API Server2

* **GET `/api/discount`** : Returns the discount based on the booked seats.
  - **Request Headers**: JWT token with IsLoyal flag  
  - **Request**: JSON object with a list of course codes   
    ```
    { "isLoyal": 0, "sumOfRowNumbers" : 15 }
    ```
  - **Response body**: EJSON object with the percentage
    ```
    { "discount": 24 }
    ```
  - Codes: `200 OK`, `401 Unauthorized`, `400 Bad Request` (invalid request body).


## Database Tables

- Table `user` - contains user_id, username, password, salt, IsLoyal
- Table `theatre` - contains theatre_id, size, row, seats
- Table `concert` - contains concert_id, title, date, theatre_id
- Table `seat` - contains seat_id, row, position, concert_id, status
- Table `reservation` - contains reservation_id, concert_id, user_id
- Table `reservation_seat` - contains reservation_seat_id, reservation_id, seat_id

## Main React Components

- `App` (in `App.jsx`): Component that manages all the routes. It renders the list of concerts, via smaller components such as ConcertRow and ConcertRoute.
- `LoginForm` (in `AuthComponent.jsx`): Component that manages the login process
- `Reservation` (in `ReservationComponent.jsx`): Component that holds the list of reservations for a logged-in user. It manages the deletion of a reservation.
- `Seat` (in `Seat.jsx`): Manages the seat style.
- `SeatsGrid` (in `SeatsGrid.jsx`): responsible to render a grid of seats based on the seats data passed by seat.
- `BookingControls` (in `BookingConntrols.jsx`): component that renders the controls for seat booking, allowing users to select the number of seats they wish to book, trigger random seat bookings, confirm selected seats.
- `ConcertSeats` (in `ConcertSeatsComponent.jsx`):component that handles all the logic for booking seats in a concert, including fetching seat data, selecting seats, booking randomly, confirming bookings


## Screenshot

![Screenshot](./img/Homepage%20-%20not%20authenticated.png)
![Screenshot](./img/Homepage%20-%20Authenticated.png)
![Screenshot](./img/Seats%20view%20-%20not%20authenticated.png)
![Screenshot](./img/Reservations%20-%20Authenticated.png)
![Screenshot](./img/Seat%20selection%20and%20view%20-%20Authenticated.png)
![Screenshot](./img/Seat%20booking%20with%20discount%20-%20Authenticated.png)





## Users Credentials

- user1, pwd (IsLoyal = 0, has reservation for all the concerts)
- user2, pwd (IsLoyal = 1, has reservations for all the concerts)
- user3, pwd (IsLoyal = 0, no reservations)
- user4, pwd (IsLoyal = 1, no reservations)


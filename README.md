# DineEase - Restaurant Reservation & Management System

A MERN stack project that demonstrates **CRUD** on three connected collections: Restaurants, Tables and Reservations.

- **Frontend:** React (Vite), React Router, Axios, plain CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (inspect with MongoDB Compass at `mongodb://127.0.0.1:27017`, database `dineease`)

## Run it (3 steps)

You need Node.js 18+ and MongoDB running locally (or a MongoDB Atlas link in `server/.env`).

```bash
# 1. Backend (terminal 1)
cd server
npm install
npm run seed      # inserts 5 restaurants, 30 tables, 5 reservations
npm run dev       # http://localhost:5000

# 2. Frontend (terminal 2)
cd client
npm install
npm run dev       # http://localhost:5173
```

`server/.env` already has `MONGO_URI=mongodb://127.0.0.1:27017/dineease` and `PORT=5000`.
If the backend runs on another URL, create `client/.env` with `VITE_API_URL=http://localhost:5000/api`.

Demo tip: phone number **9876543210** has two sample reservations on the My Reservations page.

## Folder structure

```
dineease/
├── client/src/
│   ├── components/   Navbar, Footer, RestaurantCard, RestaurantForm, TableForm,
│   │                 ReservationForm, ReservationCard, StatusBadge, Loading, Modal
│   ├── pages/        Home, Restaurants, RestaurantDetails, BookTable, MyReservations
│   │   └── admin/    AdminLayout, Dashboard, AdminRestaurants, AdminTables, AdminReservations
│   ├── services/api.js     (Axios instance + error helper)
│   ├── App.jsx             (routes)
│   └── index.css           (the only stylesheet)
└── server/
    ├── config/db.js        (MongoDB connection)
    ├── models/             (Restaurant, Table, Reservation schemas)
    ├── controllers/        (the logic for each route)
    ├── routes/             (URL + method -> controller)
    ├── middleware/         (404 handler + error handler)
    ├── seed.js             (sample data)
    └── server.js           (starts Express)
```

Request flow: **Route -> Controller -> Mongoose Model -> MongoDB**

## API list (test in Postman)

```
POST   /api/restaurants
GET    /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

POST   /api/tables
GET    /api/tables                 (filters: ?restaurantId=&status=)
GET    /api/tables/:id
PUT    /api/tables/:id
DELETE /api/tables/:id

POST   /api/reservations
GET    /api/reservations           (filters: ?restaurantId=&date=&status=&customerPhone=)
GET    /api/reservations/:id
PUT    /api/reservations/:id
DELETE /api/reservations/:id

GET    /api/stats                  (numbers for the admin dashboard)
```

Success response: `{ "success": true, "message": "...", "data": ... }`
Error response: `{ "success": false, "message": "..." }`
Status codes: 200 OK, 201 created, 400 bad request, 404 not found, 500 server error.

### Sample Postman bodies

Create restaurant (`POST /api/restaurants`, Body -> raw -> JSON):
```json
{ "name": "Sushi Zen", "location": "Juhu, Mumbai", "cuisine": "Japanese", "rating": 4.5,
  "description": "Fresh sushi and ramen.", "image": "" }
```

Create table (`POST /api/tables`) - copy a restaurant `_id` from the GET response:
```json
{ "restaurantId": "PASTE_RESTAURANT_ID", "tableNumber": 1, "capacity": 4 }
```

Create reservation (`POST /api/reservations`):
```json
{ "restaurantId": "PASTE_RESTAURANT_ID", "tableId": "PASTE_TABLE_ID", "customerName": "Test User",
  "customerPhone": "9999999999", "date": "2026-12-01", "time": "20:00", "guests": 2 }
```
Send the same body twice: the second call returns **400 "already reserved for that date and time"**.

## Reservation rules (server/controllers/reservationController.js)

1. Restaurant exists -> else 404
2. Table exists -> else 404
3. Table belongs to that restaurant -> else 400
4. Table is not in Maintenance
5. Guests <= table capacity
6. No Confirmed/Pending reservation for the same table + date + time
7. Create it, then `refreshTableStatus()` sets the table to `Reserved`

`refreshTableStatus()` counts the table's Confirmed/Pending reservations: more than 0 -> `Reserved`, otherwise -> `Available`. It runs after create, update (cancel, move table) and delete. `Maintenance` is never changed automatically.

Deleting a restaurant also deletes its tables and reservations. A table with active reservations cannot be deleted.

## Known limitations (say these honestly in the interview)

- No login: the admin page is open, and "My Reservations" is found by phone number.
- A table's status is one flag, not per date. After a booking the table shows `Reserved` and hides from the booking dropdown, even for other dates. The backend double-booking check is per date+time, so it is correct if you call the API directly. Improvement: compute availability per date and time from reservations.
- Date and time are stored as plain strings.

## Quick test checklist

1. Home page shows 3 featured restaurants; search sends you to /restaurants.
2. Book a table at The Green Leaf -> success message -> table disappears from the dropdown.
3. /my-reservations -> phone number is pre-filled -> Edit, Cancel and Delete work.
4. /admin -> dashboard numbers change after you book or cancel.
5. Admin Restaurants/Tables/Reservations: add, edit, delete, status filter.
6. Cancel a booking -> its table becomes `Available` again (check in Admin -> Tables).

## Build stages (the order the project is built in)

1. Project structure and backend (`server/package.json`, `server.js`)
2. MongoDB connection and models (`config/db.js`, `models/`)
3. Restaurant CRUD (controller + routes)
4. Table CRUD
5. Reservation CRUD with validation
6. Test every API in Postman
7. React setup (Vite, Router, Axios)
8. Restaurant browsing pages
9. Booking and My Reservations
10. Admin CRUD pages
11. Connect and fix bugs
12. CSS polish
13. README and interview prep -> see `INTERVIEW_PREP.md`

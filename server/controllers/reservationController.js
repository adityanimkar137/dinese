const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');

// A reservation "blocks" a table only while it is Confirmed or Pending
const ACTIVE_STATUSES = ['Confirmed', 'Pending'];

// Helper: sets the table status based on its reservations.
// - at least one active reservation -> Reserved
// - none left                       -> Available
// - Maintenance is never changed automatically
const refreshTableStatus = async (tableId) => {
  const table = await Table.findById(tableId);
  if (!table || table.status === 'Maintenance') return;

  const activeCount = await Reservation.countDocuments({
    tableId: tableId,
    status: { $in: ACTIVE_STATUSES },
  });

  table.status = activeCount > 0 ? 'Reserved' : 'Available';
  await table.save();
};

// Helper: loads restaurant name and table details into a reservation
const withDetails = (query) =>
  query.populate('restaurantId', 'name location').populate('tableId', 'tableNumber capacity status');

// GET /api/reservations  (filters: ?restaurantId=&date=&status=&customerPhone=)
const getReservations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerPhone) filter.customerPhone = req.query.customerPhone;

    const reservations = await withDetails(Reservation.find(filter).sort({ date: -1, time: -1 }));
    res.status(200).json({ success: true, message: 'Reservations fetched successfully', data: reservations });
  } catch (error) {
    next(error);
  }
};

// GET /api/reservations/:id
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await withDetails(Reservation.findById(req.params.id));
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.status(200).json({ success: true, message: 'Reservation fetched successfully', data: reservation });
  } catch (error) {
    next(error);
  }
};

// POST /api/reservations
const createReservation = async (req, res, next) => {
  try {
    const { restaurantId, tableId, customerName, customerPhone, date, time, guests, status } = req.body;

    if (!restaurantId || !tableId || !customerName || !customerPhone || !date || !time || !guests) {
      return res.status(400).json({ success: false, message: 'Please fill in all the reservation details' });
    }
    const guestCount = Number(guests);
    if (!guestCount || guestCount < 1) {
      return res.status(400).json({ success: false, message: 'Guests must be at least 1' });
    }

    // 1. Restaurant must exist
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // 2. Table must exist
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // 3. Table must belong to this restaurant
    if (table.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({ success: false, message: 'This table does not belong to the selected restaurant' });
    }

    if (table.status === 'Maintenance') {
      return res.status(400).json({ success: false, message: 'This table is under maintenance' });
    }

    // 4. Guests must fit on the table
    if (guestCount > table.capacity) {
      return res.status(400).json({ success: false, message: `This table seats only ${table.capacity} guests` });
    }

    // 5. Same table + same date + same time must not already be booked
    const conflict = await Reservation.findOne({
      tableId,
      date,
      time,
      status: { $in: ACTIVE_STATUSES },
    });
    if (conflict) {
      return res.status(400).json({ success: false, message: 'This table is already reserved for that date and time' });
    }

    // 6. Create the reservation
    const reservation = await Reservation.create({
      restaurantId,
      tableId,
      customerName,
      customerPhone,
      date,
      time,
      guests: guestCount,
      status: status || 'Confirmed',
    });

    // 7. Mark the table as Reserved
    await refreshTableStatus(tableId);

    const savedReservation = await withDetails(Reservation.findById(reservation._id));
    res.status(201).json({ success: true, message: 'Reservation created successfully', data: savedReservation });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reservations/:id
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const oldTableId = reservation.tableId.toString();
    const { customerName, customerPhone, date, time, guests, tableId, status } = req.body;

    // Work out the values the reservation will have after the update
    const newTableId = tableId || oldTableId;
    const newDate = date || reservation.date;
    const newTime = time || reservation.time;
    const newGuests = guests !== undefined ? Number(guests) : reservation.guests;
    const newStatus = status || reservation.status;

    if (!newGuests || newGuests < 1) {
      return res.status(400).json({ success: false, message: 'Guests must be at least 1' });
    }

    const table = await Table.findById(newTableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    if (table.restaurantId.toString() !== reservation.restaurantId.toString()) {
      return res.status(400).json({ success: false, message: 'This table does not belong to the reservation restaurant' });
    }
    if (newGuests > table.capacity) {
      return res.status(400).json({ success: false, message: `This table seats only ${table.capacity} guests` });
    }

    // Only check for double booking if the reservation will still be active
    if (ACTIVE_STATUSES.includes(newStatus)) {
      const conflict = await Reservation.findOne({
        tableId: newTableId,
        date: newDate,
        time: newTime,
        status: { $in: ACTIVE_STATUSES },
        _id: { $ne: reservation._id }, // ignore itself
      });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'This table is already reserved for that date and time' });
      }
    }

    if (customerName) reservation.customerName = customerName;
    if (customerPhone) reservation.customerPhone = customerPhone;
    reservation.date = newDate;
    reservation.time = newTime;
    reservation.guests = newGuests;
    reservation.tableId = newTableId;
    reservation.status = newStatus;
    await reservation.save();

    // Fix table statuses (new table, and the old table if the booking moved)
    await refreshTableStatus(newTableId);
    if (oldTableId !== newTableId.toString()) {
      await refreshTableStatus(oldTableId);
    }

    const updated = await withDetails(Reservation.findById(reservation._id));
    res.status(200).json({ success: true, message: 'Reservation updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reservations/:id
const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // The table may be free now
    await refreshTableStatus(reservation.tableId);

    res.status(200).json({ success: true, message: 'Reservation deleted successfully', data: reservation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
};

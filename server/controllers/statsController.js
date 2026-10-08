const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// GET /api/stats  -> numbers for the admin dashboard
// countDocuments() asks MongoDB to count the matching documents.
const getStats = async (req, res, next) => {
  try {
    const totalRestaurants = await Restaurant.countDocuments();
    const totalTables = await Table.countDocuments();
    const availableTables = await Table.countDocuments({ status: 'Available' });
    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      message: 'Stats fetched successfully',
      data: { totalRestaurants, totalTables, availableTables, totalReservations, pendingReservations },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };

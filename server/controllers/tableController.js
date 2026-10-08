const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');

// GET /api/tables  (optional filters: ?restaurantId=...&status=Available)
const getTables = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.status) filter.status = req.query.status;

    // populate() replaces the stored ObjectId with the real restaurant document (name, location)
    const tables = await Table.find(filter)
      .populate('restaurantId', 'name location')
      .sort({ restaurantId: 1, tableNumber: 1 });

    res.status(200).json({ success: true, message: 'Tables fetched successfully', data: tables });
  } catch (error) {
    next(error);
  }
};

// GET /api/tables/:id
const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id).populate('restaurantId', 'name location');
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, message: 'Table fetched successfully', data: table });
  } catch (error) {
    next(error);
  }
};

// POST /api/tables
const createTable = async (req, res, next) => {
  try {
    const { restaurantId, tableNumber, capacity, status } = req.body;

    if (!restaurantId || !tableNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'Restaurant, table number and capacity are required' });
    }
    if (Number(capacity) <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be greater than 0' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Two tables in the same restaurant should not have the same number
    const duplicate = await Table.findOne({ restaurantId, tableNumber });
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Table ${tableNumber} already exists in this restaurant` });
    }

    const table = await Table.create({ restaurantId, tableNumber, capacity, status });
    res.status(201).json({ success: true, message: 'Table created successfully', data: table });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tables/:id
const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const { restaurantId, tableNumber, capacity, status } = req.body;

    if (capacity !== undefined && Number(capacity) <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be greater than 0' });
    }

    const newRestaurantId = restaurantId || table.restaurantId;
    const newTableNumber = tableNumber || table.tableNumber;

    if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ success: false, message: 'Restaurant not found' });
      }
    }

    // $ne = "not equal" -> ignore the table we are editing when looking for duplicates
    const duplicate = await Table.findOne({
      restaurantId: newRestaurantId,
      tableNumber: newTableNumber,
      _id: { $ne: table._id },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Table ${newTableNumber} already exists in this restaurant` });
    }

    table.restaurantId = newRestaurantId;
    table.tableNumber = newTableNumber;
    if (capacity !== undefined) table.capacity = capacity;
    if (status) table.status = status;

    await table.save(); // save() runs schema validation (e.g. invalid status gives a 400)
    res.status(200).json({ success: true, message: 'Table updated successfully', data: table });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tables/:id
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Do not delete a table that still has live bookings
    const activeCount = await Reservation.countDocuments({
      tableId: table._id,
      status: { $in: ['Confirmed', 'Pending'] },
    });
    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'This table has active reservations. Cancel or delete them first.',
      });
    }

    // Old cancelled/completed reservations of this table are removed so nothing points to a missing table
    await Reservation.deleteMany({ tableId: table._id });
    await table.deleteOne();

    res.status(200).json({ success: true, message: 'Table deleted successfully', data: table });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTables, getTableById, createTable, updateTable, deleteTable };

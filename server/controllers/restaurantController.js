const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// GET /api/restaurants  -> READ all
const getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Restaurants fetched successfully', data: restaurants });
  } catch (error) {
    next(error);
  }
};

// GET /api/restaurants/:id  -> READ one
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, message: 'Restaurant fetched successfully', data: restaurant });
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants  -> CREATE
const createRestaurant = async (req, res, next) => {
  try {
    const { name, location, cuisine, rating, description, image } = req.body;

    if (!name || !location || !cuisine || !description) {
      return res.status(400).json({ success: false, message: 'Name, location, cuisine and description are required' });
    }

    const restaurant = await Restaurant.create({ name, location, cuisine, rating, description, image });
    res.status(201).json({ success: true, message: 'Restaurant created successfully', data: restaurant });
  } catch (error) {
    next(error);
  }
};

// PUT /api/restaurants/:id  -> UPDATE
const updateRestaurant = async (req, res, next) => {
  try {
    // new: true  -> return the updated document (not the old one)
    // runValidators: true -> apply the schema rules (required, min, max) on update too
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, message: 'Restaurant updated successfully', data: restaurant });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/restaurants/:id  -> DELETE
// Tables and reservations belong to the restaurant, so we delete them too (otherwise they would be "orphans").
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    await Reservation.deleteMany({ restaurantId: restaurant._id });
    await Table.deleteMany({ restaurantId: restaurant._id });
    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Restaurant and its tables and reservations deleted successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant };

// Run with:  npm run seed
// WARNING: this deletes all existing data and inserts fresh sample data.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Restaurant = require('./models/Restaurant');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');

// Returns a date string like "2026-10-08", `daysFromToday` days from now
const dateFromToday = (daysFromToday) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
};

const restaurantData = [
  {
    name: 'The Green Leaf',
    location: 'Bandra West, Mumbai',
    cuisine: 'Vegetarian',
    rating: 4.5,
    description: 'Fresh, seasonal vegetarian plates served in a bright garden dining room.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  },
  {
    name: 'Spice Route',
    location: 'Colaba, Mumbai',
    cuisine: 'Indian',
    rating: 4.7,
    description: 'Regional Indian curries and tandoor specials inspired by old trade routes.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  },
  {
    name: 'Bella Italia',
    location: 'Powai, Mumbai',
    cuisine: 'Italian',
    rating: 4.4,
    description: 'Wood-fired pizza, handmade pasta and tiramisu in a cosy trattoria.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  },
  {
    name: 'Urban Tadka',
    location: 'Andheri East, Mumbai',
    cuisine: 'North Indian',
    rating: 4.2,
    description: 'Street-food classics and rich North Indian gravies with a modern twist.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  },
  {
    name: 'The Terrace',
    location: 'Worli, Mumbai',
    cuisine: 'Continental',
    rating: 4.6,
    description: 'Rooftop dining with grills, seafood and sea-facing sunset views.',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
  },
];

// capacity of tables 1..6 for every restaurant
const capacities = [2, 2, 4, 4, 6, 8];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Reservation.deleteMany();
    await Table.deleteMany();
    await Restaurant.deleteMany();
    console.log('Old data cleared');

    const restaurants = await Restaurant.insertMany(restaurantData);

    // Create 6 tables for every restaurant
    const tablesToInsert = [];
    restaurants.forEach((restaurant) => {
      capacities.forEach((capacity, index) => {
        tablesToInsert.push({
          restaurantId: restaurant._id,
          tableNumber: index + 1,
          capacity: capacity,
          status: 'Available',
        });
      });
    });
    const tables = await Table.insertMany(tablesToInsert);

    // Helper: find a table by restaurant index and table number
    const findTable = (restaurantIndex, tableNumber) =>
      tables.find(
        (t) => t.restaurantId.toString() === restaurants[restaurantIndex]._id.toString() && t.tableNumber === tableNumber
      );

    // One table is under maintenance to show that status
    const maintenanceTable = findTable(4, 6);
    maintenanceTable.status = 'Maintenance';
    await maintenanceTable.save();

    const reservationData = [
      { r: 0, t: 3, customerName: 'Rohan Mehta', customerPhone: '9876543210', date: dateFromToday(1), time: '19:30', guests: 4, status: 'Confirmed' },
      { r: 1, t: 2, customerName: 'Priya Sharma', customerPhone: '9123456780', date: dateFromToday(1), time: '20:00', guests: 2, status: 'Pending' },
      { r: 2, t: 5, customerName: 'Aman Verma', customerPhone: '9988776655', date: dateFromToday(2), time: '13:00', guests: 6, status: 'Confirmed' },
      { r: 3, t: 1, customerName: 'Sneha Patil', customerPhone: '9876543210', date: dateFromToday(-1), time: '21:00', guests: 2, status: 'Completed' },
      { r: 4, t: 2, customerName: 'Karan Joshi', customerPhone: '9000011111', date: dateFromToday(3), time: '18:30', guests: 2, status: 'Cancelled' },
    ];

    for (const item of reservationData) {
      const table = findTable(item.r, item.t);
      await Reservation.create({
        restaurantId: restaurants[item.r]._id,
        tableId: table._id,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        date: item.date,
        time: item.time,
        guests: item.guests,
        status: item.status,
      });

      // Confirmed/Pending reservations make the table Reserved
      if (item.status === 'Confirmed' || item.status === 'Pending') {
        table.status = 'Reserved';
        await table.save();
      }
    }

    console.log('Seed complete: 5 restaurants, 30 tables, 5 reservations');
    console.log('Tip: phone 9876543210 has 2 sample reservations');
    process.exit(0);
  } catch (error) {
    console.log('Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();

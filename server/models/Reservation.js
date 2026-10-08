const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: [true, 'Restaurant is required'] },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: [true, 'Table is required'] },
  customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
  customerPhone: { type: String, required: [true, 'Phone number is required'], trim: true },
  date: { type: String, required: [true, 'Date is required'] }, // kept as text like "2026-10-08"
  time: { type: String, required: [true, 'Time is required'] }, // kept as text like "19:30"
  guests: { type: Number, required: [true, 'Number of guests is required'], min: [1, 'At least 1 guest is needed'] },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    default: 'Confirmed',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reservation', reservationSchema);

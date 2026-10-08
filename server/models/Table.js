const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  // ObjectId + ref = a link to a document in the Restaurant collection (like a foreign key)
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant is required'],
  },
  tableNumber: { type: Number, required: [true, 'Table number is required'] },
  capacity: { type: Number, required: [true, 'Capacity is required'], min: [1, 'Capacity must be greater than 0'] },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Maintenance'],
    default: 'Available',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Table', tableSchema);

const mongoose = require('mongoose');

// A Schema describes the shape of a document (one record) in a MongoDB collection.
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Restaurant name is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  cuisine: { type: String, required: [true, 'Cuisine is required'], trim: true },
  rating: { type: Number, default: 4, min: 0, max: 5 },
  description: { type: String, required: [true, 'Description is required'], trim: true },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// A Model is the tool we use to talk to the "restaurants" collection (find, create, update, delete).
module.exports = mongoose.model('Restaurant', restaurantSchema);

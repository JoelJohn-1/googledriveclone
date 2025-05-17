const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    s3FileLink: {
      type: String,
      default: '',
      required: true,
      unique: true
    },
    ownerId: {
      type: Number,
      required: true,
    }
  }, {
    collection: 'documents',
    timestamps: true
  });
  
  module.exports = mongoose.model('Document', DocumentSchema);
  
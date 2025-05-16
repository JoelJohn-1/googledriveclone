const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    s3_file_link: {
      type: String,
      default: '',
    },
    // Maps to a users unique id
    owner_id: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: () => new Date(),
    },
    updated_at: {
      type: Date,
      default: () => new Date(),
    },
  }, {
    collection: 'documents',
    timestamps: true // Automatically manages `createdAt` and `updatedAt`
  });
  
  module.exports = mongoose.model('Document', DocumentSchema);
  
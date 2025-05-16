const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    s3_file_link: {
      type: String,
      default: '',
      required: true,
      unique: true
    },
    owner_id: {
      type: Number,
      required: true,
    }
  }, {
    collection: 'documents',
    timestamps: true
  });
  
  module.exports = mongoose.model('Document', DocumentSchema);
  
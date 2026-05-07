const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['success', 'error', 'info', 'warning'],
      default: 'info',
    },
    read: {
      type: Boolean,
      default: false,
    },
    batchId: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);

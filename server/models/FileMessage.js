// server/models/FileMessage.js - File Message Model
import mongoose from 'mongoose';

const fileMessageSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'document', 'video', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  thumbnailUrl: String
}, {
  timestamps: true
});

const FileMessage = mongoose.model('FileMessage', fileMessageSchema);

export default FileMessage;
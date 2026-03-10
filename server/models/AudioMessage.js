// server/models/AudioMessage.js - Voice Note Extension
import mongoose from 'mongoose';

const audioMessageSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  mimeType: {
    type: String,
    default: 'audio/webm'
  },
  waveformData: {
    type: [Number], // Array of amplitude values for visualization
    default: []
  }
}, {
  timestamps: true
});

const AudioMessage = mongoose.model('AudioMessage', audioMessageSchema);

export default AudioMessage;
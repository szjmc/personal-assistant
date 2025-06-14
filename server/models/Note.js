const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: '未分类'
  },
  tags: [
    {
      type: String
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Note = mongoose.model('note', NoteSchema);    
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    elements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Element',
    }],
});

module.exports = mongoose.model('Board', boardSchema);
const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    leftUpCornerX: {
        type: String,
    },
    leftUpCornerY: {
        type: String,
    },
    rightDownCornerX: {
        type: String,
    },
    rightDownCornerY: {
        type: String,
    },
    owner: {
        type: String,
    },
    elementType: {
        type: String,
    },
    selectedColor: {
        type: String,
    },
    selectedTextColor: {
        type: String,
    },
    selectedElement: {
        type: String,
    },
    initialOffsetX: {
        type: String,
    },
    initialOffsetY: {
        type: String,
    },
    elementTextString: {
        type: String,
    },
    allowText: {
        type: String,
    },
    pointsArray: {
        type: String,
    },
    scalePenX: {
        type: String,
    },
    scalePenY: {
        type: String,
    },
    initialWidth: {
        type: String,
    },
    initialHeight: {
        type: String,
    },
    elementId: {
        type: String,
    }
});

module.exports = mongoose.model('Element', elementSchema);
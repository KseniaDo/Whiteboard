const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    LeftCornerX: {
        type: String,
    },
    LeftCornerY: {
        type: String,
    },
    RightCornerX: {
        type: String,
    },
    RightCornerY: {
        type: String,
    },
    owner: {
        type: String,
    },
    type: {
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
    offsetPenX: {
        type: String,
    },
    offsetPenY: {
        type: String,
    },
    textString: {
        type: String,
    },
    allowText: {
        type: String,
    },
    pointsPenArray: {
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
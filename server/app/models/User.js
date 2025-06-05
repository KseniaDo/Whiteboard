const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

userSchema.pre('save', async function(next) {
    const passSalt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, passSalt);
    next();
});

module.exports = mongoose.model('User', userSchema);
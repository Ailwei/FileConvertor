const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConvertFileSchema = new Schema({
    originalname: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    format: { type: String, required: true },
    uploadedDate: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    allocatedStorage: { type: Number, default: 0 },
    usedStorage: { type: Number, default: 0 }
});


const ConvertFile = mongoose.model('ConvertFile', ConvertFileSchema);

module.exports = {
    File: ConvertFile};

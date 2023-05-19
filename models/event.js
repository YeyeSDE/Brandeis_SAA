
// require mongoose
const mongoose = require('mongoose');

//define the event schema
const Schema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true }, 
    endDate: { type: Date, required: true },
    isOnline: { type: Boolean, required: false },
    registrationLink: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // attendees: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

});

//create the event model from the schema 
const Event = mongoose.model('Event', Schema);

//export the event model so it can be used elsewhere
module.exports = Event;
//require mongoose
const mongoose = require('mongoose');

//define the job schema
const jobSchema = new mongoose.Schema ({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    salary: { type: Number, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    postDate: { type: Date, default: Date.now },
    deadlineDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
});

//create the job model from the schema
const Job = mongoose.model('Job', jobSchema);

//export the job model so it can be used elsewhere 
module.exports = Job;
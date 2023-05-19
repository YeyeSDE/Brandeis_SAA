//require mongoose
const randToken = require("rand-token");
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

//define a user schema
const userSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    email:  { type: String, required: true},
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "alumi"], default: "student" },
    graduationYear: { type: Number, required: true },
    major: { type: String, required: true },
    job: { type: String },
    company: { type: String },
    city: { type: String },
    state: { type: String },
    county: { type: String },
    zipCode: { type: Number, min: [10000, "zipcode is too short!"], max: [99999, "zipcode is too long!"]},
    bio: { type: String },
    interests: [{ type: String }],
    isAdmin: { type: Boolean, default: false},
    apiToken: { type: String },
});

// Add the passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});

userSchema.pre("save", function (next) {
    let user = this;
    if (!user.apiToken) user.apiToken = randToken.generate(16);
    next();
  });

//create the user model from the schema 
module.exports = mongoose.model("User", userSchema);

//export the module so it can be used elsewhere
//module.exports = User;
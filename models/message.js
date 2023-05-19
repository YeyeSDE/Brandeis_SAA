// require mongoose for the model
const mongoose = require("mongoose");
// create the message schema through mongoose schema 
const messageSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },

        userName: {
            type: String,
            required: true,
        },

        // 'user' field: this will hold the unique identifier of the user who sent the message.
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
    },
    // require Mongoose timestamps, meaning Mongoose will keep tracking the data in database is created and changed.
    { timestamps: true }
);

// export the model, so it can be required and used in other files.
module.exports = mongoose.model("Message", messageSchema);
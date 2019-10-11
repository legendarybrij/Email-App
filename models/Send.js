var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var SendSchema = new Schema({
  // `title` is required and of type String
  from: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  message: {
    type: String,
    required: true
  },
  delete: {
    type: Boolean,
    required: true
  },
  time:{
    type: String
  }
});

// This creates our model from the above schema, using mongoose's model method
var Send = mongoose.model("Send", SendSchema);

// Export the Article model
module.exports = Send;

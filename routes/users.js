const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const url = process.env.MONGODB_ATLAS

mongoose.connect(url);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    dp: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

UserSchema.plugin(plm);

const User = mongoose.model("User", UserSchema);

module.exports = User;

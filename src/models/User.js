const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");
const { ROLES } = require("./enum");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    require:true, 
  },
  email: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
    min: 8,
  },
  role: {
    type: String,
    default: ROLES.USER,
  },
  full_name: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  dod: {
    type: String,
    default: null,
  },
  school: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  avatar: {
    type: String,
    default: null,
  },
  _status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: formatTimeUTC,
  },
  updatedAt: {
    type: Date,
    default: formatTimeUTC,
  },
});

userSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("users", userSchema);

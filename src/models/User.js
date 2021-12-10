const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");
const { ROLES } = require("./enum");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    require:[true,"Hãy điền Username !!"] 
  },
  email: {
    type: String,
    unique: true,
    require: [true,"Hãy điền Email !!"] 
  },
  password: {
    type: String,
    require: [true,"Hãy điền Password !!"],
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
    default: "https://res.cloudinary.com/dsy3fbzxg/image/upload/v1639069707/samples/avatar/39e426741c29f67274c8d23734f19aea_bm8bil.jpg",
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

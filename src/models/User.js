const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    require: true,
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
  isHidden: {
    type: Boolean,
    default: false,
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

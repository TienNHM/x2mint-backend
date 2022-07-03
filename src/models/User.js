const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");
const { ROLES, ACCOUNT_TYPES, STATUS, DEFAULT_VALUES } = require("./enum");

const userSchema = mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
    require: [true, "Hãy điền UserId !!"],
    default: 0,
  },
  username: {
    type: String,
    unique: true,
    require: [true, "Hãy điền Username !!"]
  },
  email: {
    type: String,
    unique: true,
    require: [true, "Hãy điền Email !!"]
  },
  password: {
    type: String,
    require: [true, "Hãy điền Password !!"],
    min: 8,
  },
  role: {
    type: String,
    default: ROLES.USER,
  },
  type: {
    type: String,
    default: ACCOUNT_TYPES.LITE,
  },
  full_name: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  dob: {
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
    default: DEFAULT_VALUES.AVATAR,
  },
  _status: {
    type: String,
    default: STATUS.OK
  },
  createdAt: {
    type: Date,
    default: new Date()//formatTimeUTC,
  },
  updatedAt: {
    type: Date,
    default: new Date()//formatTimeUTC,
  },
});

userSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("users", userSchema);

const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");
const { ROLES } = require("./enum");

const accountSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
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
  createdAt: {
    type: Date,
    default: formatTimeUTC,
  },
  updatedAt: {
    type: Date,
    default: formatTimeUTC,
  },
  status: {
    type: String,
  },
});

accountSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("accounts", accountSchema);

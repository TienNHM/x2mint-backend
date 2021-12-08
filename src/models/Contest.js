const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const contestSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    default: null,
  },
  description: {
    type: String,
    require: true,
    default: null,
  },
  startTime: {
    type: Date,
    default: formatTimeUTC,
  },

  endTime: {
    type: Date,
    default: formatTimeUTC,
  },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  tests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tests",
      default: null,
    },
  ],
  _status: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: formatTimeUTC,
  },
  updatedAt: {
    type: Date,
    default: formatTimeUTC,
  },
  embededMedia: 
    {
      type: String,
      default: null,
    },
  
});

contestSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("contests", contestSchema);

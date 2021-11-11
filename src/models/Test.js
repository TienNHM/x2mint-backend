const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const testSchema = mongoose.Schema({
    name: {
    type: String,
    require: true,
    default: 0,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
    default: null,
  },
  description: {
    type: String,
    require: true,
    default: null,
  },
  questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "questions",
      default: null,
  }],

  startTime: {
    type: Date,
    default: formatTimeUTC,
  },

  endTime: {
    type: Date,
    default: formatTimeUTC,
  },
  url: {
    type: String,
    default: null,
  },
//   status: {
//     type: String,
//     require: true,
//     default: null,
//   },
  duration: {
    type: Number,
    require: true,
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

testSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("tests", testSchema);

const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const testSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      default: 0,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      require: true,
      default: null,
    },
    pin: {
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
      default: new Date()//formatTimeUTC,
    },

    endTime: {
      type: Date,
      default: new Date()//formatTimeUTC,
    },
    url: {
      type: String,
      default: null,
    },
    maxPoints: {
      type: Number,
      default: null,
    },
    questionsOrder: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "questions",
      default: null,
    }],
    _status: {
      type: String,
      default: "",
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

testSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("tests", testSchema);

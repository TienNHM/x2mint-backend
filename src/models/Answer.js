const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const answerSchema = mongoose.Schema({
  answerId: {
    type: Number,
    require: true,
    default: 0,
  },
  name: {
    type: String,
    require: true,
    default: 0,
  },
  content: {
    type: String,
    require: true,
    default: null,
  },
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
    default: new Date()// formatTimeUTC,
  },
});

answerSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("answers", answerSchema);

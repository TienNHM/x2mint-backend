const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const questionSchema = mongoose.Schema({
  // order: {
  //   type: Number,
  //   require: true,
  //   default: 0,
  // },
  type: {
    type: String,
    require: true,
    default: null,
  },
  content: {
    type: String,
    require: true,
    default: null,
  },
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "answers",
      default: null,
    },
  ],
  correctAnswers: [
    {
      type: [String],
      default: null,
    },
  ],
  embededMedia: {
    type: String,
    default: null,
  },
  _status: {
    type: String,
  },
  maxPoints: {
    type: Number,
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

questionSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("questions", questionSchema);

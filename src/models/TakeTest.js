const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const takeTestSchema = mongoose.Schema({
  test: {
    type: mongoose.SchemaTypes.ObjectId,
    require: true,
    default: null,
    ref: "tests",
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    require: true,
    default: null,
    ref: "users",
  },
  startTime: {
    type: Date,
    default: formatTimeUTC,
  },
  endTime: {
    type: Date,
    default: formatTimeUTC,
  },
  chooseAnswers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questions",
        default: null,
      },
      answers: [String],
    },
  ],
  point: {
    type: Number,
    default: 0,
  },
  status: {
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

takeTestSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("take_test", takeTestSchema);

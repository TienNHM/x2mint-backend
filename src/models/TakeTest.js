const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const takeTestSchema = mongoose.Schema({
  takeTestId: {
    type: Number,
    require: true,
    default: 0,
  },
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
  submitTime: {
    type: Date,
    default: new Date()// formatTimeUTC,
  },
  questionsOrder: [String],
  chooseAnswers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questions",
        default: null,
      },
      answers: [String]
    },
  ],
  isCorrect: [Boolean],
  points: {
    type: Number,
    default: 0,
  },
  _status: {
    type: String,
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

takeTestSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model("take_test", takeTestSchema);

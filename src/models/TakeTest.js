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
  submitTime: {
    type: Date,
    default: formatTimeUTC,
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
  points: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
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

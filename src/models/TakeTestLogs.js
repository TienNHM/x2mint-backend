const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");

const takeTestLogsSchema = mongoose.Schema({
    logId: {
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
    takeTest: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        default: null,
        ref: "take_test",
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        default: null,
        ref: "users",
    },
    logs: [
        {
            time: {
                type: Date,
                default: new Date()//formatTimeUTC,
            },
            action: {
                type: String,
            }
        }
    ],
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

takeTestLogsSchema.method("toJSON", function () {
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});

module.exports = mongoose.model("take_test_logs", takeTestLogsSchema);

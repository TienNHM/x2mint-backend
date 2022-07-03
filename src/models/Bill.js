const mongoose = require("mongoose");
const { formatTimeUTC } = require("../utils/Timezone");
const { STATUS } = require("../models/enum");

const billSchema = mongoose.Schema({
    billId: {
        type: Number,
        default: 0,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "users",
    },
    amount: {
        type: Number,
        default: null,
    },
    _status: {
        type: String,
        default: STATUS.FAILED
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
});

billSchema.method("toJSON", function () {
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});

module.exports = mongoose.model("bills", billSchema);

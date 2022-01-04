const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES, STATUS } = require("../models/enum");
dotenv.config({ path: "./.env" });
const Bill = require("../models/Bill")

//@route GET v1/bills/
//@desc ADMIN get all bills
//@access private
//@role ADMIN
router.get("", verifyToken, async (req, res) => {
    try {
        //Check permission
        if (
            !(
                req.body.verifyAccount.role === ROLES.ADMIN
            )
        ) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const bills = await Bill.find().populate("user");
        if (bills) {
            res.json({
                success: true,
                message: "Get all bills successfully ",
                bills: bills,
            });
        } else {
            res.json({
                success: false,
                message: "Bills do not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route Test v1/bills/
//@desc Create a bill
//@access private
//@role admin/creator/user
router.post("", verifyToken, async (req, res) => {
    try {
        if (!req.body)
            res.status(400).json({
                success: false,
                message: "Body request not found",
            });

        //Create new contest
        let bill = new Bill({
            user: req.body.userId,
            amount: req.body.amount,
            _status: req.body._status
        });

        //Send to Database
        bill = await bill.save();


        res.json({
            success: true,
            message: "Bill created successfully",
            bill: bill,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;

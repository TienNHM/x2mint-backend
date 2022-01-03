const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sortObject } = require("../utils/SortObj")
const { datetimeFormat } = require("../utils/Timezone")
const { ACCOUNT_TYPES } = require("../models/enum");

router.post('/create_payment_url', function (req, res, next) {
    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var tmnCode = process.env.REACT_APP_VNP_TMNCODE;
    var secretKey = process.env.REACT_APP_VNP_HASHSECRET;
    var vnpUrl = process.env.REACT_APP_VNP_URL;
    var returnUrl = process.env.REACT_APP_CLIENT_URL + '/payments/vnpay_return';

    var date = new Date();

    var createDate = datetimeFormat(date, 'yyyymmddHHmmss');
    var orderId = datetimeFormat(date, 'HHmmss');
    var amount = req.body.amount;
    var bankCode = req.body.bankCode;
    var orderInfo = req.body.orderDescription;
    var orderType = req.body.orderType;
    var locale = req.body.language;
    if (locale === null || locale === '') {
        locale = 'vn';
    }
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Merchant'] = 'X2MINT'
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    // res.redirect(301, vnpUrl)
    res.json({
        success: true,
        message: "Redirect",
        vnpUrl: vnpUrl
    });
});

router.get('/vnpay_return', function(req, res, next) {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    var tmnCode = process.env.REACT_APP_VNP_TMNCODE;
    var secretKey = process.env.REACT_APP_VNP_HASHSECRET;

    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        var orderId = vnp_Params['vnp_TxnRef'];
        var rspCode = vnp_Params['vnp_ResponseCode'];

        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.json({
            success: true,
            message: "Success",
            orderId: orderId,
            code: rspCode,
            userId: vnp_Params['vnp_OrderInfo']
        })
    } else {
        res.json({
            success: false,
            message: "Invalid sign",
            code: '97'
        })
    }
});

router.get('/vnpay_ipn', function(req, res, next) {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var secretKey = process.env.REACT_APP_VNP_HASHSECRET;
    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        var orderId = vnp_Params['vnp_TxnRef'];
        var rspCode = vnp_Params['vnp_ResponseCode'];
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi

        res.status(200).json({
            RspCode: '00',
            Message: 'success'
        })
    }
    else {
        res.status(200).json({
            RspCode: '97',
            Message: 'Fail checksum'
        })
    }
});

module.exports = router;
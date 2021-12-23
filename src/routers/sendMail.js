const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const {OAuth2} = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    SENDER_EMAIL_ADDRESS
} = process.env

const oauth2Client = new OAuth2(
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
)

// send mail
const sendEmail = (kind, full_name, name, to, url, txt) => {
    oauth2Client.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })

    const accessToken = oauth2Client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL_ADDRESS,
            clientId: MAILING_SERVICE_CLIENT_ID,
            clientSecret: MAILING_SERVICE_CLIENT_SECRET,
            refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
            accessToken
        }
    })

    const mailOptions_verify = {
        from: SENDER_EMAIL_ADDRESS,
        to: to,
        subject: "X2M!NT XIN CHÀO",
        html: `
            <div style="max-width: 700px; padding: 30px 30px; margin:auto; border: 2px solid #5fa509; border-radius: 10px; font-size: 110%;">
            <h1 style="text-align: center; color: #5fa509;">
            CHÀO MỪNG @${name} ĐẾN VỚI X2M!NT</h1>

            <h3> Hãy bấm nút bên dưới để xác thực Email của bạn nhé !!</h3>            
            <a href=${url} style="background:#5fa509; border-radius:30px; text-decoration: none; color: white; padding: 10px 20px; display: inline-block;">${txt}</a>
            </div>
        `
    }
    const mailOptions_resetPassword = {
        from: SENDER_EMAIL_ADDRESS,
        to: to,
        subject: "THAY ĐỔI MẬT KHẨU X2M!NT",
        html: `
            <div style="max-width: 700px; padding: 30px 30px; margin:auto; border: 2px solid #5fa509; border-radius: 10px; font-size: 110%;">
            <h1 style="text-align: center; color: #5fa509;">
            THAY ĐỔI MẬT KHẨU X2M!NT CỦA @${name}</h1>

            <h3> Hãy bấm nút bên dưới để cập nhật mật khẩu của của bạn nhé !!</h3>            
            <a href=${url} style="background:#5fa509; border-radius:30px; text-decoration: none; color: white; padding: 10px 20px; display: inline-block;">${txt}</a>
            </div>
        `
    }
    const mailOptions_creatAccountByEmail = {
        from: SENDER_EMAIL_ADDRESS,
        to: to,
        subject: "TẠO TÀI KHOẢN BẰNG GMAIL THÀNH CÔNG",
        html: `
            <div style="max-width: 700px; padding: 30px 30px; margin:auto; border: 2px solid #5fa509; border-radius: 10px; font-size: 110%;">
            <h1 style="text-align: center; color: #5fa509;">
            THÔNG TIN ĐĂNG NHẬP X2M!NT CỦA ${full_name}</h1>

            <h4>Username: ${name} </h4>
            <h4>Password: ${url} </h4>
            <h3> Trở lại trang đăng nhập !!</h3>            
            <a href="${process.env.REACT_APP_CLIENT_URL}/login" style="background:#5fa509; border-radius:30px; text-decoration: none; color: white; padding: 10px 20px; display: inline-block;">${txt}</a>
            </div>
        `
    }

    if (kind == 'verify'){
        smtpTransport.sendMail(mailOptions_verify, function(err, data) {
            if(err) {
                return err
                console.log("Error:" + err)
            }
            else {
                console.log("Email sent successfully")
            }
            
        })
    } else if (kind == 'reset') {
        smtpTransport.sendMail(mailOptions_resetPassword, function(err, data) {
            if(err) {
                return err
                console.log("Error:" + err)
            }
            else {
                console.log("Email sent successfully")
            }
            
        })
    } else if (kind == 'password') {
        smtpTransport.sendMail(mailOptions_creatAccountByEmail, function(err, data) {
            if(err) {
                return err
                console.log("Error:" + err)
            }
            else {
                console.log("Email sent successfully")
            }
            
        })
    }
}

module.exports = sendEmail;
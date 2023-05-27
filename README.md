# X2M!NT API

[![](https://img.shields.io/badge/API-Documentation-brightgreen)](https://documenter.getpostman.com/view/13444000/UVJeEbgb)

## Cấu trúc thư mục

<details>
  <summary>Xem chi tiết</summary>
  
```
x2mint-backend
│   .gitignore
│   index.js
│   package-lock.json
│   package.json
│   Procfile
│   README.md
├───.vscode
│       settings.json
└───src
    ├───middleware
    │       requireAuth.js
    ├───models
    │       Account.js
    │       Answer.js
    │       Bill.js
    │       Contest.js
    │       enum.js
    │       Question.js
    │       TakeTest.js
    │       TakeTestLogs.js
    │       Test.js
    │       User.js
    ├───routers
    │       adminRoutes.js
    │       answerRoutes.js
    │       authRoutes.js
    │       billRoutes.js
    │       contestRoutes.js
    │       paymentRoutes.js
    │       questionRoutes.js
    │       sendMail.js
    │       takeTestRoutes.js
    │       testRoutes.js
    │       userRoutes.js
    └───utils
            SortObj.js
            Timezone.js
```
</details>

## Hướng dẫn cài đặt

- Bước 1: Clone project

```
git clone https://github.com/x2mint/x2mint-backend.git
```

- Bước 2: Install

Tại thư mục `x2mint-backend`, mở terminal và gõ lệnh:

```
npm install
```

Hoặc:
```
yarn install
```

- Bước 3: Thêm file `.env` chứa thông tin các biến môi trường:

| Tên biến | Mô tả |
| :--- | :--- |
| DB_URL | Connection string kết nối cơ sở dữ liệu MongoDB. |
| REACT_APP_SECRET_HASH_KEY | Hash key bí mật |
| REACT_APP_ACCESS_TOKEN_SECRET | Token bí mật |
| REACT_APP_ACTIVATION_TOKEN_SECRET | Token kích hoạt |
| REACT_APP_GOOGLE_CLIENT_ID | Google Client ID, đăng ký vào tạo mới project. Xem hướng dẫn chi tiết [tại đây](https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a#:~:text=Step%201%3A%20Creating%20a%20Google%20Project). |
| REACT_APP_GOOGLE_SECRET_KEY | Key bí mật của ứng dụng Google. |
| REACT_APP_MAILING_SERVICE_CLIENT_ID | Google Client ID dùng cho việc gửi mail. |
| REACT_APP_MAILING_SERVICE_CLIENT_SECRET | Key bí mật của ứng dụng Google dùng cho việc gửi mail. |
| REACT_APP_MAILING_SERVICE_REFRESH_TOKEN | Refresh token. |
| REACT_APP_SENDER_EMAIL_ADDRESS | Tài khoản email của ứng dụng, dùng cho việc gửi mail thông báo đến người dùng. |
| REACT_APP_VNP_TMNCODE | VNPay `tmnCode`, hướng dẫn chi tiết về tạo tài khoản thanh toán VNPay xem [tại đây](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/). |
| REACT_APP_VNP_HASHSECRET| Mã `hashSecret` của VNPay. |
| REACT_APP_VNP_URL | Endpoint gọi API thanh toán của VNPay, mặc định là: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`. |
| REACT_APP_VNP_EMAIL | Email tài khoản VNPay. |
| REACT_APP_CLIENT_URL | Link domain của website, VD: `http://x2mint.vercel.app`. Lưu ý: không có dấu `/` ở cuối URL. |
| REACT_APP_API_ROOT | App root endpoint, VD: `http://api-x2mint.herokuapp.com/app/api/v1`. |

- Bước 4: Khởi chạy

Mặc định, server sẽ chạy tại cổng `5005`. Mở terminal và chạy lệnh sau:
```
npm run server
```

**Kết quả:**

```
> backend@1.0.0 server
> nodemon index

[nodemon] 2.0.15
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node index index.js`
Express server listening on port 5005 in development mode
 Mongoose connected 
```

## Hướng dẫn deploy lên Heroku

- Bước 1: Tạo tài khoản Heroku [tại đây](https://signup.heroku.com/login). Sau đó, tải và cài đặt Heroku CLI theo hướng dẫn [tại đây](https://devcenter.heroku.com/articles/heroku-cli).
- Bước 2: Tạo file `Procfile` tại thư mục gốc của project. Lưu ý file trên không có phần mở rộng file. Mở file lên và thêm vào nội dung như sau:

```
web: npm run server
```

Sau đó, push code lên master của Github repo.
- Bước 3: Tạo mới một ứng dụng trên Heroku (`<app_name>`) theo link [này](https://dashboard.heroku.com/new-app).
  + Bước 3.1: Đặt tên ứng dụng, sau đó bấm `Create app`.
  + Bước 3.2: Tại mục `Deployment method`, chọn Github để import. Lưu ý, tài khoản phải được kết nối với Github trước đó.
  + Bước 3.3: Nhập tên Github repo, bấm tìm kiếm. Repo tương ứng hiện ra thì chọn `Connect` để kết nối.
  + Bước 3.4: Bấm `Deploy branch` để bắt đầu deploy. Chờ quá trình deploy diễn ra thành công và thông báo `Your app was successfully deployed`.
- Bước 4: Thêm biến môi trường cho ứng dụng.
  + Bước 4.1: Tại thư mục gốc của project, mở terminal và chạy lệnh sau: `heroku plugins:install heroku-config`. Lưu ý: Bắt buộc đã cài đặt [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) trước đó.
  + Bước 4.2: Cập nhật biến môi trường cho ứng dụng Heroku:
  
```
heroku config:push -a <app_name>
```

Trong đó, `<app_name>` là tên ứng dụng trên Heroku. Ví dụ:
```
heroku config:push -a api-x2mint
```
- Bước 5: Deploy lại ứng dụng.

## Contributors

[![](https://avatars.githubusercontent.com/u/33385777?v=4&s=80)](https://github.com/TienNHM)
[![](https://avatars.githubusercontent.com/u/58748687?v=4&s=80)](https://github.com/timomint)

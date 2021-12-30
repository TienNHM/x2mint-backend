const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/requireAuth");
const { OAuth2Client } = require("google-auth-library");
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
dotenv.config({ path: "./.env" });
const client = new OAuth2Client(process.env.MAILING_SERVICE_CLIENT_ID);
const sendMail = require('./sendMail');
const generator = require('generate-password');
const genUsername = require("unique-username-generator");

const googleAuth = async (token) => {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: [process.env.GOOGLE_CLIENT_ID],
	});
	return ticket.getPayload();
};


//@route GET v1/auth/register
//@desc Register User
//@access public
//@role any
router.post("/register", async (req, res) => {

  const { username, email, password } = req.body;
  try {
    //Check for existing username
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      // check already account
      if (user.username === username)
        return res
          .json({ success: false, message: "username" });
      else if (user.email === email) {
        return res
          .json({ success: false, message: "email" });
      }
    }
    //Hash Password
    const hashedPassword = await argon2.hash(password,process.env.SECRET_HASH_KEY);
    const newUser = new User({
      //create account with username, email and password
      username: req.body.username, 
      email: req.body.email, 
      password:hashedPassword,
      role: req.body.role
    });
    
    // return activation_token
    const activation_token = jwt.sign({newUser},
      process.env.REACT_APP_ACTIVATION_TOKEN_SECRET,
      {expiresIn: '5m'}
    ); 
    //send request verify email
    const url = `${process.env.REACT_APP_CLIENT_URL}/activation/${activation_token}`
    sendMail('verify', '', username, email, url, "Xác thực tài khoản")
    return res.json({success: true, message: "verify"});

	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Internal server error" });
	}
});

// Activate Email
router.post("/activation", async (req, res) => {
	try {
		const { activation_token } = req.body
		//console.log(activation_token)
		//console.log(jwt.verify(process.env.REACT_APP_ACTIVATION_TOKEN_SECRET))
		const decode = jwt.verify(activation_token, process.env.REACT_APP_ACTIVATION_TOKEN_SECRET)
		const user = decode.newUser
		const { username, password, email,
			full_name,
			phone,
			address,
			school,
			role } = user
		const check = await User.findOne({ email })
		if (check) return res.json({ success: false, message: "already" })
		const newUser = new User({
			username,
			email,
			password,
			full_name,
			phone,
			address,
			school,
			role
		})
		await newUser.save()      //console.log(newUser)

		res.json({ success: true, message: "success" })

	} catch (err) {
		//console.log(err.message)
		return res.status(500).json({ msg: err.message })
	}
})

// Forgot Password
router.post("/forgotPassword", async (req, res) => {
	try {
		const { email } = req.body
		const user = await User.findOne({ email })
		if (!user) return res.status(400).json({ msg: "This email does not exist." })
		const access_token = jwt.sign({ id: user._id },
			process.env.REACT_APP_ACCESS_TOKEN_SECRET,
			{ expiresIn: '5m' }
		);
		const url = `${process.env.REACT_APP_CLIENT_URL}/resetPassword/${access_token}`
		//console.log(url)
		sendMail('reset', user.username, email, url, "Reset your password")
		res.json({ msg: "Re-send the password, please check your email." })
	} catch (err) {
		return res.status(500).json({ msg: err.message })
	}
});

//Reset Password
router.post("/resetPassword", async (req, res) => {
	try {
		const { password, token } = req.body

		const hashedPassword = await argon2.hash(password, process.env.SECRET_HASH_KEY);
		const user = jwt.verify(token, process.env.REACT_APP_ACCESS_TOKEN_SECRET)

		await User.findOneAndUpdate({ _id: user.id }, {
			password: hashedPassword
		})
		res.json({ success: true, msg: "Password successfully changed!" })
	} catch (err) {
		return res.status(500).json({ msg: err.message })
	}
})


// @route POST v1/auth/login
// @desc Login user by username and password
// @access Public
router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	//simple validation
	try {
		//check for existing username
		const user = await User.findOne({ username });
		if (!user)
			return res
				.json({ success: false, message: "incorrect" });
		// Username found
		
		const passwordValid = await argon2.verify(user.password, password);
		if (!passwordValid)
			return res
				.json({ success: false, message: "password" });

		//All good
		//return token
		const accessToken = jwt.sign(
			{
				verifyAccount: {
					id: user._id,
					username: user.username,
					role: user.role,
				},
			}, process.env.REACT_APP_ACCESS_TOKEN_SECRET
		);
		res.json({
			accessToken: accessToken,
			user: user,
			success: true,
			message: "login"
		})


	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

router.get("/getInfor", async (req, res) => {
	try {
		const user = await User.findById(req.user.username).select('-password')
		res.json(user)

	} catch (err) {
		return res.status(500).json({ msg: err.message })
	}
}
)

// Login GG
router.post("/loginViaGoogle", async (req, res) => {
	try {
		const { tokenId } = req.body
		const verify = await client.verifyIdToken({ idToken: tokenId, audience: process.env.MAILING_SERVICE_CLIENT_ID })
		//console.log(verify)
		const { email_verified, email, name, picture } = verify.payload
		// const password = email + process.env.GOOGLE_SECRET
		// console.log(verify.payload)

		if (!email_verified) return res.json({ success: false, message: "email" })
		const user = await User.findOne({ email: email })
		// console.log('user', user)
		if (user) {
			//console.log(user)
			//return token
			const accessToken = jwt.sign(
				{
					verifyAccount: {
						id: user._id,
						username: user.username,
						role: user.role,
					},
				}, process.env.REACT_APP_ACCESS_TOKEN_SECRET
			);
			res.json({
				accessToken: accessToken,
				user: user,
				success: true,
				message: "login"
			})
		}
		// Tạo tài khoản mới !!
		else {
			const username = genUsername.generateFromEmail(email, 3);
			const password = generator.generate({
				length: 10,
				numbers: true
			});
			const passwordHash = await argon2.hash(password, process.env.SECRET_HASH_KEY);
			// console.log(username, passwordHash);
			const newUser = new User({
				username: username, 
				full_name: name, 
				email: email, 
				password: passwordHash, 
				avatar: picture
			})
			await newUser.save()
			sendMail('password', name, username, email, password, "Xác thực tài khoản")
			//return token
			const accessToken = jwt.sign(
				{
					verifyAccount: {
						id: user._id,
						username: user.username,
						role: user.role,
					},
				}, process.env.REACT_APP_ACCESS_TOKEN_SECRET
			);
			//console.log(accessToken)
			res.json({
				accessToken: accessToken,
				user: user,
				success: true,
				message: "loginGoogle"
			})
		}
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

//Login with  google api
router.post("/login/google", verifyToken, async (req, res, next) => {
	try {
		const { authorization } = req.headers;
		if (!authorization) {
			return res.status(401).json({
				message: "Access token not found",
			});
		}
		
		const token = authorization;
		const user = await googleAuth(token);
		const snapshot = await Account.findOne({
			email: user.email,
		});
		if (!snapshot) {
			//New account
			let newAccount = new Account({
				email: user.email,
			});
			newAccount = await newAccount.save();
			let newUser = new User({
				fullName: user.name,
				image: user.picture,
				account: newAccount._id,
			});
			newUser = await newUser.save();
			if (!newUser) {
				return res.status(500).json({
					message: "Cannot create user",
					success: false,
				});
			} else {
				return res.status(200).json({
					message: "Create user successfully",
					success: true,
					user: newUser,
					accessToken: token,
				});
			}
		} else {
			if (!snapshot.isHidden) {
				if (snapshot.username === null && snapshot.password === null)
					return res.status(200).json({
						message: "User login",
						success: true,
						user: snapshot,
						accessToken: req.headers.authorization,
					});
				else {
					return res.status(400).json({
						message: "This account have used with username and password",
						success: false,
					});
				}
			} else {
				res.status(403).json({
					message: "Your account is blocked",
					success: false,
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal server error",
			success: false,
		});
	}
});

router.get("/verify", verifyToken, async (req, res) => {
  try {
    return res.status(200).json({
      message: "Token is valid",
      success: true,
      user: req.body.verifyAccount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal error server",
    });
  }
	try {
		return res.status(200).json({
			message: "Token is valid",
			success: true,
			user: req.body.verifyAccount,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Internal error server",
		});
	}
});



router.get("/", verifyToken, async (req, res) => {
	try {
		const user = await User.findById(req.body.verifyAccount.id).select(
			"-password"
		);
		if (!user)
			return res
				.status(400)
				.json({ success: false, message: "User not found" });
		res.json({ success: true, user });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

module.exports = router;

const jwt = require('jsonwebtoken')


<<<<<<< HEAD
const auth = (req, res, next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(400).json({msg: "Invalid Authentication."})
=======
const googleAuth = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [process.env.GOOGLE_CLIENT_ID],
  });

  return ticket.getPayload();
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access token not found" });

  try {
    //Try with token from google

    const user = await googleAuth(token);

    let userMap = await User.findOne({ email: user.email });
>>>>>>> 7b891f300d631237695fe0f3b1a014f5cd43f26c

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(400).json({msg: "Invalid Authentication."})

            req.user = user
            next()
        })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = auth
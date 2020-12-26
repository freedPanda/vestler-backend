/** Routes for authentication. */

const User = require("../models/users");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/createToken");

router.post("/login", async function(req, res, next) {
  try {
    const user = await User.authenticate(req.body);
    const token = createToken(user);
    let userInfo = {'username':user.username,'photo':user.photo,
      'firstname':user.firstname,'lastname':user.lastname,
      'email':user.email};
    return res.json({ loginData:{token:token,user:userInfo}});
  } catch (e) {
    return next(e);
  }
});


module.exports = router;
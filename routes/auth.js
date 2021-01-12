/** Routes for authentication. */

const User = require("../models/users");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/createToken");

/**
 * LOGIN ROUTE
 */

router.post("/login", async function(req, res, next) {
  try {
    //authenticate user
    const user = await User.authenticate(req.body);

    //create a token
    const token = createToken(user);
    let userInfo = {'username':user.username,'photo':user.photo,
      'firstname':user.firstname,'lastname':user.lastname,
      'email':user.email};
    
      //return user info
    return res.json({ loginData:{token:token,user:userInfo}});
  } catch (e) {
    return next(e);
  }
});


module.exports = router;
const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
const JWT_SECRET='Surajisagoodb$oy';
var fetchuser=require('../middleware/fetchuser');
// Route2 Create a user using:POST"/api/auth/" .Doesnt require Auth

router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "password must be at list 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //if there are errors,return bad request and then errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check wether users exit already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ errors: "User with email already exits" });
      }
      const salt = await bcrypt.genSalt(10); //genratet the salt
      const secPass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      //.then(user=>res.json(user))
      //.catch(err=>{console.log(err)
      //res.json({error:'Please enter a unique value ',message:err.message})})
      const data={
         user:{
            id:user.id
         }
      }
      const authtoken=jwt.sign(data,JWT_SECRET);
    res.json({authtoken})
 
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

//Route2 Authenticate a User using POST "/api/auth/login" no login required
router.post(
  "/login",
  [
    
    body("email", "Enter a valid Email").isEmail(),
   body('password','Enter a correct Password').exists(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password}=req.body;
    try {
      let user= await User.findOne({email});
      if(!user){
        return res.status(400).json({errors:'Please try to login with correct credentials'});
      }
      const passwordcompare = await bcrypt.compare(password,user.password);
      if(!passwordcompare){
        return res.status(400).json({errors:'Please try to login with correct credentials'});
      }

      const data={
        user:{
          id:user.id
        }
      }
      const authtoken=jwt.sign(data,JWT_SECRET);
      res.json({authtoken})
    }  catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  });

  //Route3 Get loggedin User Details using: POST "/api/auth/getuser"  login required
  router.post(
    "/getuser",fetchuser,
  async (req, res) => {
try {
  userId=req.user.id;
  const user =await User.findById(userId).select("-password")
  res.send(user)
}  catch (error) {
  console.error(error.message);
  res.status(500).send("Some Error occured");
}
    })
module.exports = router

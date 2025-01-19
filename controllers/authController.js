const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/user')

router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, username, email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(400).json({ error: 'Error registering user', details: err });
    }
  });

 

router.post('/login', async (req, res) => {
    try{
        //1. Check if user exists
        const user = await User.findOne({email: req.body.email});
        if(!user){
            return res.send({
                message: 'User does not exist',
                success: false
            })
        }

        //2. check if the password is correct
        const isvalid = await bcrypt.compare(req.body.password, user.password);
        if(!isvalid){
            return res.send({
                message: 'invalid password',
                success: false
            })
        }

        //3. If the user exists & password is correct, assign a JWT
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.send({
            message: 'user logged-in successfully',
            success: true,
            token: token
        });

    }catch(error){
        res.send({
            message: error.message,
            success: false
        })
    }
});
module.exports = router;
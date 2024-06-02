
require("dotenv").config();
const User = require('../models/userDetails.model');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Joi = require('joi');



exports.registerUser = async (req, res) => {

    console.log(req.body);

    const schema = Joi.object({
        first_name: Joi.string().required().label("first_name"),
        last_name: Joi.string().required().label("last_name"),
        email: Joi.string().email().required().label("email"),
        password: Joi.string().min(6).required().label("password"),
        confirmpassword: Joi.string().min(6).required().label(`confirmpassword Confirm Password`),
    });

    try {
        await schema.validateAsync(req.body);
        const { first_name, last_name, email, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            return res.status(400).json({
                errorCode: 101,
                status: false,
                returnMessage: 'Password and confirm password do not match'
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                errorCode: 102,
                status: false,
                returnMessage: 'Email already exists'
            });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const addUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword
        })

        if (!addUser) {
            return res.status(500).json({
                errorCode: 500,
                status: false,
                message: 'User not registered'
            });
        }
        else {
            return res.status(201).json({
                errorCode: 201,
                status: true,
                returnMessage: 'User registered successfully'
            });
        }
    } catch (err) {
        return res.status(500).json({
            errorCode: 500,
            status: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};


exports.signIn = async (req, res, next) => {
    console.log(req.body);
    const schema = Joi.object({
        email: Joi.string().email().required().label("email"),
        password: Joi.string().min(6).required().label("password"),
    });

    try {
        await schema.validateAsync(req.body);

        const { email, password } = req.body;

        const userExist = await User.findOne({ email: email });

        // console.log(userExist)
        if (!userExist) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        else {
            const comparedPass = await bcrypt.compare(password, userExist.password);

            if (comparedPass) {

                console.log("process.env.JWT_SECRET == ", process.env.JWT_SECRET);
                const token = jwt.sign(
                    { id: userExist._id, email: userExist.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '10m' }
                );

                return res.status(200).json({
                    token: token,
                    user: {
                        id: userExist._id,
                        email: userExist.email
                    }
                });
            }
            else {
                return res.status(401).json({
                    message: "Invalid Password"
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            errorCode: 500,
            status: false,
            message: error.message
        });
    }
};


exports.userDetails = async (req, res) => {

    try {
        const { body } = req;
        const query = {};
        
        if(body.email) {
            query.email = body.email;
        }
        if(body.first_name) {
            query.first_name = body.first_name;
        }
        const user = await User.find(query).select('_id first_name last_name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            errorCode: 200,
            status: true,
            message: `User Details List`,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            errorCode: 500,
            status: false,
            message: error.message
        });
    }
}
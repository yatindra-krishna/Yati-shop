import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import {comparePassword, hashPassword} from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { compare } from "bcrypt";

//POST Regiter
const registerController=async(req,res)=>{
    try {
        const {name,email,password,phone,address,answer}= req.body;

        if(!name){return res.send({message:'Name is Required'})}
        if(!email){return res.send({message:'Email is Required'})}
        if(!password){return res.send({message:'Password is Required'})}
        if(!phone){return res.send({message:'Phone is Required'})}
        if(!address){return res.send({message:'Address is Required'})}
        if(!answer){return res.send({message:'Answer is Required'})}

        //existing user
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:"Already Register please login",
            })
        }

        //registeruser
        const hashedPassword=await hashPassword(password);

        const user= await new userModel({name,email,phone,address,password:hashedPassword,answer}).save();

        res.status(201).send({
            success:true,
            message:"User Register Successfully",
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in Registration',
            error
        })
    }
}

//POST Login
const loginController=async(req,res)=>{
       try {
            const {email,password}=req.body;
            if(!email||!password)
            {
                return res.status(404).send({
                    success:false,
                    message:"Ivalid email or password"
                })
            }
            //check user
            const user=await userModel.findOne({email});
            if(!user){
                return res.status(404).send({
                    succes:false,
                    message:"Email is not register"
                })
            }

            const match=await comparePassword(password,user.password);
            if(!match)
            {
                return res.status(200).send({
                    succes:false,
                    message:"Invalid password"
                })
            }

            const token= await JWT.sign({_id:user._id}, process.env.JWT_SECRET,{
               expiresIn:"7d",
            });
            res.status(200).send({
                success:true,
                message:"login Successfully",
                user:{
                    name:user.name,
                    email:user.email,
                    phone:user.phone,
                    address:user.address,
                    role: user.role,
                },
                token
            })
             

       } catch (error) {
           console.log(error);
           res.status(500).send({
            succes:false,
            message:"Error in login",
            error
           })
       }
}

const forgotPasswordController=async(req,res)=>{
     try {
        const {email,answer,newpassword}=req.body;
        if(!email){res.status(400).send({message:"Email is required"})}
        if(!answer){res.status(400).send({message:"answer is required"})}
        if(!newpassword){res.status(400).send({message:"newpassword is required"})}
        //check
        const user=await userModel.findOne({email,answer});
        //validation
        if(!user)
        {
            return res.status(404).send({
                success:false,
                message:"wrong email or answer"
            })
        }
        const hashed=await hashPassword(newpassword);
        await userModel.findByIdAndUpdate(user._id,{password:hashed});
        res.status(200).send({
            success:true,
            message:"Password Reset Successfully"
        })
     } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"somthing went wrong",
            error
        })
     }
}

const testController=(req,res)=>{
     res.send("reponse sended by test");
}

//update profile
const updateProfileController=async(req,res)=>{
    try {
        const {name,email,password,address,phone}=req.body
        const user=await userModel.findById(req.user._id);
        //password
        if(password && password.length<6){
            return res.json({error:"Password is required and 6 character long"})
        }
        const hashedPassword=password ? await hashPassword(password) : undefined
        const updatedUser=await userModel.findByIdAndUpdate(req.user._id,{
           name:name || user.name,
           password: hashedPassword || user.password,
           phone: phone || user.phone,
           address: address || user.address,
        },{new:true});

        res.status(200).send({
            success:true,
            message:"Profile Updated Successfully",
            updatedUser,
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
          success:true,
          message:"Error in Updating User Profile",
          error
        })
    }
}

//orders
const getOrderController=async(req,res)=>{
    try {
         const orders=await orderModel.find({buyer:req.user._id}).populate("product","-photo").populate("buyer","name")
         res.json(orders);  
    } catch (error) {
       console.log(error);
       res.status(500).send({
           success:false,
           message:'Error while getting orders',
           error
       })
    }
}


//all orders
const getAllOrderController=async(req,res)=>{
    try {
         const orders=await orderModel.find({}).populate("product","-photo").populate("buyer","name").sort({createdAt:"-1"}) ;
         res.json(orders);  
    } catch (error) {
       console.log(error);
       res.status(500).send({
           success:false,
           message:'Error while getting All orders',
           error
       })
    }
}

//status update
const orderStatusController=async(req,res)=>{
     try {
        const {orderId}=req.params
        const {status}=req.body
        const orders=await orderModel.findByIdAndUpdate(orderId,{status},{new:true});
        res.json(orders)
     } catch (error) {
       console.log(error);
       res.status(500).send({
           success:false,
           message:'Error while updating status orders',
           error
       })
     }
}

export {registerController,loginController,testController,forgotPasswordController,updateProfileController,getOrderController,getAllOrderController,orderStatusController} ;
import express from "express";
import { registerController, loginController,testController, forgotPasswordController, updateProfileController, getOrderController, getAllOrderController, orderStatusController } from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router= express.Router();

//routing
router.post('/register',registerController);

router.post('/login',loginController);

router.get('/test',requireSignIn,isAdmin,testController);

//forgot password
router.post('/forgot-password',forgotPasswordController);

//protected route auth
router.get("/user-auth",requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
});

//protect route admin
router.get("/admin-auth",requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
});

//update profile
router.put('/profile',requireSignIn,updateProfileController)
//order
router.get('/orders',requireSignIn,getOrderController);
//all order
router.get('/all-orders',requireSignIn,isAdmin,getAllOrderController);
//status update
router.put('/order-status/:orderId',requireSignIn,isAdmin,orderStatusController)
export default router;
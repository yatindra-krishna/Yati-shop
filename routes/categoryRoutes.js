import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from "../controllers/categoryController.js";

const router=express.Router();

//routes
//create Category
router.post('/create-category',requireSignIn,isAdmin,createCategoryController);
//Update Category
router.put('/update-category/:_id',requireSignIn,isAdmin,updateCategoryController);
//get All category
router.get('/get-category',categoryController);
//get single category
router.get('/single-category/:slug',singleCategoryController);
//delete category
router.delete('/delete-category/:_id',requireSignIn,isAdmin,deleteCategoryController);


export default router;
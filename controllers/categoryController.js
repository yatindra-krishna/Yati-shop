import categoryModels from "../models/categoryModels.js";
import slugify from "slugify";
export const createCategoryController=async(req,res)=>{
    try {
        const {name}=req.body
        if(!name){
          return  res.status(404).send({message:"Name is Required"})
        }
        const existingCategory=await categoryModels.findOne({name});
        if(existingCategory)
        {
            return res.status(200).send({
                success:true,
                message:"category already exisits"
            });
        }
        const category=await new categoryModels({name,slug:slugify(name)}).save();
        res.status(201).send({
            success:true,
            message:"new category Created",
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Cate"
        })
    }
}

//update category
export const updateCategoryController=async(req,res)=>{
     try {
        const {name}=req.body
        const {_id}=req.params
        const category=await categoryModels.findByIdAndUpdate(_id,{name,slug:slugify(name)},{new:true})
        res.status(200).send({
            success:true,
            message:'category Updated Successfully',
            category,
        })
     } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error while updating category"
        })
     }
}

//get All category
export const categoryController=async(req,res)=>{
    try {
        const category=await categoryModels.find({});
        res.status(200).send({
            success:true,
            message:"All category list",
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error while getting All category"
        });
    }
}

// get Single Category
export const singleCategoryController=async(req,res)=>{
    try {
        // const {slug}=req.params
        const category = await categoryModels.findOne({slug:req.params.slug});
        res.status(200).send({
            success:true,
            message:"get single category successfully",
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error while getting Single category"
        });
    }
}

//delete category
export const deleteCategoryController=async(req,res)=>{
         try {
            const {_id}=req.params
            await categoryModels.findByIdAndDelete(_id);
            res.status(200).send({
                success:true,
                message:"category Deleted Successfully",
            })
         } catch (error) {
            console.log(error);
            res.status(500).send({
            success:false,
            error,
            message:"Error while deleting category"
            });
         }
}
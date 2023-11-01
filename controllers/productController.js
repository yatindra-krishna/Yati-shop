import slugify from "slugify";
import productModel from "../models/productModel.js"
import categoryModels from "../models/categoryModels.js"
import orderModels from "../models/orderModel.js"
import fs from "fs";
import dotenv from "dotenv";
import braintree from "braintree";

dotenv.config()
//payment Gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });

export const createProductController=async(req,res)=>{
    try {
         const {name,slug,description,price,category,quantity,shipping}=req.fields
         const {photo}=req.files

         switch(true)
         {
            case !name: return res.status(500).send({error:"Name is required"})
            case !description: return res.status(500).send({error:"Description is required"})
            case !price: return res.status(500).send({error:"Price is required"})
            case !category: return res.status(500).send({error:"category is required"})
            case !quantity: return res.status(500).send({error:"Quantity is required"})
            case photo && photo.size>1000000: return res.status(500).send({error:"photo is required and less than 1mb"})
           
        }
         
        const product=new productModel({...req.fields,slug:slugify(name)});
        if(photo){
            product.photo.data=fs.readFileSync(photo.path);
            product.photo.contentType=photo.type;
        }
        await product.save();
        res.status(201).send({
            success:true,
            message: "Product Created Successfully",
            product,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in creating Product"
        })
    }
}

//get all product
export const getProductController=async(req,res)=>{
      try {
        const product=await productModel.find({}).populate('category').select("-photo").limit(12).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            counTotal:product.length,
            message:"All Products",
            product,
        })
      } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in getting all Product"
        })
      }
}


//get Single Product
export const getSingleProductController=async(req,res)=>{
    try {
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate('category');
        res.status(200).send({
            success:true,
            message:'Single product Fetch',
            product,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in getting single Product"
        })
    }
}

//get photo
export const productPhotoController=async(req,res)=>{
      try {
        const product =await productModel.findById(req.params.pid).select("photo");
        if(product.photo.data){
             res.set('Content-type',product.photo.contentType);
             return res.status(200).send(product.photo.data);
        }
      } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in getting Photo"
        })
      }
}

//delete product
export const deleteProductController=async(req,res)=>{
      try {
           await productModel.findByIdAndDelete(req.params.pid).select("-photo")
           res.status(200).send({
            success:true,
            message:'Product Deleted successfully'
           })
      } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in deleting product"
        })
      }
}

//upadte product
export const updateProductController=async(req,res)=>{
    try {
        const {name,slug,description,price,category,quantity,shipping}=req.fields
        const {photo}=req.files

        switch(true)
        {
           case !name: return res.status(500).send({error:"Name is required"})
           case !description: return res.status(500).send({error:"Description is required"})
           case !price: return res.status(500).send({error:"Price is required"})
           case !category: return res.status(500).send({error:"category is required"})
           case !quantity: return res.status(500).send({error:"Quantity is required"})
           case photo && photo.size>1000000: return res.status(500).send({error:"photo is required and less than 1mb"})
          
       }
        
       const product=await productModel.findByIdAndUpdate(req.params.pid,
        {
            ...req.fields,slug:slugify(name)
        },{new:true})
       if(photo){
           product.photo.data=fs.readFileSync(photo.path);
           product.photo.contentType=photo.type;
       }
       await product.save();
       res.status(201).send({
           success:true,
           message: "Product Created Successfully",
           product,
       })
   } catch (error) {
       console.log(error);
       res.status(500).send({
           success:false,
           error:error.message,
           message:"Error in creating Product"
       })
   }
}

//filter product
export const productFilterController=async(req,res)=>{
      try {
             const {checked,radio}=req.body
             let arg={};
             if(checked.length>0) arg.category=checked;
             if(radio.length) arg.price={$gte:radio[0], $lte:radio[1]};
             const product=await productModel.find(arg);
             res.status(200).send({
                success:true,
                product,
             })
      } catch (error) {
        console.log(error);
       res.status(400).send({
           success:false,
           error,
           message:"Error in filtering product Product"
       })
      }
}

//product Count 
export const productCountController=async(req,res)=>{
    try {
         const total=await productModel.find({}).estimatedDocumentCount()
         res.status(200).send({
            success:true,
            total,
         })
    } catch (error) {
       console.log(error);
       res.status(400).send({
           success:false,
           error,
           message:"Error in Count Product"
       })
    }
}

//product list base on page
export const productListController=async(req,res)=>{
    try {
        const perpage=6;
        const page=req.params.page? req.params.page:1;
        const product=await productModel.find({}).select("-photo").skip((page-1)*perpage).limit(perpage).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            product,
        })
    } catch (error) {
        console.log(error);
       res.status(400).send({
           success:false,
           error,
           message:"Error in per page ctrl"
       })
    }
}


//Search product controller
export const searchProductController=async(req,res)=>{
    try {
        const {keyword}=req.params;
        const results =await productModel.find({
            $or:[
                {name:{$regex:keyword,$options:"i"}},
                {description:{$regex:keyword,$options:"i"}},
            ]
        }).select("-photo"); 
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success:false,
            error,
            message:"Error in Search product"
        })
    }
}

//similar products
export const relatedProductController=async(req,res)=>{
    try {
        const {pid,cid}=req.params
        const product=await productModel.find({
            category:cid,
            _id:{$ne:pid}
        }).select("-photo").limit(3).populate("category")
        res.status(200).send({
            success:true,
            product,
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success:false,
            error,
            message:"Error in getting related product"
        })
    }
}

//categories wise Product
export const productCategoryController=async(req,res)=>{
    try {
      
        const category= await categoryModels.find({slug:req.params.slug})
        const products=await productModel.find({category}).select("-photo").populate('category');
      
        res.status(200).send({
            success:true,
            products,
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success:false,
            error,
            message:"Error in getting category product"
        })
    }
}

//payment gateway api
//token
export const braintreeTokenController=async(req,res)=>{
     try {
        gateway.clientToken.generate({},function(err,response){
            if(err)
            {
                res.status(500).send(err);
            }else{
                res.status(200).send(response);
            }
        })
     } catch (error) {
        console.log(error);
     }
}

//payment
export const braintreePaymentController=async(req,res)=>{
   try {
       const {cart,nonce}=req.body;
       let total=0;
       cart.map((i)=>{
        total += i.price; 
       })
       let newTransaction=gateway.transaction.sale({
        amount:total,
        paymentMethodNonce:nonce,
        options:{
            submitForSettlement:true
        },
       },
       function(error,result){
         if(result)
         {
            const order=new orderModels({
                product:cart,
                payment:result,
                buyer:req.user._id
            }).save()
            res.json({ok:true})
         }else{
            res.status(500).send(error);
         }
       }
       )
   } catch (error) {
       console.log(error);
   }
}


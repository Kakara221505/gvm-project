const path = require("path");
const fs = require("fs");
const Brand = require("../models/Brand");
const messages = require("../utils/messages");

async function addBrand(req, res, next) {
  try {
      const { name } = req.body;
      const userId = req.user.id;

      // Check if the brand name already exists in the database
      const existingBrand = await Brand.findOne({ name: name });
      if (existingBrand) {
          return res.status(400).json({
            status:messages.error.STATUS,
            message: messages.error.BR,
          });
      }

      // Handle optional brand image
      let brandImage = null;
      if (req.file) {
          const imagePath = process.env.BRAND_IMAGE_PATH;
          brandImage = `${imagePath}${req.file.filename}`;
      }

      // Create new brand entry
      const newBrand = new Brand({
          name,
          brandImage,
          userId
      });

      await newBrand.save();

      res.status(201).json({
        status:messages.success.STATUS,
        message: messages.success.BRAND_ADDED,
          data: {
              _id: newBrand._id,
              name: newBrand.name,
              brandImage: brandImage || "",
              userId: newBrand.userId
          }
      });
  } catch (error) {
      next(error);
  }
}

async function getAllBrands(req, res, next) {
  try {
    const baseUrl = `http://localhost:3005`;
    const brands = await Brand.find();
    const Path = process.env.BRAND_IMAGE_ROUTE;
    const updatedBrands = brands.map((brand) => ({
      _id: brand._id,
      name: brand.name,
      brandImage: `${baseUrl}${Path}${path.basename(brand.brandImage)}`,
    }));

    res.status(200).json({status:messages.success.STATUS,message:messages.success.BRAND_FETCHED ,data: updatedBrands });
  } catch (error) {
    next(error);
  }
}
async function getBrandById(req, res, next) {
    try {
      const { id } = req.params;
  
      // Find the brand by ID
      const brand = await Brand.findById(id);
      if (!brand) {
        return res.status(404).json({
          status:messages.success.STATUS,
          message: messages.error.BRAND_NOT_FOUND,
          data: []
        });
      }
  
      // Construct brand image URL
      const baseUrl = `http://localhost:3005/`;
      const brandImagePath = process.env.BRAND_IMAGE_ROUTE 
      const brandImage = brand.brandImage
        ? `${baseUrl}${brandImagePath}${path.basename(brand.brandImage)}`
        : "";
  
      res.status(200).json({
        status:messages.success.STATUS,
        message:messages.success.BRAND_FETCHED,
        data: {
          _id: brand._id,
          name: brand.name,
          brandImage
        }
      });
    } catch (error) {
      next(error);
    }
  }
  async function deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
  
      // Find the brand by ID
      const brand = await Brand.findById(id);
      if (!brand) {
        return res.status(404).json({ message: messages.error.BRAND_NOT_FOUND });
      }
  
      // Extract and delete the image if it exists
      if (brand.brandImage) {
        const brandImagePath = process.env.BRAND_IMAGE_PATH ;
        const fullImagePath = path.join(__dirname, "..", brandImagePath, path.basename(brand.brandImage));
  
        if (fs.existsSync(fullImagePath)) {
          fs.unlinkSync(fullImagePath);
        }
      }
  
      // Delete brand from database
      await Brand.findByIdAndDelete(id);
  
      res.status(200).json({ status:messages.success.STATUS,message: messages.success.BRAND_DELETED });
    } catch (error) {
      next(error);
    }
  }
async function deleteBrandImage(req, res, next) {
  try {
    const { id } = req.params;

    // Find the brand by ID
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message:messages.error.BRAND_NOT_FOUND });
    }

    // Extract the image filename
    const imagePath = brand.brandImage; 
    if (!imagePath) {
      return res.status(400).json({ message: messages.error.BRAND_IMAGE_NOT_FOUND });
    }

    const fullImagePath = path.join(__dirname, "..", imagePath); // Construct absolute path

    // Remove the image file if it exists
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
    }

    // Update brand to remove the image reference
    brand.brandImage = "";
    await brand.save();

    res.status(200).json({ status:messages.success.STATUS,message: messages.success.BRAND_IMAGE_DELETED });
  } catch (error) {
    next(error);
  }
}
async function getBrandsByUser(req, res, next) {
  try {
    const userId = req.params.id; // Extract userId from URL

    console.log("User ID from middleware:", userId);

    // Fetch brands related to the user
    const brands = await Brand.find({ userId });

    if (!brands.length) {
      return res.status(404).json({
        // success: false,
        message: messages.error.BRAND_NOT_FOUND,
        data: [],
      });
    }

    // Base URL for accessing images
    const baseUrl =  "http://localhost:3005/"; 
    const brandImagePath = process.env.BRAND_IMAGE_ROUTE 

    // Prepare response data
    const responseData = brands.map((brand) => ({
      _id: brand._id,
      name: brand.name,
      brandImage: brand.brandImage
        ? `${baseUrl}${brandImagePath}${path.basename(brand.brandImage)}`
        : '',
      userId: brand.userId,
    }));

    res.status(200).json({
      status:messages.success.STATUS,
      message: messages.success.BRAND_FETCHED,
      data: responseData,
    });
  } catch (error) {
   
    next(error);
  }
}
async function updateBrand(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
// console.log("Brand ID:", id);
// return
    // Find existing brand
    const brand = await Brand.findOne({ _id: id });

    if (!brand) {
      return res.status(404).json({ message:messages.error.BRAND_NOT_FOUND });
    }

    // Update name if provided
    if (name) {
      brand.name = name;
    }

    // Handle brand image update if a new image is uploaded
    if (req.file) {
      const newImage = req.file.filename;
      const brandImagePath = process.env.BRAND_IMAGE_PATH;

      // Delete old image if it exists
      if (brand.brandImage) {
        const oldImagePath = path.join(brandImagePath, brand.brandImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image
      brand.brandImage = newImage;
    }

    await brand.save();
    res.status(200).json({
      status:messages.success.STATUS,
      message: messages.success.BRAND_UPDATED,
      data: {
      name: brand.name,
      brandImage: brand.brandImage ? path.basename(brand.brandImage) : "",
      userId: brand.userId,
      },
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  addBrand,
  getAllBrands,
  deleteBrand,
  deleteBrandImage,
  getBrandById,
  getBrandsByUser,
  updateBrand,
};

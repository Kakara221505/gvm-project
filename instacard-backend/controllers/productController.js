const ProductModel = require('../models/Product'); 
const ProductMediaModel = require('../models/ProductMedia'); 
const VariationModel = require('../models/Variation')
const BrandModel = require('../models/Brand');
const CategoryModel = require('../models/Category');
const SubCategoryModel = require('../models/SubCategory');
const messages = require('../utils/messages');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


function convertToObjectId(id) {
    return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

// Add or Update Product
async function addUpdateProductDetail(req, res, next) {
    let {
        UserID,
        id,
        Name,
        BrandID,            
        CategoryID, 
        SubCategoryID,
        Model_number,       
        Model_series,
        Description,
        Price,
        Sale_price,
        Is_price,
        Is_price_range,
        Min_price,
        Max_price,
        Quantity,
        Status,
        Is_available,
        Is_featured,
        Is_exclusive,
        Is_new_arrival,
        Is_best_seller,
        Color,
        seller_id,          
        Warranty_period,
        ProductMedia,
        MediaIDsToRemove,
        VariationIDsToRemove

    } = req.body;

    let user = req.user;
    const userID = UserID || user.ID;

    try {

 // Convert IDs to ObjectId
 const userID = convertToObjectId(UserID);
 const brandID = convertToObjectId(BrandID);
 const categoryID = convertToObjectId(CategoryID);
 const sellerID = convertToObjectId(seller_id);
 if (!userID || !brandID || !categoryID || !sellerID) {
     return res.status(400).json({ message: "Invalid ID format", status: false });
 }


        const productMedia = req.body.ProductMedia || [];
        const imageFiles = req.files || [];
        const productMediaWithImages = [];

        const productMainImageFiles = imageFiles.find(file => file.fieldname === 'ProductMainImage');

        // Iterate through the productMedia array and associate images with colors
        for (let i = 0; i < productMedia.length; i++) {
            const color = productMedia[i].color || null;
            // const image = imageFiles[i] || null;
            const images = [];

            for (let j = 0; j < imageFiles.length; j++) {
                if (imageFiles[j].fieldname === `ProductMedia[${i}][images]`) {
                    images.push(imageFiles[j]);
                }
            }
            if (color !== null || images.length > 0) {
                const mediaData = {
                    color: color,
                    images: images,
                };
                productMediaWithImages.push(mediaData);
            }
        }

        if (!id) {
            // Create new product
            const productDetails = await ProductModel.create({
                UserID,
                Name,
                BrandID,            
                CategoryID,  
                SubCategoryID,      
                Model_number,
                Model_series,
                Description,
                Price,
                Sale_price,
                Is_price,
                Is_price_range,
                Min_price,
                Max_price,
                Quantity,
                Status,
                Is_available,
                Is_featured,
                Is_exclusive,
                Is_new_arrival,
                Is_best_seller,
                Color,
                seller_id,        
                Warranty_period,
                
              
            });
 // Create ProductMedia entries

 if (productMediaWithImages) {
    productMediaWithImages.forEach(async (media) => {
        // Create a Variation for each color
        const variation = await VariationModel.create({
            ProductID: productDetails._id,
            Type: "Color",
            Value: media.color,
    
        });

        // Create ProductMedia for each image
        const productMedia = media.images.map(async (file) => {
            const mediaType = file.mimetype.includes('image') ? 'image' : 'video';

            const productMediaEntry = {
                ProductID: productDetails._id,
                VariationID: variation._id,
                Media_url: `${process.env.PRODUCT_MEDIA_ROUTE}${file.filename}`,
                Media_type: mediaType,
                Is_main_media: false,
                     };

            // Save the new ProductMedia to the database
            await ProductMediaModel.create(productMediaEntry);

            return productMediaEntry;
        });
    });
}

if (productMainImageFiles) {
    // Create newProductMainImage entry (if applicable) 
    const productMainImage = {
        ProductID: productDetails._id,
        Media_url: `${process.env.PRODUCT_MEDIA_ROUTE}${productMainImageFiles.filename}`,
        Media_type: 'image',
        Is_main_media: true,
    };
    // Save the new ProductMedia to the database
    await ProductMediaModel.create(productMainImage);
}

return res.status(200).json({ message: messages.success.PRODUCT_CREATED, status: messages.success.STATUS });

        } else {
            // Update existing product
            const existingProductDetails = await ProductModel.findById(id);
            if (!existingProductDetails) {
                return res.status(404).json({
                    message: messages.error.PRODUCT_NOT_FOUND,
                    status: messages.error.STATUS,
                });
            }

            // Update the fields received in the request for ProductDetails
            existingProductDetails.Name = Name;
            existingProductDetails.BrandID = BrandID;            
            existingProductDetails.CategoryID = CategoryID;  
            existingProductDetails.SubCategoryID = SubCategoryID;    
            existingProductDetails.Model_number = Model_number;
            existingProductDetails.Model_series = Model_series;
            existingProductDetails.Description = Description;
         
             // Update Price and Sale_price based on Is_price
             if (existingProductDetails.Is_price === true) {
                existingProductDetails.Price = Price || 0;
                existingProductDetails.Sale_price = Sale_price || 0;
            } 
            
            // Update Min_price and Max_price based on Is_price_range
            if (existingProductDetails.Is_price_range === true) {
                existingProductDetails.Min_price = Min_price || 0;
                existingProductDetails.Max_price = Max_price || 0;
            }
            existingProductDetails.Is_price = Is_price;
            existingProductDetails.Is_price_range = Is_price_range;
            existingProductDetails.Quantity = Quantity;
            existingProductDetails.Status = Status;
            existingProductDetails.Is_available = Is_available;
            existingProductDetails.Is_featured = Is_featured;
            existingProductDetails.Is_exclusive = Is_exclusive;
            existingProductDetails.Is_new_arrival = Is_new_arrival;
            existingProductDetails.Is_best_seller = Is_best_seller;
            existingProductDetails.Color = Color;
            existingProductDetails.seller_id = seller_id;       
            existingProductDetails.Warranty_period = Warranty_period;
            existingProductDetails.Updated_at = Date.now();

             // Save the updated record
             await existingProductDetails.save();

             // Remove media
             if (MediaIDsToRemove) {
                const parsedMediaIDsToRemove = JSON.parse(MediaIDsToRemove);
            
                // Convert each media ID to ObjectId
                for (const mediaId of parsedMediaIDsToRemove) {
                    const objectId = convertToObjectId(mediaId);
                    if (objectId) {
                        await ProductMediaModel.deleteOne({ _id: objectId });
                    }
                }
            }
            
            if (VariationIDsToRemove) {
                const parsedVariationIDsToRemove = JSON.parse(VariationIDsToRemove);
            
                // Convert each variation ID to ObjectId
                for (const variationId of parsedVariationIDsToRemove) {
                    const objectId = convertToObjectId(variationId);
                    if (objectId) {
                        // Delete the associated ProductMedia entries
                        await ProductMediaModel.deleteMany({ VariationID: objectId });
                        // Delete the variation itself
                        await VariationModel.deleteOne({ _id: objectId });
                    }
                }
            }
            
 
             if (productMediaWithImages) {
                 productMediaWithImages.forEach(async (media) => {
                     // Check if the variation already exists
                     let variation = await VariationModel.findOne({
                         where: {
                             ProductID: id,
                             Type: "Color",
                             Value: media.color,
                         }
                     });

                     if (!variation) {
                         // Create a Variation for each color if it doesn't exist
                         variation = await VariationModel.create({
                             ProductID: id,
                             Type: "Color",
                             Value: media.color,
                         });
                     }
 
                     // Create ProductMedia for each image
                     const productMedia = media.images.map(async (file) => {
                         const mediaType = file.mimetype.includes('image') ? 'image' : 'video';
 
                         const productMediaEntry = {
                             ProductID: id,
                             VariationID: variation.ID,
                             Media_url: `${process.env.PRODUCT_MEDIA_ROUTE}${file.filename}`,
                             Media_type: mediaType,
                             Is_main_media: false,
                         };
 
                         // Save the new ProductMedia to the database
                         await ProductMediaModel.create(productMediaEntry);
 
                         return productMediaEntry;
                     });
                 });
             }
 
             // Update ProductMainImage entries
             if (productMainImageFiles) {
                 const productImageData = await ProductMediaModel.findOne({ where: { ProductID: id, Is_main_media: true } });
                 const updatedMediaUrl = `${process.env.PRODUCT_MEDIA_ROUTE}${productMainImageFiles.filename}`;
 
                 if (productImageData) {
                     productImageData.Media_url = updatedMediaUrl;
                     await productImageData.save();
                 } else {
                     // If ProductMedia doesn't exist, create a new one
                     await ProductMediaModel.create({
                         ProductID: id,
                         Media_url: updatedMediaUrl,
                         Media_type: 'image',
                         Is_main_media: true,
                     });
                 }
             }
 
             return res.status(200).json({ message: messages.success.PRODUCT_UPDATE, status: messages.success.STATUS });
         }
 
     } catch (error) {
         return next(error);
     }
 }

// Get Arrival product list
async function getNewArrivalProducts(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get top 5 newly added Product details'
    try {
        const limit = 5; // Fetch only the top 5 records
        const productData = await ProductModel.find({})
            .select('ID Name Price Sale_price Created_at') // Selecting specific fields
            .sort({ Created_at: -1 }) // Sorting by Created_at in descending order
            .limit(limit); // Limiting the number of products

        // Get main media URLs for each product using mapping
        const productIds = productData.map(product => product._id);
        const productMediaData = await ProductMediaModel.find({
            ProductID: { $in: productIds },
            Is_main_media: true
        })
            .select('ProductID Media_url'); // Select only the necessary fields

        // Map main media URLs to the corresponding products
        const productDetails = productData.map(product => {
            const mainMedia = productMediaData.find(media => media.ProductID.toString() === product._id.toString());

            // Convert Decimal128 to regular number using `toString()` or `valueOf()`
            const price = product.Price ? parseFloat(product.Price.toString()) : 0;
            const salePrice = product.Sale_price ? parseFloat(product.Sale_price.toString()) : 0;

            if (mainMedia) {
                mainMedia.Media_url = `${process.env.BASE_URL}${mainMedia.Media_url}`;
            }

            return {
                ...product.toObject(),
                Price: price,           // Price as a number
                Sale_price: salePrice,  // Sale_price as a number
                Media_url: mainMedia ? mainMedia.Media_url : null
            };
        });

        return res.status(200).json({
            data: productDetails,
            status: messages.success.STATUS,
        });
    } catch (error) {
        return next(error);
    }
}


// Delete a Product by ID
async function deleteProductDetail(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Delete Product details by UserID'
    const { id } = req.params;
    try {
        const product = await ProductModel.findById(id); // Fetch the product details by ID
        if (!product) {
            return res.status(404).json({ message: messages.error.PRODUCT_NOT_FOUND, status: messages.error.STATUS });
        }

        // Delete all variations related to the product
        await VariationModel.deleteMany({ ProductID: id });

        // Find all media records related to the product
        const mediaRecords = await ProductMediaModel.find({ ProductID: id });

        // Delete all media records related to the product
        await ProductMediaModel.deleteMany({ ProductID: id });

        // Delete the product
        await ProductModel.deleteOne({ _id: id });

        // Delete the media files
        for (const mediaRecord of mediaRecords) {
            const fileName = path.basename(mediaRecord.Media_url);
            const outputFilePath = path.join(process.env.PRODUCT_MEDIA_PATH, fileName);
            // Delete the media file if it exists
            if (fs.existsSync(outputFilePath)) {
                fs.unlinkSync(outputFilePath);
                console.log("Media file deleted:", outputFilePath);
            } else {
                console.log("Media file does not exist:", outputFilePath);
            }
        }

        return res.status(200).json({ message: messages.success.PRODUCT_DELETED, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}

// Get product details by userID
async function getProductDetailById(req, res, next) {
    try {
        const { id } = req.params;

        // Fetch product details
        const product = await ProductModel.findById(id)
            .select('-Created_at -Created_by -Updated_at -Updated_by')
            .lean();

        if (!product) {
            return res.status(404).json({ message: messages.error.PRODUCT_NOT_FOUND, status: messages.error.STATUS });
        }

        // Convert Decimal128 values to JavaScript numbers
        product.Price = product.Price ? parseFloat(product.Price) : null;
        product.Sale_price = product.Sale_price ? parseFloat(product.Sale_price) : null;
        product.Min_price = product.Min_price ? parseFloat(product.Min_price) : null;
        product.Max_price = product.Max_price ? parseFloat(product.Max_price) : null;

        // Fetch product media
        const productMedia = await ProductMediaModel.find({ ProductID: id })
            .select('VariationID Media_url Is_main_media Media_type ID')
            .lean();

        const mainMedia = productMedia.find(media => media.Is_main_media === true);
        const otherMedias = productMedia.filter(media => media.Is_main_media === false);

        // Fetch variations
        const variations = await VariationModel.find({ ProductID: id })
            .select('ID Type Value')
            .lean();

        const formattedMainMedia = mainMedia
            ? `${process.env.BASE_URL}${mainMedia.Media_url}`
            : null;

        // Format variations with their respective media
        const formattedOtherMedias = variations.map(variation => {
            const filteredMedias = otherMedias.filter(media => String(media.VariationID) === String(variation.ID));
            const media_urls = filteredMedias.map(media => ({
                ID: media.ID,
                Media_url: `${process.env.BASE_URL}${media.Media_url}`,
            }));

            return {
                ...variation,
                Media_urls: media_urls,
            };
        });

        return res.status(200).json({
            data: {
                ...product,
                MainMedia: formattedMainMedia,
                Variations: formattedOtherMedias
            },
            status: messages.success.STATUS
        });

    } catch (error) {
        return next(error);
    }
}

// Get All product list
async function getProductDetailsWithPagination(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get Product details with pagination'
    try {
        // Extract query params
        const { page = 1, limit, search = '', status } = req.query;

        // Ensure proper pagination and limit setup
        const skip = (page - 1) * (limit ? parseInt(limit, 10) : 0);

        // Create match conditions for the search and status
        const matchConditions = {};
        if (search) {
            matchConditions.Name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        if (status) {
            matchConditions.Status = status;
        }

        // Aggregate the query to fetch product details with pagination
        const productData = await ProductModel.aggregate([
            {
                $match: matchConditions // Match products based on search and status
            },
            {
                $skip: skip // Pagination: Skip based on current page
            },
            {
                $limit: limit ? parseInt(limit, 10) : 0 // Limit the number of results based on the provided limit
            },
            {
                $sort: { _id: -1 } // Sort by _id in descending order
            },
            {
                $lookup: {
                    from: 'ProductMedia', // Reference to ProductMedia collection
                    localField: '_id', // Reference to Product's _id
                    foreignField: 'ProductID', // Foreign key to ProductID in ProductMedia collection
                    as: 'media'
                }
            },
            {
                $unwind: {
                    path: '$media', // Unwind the 'media' array
                    preserveNullAndEmptyArrays: true // Allow products with no media
                }
            },
            {
                // Optional: Filter media if 'Is_main_media' is true
                $match: { 'media.Is_main_media': true } // Make sure we only include products with 'Is_main_media' set to true
            },
            {
                $lookup: {
                    from: 'brands', // Reference to Brands collection
                    localField: 'BrandID', // Reference to Product's BrandID
                    foreignField: '_id', // Foreign key to _id in Brands collection
                    as: 'brand'
                }
            },
            {
                $unwind: {
                    path: '$brand', // Unwind the 'brand' array to extract the brand
                    preserveNullAndEmptyArrays: true // Allow products without a brand
                }
            },
            {
                $project: {
                    _id: 1,
                    Name: 1,
                    Price: { $toDouble: "$Price" }, // Convert Decimal128 to float
                    Sale_price: { $toDouble: "$Sale_price" }, // Convert Decimal128 to float
                    Is_price: 1,
                    Is_price_range: 1,
                    Min_price: { $toDouble: "$Min_price" }, // Convert Decimal128 to float
                    Max_price: { $toDouble: "$Max_price" }, // Convert Decimal128 to float
                    Quantity: 1,
                    Status: 1,
                    Is_available: 1,
                    BrandName: { $ifNull: ['$brand.name', 'Unknown'] }, // Corrected to use 'name' field for brand name
                    Media_url: {
                        $cond: {
                            if: { $eq: [{ $type: '$media.Media_url' }, 'string'] },
                            then: { $concat: [process.env.BASE_URL, '$media.Media_url'] },
                            else: null
                        }
                    }
                }
            },
            {
                // Remove duplicate products based on the _id
                $group: {
                    _id: '$_id',
                    Name: { $first: '$Name' },
                    Price: { $first: '$Price' },
                    Sale_price: { $first: '$Sale_price' },
                    Is_price: { $first: '$Is_price' },
                    Is_price_range: { $first: '$Is_price_range' },
                    Min_price: { $first: '$Min_price' },
                    Max_price: { $first: '$Max_price' },
                    Quantity: { $first: '$Quantity' },
                    Status: { $first: '$Status' },
                    Is_available: { $first: '$Is_available' },
                    BrandName: { $first: '$BrandName' },
                    Media_url: { $first: '$Media_url' }
                }
            }
        ]);

        // Count the total number of records matching the search conditions
        const totalCount = await ProductModel.countDocuments(matchConditions);

        const totalPages = limit ? Math.ceil(totalCount / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({
            data: productData,
            totalPages,
            status: 'success',
            currentPage,
            totalRecords: totalCount
        });
    } catch (error) {
        console.error("Error in getProductDetailsWithPagination:", error);
        return next(error);
    }
}



async function getProductList(req, res, next) {
    try {
        const {
            Page = 1,
            Limit = 10,
            CategoryIDs,
            SubCategoryIDs,
            BrandIDs,
        } = req.body;

        const offset = (Page - 1) * Limit;

        const matchQuery = {};

        if (CategoryIDs && Array.isArray(CategoryIDs) && CategoryIDs.length > 0) {
            matchQuery.CategoryID = { $in: CategoryIDs.map(id => new mongoose.Types.ObjectId(id)) };
        }

        if (SubCategoryIDs && Array.isArray(SubCategoryIDs) && SubCategoryIDs.length > 0) {
            matchQuery.SubCategoryID = { $in: SubCategoryIDs.map(id => new mongoose.Types.ObjectId(id)) };
        }

        if (BrandIDs && Array.isArray(BrandIDs) && BrandIDs.length > 0) {
            matchQuery.BrandID = { $in: BrandIDs.map(id => new mongoose.Types.ObjectId(id)) };
        }

        const products = await ProductModel.aggregate([
            { $match: matchQuery },
        
            // Lookup for Category Name
            {
                $lookup: {
                    from: 'Category',
                    localField: 'CategoryID',
                    foreignField: '_id',
                    as: 'CategoryInfo'
                }
            },
            {
                $addFields: {
                    CategoryName: { $ifNull: [{ $arrayElemAt: ['$CategoryInfo.Name', 0] }, null] }
                }
            },
        
            // Lookup for Brand Name
            {
                $lookup: {
                    from: 'brands',
                    localField: 'BrandID',
                    foreignField: '_id',
                    as: 'BrandInfo'
                }
            },
            {
                $addFields: {
                    BrandName: { $ifNull: [{ $arrayElemAt: ['$BrandInfo.name', 0] }, null] }
                }
            },
        
            // Lookup for SubCategory Name
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'SubCategoryID',
                    foreignField: '_id',
                    as: 'SubCategoryInfo'
                }
            },
            {
                $addFields: {
                    SubCategoryName: { $ifNull: [{ $arrayElemAt: ['$SubCategoryInfo.SubCategoryName', 0] }, null] }
                }
            },
        
            // Lookup for ProductMedia
            {
                $lookup: {
                    from: 'ProductMedia',
                    localField: '_id',
                    foreignField: 'ProductID',
                    as: 'ProductMedia'
                }
            },
        
            // Separate main and sub images and concatenate base URL
            {
                $addFields: {
                    MainImage: {
                        $concat: [
                            process.env.BASE_URL,
                            {
                                $ifNull: [
                                    {
                                        $arrayElemAt: [
                                            {
                                                $map: {
                                                    input: {
                                                        $filter: {
                                                            input: '$ProductMedia',
                                                            as: 'media',
                                                            cond: { $eq: ['$$media.Is_main_media', true] }
                                                        }
                                                    },
                                                    as: 'media',
                                                    in: '$$media.Media_url'
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    ''
                                ]
                            }
                        ]
                    },
                    SubImages: {
                        $map: {
                            input: {
                                $filter: {
                                    input: '$ProductMedia',
                                    as: 'media',
                                    cond: { $eq: ['$$media.Is_main_media', false] }
                                }
                            },
                            as: 'media',
                            in: { $concat: [process.env.BASE_URL, '$$media.Media_url'] }
                        }
                    }
                }
            },
        
            // Add pagination
            { $skip: offset },
            { $limit: Limit },
        
            // Format the output
            {
                $project: {
                    _id: 1,
                    UserID: 1,
                    Name: 1,
                    Model_number: 1,
                    Model_series: 1,
                    Description: 1,
                    Price: 1,
                    Sale_price: 1,
                    Is_price: 1,
                    Is_price_range: 1,
                    Min_price: 1,
                    Max_price: 1,
                    Quantity: 1,
                    Status: 1,
                    Is_available: 1,
                    Is_featured: 1,
                    Is_new_arrival: 1,
                    Is_exclusive: 1,
                    Is_best_seller: 1,
                    Color: 1,
                    seller_id: 1,
                    Warranty_period: 1,
                    Created_at: 1,
                    Updated_at: 1,
                    CategoryName: 1,
                    BrandName: 1,
                    SubCategoryName: 1,
                    MainImage: 1,
                    SubImages: 1,
                    BrandID: 1,  // Adding BrandID to the response
                    CategoryID: 1,  // Adding CategoryID to the response
                    SubCategoryID: 1  // Adding SubCategoryID to the response
                }
            }
        ]);
        

        // Step 2: Clean up the response
        const modifiedProducts = products.map(product => ({
            _id: product._id,
            UserID: product.UserID,
            Name: product.Name,
            Model_number: product.Model_number,
            Model_series: product.Model_series,
            Description: product.Description,
            Price: parseFloat(product.Price || 0),
            Sale_price: parseFloat(product.Sale_price || 0),
            Is_price: product.Is_price,
            Is_price_range: product.Is_price_range,
            Min_price: parseFloat(product.Min_price || 0),
            Max_price: parseFloat(product.Max_price || 0),
            Quantity: product.Quantity,
            Status: product.Status,
            Is_available: product.Is_available,
            Is_featured: product.Is_featured,
            Is_new_arrival: product.Is_new_arrival,
            Is_exclusive: product.Is_exclusive,
            Is_best_seller: product.Is_best_seller,
            Color: product.Color,
            seller_id: product.seller_id,
            Warranty_period: product.Warranty_period,
            Created_at: product.Created_at,
            Updated_at: product.Updated_at,
            CategoryName: product.CategoryName || null,
            BrandName: product.BrandName || null,
            SubCategoryName: product.SubCategoryName || null,
            MainImage: product.MainImage || null,
            SubImages: product.SubImages || [],
            BrandID: product.BrandID,  // Including BrandID in the final response
            CategoryID: product.CategoryID,  // Including CategoryID in the final response
            SubCategoryID: product.SubCategoryID  // Including SubCategoryID in the final response
        }));

        // Step 3: Get total product count
        const totalProducts = await ProductModel.countDocuments(matchQuery);

        // Step 4: Calculate pagination
        const totalPages = Math.ceil(totalProducts / Limit);

        // Step 5: Return response
        return res.status(200).json({
            data: modifiedProducts,
            totalPages,
            currentPage: parseInt(Page, 10),
            totalRecords: totalProducts,
            status: 'success',
        });

    } catch (error) {
        return next(error);
    }
}




// Controller to get the list of unique brands based on Category and SubCategory
async function getBrandListByCategorySubCategory(req, res, next) {
    try {
        const {
            CategoryID,
            SubCategoryID,
            Page = 1,
            Limit = 10,
        } = req.body;

        const offset = (Page - 1) * Limit;

        // Validate if CategoryID and SubCategoryID are provided
        if (!CategoryID || !SubCategoryID) {
            return res.status(400).json({ error: 'CategoryID and SubCategoryID are required' });
        }

        // Check if the Category and SubCategory exist
        const category = await CategoryModel.findById(CategoryID);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const subCategory = await SubCategoryModel.findById(SubCategoryID);
        if (!subCategory) {
            return res.status(404).json({ error: 'SubCategory not found' });
        }

        // Fetch products that match the given CategoryID and SubCategoryID
        const products = await ProductModel.find({
            CategoryID,
            SubCategoryID,
            Status: 'Published', // Ensuring we only get published products
        })
        .skip(offset)
        .limit(Limit)
        .populate('BrandID', 'name brandImage'); // Populating Brand details

        // Extract unique brand names and their IDs from the products
        const brandList = products.map(product => {
            // Check if BrandID is populated and has the necessary properties
            if (product.BrandID) {
                return {
                    brandId: product.BrandID._id, // BrandID
                    brandName: product.BrandID.name, // Brand name
                };
            }
            return null;
        }).filter(brand => brand !== null); // Filter out null values

        // Remove duplicates by using a Set for both ID and Name
        const uniqueBrands = [];
        const seen = new Set();

        brandList.forEach(brand => {
            // Create a unique identifier combining brand ID and name
            const identifier = `${brand.brandId}-${brand.brandName}`;
            if (!seen.has(identifier)) {
                uniqueBrands.push(brand);
                seen.add(identifier);
            }
        });

        // If no brands are found
        if (uniqueBrands.length === 0) {
            return res.status(404).json({ message: 'No brands found for the selected category and subcategory' });
        }

        // Return the unique list of brands with both ID and name
        return res.status(200).json({ brands: uniqueBrands });

    } catch (error) {
        console.error(error);
        return next(error);
    }
}


async function getProductsBySellerId(req, res, next) {
    try {
      const sellerId = req.params.id;
      const { search, page = 1, limit = 10 } = req.query;
  
      if (!sellerId) {
        return res.status(400).json({ message: 'Seller ID is required' });
      }
  
      const query = { seller_id: sellerId };
  
      if (search) {
        query.$or = [
          { Name: { $regex: search, $options: 'i' } },
          { Model_number: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const [products, total] = await Promise.all([
        ProductModel.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('BrandID')
          .populate('CategoryID')
          .populate('SubCategoryID')
          .populate('UserID'),
        ProductModel.countDocuments(query),
      ]);
  
      res.status(200).json({
        status: messages.success.STATUS,
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
  












module.exports = {
    addUpdateProductDetail,
    getNewArrivalProducts,
    deleteProductDetail,
    getProductDetailById,
    getProductDetailsWithPagination,
    getProductList,
    getBrandListByCategorySubCategory,
    getProductsBySellerId
};
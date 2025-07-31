const commonFunctions = require('../utils/commonFunctions');
const ProductModel = require('../models/product');
const ProductMediaModel = require('../models/productMedia');
const BrandModel = require('../models/brand');
const CategoryModel = require('../models/category');
const RatingModel = require('../models/rating');
const VariationModel = require('../models/variation');
const EnergyEfficiencyRatingModel = require('../models/energyEfficiencyRating');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// Function to generate unique SkuNumber
async function generateSkuNumber() {
    // Retrieve the last sku number from the database
    const lastProduct = await ProductModel.findOne({
        order: [['SKU_number', 'DESC']],
        attributes: ['SKU_number'],
        raw: true
    });

    let skuNumber;

    if (lastProduct && lastProduct.SKU_number) {
        const lastSkuNumber = lastProduct.SKU_number;
        const numericPart = parseInt(lastSkuNumber.substr(4)); // Extract the numeric part
        const newNumericPart = numericPart + 1;
        const newNumericPartString = newNumericPart.toString().padStart(6, '0'); // Pad with zeros to make it 6 digits
        skuNumber = `SKU${newNumericPartString}`;
    } else {
        skuNumber = 'SKU000001'; // Initial sku number
    }

    let isUnique = false;

    while (!isUnique) {
        const existingProduct = await ProductModel.findOne({ where: { SKU_number: skuNumber } });
        if (!existingProduct) {
            isUnique = true;
        } else {
            const numericPart = parseInt(skuNumber.substr(4)); // Extract the numeric part
            const newNumericPart = numericPart + 1;
            const newNumericPartString = newNumericPart.toString().padStart(6, '0'); // Pad with zeros to make it 6 digits
            skuNumber = `SKU${newNumericPartString}`;
        }
    }

    return skuNumber;
}

// Get Arrival product list
async function getNewArrivalProducts(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get top 5 newly added Product details'
    try {
        const limit = 5; // Fetch only the top 5 records
        const productData = await ProductModel.findAll({
            attributes: ['ID', 'Name', 'Price', 'Sale_price'],
            order: [['Created_at', 'DESC']],
            limit,
            raw: true
        });
        // Get main media URLs for each product using mapping
        const productIds = productData.map(product => product.ID);
        const productMediaData = await ProductMediaModel.findAll({
            attributes: ['ProductID', 'Media_url'],
            where: {
                ProductID: productIds,
                Is_main_media: true
            },
            raw: true
        });

        // Map main media URLs to the corresponding products
        const productDetails = productData.map(product => {
            const mainMedia = productMediaData.find(media => media.ProductID === product.ID);
            if (mainMedia) {
                mainMedia.Media_url = `${process.env.BASE_URL}${mainMedia.Media_url}`;
            }
            return {
                ...product,
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

// AddUpdate product
async function addUpdateProductDetail(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Add or update product details'
    let {
        UserID,
        id,
        Name,
        Description,
        Price,
        Sale_price,
        Is_price,
        Is_price_range,
        Min_price,
        Max_price,
        Meta_tag_title,
        Meta_tag_description,
        Meta_tag_keywords,
        Quantity,
        Status,
        Cooling_capacity,
        Is_available,
        Is_featured,
        Is_exclusive,
        Is_new_arrival,
        Is_best_seller,
        Is_wifi_enabled,
        Has_voice_control,
        Has_auto_cleaning,
        Has_dehumidification,
        Has_sleep_mode,
        Has_turbo_mode,
        Has_eco_mode,
        Remote_control_type,
        Warranty_period,
        Cooling_technology,
        Has_built_in_air_purifier,
        Has_anti_bacterial_filter,
        Has_dust_filter,
        Room_size_suitability,
        Production_year,
        Voltage,
        Wattage,
        Frequency,
        Refrigerant,
        Condenser_coil,
        Dimensions_indoor_width,
        Dimensions_indoor_height,
        Dimensions_indoor_depth,
        Indoor_unit_weight,
        Dimensions_outdoor_width,
        Dimensions_outdoor_height,
        Dimensions_outdoor_depth,
        Outdoor_unit_weight,
        BrandID,
        CategoryID,
        EnergyEfficiencyRatingID,
        ProductMainImage,
        Model_number,
        Model_series,
        Noise_level_indoor,
        Noise_level_outdoor,
        Installation_type,
        MediaIDsToRemove,
        VariationIDsToRemove
    } = req.body;

    let user = req.user;
    const userID = UserID || user.ID;
    try {
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

        // return res.status(200).json();
        if (!id) {
            // Generate a random sku number
            let skuNumber = await generateSkuNumber();
            const SKU_number = skuNumber;
            if (Is_price === true) {
                // If Is_price is true, set Price and Sale_price
                Price = Price || 0; 
                Sale_price = Sale_price || 0;
            } else if (Is_price_range === true) {
                // If Is_price_range is true, set Min_price and Max_price
                Min_price = Min_price || 0;
                Max_price = Max_price || 0; 
            }
            // Create productDetails entry
            const productDetails = await ProductModel.create({
                UserID,
                Name,
                BrandID,
                CategoryID,
                EnergyEfficiencyRatingID,
                SKU_number,
                Description,
                Price,
                Sale_price,
                Is_price,
                Is_price_range,
                Min_price,
                Max_price,
                Meta_tag_title,
                Meta_tag_description,
                Meta_tag_keywords,
                Quantity,
                Status,
                Cooling_capacity,
                Is_available,
                Is_featured,
                Is_exclusive,
                Is_new_arrival,
                Is_best_seller,
                Is_wifi_enabled,
                Has_voice_control,
                Has_auto_cleaning,
                Has_dehumidification,
                Has_sleep_mode,
                Has_turbo_mode,
                Has_eco_mode,
                Remote_control_type,
                Warranty_period,
                Cooling_technology,
                Has_built_in_air_purifier,
                Has_anti_bacterial_filter,
                Has_dust_filter,
                Room_size_suitability,
                Production_year,
                Voltage,
                Wattage,
                Frequency,
                Refrigerant,
                Condenser_coil,
                Dimensions_indoor_width,
                Dimensions_indoor_depth,
                Dimensions_indoor_height,
                Indoor_unit_weight,
                Dimensions_outdoor_width,
                Dimensions_outdoor_height,
                Dimensions_outdoor_depth,
                Outdoor_unit_weight,
                Model_number,
                Model_series,
                Noise_level_indoor,
                Noise_level_outdoor,
                Installation_type,
                Created_by: user.ID
            });
            // Create ProductMedia entries

            if (productMediaWithImages) {
                productMediaWithImages.forEach(async (media) => {
                    // Create a Variation for each color
                    const variation = await VariationModel.create({
                        ProductID: productDetails.ID,
                        Type: "Color",
                        Value: media.color,
                        Created_by: user.ID,
                    });

                    // Create ProductMedia for each image
                    const productMedia = media.images.map(async (file) => {
                        const mediaType = file.mimetype.includes('image') ? 'image' : 'video';

                        const productMediaEntry = {
                            ProductID: productDetails.ID,
                            VariationID: variation.ID,
                            Media_url: `${process.env.PRODUCT_MEDIA_ROUTE}${file.filename}`,
                            Media_type: mediaType,
                            Is_main_media: false,
                            Created_by: user.ID,
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
                    ProductID: productDetails.ID,
                    Media_url: `${process.env.PRODUCT_MEDIA_ROUTE}${productMainImageFiles.filename}`,
                    Media_type: 'image',
                    Is_main_media: true,
                    Created_by: user.ID
                };
                // Save the new ProductMedia to the database
                await ProductMediaModel.create(productMainImage);
            }

            return res.status(200).json({ message: messages.success.PRODUCT_CREATED, status: messages.success.STATUS });
        }
        else {
            // Find the existing ProductDetails record
            const existingProductDetails = await ProductModel.findByPk(id);
            if (!existingProductDetails) {
                return res.status(404).json({ message: messages.error.PRODUCT_NOT_FOUND, status: messages.error.STATUS });
            }
            // Update the fields received in the request for ProductDetails
            existingProductDetails.UserID = UserID;
            existingProductDetails.Name = Name;
            existingProductDetails.BrandID = BrandID;
            existingProductDetails.CategoryID = CategoryID;
            existingProductDetails.EnergyEfficiencyRatingID = EnergyEfficiencyRatingID;
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
            // existingProductDetails.Min_price = Min_price;
            // existingProductDetails.Max_price = Max_price;
            existingProductDetails.Meta_tag_title = Meta_tag_title;
            existingProductDetails.Meta_tag_description = Meta_tag_description;
            existingProductDetails.Meta_tag_keywords = Meta_tag_keywords;
            existingProductDetails.Quantity = Quantity;
            existingProductDetails.Status = Status;
            existingProductDetails.Cooling_capacity = Cooling_capacity;
            existingProductDetails.Is_available = Is_available;
            existingProductDetails.Is_featured = Is_featured;
            existingProductDetails.Is_exclusive = Is_exclusive;
            existingProductDetails.Is_new_arrival = Is_new_arrival;
            existingProductDetails.Is_best_seller = Is_best_seller;
            existingProductDetails.Is_wifi_enabled = Is_wifi_enabled;
            existingProductDetails.Has_voice_control = Has_voice_control;
            existingProductDetails.Has_auto_cleaning = Has_auto_cleaning;
            existingProductDetails.Has_dehumidification = Has_dehumidification;
            existingProductDetails.Has_sleep_mode = Has_sleep_mode;
            existingProductDetails.Has_turbo_mode = Has_turbo_mode;
            existingProductDetails.Has_eco_mode = Has_eco_mode;
            existingProductDetails.Remote_control_type = Remote_control_type;
            existingProductDetails.Warranty_period = Warranty_period;
            existingProductDetails.Cooling_technology = Cooling_technology;
            existingProductDetails.Has_built_in_air_purifier = Has_built_in_air_purifier;
            existingProductDetails.Has_anti_bacterial_filter = Has_anti_bacterial_filter;
            existingProductDetails.Room_size_suitability = Room_size_suitability;
            existingProductDetails.Production_year = Production_year;
            existingProductDetails.Voltage = Voltage;
            existingProductDetails.Wattage = Wattage;
            existingProductDetails.Frequency = Frequency;
            existingProductDetails.Refrigerant = Refrigerant;
            existingProductDetails.Condenser_coil = Condenser_coil;
            existingProductDetails.Dimensions_indoor_width = Dimensions_indoor_width;
            existingProductDetails.Dimensions_indoor_height = Dimensions_indoor_height;
            existingProductDetails.Dimensions_indoor_depth = Dimensions_indoor_depth;
            existingProductDetails.Indoor_unit_weight = Indoor_unit_weight;
            existingProductDetails.Dimensions_outdoor_width = Dimensions_outdoor_width;
            existingProductDetails.Dimensions_outdoor_height = Dimensions_outdoor_height;
            existingProductDetails.Dimensions_outdoor_depth = Dimensions_outdoor_depth;
            existingProductDetails.Outdoor_unit_weight = Outdoor_unit_weight;
            existingProductDetails.Model_number = Model_number;
            existingProductDetails.Model_series = Model_series;
            existingProductDetails.Noise_level_indoor = Noise_level_indoor;
            existingProductDetails.Noise_level_outdoor = Noise_level_outdoor;
            existingProductDetails.Installation_type = Installation_type;
            existingProductDetails.Updated_by = user.ID;
            // Save the updated record
            await existingProductDetails.save();

            // Remove media
            if (MediaIDsToRemove) {
                const parsedMediaIDsToRemove = JSON.parse(MediaIDsToRemove);
                for (const mediaId of parsedMediaIDsToRemove) {
                    await ProductMediaModel.destroy({ where: { id: mediaId } });
                }
            }

            // Remove variation
            if (VariationIDsToRemove) {
                const parsedVariationIDsToRemove = JSON.parse(VariationIDsToRemove);
                for (const variationId of parsedVariationIDsToRemove) {
                    // Delete the associated ProductMediaModel entries
                    await ProductMediaModel.destroy({ where: { VariationID: variationId } });

                    // Delete the variation itself
                    await VariationModel.destroy({ where: { id: variationId } });
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
                            Created_by: user.ID,
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
                            Created_by: user.ID,
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
                    productImageData.Updated_by = user.ID;
                    productImageData.Media_url = updatedMediaUrl;
                    await productImageData.save();
                } else {
                    // If ProductMedia doesn't exist, create a new one
                    await ProductMediaModel.create({
                        ProductID: id,
                        Media_url: updatedMediaUrl,
                        Media_type: 'image',
                        Is_main_media: true,
                        Created_by: user.ID
                    });
                }
            }

            return res.status(200).json({ message: messages.success.PRODUCT_UPDATE, status: messages.success.STATUS });
        }

    } catch (error) {
        return next(error);
    }
}

// Get All product list
async function getProductDetailsWithPagination(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get Product details with pagination'
    try {
        const { page = 1, limit, search = '',status } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const whereClause = {};
        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }
        if (status) {
            whereClause.Status = status;
          }
        const { count, rows: productData } = await ProductModel.findAndCountAll({
            attributes: ['ID', 'Name', 'Price', 'Sale_price','Is_price','Is_price_range','Min_price','Max_price', 'SKU_number', 'Quantity', 'Status', 'Is_available', 'BrandID'], // Include BrandID
            offset,
            limit: limit ? parseInt(limit, 10) : null,
            where: whereClause,
            order: [['ID', 'DESC']], 
            raw: true
        });

        // Get main media URLs for each product using mapping
        const productIds = productData.map(product => product.ID);
        const productMediaData = await ProductMediaModel.findAll({
            attributes: ['ProductID', 'Media_url'],
            where: {
                ProductID: productIds,
                Is_main_media: true
            },
            raw: true
        });

        // Map main media URLs to the corresponding products
        const productDetails = productData.map(async product => {
            const mainMedia = productMediaData.find(media => media.ProductID === product.ID);
            if (mainMedia) {
                mainMedia.Media_url = `${process.env.BASE_URL}${mainMedia.Media_url}`;
            }

            // Fetch Brand name for the current product
            const brand = await BrandModel.findByPk(product.BrandID, {
                attributes: ['Name'],
                raw: true
            });

            const productWithoutBrandID = {
                ...product,
                Media_url: mainMedia ? mainMedia.Media_url : null,
                BrandName: brand ? brand.Name : null // Add the BrandName property
            };

            // Omit BrandID from the response
            delete productWithoutBrandID.BrandID;

            return productWithoutBrandID;
        });

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({
            data: await Promise.all(productDetails), // Wait for all product details to be fetched
            totalPages,
            status: messages.success.STATUS,
            currentPage,
            totalRecords: count
        });
    } catch (error) {
        return next(error);
    }
}


// Get product details by userID
async function getProductDetailById(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get Product details by ID'
    const { id } = req.params;

    try {
        const product = await ProductModel.findByPk(id, {
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            raw: true
        });

        if (!product) {
            return res.status(404).json({ message: messages.error.PRODUCT_NOT_FOUND, status: messages.error.STATUS });
        }

        const ProductMedia = await ProductMediaModel.findAll({
            attributes: ['VariationID', 'Media_url', 'Is_main_media', 'Media_type', 'ID'],
            where: {
                ProductID: id
            },
            raw: true
        });

        const mainMedia = ProductMedia.find(media => media.Is_main_media === 1);
        const otherMedias = ProductMedia.filter(media => media.Is_main_media === 0);

        // Get variation information
        const variations = await VariationModel.findAll({
            attributes: ['ID', 'Type', 'Value'],
            where: {
                ProductID: product.ID
            },
            raw: true
        });

        const formattedMainMedia = mainMedia
            ? `${process.env.BASE_URL}${mainMedia.Media_url}`
            : null;

        // Map each other media to include the full URL
        const formattedOtherMedias = variations.map(variation => {
            const filteredMedias = otherMedias.filter(media => media.VariationID === variation.ID);
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


// Delete a Product by ID
async function deleteProductDetail(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Delete Product details by UserID'
    const { id } = req.params;
    try {
        const product = await ProductModel.findByPk(id); // Fetch the product details
        if (!product) {
            return res.status(404).json({ message: messages.error.PRODUCT_NOT_FOUND, status: messages.error.STATUS });
        }
        await VariationModel.destroy({
            where: { ProductID: id }
        });
        const mediaRecords = await ProductMediaModel.findAll({
            where: { ProductID: id }
        });

        // Delete the product and related media records
        await ProductMediaModel.destroy({
            where: { ProductID: id }
        });
        await ProductModel.destroy({
            where: { ID: id }
        });
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



// APP - Get All product list for admin
async function getProductList(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get Product list with additional details'
    try {

        const {
            Page = 1,
            Limit,
            Sort_by: sortBy,
            Brand,
            Capacity,
            Features,
            Warranty_period: warrantyPeriod,
            Availability,
            Energy_rating: energyRating,
            Price_range: priceRange,
            Type,
            search,
            Is_new_arrival,
            Room_size: roomSize,
            Noise_level: noiseLevel,
            Air_Purification: airPurification,
            Cooling_Capacity: coolingCapacity,
            Rating: ratingFilter,
        } = req.body;

        const offset = (Page - 1) * (Limit ? parseInt(Limit, 10) : 0);

        const options = {
            offset,
            limit: Limit ? parseInt(Limit, 10) : null,
            attributes: ['ID', 'UserID', 'Name', 'Price', 'Sale_price', 'EnergyEfficiencyRatingID', 'CategoryID', 'BrandID', 'SKU_number', 'Is_price_range', 'Min_price', 'Max_price'],
            raw: true,
            where: {
                Status: 'Published',
            },
            order: [],
        };

        // Search for brand names first
        if (search) {
            const brandSearchResult = await BrandModel.findAll({
                attributes: ['ID'],
                where: {
                    Name: { [Op.like]: `%${search}%` },
                },
                raw: true,
            });

            const brandIds = brandSearchResult.map(brand => brand.ID);

            if (brandIds.length > 0) {
                options.where[Op.or] = [
                    { Name: { [Op.like]: `%${search}%` } }, // Search in Product table
                    { BrandID: { [Op.in]: brandIds } }, // Search for matching Brand IDs
                ];
            } else {
                // If no matching brands found, just search in the product names
                options.where = {
                    Name: { [Op.like]: `%${search}%` },
                    Status: 'Published',
                };
            }
        }
        if (noiseLevel && noiseLevel.length > 0) {
            const selectedNoiseLevel = noiseLevel[0]; // Get the first element

            if (['low', 'moderate', 'high'].includes(selectedNoiseLevel)) {
                const noiseLevelFilter = [];

                if (selectedNoiseLevel === 'low') {
                    noiseLevelFilter.push(
                        { Noise_level_indoor: { [Op.lt]: 40 } },
                        { Noise_level_outdoor: { [Op.lt]: 40 } }
                    );
                } else if (selectedNoiseLevel === 'moderate') {
                    noiseLevelFilter.push(
                        {
                            [Op.and]: [
                                { Noise_level_indoor: { [Op.gte]: 40 } },
                                { Noise_level_indoor: { [Op.lte]: 50 } },
                            ],
                        },
                        {
                            [Op.and]: [
                                { Noise_level_outdoor: { [Op.gte]: 40 } },
                                { Noise_level_outdoor: { [Op.lte]: 50 } },
                            ],
                        }
                    );
                } else if (selectedNoiseLevel === 'high') {
                    noiseLevelFilter.push(
                        { Noise_level_indoor: { [Op.gt]: 50 } },
                        { Noise_level_outdoor: { [Op.gt]: 50 } }
                    );
                }

                // Add the noise level filter to the existing filters using [Op.and]
                if (options.where[Op.or]) {
                    options.where[Op.and] = [
                        { [Op.or]: options.where[Op.or] },
                        { [Op.or]: noiseLevelFilter },
                    ];
                } else {
                    options.where[Op.or] = noiseLevelFilter;
                }
            }
        }

        if (ratingFilter && ratingFilter.length > 0) {
            const numericRatings = ratingFilter.map((rating) => {
                const numericValue = parseFloat(rating.replace('-rating', ''));
                return isNaN(numericValue) ? 0 : numericValue; // Convert non-numeric values to 0
            });
            const minimumRating = Math.min(...numericRatings);

            if (minimumRating > 0) {
                const ratedProductIDs = await RatingModel.findAll({
                    attributes: ['Rated_item_id'],
                    where: {
                        Rated_item_type: 'product',
                        Rating: { [Op.gte]: minimumRating },
                    },
                    raw: true,
                });

                // Extract the product IDs from the result
                const ratedProductIDsArray = ratedProductIDs.map((item) => item.Rated_item_id);

                if (ratedProductIDsArray.length > 0) {
                    options.where.ID = { [Op.in]: ratedProductIDsArray }; // Filter products based on the ratedProductIDsArray
                } else {
                    // If no matching products found, return an empty result
                    return res.status(200).json({
                        data: [],
                        totalPages: 0,
                        currentPage: 1,
                        status: messages.success.STATUS,
                        totalRecords: 0,
                    });
                }
            }
        }

        if (Availability && Availability.length > 0) {
            const mappedAvailability = Availability.map(availabilityValue => {
                const enumValue = commonFunctions.AvailabilityEnum[availabilityValue];
                return enumValue || availabilityValue;
            });

            if (mappedAvailability.length > 0) {
                options.where.Is_available = { [Op.or]: mappedAvailability };
            }
        }
        if (Brand && Brand.length > 0) {
            options.where.BrandID = { [Op.or]: Brand };
        }

        if (Capacity && Capacity.length > 0) {
            const mappedCapacity = Capacity.map(capacityValue => {
                const enumValue = commonFunctions[capacityValue];
                return enumValue || capacityValue;
            });

            if (mappedCapacity.length > 0) {
                options.where.Cooling_capacity = { [Op.or]: mappedCapacity };
            }
        }

        if (airPurification && airPurification.length > 0) {
            options.where[Op.or] = airPurification.map(airpurification => ({
                [airpurification]: true,
            }));
        }
        if (coolingCapacity && coolingCapacity.length > 0) {
            const mappedCoolingCapacity = coolingCapacity.map(collingcapacityValue => {
                const enumValue = commonFunctions.CoolingCapacityEnum[collingcapacityValue];
                return enumValue || collingcapacityValue;
            });

            if (mappedCoolingCapacity.length > 0) {
                options.where.Cooling_technology = { [Op.or]: mappedCoolingCapacity };
            }
        }
        if (Features && Features.length > 0) {
            options.where[Op.or] = Features.map(feature => ({
                [feature]: true,
            }));
        }
        if (Is_new_arrival === true) {
            options.where.Is_new_arrival = true;
        }
        if (warrantyPeriod && warrantyPeriod.length > 0) {
            const mappedWarrantyPeriod = warrantyPeriod.map(warrantyperiodValue => {
                const enumValue = commonFunctions.WarrantyPeriodEnum[warrantyperiodValue];
                return enumValue || warrantyperiodValue;
            });

            if (mappedWarrantyPeriod.length > 0) {
                options.where.Warranty_period = { [Op.or]: mappedWarrantyPeriod };
            }
        }
        if (energyRating && energyRating.length > 0) {
            options.where.EnergyEfficiencyRatingID = { [Op.or]: energyRating };
        }
        if (priceRange && priceRange.length > 0) {
            const priceFilters = priceRange.map(range => {
                const match = range.match(/₹(\d+)\s*-\s*₹?(\d+)/);
                if (match) {
                    const lowerBound = parseFloat(match[1]);
                    const upperBound = match[2] ? parseFloat(match[2]) : Infinity;
                    return {
                        Price: { [Op.and]: [{ [Op.gte]: lowerBound }, { [Op.lte]: upperBound }] },
                    };
                } else {
                    const matchUpTo = range.match(/Up\s*to\s*₹?(\d+)/);
                    if (matchUpTo) {
                        const upperBound = parseFloat(matchUpTo[1]);
                        return {
                            Price: { [Op.lte]: upperBound },
                        };
                    }
                }
            });
            options.where[Op.or] = priceFilters;
        }
        if (roomSize && roomSize.length > 0) {
            const mappedRoomSize = roomSize.map(roomsizeValue => {
                console.log("roomsizeValue", roomsizeValue)
                const enumValue = commonFunctions.RoomSizeEnum[roomsizeValue];
                console.log("enumValue", enumValue)
                return enumValue || roomsizeValue;
            });

            if (mappedRoomSize.length > 0) {
                options.where.Room_size_suitability = { [Op.or]: mappedRoomSize };
            }
        }
        if (Type && Type.length > 0) {
            options.where.CategoryID = { [Op.or]: Type };
        }

        // Sorting options
        const sortMap = {
            'Relevance': [['ID', 'ASC']],
            'Price (High to Low)': [Sequelize.literal('CAST(Sale_price AS DECIMAL(10, 2))'), 'DESC'],
            'Price (Low to High)': [Sequelize.literal('CAST(Sale_price AS DECIMAL(10, 2))'), 'ASC'],
            'Rating': ['Rating', 'DESC'],
            'New Arrivals': ['Is_new_arrival', 'DESC'],
            'Best Selling': ['Is_best_seller', 'DESC'],
            'Alphabetical:A-Z': ['Name', 'ASC'],
            'Alphabetical:Z-A': ['Name', 'DESC'],
            default: ['ID', 'DESC'],
        };
        options.order.push(sortMap[sortBy] || sortMap.default);

        const { count, rows: productData } = await ProductModel.findAndCountAll(options);

        // Get main media URLs for each product using mapping
        const productIds = productData.map(product => product.ID);
        const productMediaData = await ProductMediaModel.findAll({
            attributes: ['ProductID', 'Media_url'],
            where: {
                ProductID: productIds,
                Is_main_media: true
            },
            raw: true
        });

        // Get all rating details for the products in one query
        const ratingDetails = await RatingModel.findAll({
            where: {
                Rated_item_id: productIds,
                Rated_item_type: 'product',
            },
            attributes: ['Rated_item_id', 'Rating', 'Review'],
            raw: true,
        });

        // Create maps for rating and review statistics
        const ratingStatistics = ratingDetails.reduce((stats, detail) => {
            const productId = detail.Rated_item_id;
            stats.ratingCountMap[productId] = (stats.ratingCountMap[productId] || 0) + 1;
            stats.sumOfTotalRatingMap[productId] = (stats.sumOfTotalRatingMap[productId] || 0) + (detail.Rating ? parseInt(detail.Rating) : 0);
            stats.reviewCountMap[productId] = (stats.reviewCountMap[productId] || 0) + (detail.Review ? 1 : 0);
            return stats;
        }, {
            ratingCountMap: {},
            sumOfTotalRatingMap: {},
            reviewCountMap: {},
        });

        const productDetails = productData.map(product => {
            const mainMedia = productMediaData.find(media => media.ProductID === product.ID);
            const productId = product.ID;
            const totalRating = ratingStatistics.ratingCountMap[productId] || 0;
            const sumOfTotalRating = ratingStatistics.sumOfTotalRatingMap[productId] || 0;
            const totalReviews = ratingStatistics.reviewCountMap[productId] || 0;
            const averageRating = totalRating > 0 ? (sumOfTotalRating / totalRating).toFixed(1) : '0.0';

            const productWithAllDetails = {
                ...product,
                Media_url: mainMedia ? `${process.env.BASE_URL}${mainMedia.Media_url}` : null,
                totalReview: totalReviews,
                totalRating,
                averageRating,
            };

            // Omit unnecessary properties
            delete productWithAllDetails.EnergyEfficiencyRatingID;
            delete productWithAllDetails.BrandID;
            delete productWithAllDetails.CategoryID;
            delete productWithAllDetails.UserID;

            return productWithAllDetails;
        });

        const totalPages = Limit ? Math.ceil(count / parseInt(Limit, 10)) : 1;
        const currentPage = parseInt(Page, 10);

        return res.status(200).json({
            data: await Promise.all(productDetails), // Wait for all product details to be fetched
            totalPages,
            currentPage,
            status: messages.success.STATUS,
            totalRecords: count
        });
    } catch (error) {
        return next(error);
    }
}


//APP - get product details
async function getProductDetail(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get Product details by ID'
    const { id } = req.params;

    try {
        const product = await ProductModel.findOne({
            attributes: ['ID', 'Name', 'BrandID', 'SKU_number', 'Is_price', 'Is_price_range', 'Min_price', 'Max_price', 'Meta_tag_title', 'Meta_tag_description', 'Meta_tag_keywords', 'Status', 'CategoryID', 'UserID', 'Has_voice_control', 'Has_voice_control', 'Has_dehumidification', 'Has_sleep_mode', 'Has_turbo_mode', 'Has_eco_mode', 'Room_size_suitability', 'Price', 'Sale_price', 'Is_available', 'Cooling_capacity', 'Is_wifi_enabled', 'Model_series', 'Model_number', 'Noise_level_indoor', 'Noise_level_outdoor', 'Installation_type', 'Remote_control_type', 'Refrigerant', 'Cooling_technology', 'Voltage', 'Wattage', 'Frequency', 'Refrigerant', 'Condenser_coil', 'Condenser_coil', 'Condenser_coil', 'Description', 'Warranty_period', 'BrandID', 'Quantity', 'Dimensions_indoor_width', 'Dimensions_indoor_height', 'Dimensions_indoor_depth', 'Indoor_unit_weight', 'Dimensions_outdoor_width', 'Dimensions_outdoor_height', 'Dimensions_outdoor_depth', 'Outdoor_unit_weight', 'EnergyEfficiencyRatingID'],
            where: {
                ID: id,
                Status: 'Published'
            },
            raw: true
        });

        if (!product) {
            return res.status(404).json({ message: messages.error.PRODUCT_NOT_FOUND, status: messages.error.STATUS });
        }

        const ProductMedia = await ProductMediaModel.findAll({
            attributes: ['VariationID', 'Media_url', 'Is_main_media', 'Media_type', 'ID'],
            where: {
                ProductID: id
            },
            raw: true
        });

        const mainMedia = ProductMedia.find(media => media.Is_main_media === 1);
        const otherMedias = ProductMedia.filter(media => media.Is_main_media === 0);

        // Get variation information
        const variations = await VariationModel.findAll({
            attributes: ['ID', 'Type', 'Value'],
            where: {
                ProductID: product.ID
            },
            raw: true
        });

        const formattedMainMedia = mainMedia
            ? `${process.env.BASE_URL}${mainMedia.Media_url}`
            : null;

        // Map each other media to include the full URL
        const formattedOtherMedias = variations.map(variation => {
            const filteredMedias = otherMedias.filter(media => media.VariationID === variation.ID);
            const media_urls = filteredMedias.map(media => ({
                ID: media.ID,
                Media_url: `${process.env.BASE_URL}${media.Media_url}`,
            }));

            return {
                ...variation,
                Media_urls: media_urls,
            };
        });

        // Get brand information
        const brand = await BrandModel.findByPk(product.BrandID, {
            attributes: ['Name'],
            raw: true
        });

        // Get category information
        const category = await CategoryModel.findByPk(product.CategoryID, {
            attributes: ['Name'],
            raw: true
        });

        // Get energy efficiency rating name
        const energyEfficiency = await EnergyEfficiencyRatingModel.findByPk(product.EnergyEfficiencyRatingID, {
            attributes: ['Name'],
            raw: true
        });
        // Fetch Rating details
        const ratingDetails = await RatingModel.findAll({
            where: {
                Rated_item_id: product.ID,
                Rated_item_type: 'product',
            },
            attributes: ['Rated_item_id', 'Rating', 'Review'],
            raw: true,
        });
        const ratingStatistics = ratingDetails.reduce((stats, detail) => {
            const productId = detail.Rated_item_id;
            stats.ratingCountMap[productId] = (stats.ratingCountMap[productId] || 0) + 1;
            stats.sumOfTotalRatingMap[productId] = (stats.sumOfTotalRatingMap[productId] || 0) + (detail.Rating ? parseInt(detail.Rating) : 0);
            stats.reviewCountMap[productId] = (stats.reviewCountMap[productId] || 0) + (detail.Review ? 1 : 0);
            return stats;
        }, {
            ratingCountMap: {},
            sumOfTotalRatingMap: {},
            reviewCountMap: {},
        });
        const totalRating = ratingStatistics.ratingCountMap[product.ID] || 0;
        const sumOfTotalRating = ratingStatistics.sumOfTotalRatingMap[product.ID] || 0;
        const totalReviews = ratingStatistics.reviewCountMap[product.ID] || 0;
        const averageRating = totalRating > 0 ? (sumOfTotalRating / totalRating).toFixed(1) : '0.0';

        const productWithAllDetails = {
            ...product,
            MainMedia: formattedMainMedia,
            Variations: formattedOtherMedias,
            BrandName: brand ? brand.Name : null,
            CategoryName: category ? category.Name : null,
            EnergyEfficiencyRatingName: energyEfficiency ? energyEfficiency.Name : null,
            totalReview: totalReviews,
            totalRating: totalRating,
            averageRating: averageRating,
        };

        delete productWithAllDetails.EnergyEfficiencyRatingID;
        delete productWithAllDetails.BrandID;
        delete productWithAllDetails.CategoryID;
        delete productWithAllDetails.UserID;


        return res.status(200).json({
            data: productWithAllDetails,
            status: messages.success.STATUS,

        });
    } catch (error) {
        return next(error);
    }
}


// Get Product Filter
async function getProductFilter(req, res, next) {
    // #swagger.tags = ['Product']
    // #swagger.description = 'Get Product filter
    try {
        const Brands = await BrandModel.findAll({
            attributes: ['ID', 'Name'],
            raw: true
        });

        const Categories = await CategoryModel.findAll({
            attributes: ['ID', 'Name'],
            raw: true
        });

        const energyEfficiencyRatings = await EnergyEfficiencyRatingModel.findAll({
            attributes: ['ID', 'Name'],
            raw: true
        });

        // Define static values
        const Feature = [
            { ID: 'Is_wifi_enabled', Name: 'Wi-Fi Enable' },
            { ID: 'Has_voice_control', Name: 'Voice Control' },
            { ID: 'Has_auto_cleaning', Name: 'Auto Cleaning' },
            { ID: 'Has_dehumidification', Name: 'Dehumidification' },
            { ID: 'Has_turbo_mode', Name: 'Turbo Mode' },
            { ID: 'Has_eco_mode', Name: 'Eco Mode' },
            { ID: 'Has_sleep_mode', Name: 'Sleep Mode' }
        ];
        const Price = [
            { ID: 'under20000', Name: 'Under ₹20000' },
            { ID: '20000-30000', Name: '₹20000- ₹30000' },
            { ID: '30000-40000', Name: '₹30000- ₹40000' },
            { ID: '40000-50000', Name: '₹40000- ₹50000' },
            { ID: 'above50000', Name: 'Above ₹50000' }
        ];
        const CoolingTechnologies = [
            { ID: 'Conventional-compressor', Name: 'Conventional compressor' },
            { ID: 'Inverter-compressor', Name: 'Inverter compressor' }
        ];
        const AirPurification = [
            { ID: 'Has_built_in_air_purifier', Name: 'Built-in air purifier' },
            { ID: 'Has_anti_bacterial_filter', Name: 'Anti-bacterial filter' },
            { ID: 'Has_dust_filter', Name: 'Dust filter' }
        ];
        const Availability = [
            { ID: 'Out-of-stock', Name: 'Out of stock' },
            { ID: 'In-stock', Name: 'In stock' }
        ];
        const NoiseLevel = [
            { ID: 'low', Name: 'Low(less than 40 dB)' },
            { ID: 'moderate', Name: 'Moderate(40-50 dB)' },
            { ID: 'high', Name: 'High(50 dB and above)' }
        ];
        const RoomSize = [
            { ID: 'small', Name: 'Small room (Up to 150)' },
            { ID: 'medium', Name: 'Medium room (150-300)' },
            { ID: 'large', Name: 'Large room(300-500)' },
            { ID: 'extra-large', Name: 'Extra-large room(500+)' }
        ];
        const Capacity = [
            { ID: '1-ton', Name: '1 Ton' },
            { ID: '1.5-ton', Name: '1.5 Ton' },
            { ID: '2-ton', Name: '2 Ton' },
            { ID: '2.5-ton', Name: '2.5 Ton' },
            { ID: '3-ton', Name: '3 Ton' }
        ];
        const WarrantyPeriod = [
            { ID: '1-year', Name: '1 year' },
            { ID: '2-years', Name: '2 years' },
            { ID: '3-years', Name: '3 years' },
            { ID: '5-years', Name: '5 years' }
        ];
        const Rating = [
            { ID: '1-rating', Name: '1★ & above' },
            { ID: '2-rating', Name: '2★ & above' },
            { ID: '3-rating', Name: '3★ & above' },
            { ID: '4-rating', Name: '4★ & above' }
        ];


        // Convert IDs to strings
        const formatData = (data) => {
            return data.map(item => ({
                ID: item.ID.toString(),
                Name: item.Name
            }));
        };

        return res.status(200).json({
            data: {
                Brands: formatData(Brands),
                Categories: formatData(Categories),
                "Energy Ratings": formatData(energyEfficiencyRatings),
                Feature,
                Price,
                "Room Size": RoomSize,
                "Cooling Technologies": CoolingTechnologies,
                "Air Purification": AirPurification,
                Availability,
                "Noise Level": NoiseLevel,
                Capacity,
                "Warranty Period": WarrantyPeriod,
                Rating
            },
            status: messages.success.STATUS
        });
    } catch (error) {
        return next(error);
    }
}








module.exports = {
    getNewArrivalProducts,
    getProductDetailsWithPagination,
    getProductDetailById,
    deleteProductDetail,
    addUpdateProductDetail,
    getProductList,
    getProductDetail,
    getProductFilter
};


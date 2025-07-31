const mongoose = require('mongoose');
const RatingModel = require('../models/Rating');
const RatingMediaModel = require('../models/RatingMedia');
const UserModel = require('../models/User');
const UserMediaModel = require('../models/UserMedia');
const messages = require('../utils/messages');

// Add/Update Rating Detail
async function addUpdateRatingDetail(req, res, next) {
    try {
        let { UserID, ID, Name,Title, RatingMedia, Rated_item_id, Rating, Review, Rated_item_type, MediaIDsToRemove } = req.body; // Use `let` instead of `const`
        const ratingMediaFiles = req.files['RatingMedia'];
        let IsAnonymous = true;

        // Convert UserID to ObjectId using mongoose.Types.ObjectId() 
        const userID = new mongoose.Types.ObjectId(UserID);

        if (!ID) {
            if (UserID) {
                // UserID is present, set Name from UserID and IsAnonymous to false if user exists
                const existingUser = await UserModel.findById(userID); // Ensure to use ObjectId
                if (existingUser) {
                    Name = existingUser.Name;  // Now this reassignment is allowed because `Name` is declared as `let`
                    IsAnonymous = false;
                }
            }

            // Create a new Rating entry
            const ratingDetails = new RatingModel({
                UserID: userID, // Ensure UserID is stored as ObjectId
                Name: Name || '',
                Rated_item_id,
                Rating,
                Review,
                Rated_item_type,
                IsAnonymous,
                Title
            });
            await ratingDetails.save();

            if (ratingMediaFiles) {
                await createRatingMediaEntries(ratingMediaFiles, ratingDetails._id); // Use _id for ratingDetails
            }

            return res.status(200).json({ message: messages.success.RATING_CREATED, status: messages.success.STATUS });
        } else {
            // Find the existing Rating record using ObjectId for ID
            const existingRatingDetails = await RatingModel.findById(ID);

            if (!existingRatingDetails) {
                return res.status(404).json({ message: messages.error.RATING_NOT_FOUND, status: messages.error.STATUS });
            }

            // Update the fields received in the request
            existingRatingDetails.Rating = Rating;
            existingRatingDetails.Review = Review;
            existingRatingDetails.Title = Title
            await existingRatingDetails.save();

            if (MediaIDsToRemove) {
                await removeMediaEntries(MediaIDsToRemove);
            }

            if (ratingMediaFiles) {
                await createRatingMediaEntries(ratingMediaFiles, ID);
            }

            return res.status(200).json({ message: messages.success.RATING_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}


// Function to create Rating Media entries
async function createRatingMediaEntries(mediaFiles, ratingID) {
    const ratingMedia = mediaFiles.map(file => ({
        RatingID:new mongoose.Types.ObjectId(ratingID), // Ensure RatingID is stored as ObjectId
        Media_url: `${process.env.RATING_MEDIA_ROUTE}${file.filename}`,
        Media_type: file.mimetype.includes('image') ? 'image' : 'video'
    }));
    await RatingMediaModel.insertMany(ratingMedia);
}

// Function to remove media entries
async function removeMediaEntries(mediaIDs) {
    const parsedMediaIDsToRemove = JSON.parse(mediaIDs);
    for (const mediaId of parsedMediaIDsToRemove) {
        await RatingMediaModel.findByIdAndDelete(new mongoose.Types.ObjectId(mediaId)); // Ensure mediaId is ObjectId
    }
}


async function getRatingDetail(req, res, next) {
    try {
        const { Rated_item_type, Rated_item_id, page = 1, limit, filterByStar, UserID, Sort_by } = req.body;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const options = {
            where: {
                Rated_item_type,
                Rated_item_id,
            },
            sort: {},
        };

        if (Sort_by === 'MostRecent') {
            options.sort = { ID: -1 };
        } else if (Sort_by === 'PositiveFirst') {
            options.sort = { Rating: -1 };
        } else if (Sort_by === 'NegativeFirst') {
            options.sort = { Rating: 1 };
        }

        // If a star rating filter is provided
        if (filterByStar !== undefined) {
            const ratingFilter = Array.isArray(filterByStar)
                ? { $in: filterByStar }
                : filterByStar;

            options.where.Rating = ratingFilter;
        }

        const reviewDetails = await RatingModel.find(options.where)
            .skip(offset)
            .limit(limit ? parseInt(limit, 10) : 0)
            .sort(options.sort)
            .lean();

        const totalReviews = await RatingModel.countDocuments({ Rated_item_type, Rated_item_id });

        // Fetch media entries associated with reviews
        const ratingMediaRecords = await RatingMediaModel.find({
            RatingID: { $in: reviewDetails.map(detail => detail._id) },
        });

        const ratingMediaMap = ratingMediaRecords.reduce((map, media) => {
            if (!map[media.RatingID]) {
                map[media.RatingID] = [];
            }
            map[media.RatingID].push({
                ID: media._id,
                URL: `${process.env.BASE_URL}${media.Media_url}`,
            });
            return map;
        }, {});

        // Attach media URLs to each review
        reviewDetails.forEach(detail => {
            detail.MediaUrl = ratingMediaMap[detail._id] || [];
        });

        // Fetch user images
        const userIds = reviewDetails.map((detail) => detail.UserID);
        const userMainImages = await UserMediaModel.find({
            UserID: { $in: userIds },
            Is_main_media: true,
        });

        const userMainImageMap = userMainImages.reduce((map, userImage) => {
            map[userImage.UserID] = `${process.env.BASE_URL}${userImage.Media_url}`;
            return map;
        }, {});

        // Attach user images to each review
        reviewDetails.forEach(detail => {
            detail.UserMainImage = userMainImageMap[detail.UserID] || '';
        });

        return res.status(200).json({
            data: reviewDetails,
            totalReviews,
            status: messages.success.STATUS,
        });
    } catch (error) {
        return next(error);
    }
}


async function getCurrentRatingDetail(req, res, next) {
    const { UserID, Rated_item_id, Rated_item_type } = req.body;

    try {
        // Fetch the current rating details based on UserID, Rated_item_id, and Rated_item_type
        const ratingDetails = await RatingModel.findOne({
            UserID,
            Rated_item_id,
            Rated_item_type,
        });

        if (!ratingDetails) {
            return res.status(404).json({ message: messages.error.RATING_NOT_FOUND, status: messages.error.STATUS });
        }

        // Fetch media associated with the rating
        const mediaDetails = await RatingMediaModel.find({
            RatingID: ratingDetails.ID,
        });

        const formattedMedia = mediaDetails.map(media => ({
            ID: media.ID,
            URL: `${process.env.BASE_URL}${media.Media_url}`,
        }));

        return res.status(200).json({
            data: {
                ...ratingDetails.toObject(),
                MediaUrl: formattedMedia,
            },
            status: messages.success.STATUS,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
}

  
  

module.exports = {
    addUpdateRatingDetail,
    getRatingDetail,
    getCurrentRatingDetail
};
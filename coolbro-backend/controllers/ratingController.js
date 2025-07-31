const RatingModel = require('../models/rating');
const RatingMediaModel = require('../models/ratingMedia');
const UserModel = require('../models/user');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const UserMediaModel = require('../models/userMedia');






// AddUpdate rating
async function addUpdateRatingDetail(req, res, next) {
    // #swagger.tags = ['Rating']
    // #swagger.description = 'Add or update rating details'
    let {
        UserID,
        ID,
        Name,
        RatingMedia,
        Rated_item_id,
        Rating,
        Review,
        Rated_item_type,
        MediaIDsToRemove
    } = req.body;

    try {
        const user = req.user;
        const userID = UserID || user.ID;
        const ratingMediaFiles = req.files['RatingMedia'];
        let IsAnonymous = true;

        if (!ID) {
            if (UserID) {
                // UserID is present, set Name from UserID and IsAnonymous to false if user exists
                const existingUser = await UserModel.findByPk(UserID);
                if (existingUser) {
                    Name = existingUser.Name;
                    IsAnonymous = false;
                }
            }

            // Create a new ratingDetails entry
            const ratingDetails = await RatingModel.create({
                UserID,
                Name: Name || '',
                Rated_item_id,
                Rating,
                Review,
                Rated_item_type,
                IsAnonymous,
                Created_by: user.ID
            });

            if (ratingMediaFiles) {
                await createRatingMediaEntries(ratingMediaFiles, ratingDetails.ID, user.ID);
            }

            return res.status(200).json({ message: messages.success.RATING_CREATED, status: messages.success.STATUS });
        } else {
            // Find the existing RatingDetails record
            const existingRatingDetails = await RatingModel.findByPk(ID);

            if (!existingRatingDetails) {
                return res.status(404).json({ message: messages.error.RATING_NOT_FOUND, status: messages.error.STATUS });
            }

            // Update the fields received in the request for RatingDetails
            existingRatingDetails.Rating = Rating;
            existingRatingDetails.Review = Review;
            existingRatingDetails.Updated_by = user.ID;
            await existingRatingDetails.save();

            if (MediaIDsToRemove !== undefined) {
                await removeMediaEntries(MediaIDsToRemove);
            }

            if (ratingMediaFiles) {
                await createRatingMediaEntries(ratingMediaFiles, ID, user.ID);
            }

            return res.status(200).json({ message: messages.success.RATING_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}

async function createRatingMediaEntries(mediaFiles, ratingID, createdBy) {
    const ratingMedia = mediaFiles.map(file => ({
        RatingID: ratingID,
        Media_url: `${process.env.RATING_MEDIA_ROUTE}${file.filename}`,
        Media_type: file.mimetype.includes('image') ? 'image' : 'video',
        Created_by: createdBy
    }));
    await RatingMediaModel.bulkCreate(ratingMedia);
}

async function removeMediaEntries(mediaIDs) {
    const parsedMediaIDsToRemove = JSON.parse(mediaIDs);
    for (const mediaId of parsedMediaIDsToRemove) {
        await RatingMediaModel.destroy({ where: { id: mediaId } });
    }
}



// Get Rating Details
async function getRatingDetail(req, res, next) {
    // #swagger.tags = ['Rating']
    // #swagger.description = 'Get rating details'
    try {
        let { Rated_item_type, Rated_item_id, page = 1, limit, "filterByStar": averageRatingStar, UserID, 'Sort_by': sortBy, } = req.body;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
        const options = {
            offset,
            limit: limit ? parseInt(limit, 10) : null,
            where: {
                Rated_item_type,
                Rated_item_id,
            },
            order: []
        };

        if (sortBy === 'MostRecent') {
            options.order.push(['ID', 'DESC']);
        } else if (sortBy === 'PositiveFirst') {
            options.order.push(['Rating', 'DESC']);
        } else if (sortBy === 'NegativeFirst') {
            options.order.push(['Rating', 'ASC']);
        }

        if (averageRatingStar !== undefined) {
            const ratingFilter = Array.isArray(averageRatingStar)
                ? { [Op.in]: averageRatingStar }
                : averageRatingStar;

            options.where.Rating = ratingFilter;
        }

        const { count, rows: reviewDetails } = await RatingModel.findAndCountAll({
            where: options.where,
            attributes: ['ID', 'UserID', 'Rated_item_type', 'Rating', 'Name', 'Review', 'Rated_item_id', 'Created_at'],
            ...options,
            raw: true
        });

        const reviewDetailsData  = await RatingModel.findAndCountAll({
            where: {
                Rated_item_type,
                Rated_item_id,
            },
            attributes: ['ID', 'Rating', 'Review', 'Rated_item_id'],
            raw: true
        });
        const reviewRatingData = reviewDetailsData.rows; 
        // Create maps for rating and review statistics
        const ratingStatistics = reviewRatingData.reduce((stats, detail) => {
            const id = detail.Rated_item_id;
            stats.ratingCountMap[id] = (stats.ratingCountMap[id] || 0) + 1;
            stats.sumOfTotalRatingMap[id] = (stats.sumOfTotalRatingMap[id] || 0) + (detail.Rating ? parseInt(detail.Rating) : 0);
            stats.reviewCountMap[id] = (stats.reviewCountMap[id] || 0) + (detail.Review ? 1 : 0);
            return stats;
        }, {
            ratingCountMap: {},
            sumOfTotalRatingMap: {},
            reviewCountMap: {},
        });
        const totalRating = ratingStatistics.ratingCountMap[Rated_item_id] || 0;
        const sumOfTotalRating = ratingStatistics.sumOfTotalRatingMap[Rated_item_id] || 0;
        const totalReviews = ratingStatistics.reviewCountMap[Rated_item_id] || 0;
        const averageRating = totalRating > 0 ? (sumOfTotalRating / totalRating).toFixed(1) : '0.0';
        // Get average rating
        const averageRatingStarCount = reviewRatingData.reduce((result, { Rating }) => {
            const ratingInt = parseInt(Rating);
            result[ratingInt] = (result[ratingInt] || 0) + 1;
            return result;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        

        // Review details (latest first) with pagination
        const userIds = reviewDetails.map((detail) => detail.UserID);
        const userMainImages = await UserMediaModel.findAll({
            attributes: ['UserID', 'Media_url'],
            where: {
                UserID: userIds,
                Is_main_media: true, // Fetch the user's main image
            },
            raw: true,
        });

        // Create a map to store the user main images
        const userMainImageMap = userMainImages.reduce((map, userImage) => {
            map[userImage.UserID] = `${process.env.BASE_URL}${userImage.Media_url}`;
            return map;
        }, {});

        // Attach user main image URLs to corresponding ReviewDetails
        for (const detail of reviewDetails) {
            detail.UserMainImage = userMainImageMap[detail.UserID] || '';
        }

        // Map RatingMedia to Rating records based on RatingID
        const ratingMediaRecords = await RatingMediaModel.findAll({
            where: {
                RatingID: reviewDetails.map((detail) => detail.ID),
            },
            attributes: ['ID', 'RatingID', 'Media_url'], // Include RatingID to associate media with the correct review
        });

        const ratingMediaMap = ratingMediaRecords.reduce((map, media) => {
            if (!map[media.RatingID]) {
                map[media.RatingID] = [];
            }
            map[media.RatingID].push({
                ID: media.ID,
                URL: `${process.env.BASE_URL}${media.Media_url}`,
            });
            return map;
        }, {});

        // Attach media URLs to corresponding ReviewDetails
        for (const detail of reviewDetails) {
            detail.MediaUrl = ratingMediaMap[detail.ID] || [];
        }

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);
        let currentUserDetails = [];
        if (UserID) {
            currentUserDetails = await RatingModel.findAll({
                where: {
                    UserID,
                    Rated_item_type,
                    Rated_item_id,
                },
                attributes: ['ID', 'Rated_item_type', 'Rating', 'Name', 'Review', 'Created_at'],
                raw: true,
            });
            for (const detail of currentUserDetails) {
                detail.UserMainImage = userMainImageMap[detail.UserID] || '';
                detail.MediaUrl = ratingMediaMap[detail.ID] || [];
            }
        }
        const ratingDetails = {
            data: {
                TotalReview: totalReviews,
                TotalRating: totalRating,
                AverageRating: averageRating,
                StarredCount: averageRatingStarCount,
                CurrentDetails: currentUserDetails,
                ReviewDetails: reviewDetails
            },
            totalPages,
            currentPage,
            totalRecords: count,
            status: messages.success.STATUS
        };

        return res.status(200).json(ratingDetails);
    } catch (error) {
        return next(error);
    }
}

async function getCurrentRatingDetail(req, res, next) {
    // #swagger.tags = ['Rating']
    // #swagger.description = 'Get current user rating details'
  
    const { UserID, Rated_item_id, Rated_item_type } = req.body;
  
    try {
      if (UserID || Rated_item_id || Rated_item_type) {
        // Find the rating details based on UserID, Rated_item_id, and Rated_item_type
        const ratingDetails = await RatingModel.findOne({
          where: {
            UserID,
            Rated_item_id,
            Rated_item_type,
          },
          attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by','Name','IsAnonymous'] }
        });
  
        if (!ratingDetails) {
          return res.status(404).json({ message: messages.error.RATING_NOT_FOUND, status: messages.error.STATUS });
        }
  
        // Find media details based on RatingID
        const mediaDetails = await RatingMediaModel.findAll({
          where: {
            RatingID: ratingDetails.ID,
          },
          attributes: ['ID', 'Media_url', 'Media_type'],
        });
  
        // Map and format the response
        const formattedMedia = mediaDetails.map((media) => ({
          ID: media.ID,
          URL: `${process.env.BASE_URL}${media.Media_url}`,
        }));
  
        const data = {
          data: {
            ...ratingDetails.get({ plain: true }), // Spread the properties of ratingDetails directly into the data object
            MediaUrl: formattedMedia,
          },
          status: messages.success.STATUS,
        };
  
        return res.status(200).json(data);
      }
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
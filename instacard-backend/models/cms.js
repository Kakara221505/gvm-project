const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  homeContent: [
    {
      title: { type: String },
      subtitle: { type: String },
      imageUrl: { type: String }
    }
  ],
  exploreByCategory: [
    {
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      image: { type: String }
    }
  ],
  offerSection: [
    {
      title: { type: String },
      description: { type: String },
      image: { type: String }
    }
  ],
  superSaveBanner: [
    {
      title: { type: String },
      subtitle: { type: String },
      imageUrl: { type: String }
    }
  ],
  mobileAccessoriesBanner: [
    {
      title: { type: String },
      subtitle: { type: String },
      imageUrl: { type: String }
    }
  ],
  offer: [
    {
      title: { type: String },
      subtitle: { type: String },
      imageUrl: { type: String }
    }
  ],
  offerExploreByCategory: [
    {
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      offerTitle: { type: String },
      image: { type: String }
    }
  ]
}, {
  timestamps: true,
  collection: 'cms'
});

module.exports = mongoose.model('CMS', cmsSchema);

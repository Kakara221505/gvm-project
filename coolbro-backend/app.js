const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Enable CORS for all routes
app.use(cors());

require('dotenv').config()
const port = process.env.PORT || 3000; // Set the port to 3000 or use the environment variable

// Import middlewares
const authenticate = require('./middlewares/authenticate');
const authorize = require('./middlewares/authorize');

const { dashLogger } = require("./utils/logger");

// Set up body-parser middleware to handle JSON and urlencoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userDetailRoutes = require('./routes/userDetailRoutes');
const dealerRoutes = require('./routes/dealerRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const energyEfficiencyRatingRoutes = require('./routes/energyEfficiencyRatingRoutes');
const productRoutes = require('./routes/productRoutes');
const variationRoutes = require('./routes/variationRoutes');
const addressRoutes = require('./routes/addressRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactUsRoutes = require('./routes/contactUsRoutes');
const userAirConditionServiceRoutes = require('./routes/userAirConditionServiceRoutes');
const cartRoutes = require('./routes/cartRoutes')
const HomePageRoutes = require('./routes/homesSectionRoutes');
const CommonRoute = require('./routes/commonRoute')


app.use('/auth', authRoutes);
app.use('/users', authenticate, userRoutes);
app.use('/userdetail', userDetailRoutes);
app.use('/dealer', dealerRoutes);
app.use('/distributor', distributorRoutes);
app.use('/category', categoryRoutes);
app.use('/brand', brandRoutes);
app.use('/energyefficiencyrating', energyEfficiencyRatingRoutes);
app.use('/product', productRoutes);
app.use('/variation', variationRoutes);
app.use('/address', addressRoutes);
app.use('/rating', ratingRoutes);
app.use('/order', orderRoutes);
app.use('/contactus', contactUsRoutes);
app.use('/service', userAirConditionServiceRoutes);
app.use('/cart', cartRoutes);
app.use('/homepagesection', HomePageRoutes);
app.use('/common', CommonRoute)


// Serve static files
const staticPaths = [
  { path: '/usermedia', dir: process.env.USER_MEDIA_PATH },
  { path: '/documents', dir: process.env.DOCUMENT_PATH },
  { path: '/ratingmedia', dir: process.env.RATING_MEDIA_PATH },
  { path: '/categorymedia', dir: process.env.CATEGORY_IMAGE_PATH },
  { path: '/brandmedia', dir: process.env.BRAND_IMAGE_PATH },
  { path: '/productmedia', dir: process.env.PRODUCT_MEDIA_PATH },
  { path: '/servicemedia', dir: process.env.SERVICE_MEDIA_PATH }
];

staticPaths.forEach((staticPath) => {
  app.use(staticPath.path, express.static(staticPath.dir));
});

// Serve Swagger documentation at /doc route
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // const lineNumber = err.stack.split('\n')[1].trim().split(':')[1];
  // console.error(lineNumber);
  dashLogger.error(`${err}, \nRequest: ${req.originalUrl}, \nRequest Params: ${JSON.stringify(req.query)}, \nRequest Body: ${JSON.stringify(req.body)}, \nError: ${err.stack}`);
  res.status(500).json({ message: 'Something went wrong' });
});

// Start the server and listen to the port
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

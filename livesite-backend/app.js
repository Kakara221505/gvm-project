const express = require("express");
const cors = require("cors");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const http = require("http"); // Import http module
const { Server } = require("socket.io"); // Import Socket.IO



// Enable CORS for all routes
app.use(cors());

const server = http.createServer(app);



require("dotenv").config();
const port = process.env.PORT || 3000; // Set the port to 3000 or use the environment variable

// Import middlewares
const authenticate = require("./middlewares/authenticate");
const authorize = require("./middlewares/authorize");

const { dashLogger } = require("./utils/logger");

// Set up body-parser middleware to handle JSON and urlencoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const layerRoutes = require("./routes/layerRoutes");
const annotationRoutes = require("./routes/annotationRoutes");
const collaborationPermissionRoutes = require("./routes/collaborationPermissionRoutes");
const calenderRoutes = require("./routes/calenderRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const backgroundRoutes = require("./routes/backgroundItemRoutes");
const pageRoutes = require("./routes/pageRoutes");
const shareRoutes = require("./routes/shareRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const filterRoutes = require("./routes/filterRoutes");
const termsConditionRoutes = require("./routes/termsConditionRoutes");
const privacyRoutes = require("./routes/privacyRoutes");
const conatctRoutes = require("./routes/contactRoutes");

app.use("/auth", authRoutes);
app.use("/organization", organizationRoutes);
app.use("/users", authenticate, userRoutes);
app.use("/project", authenticate, projectRoutes);
app.use("/layer", authenticate, layerRoutes);
app.use("/annotation", authenticate, annotationRoutes);
app.use(
  "/collaborationpermission",
  authenticate,
  collaborationPermissionRoutes
);
app.use("/calender", authenticate, calenderRoutes);
app.use("/background", authenticate, backgroundRoutes);
app.use("/page", authenticate, pageRoutes);
app.use("/share", authenticate, shareRoutes);
app.use("/category", authenticate, categoryRoutes);
app.use("/filter", authenticate, filterRoutes);
app.use("/terms-condition", authenticate, termsConditionRoutes);
app.use("/privacy", authenticate, privacyRoutes);
app.use("/contact", authenticate, conatctRoutes);
// const OrganizationModel =require('./models/organization');
// const OrganizationUserRelationModel = require('./models/OrganizationUserRelation');
// const ShareModel = require('./models/Share');
const BobModel = require('./models/Bob');
const { determineEditability } = require('./utils/commonFunctions');

// Serve static files
const staticPaths = [
  { path: "/projectmedia", dir: process.env.PROJECT_FILE_PATH },
  { path: "/profile", dir: process.env.PROFILE_IMAGE_PATH },
  { path: "/backgroundMedia", dir: process.env.BACKGROUND_IMAGE_PATH },
];

staticPaths.forEach((staticPath) => {
  app.use(staticPath.path, express.static(staticPath.dir));
});

// Serve Swagger documentation at /doc route
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  dashLogger.error(
    `${err}, \nRequest: ${req.originalUrl}, \nRequest Params: ${JSON.stringify(
      req.query
    )}, \nRequest Body: ${JSON.stringify(req.body)}`
  );
  res.status(500).json({ message: "Something went wrong" });
});


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  // socket.on("example", async (data) => {
  //     // if (data.pages) {   
  //     //   for (const page of data.pages) {
  //     //     if (page.calendar && page.calendar.layers) {
  //     //       for (const layer of page.calendar.layers) {
  //     //         if (layer.annotations.length >= 1) {
  //     //           for (const annotation of layer.annotations) {    
  //     //             try {
  //     //               // Fetch data from Bob table
  //     //               const bobRecord = await BobModel.findOne({
  //     //                 where: { bob_no_id: annotation.bob_no_id },
  //     //                 attributes: ["CategoryID", "SubCategoryID", "properties"],
  //     //               });

  //     //               // Attach CategoryID and SubCategoryID
  //     //               if (bobRecord) {
  //     //                 annotation.dataValues = annotation.dataValues || {};
  //     //                 annotation.dataValues.CategoryID = bobRecord.CategoryID;
  //     //                 annotation.dataValues.SubCategoryID = bobRecord.SubCategoryID;
  //     //                 // Update title object
  //     //                 const titleObject = bobRecord.properties;
  //     //                 if (titleObject && annotation.Type) {
  //     //                   titleObject.PageID = page.ID;
  //     //                   titleObject.LayerID = layer.ID;
  //     //                   titleObject.AssignDate = annotation.AssignDate;
  //     //                   titleObject.ParentAnnotationID = annotation.front_no_id;

  //     //                   // Update annotation title
  //     //                   annotation.dataValues.properties = annotation.dataValues.properties || {};
  //     //                   annotation.dataValues.properties.title = {
  //     //                     ...(annotation.dataValues.properties.title || {}),
  //     //                     text: titleObject.text,
  //     //                   };
  //     //                 } else {
  //     //                   annotation.dataValues.properties = annotation.dataValues.properties || {};
  //     //                   annotation.dataValues.properties.title = null;
  //     //                 }
  //     //               }
  //     //               console.log("darkoT")
                     
  //     //               // Determine editability
  //     //               const isEditable = await determineEditability(data, annotation);
  //     //               annotation.IsEditable = isEditable;
  //     //             } catch (err) {
  //     //               console.error("Error processing annotation:", err);
  //     //             }
  //     //           }
  //     //         }
  //     //       }
  //     //     }
  //     //   }
  //     // }
  //   io.emit("example", data); 
  // });


  socket.on("authenticate", (userId) => {
    // Add the user to a room identified by their user ID
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room for user ${userId}`);
  });


   // Join a room based on the project ID
   socket.on("joinProject", (projectId) => {
    socket.join(projectId); // Adds the socket to a room with the project ID
    console.log(`Socket ${socket.id} joined room ${projectId}`);
  });

  // Handle "example" events and broadcast only to the room
  socket.on("example", async (data) => {
    const projectId = data?.project?.ID; // Extract the project ID from the data
    if (projectId) {
      io.to(projectId).emit("example", data); // Broadcast to all users in the project room
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});



// Pass the Socket.IO instance to routes
app.set("io", io);

// Start the server and listen to the port
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

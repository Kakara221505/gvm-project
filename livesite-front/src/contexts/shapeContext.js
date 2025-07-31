import React, { createContext, useContext, useReducer } from "react";
import createId from "../Common/Constants/CreateId";

// Initial state for shapes, properties, etc.

// here canvasData contains data for all the canvas related, and canvasShapes constains data of all canvas available, where each entry is a canvas,
// whithing it, each entry contains { canvas-id, shapes, and userShapes }

const dummyUsers = [
  {
    // canvasId:"",
    id: 1,
    user: "Rishabh",
    shapes: [],
  },
];
const initialState = {
  pages: [
    {
      ID: "canvas-0d09fda1-221e-42a0-bb2e-dc30006a652e",
      calendar: {
        ID: createId(),
        Date: new Date().toLocaleDateString(),
        layers: [
          //userShapes
          {
            ID: "f6e15ae4-c11d-487a-9404-fd2343580433",
            Name: "user 1",
            fillColor: "#ffffff",
            strokeColor: "#000000",
            IsVisible: true,
            IsLocked: false,
            annotations: [], //shapes
          },
        ],
      },
      background: {
        ID: new Date().getTime(),
        type: "solid",
        value: "#444",
        assignType: "single",
        assignedDate: new Date(),
        startDate: null,
        endDate: null,
        flag: "default",
      },
    },
  ],
  properties: {
    fillColor: "#ffffff",
    opacity: 0,
    fillType: "Solid",
    fillEnabled: true,
    color1: "#ffffff",
    color2: "#1DB8CE",
    pattern: "Diagonal",
    fontStyle: "Inter",
    fontSize: 20,
    fontWeight: "Normal",
    align: "left",
    decoration: "",
    strokeColor: "#000",
    strokeWidth: 2,
    strokeType: "Solid",
    strokeOpacity: 0,
    fontFamily: "Arial"
  },
  currentUser: "f6e15ae4-c11d-487a-9404-fd2343580433",
  selectedObject: null,
  selectedObjIdx: -1,
  selectDate: new Date().toLocaleDateString(),
  commentAddEditFlag: false,
  commentText: "",
  titleText: "",
  canvases: [{ id: "canvas-0d09fda1-221e-42a0-bb2e-dc30006a652e" }],
  activeCanvas: "canvas-0d09fda1-221e-42a0-bb2e-dc30006a652e",
  currentOption: null,
  currentObj: null,
  showEmoji: false,
  isHighlightOn: false,
  X_Cord: 0,
  Y_Cord: 0,
  currentTextTransform: "Lowercase",
  currentObjWidth: 80,
  currentObjHeight: 80,
  selectedShapeType: false,
  selectedShapeFilter: [],
  // Add other states as needed
};

// Action types
const ADD_SHAPE = "ADD_SHAPE";
const REMOVE_SHAPE = "REMOVE_SHAPE";
const UPDATE_SHAPE = "UPDATE_SHAPE";
const UPDATE_PROPERTIES = "UPDATE_PROPERTIES";
const ADD_USER_SHAPES = "ADD_USER_SHAPES";
const REMOVE_USER_SHAPE = "REMOVE_USER_SHAPE";
const UPDATE_CURRENT_USER = "UPDATE_CURRENT_USER";
const UPDATE_CURRENT_OBJ = "UPDATE_CURRENT_OBJ";
const RESET_SHAPE_PROPERTIES = "RESET_SHAPE_PROPERTIES";
const UPDATE_COMMENT_FLAG = "UPDATE_COMMENT_FLAG";
const UPDATE_COMMENT = "UPDATE_COMMENT";
const UPDATE_TITLE = "UPDATE_TITLE";
const ADD_CANVAS = "ADD_CANVAS";
const REMOVE_CANVAS = "REMOVE_CANVAS";
const REMOVE_CANVAS_ID = "REMOVE_CANVAS_ID";
const UPDATE_ACTIVE_CANVAS = "UPDATE_ACTIVE_CANVAS";
const SELECT_FILTER_SHAPE = "SELECT_FILTER_SHAPE";
const UPDATE_OPTION = "UPDATE_OPTION";
const UPDATE_CANVAS_POSITION = "UPDATE_CANVAS_POSITION";
// Add more action types as needed
const UPDATE_CANVAS = "UPDATE_CANVAS"; // New action type for updating canvas
const SET_SHOW_EMOJI = "SET_SHOW_EMOJI";
const TOGGLE_HIGHLIGHT = "TOGGLE_HIGHLIGHT";
const UPDATE_TEXT_TRANSFORM = "UPDATE_TEXT_TRANSFORM";
const UPDATE_CANVAS_BACKGROUND = "UPDATE_CANVAS_BACKGROUND";
const ADD_BACKGROUND = "ADD_BACKGROUND";
const UPDATE_BG_DATA = "UPDATE_BG_DATA";
const REMOVE_BACKGROUND = "REMOVE_BACKGROUND";
const UPDATE_WIDTH_HEIGHT = "UPDATE_WIDTH_HEIGHT";
const ADD_LAYER = "ADD_LAYER";
const UPDATE_LAYER = "UPDATE_LAYER";
const DELETE_LAYER = "DELETE_LAYER";
const MERGE_LAYERS = "MERGE_LAYERS";
const SELECTED_DATE = "SELECTED_DATE";
const GET_CANVAS_DATA = "GET_CANVAS_DATA";
const SELECT_SHAPE_TYPE = "SELECT_SHAPE_TYPE";
// Create the context
const ShapeContext = createContext();

// Create a custom hook to use the context
export const useShapeContext = () => {
  const context = useContext(ShapeContext);
  if (!context) {
    throw new Error("useShapeContext must be used within a ShapeProvider");
  }
  return context;
};

function getNewUsersArr(userShape) {
  const newUsers = [];
  for (let i = 0; i < dummyUsers.length; i++) {
    if (dummyUsers[i].id === userShape.currentUser) {
      const newDat = {
        id: dummyUsers[i].id,
        user: dummyUsers[i].user,
        shapes: [userShape?.shape],
      };
      newUsers.push(newDat);
    } else {
      newUsers.push(dummyUsers[i]);
    }
  }
  return newUsers;
}

// Reducer function
const shapeReducer = (state, action) => {
  switch (action.type) {
    case "ADD_SHAPE":
      const newShape = action.payload;
      const canvasIdx = newShape.PageID;
      // Find the canvas with the provided canvasId
      const canvasIndex = state.pages.findIndex(
        (canvas) => canvas.ID === canvasIdx
      );

      if (canvasIndex !== -1) {
        // If the canvas exists, make a copy of the pages array to update
        const updatedPages = [...state.pages];
        const canvas = { ...updatedPages[canvasIndex] };
        // Find the index of the layer where the shape should be added
        const layerIndex = canvas.calendar.layers.findIndex(
          (layer) => layer.ID === state.currentUser
        );

        if (layerIndex !== -1) {
          // If the layer exists, make a copy of the layers array to update
          const updatedLayers = [...canvas.calendar.layers];
          const layer = { ...updatedLayers[layerIndex] };
          // Add the new shape to the annotations array of the selected layer
          const updatedAnnotations = [...layer.annotations, newShape];
          layer.annotations = updatedAnnotations;
          // Update the layer in the layers array
          updatedLayers[layerIndex] = layer;
          // Update the calendar object in the canvas
          canvas.calendar = {
            ...canvas.calendar,
            layers: updatedLayers,
          };
          // Update the canvas in the pages array
          updatedPages[canvasIndex] = canvas;
          return {
            ...state,
            pages: updatedPages,
          };
        }
      } else {
        // If the canvas doesn't exist, create a new canvas entry
        const newCanvas = {
          canvasIdx,
          calendar: {
            ID: createId(),
            Date: new Date().toLocaleDateString(),
            layers: [
              {
                ID: createId(),
                Name: "user 1",
                annotations: [], //shapes
              },
            ],
          },
          background: {
            id: new Date().getTime(),
            type: "solid",
            value: "#444",
            assignType: "single",
            assignedDate: new Date().toLocaleDateString(),
            startDate: null,
            endDate: null,
            flag: "default",
          },
        };

        return {
          ...state,
          pages: [...state.pages, newCanvas],
        };
      }
    case "UPDATE_OPTION":
      return {
        ...state,
        currentOption: action.payload.currentOption,
        currentObj: action.payload.currentObj,
      };
    case "SELECT_FILTER_SHAPE":
      return {
        ...state,
        selectedShapeFilter: action.payload,
      };
    case "REMOVE_SHAPE":
      const { shapeId, canvasId2 } = action.payload;
      const canvasIndex3 = state.pages.findIndex(
        (canvas) => canvas.ID === canvasId2
      );

      if (canvasIndex3 !== -1) {
        const updatedCanvasShapes = [...state.pages];
        const canvas = updatedCanvasShapes[canvasIndex3];
        // Find the index of the shape in the canvas's shapes array
        const layerIndex = canvas.calendar.layers.findIndex(
          (layer) => layer.ID === shapeId.LayerID
        );
        if (layerIndex !== -1) {
          const shapeIndex = canvas.calendar.layers[
            layerIndex
          ].annotations.findIndex((shape) => shape.ID === shapeId.ID);

          if (shapeIndex !== -1) {
            canvas.calendar.layers[layerIndex].annotations.splice(
              shapeIndex,
              1
            );

            updatedCanvasShapes[canvasIndex3] = canvas;

            return {
              ...state,
              pages: updatedCanvasShapes,
            };
          }
        }
      }
      return state;

    case "UPDATE_SHAPE":
      const updatedCanvasShape = state.pages.map((canvasShape) => {
        // Check if it's the correct canvas by comparing the canvasId.
        if (canvasShape.ID === action.payload.PageID) {
          const updatedLayers = canvasShape.calendar.layers.map((layer) => {
            // Find the correct shape within the annotations
            const updatedAnnotations = layer.annotations.map((annotation) => {
              if (annotation.ID === action.payload.ShapeID) {
                return action.payload;
              }
              return annotation;
            });
            return {
              ...layer,
              annotations: updatedAnnotations,
            };
          });
          // Return the canvasShape with updated layers array.
          return {
            ...canvasShape,
            calendar: {
              ...canvasShape.calendar,
              layers: updatedLayers,
            },
          };
        }
        // Return the canvasShape without changes.
        return canvasShape;
      });
      return {
        ...state,
        pages: updatedCanvasShape,
      };

    case UPDATE_PROPERTIES:
      return {
        ...state,
        properties: {
          ...state.properties,
          [action.payload.field]: action.payload.value,
        },
      };
    case ADD_USER_SHAPES:
      const { currentUser, ID } = action.payload;
      const annotations = [action.payload];
      // Find the canvas with the provided canvasId
      const canvasIndex2 = state.pages?.findIndex((res) => res?.ID == ID);
      if (canvasIndex2 !== -1) {
        // If the canvas exists, make a copy of the canvasShapes array to update
        const updatedCanvasShapes = [...state.pages];
        const canvas = updatedCanvasShapes[canvasIndex2];
        // Find the user in the canvas's userShapes array
        const userIndex = canvas.calendar.layers.findIndex(
          (user) => user.ID === currentUser
        );

        if (userIndex !== -1) {
          // If the user exists, check if the shape already exists in their shapes array
          const user = canvas.calendar.layers[userIndex];
          const existingShapeIndex = user.annotations.findIndex(
            (s) => s === action.payload
          );

          if (existingShapeIndex === -1) {
            // If the shape doesn't exist in the user's shapes array, add it
            const updatedUserShapes = [...canvas.calendar.layers];
            updatedUserShapes[userIndex] = {
              ...user,
              annotations,
            };

            // Update the canvas's userShapes array with the modified user
            canvas.calendar.layers = updatedUserShapes;

            // Update the canvasShapes array with the modified canvas
            updatedCanvasShapes[canvasIndex2] = canvas;

            return {
              ...state,
              pages: updatedCanvasShapes,
            };
          }
        }
      }

      // If the canvas or user doesn't exist, return the current state
      return state;
    case "REMOVE_USER_SHAPE":
      const { canvasId4, userId, shapeId2 } = action.payload;

      // Find the canvas with the provided canvasId
      const canvasIndex4 = state.pages.findIndex(
        (canvas) => canvas.canvasId === canvasId4
      );

      if (canvasIndex4 !== -1) {
        // If the canvas exists, make a copy of the canvasShapes array to update
        const updatedCanvasShapes = [...state.pages];
        const canvas = updatedCanvasShapes[canvasIndex4];

        // Find the user in the canvas's userShapes array
        const userIndex = canvas.userShapes.findIndex(
          (user) => user.id === userId
        );

        if (userIndex !== -1) {
          // If the user exists, find the shape in the user's shapes array
          const user = canvas.userShapes[userIndex];
          const shapeIndex = user.shapes.findIndex(
            (shape) => shape === shapeId2
          );

          if (shapeIndex !== -1) {
            // If the shape is found, remove it from the user's shapes array
            user.shapes.splice(shapeIndex, 1);

            // Update the canvas's userShapes array with the modified user
            const updatedUserShapes = [...canvas.userShapes];
            updatedUserShapes[userIndex] = user;
            canvas.userShapes = updatedUserShapes;

            // Update the canvasShapes array with the modified canvas
            updatedCanvasShapes[canvasIndex4] = canvas;

            return {
              ...state,
              pages: updatedCanvasShapes,
            };
          }
        }
      }
      // If the canvas, user, or shape doesn't exist, return the current state
      return state;

    case ADD_LAYER:
      const canvasShapes = state?.pages.map((canvas) => {
        if (state?.activeCanvas === canvas?.ID) {
          const newUserShape = action.payload;
          // Push the new shape to the layers array
          const updatedLayers = [...canvas.calendar.layers, newUserShape];
          const updatedCanvas = {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: updatedLayers,
            },
          };
          return updatedCanvas;
        }
        return canvas;
      });

      return {
        ...state,
        pages: canvasShapes,
      };
      break;

    case SELECTED_DATE:
      return {
        ...state,
        selectDate: action.payload,
      };
      break;

    case UPDATE_LAYER: {
      const {
        canvasId,
        layerId,
        newName,
        fillColor,
        strokeColor,
        IsLocked,
        IsVisible,
      } = action.payload;
      const updatedCanvasData = state.pages.map((canvas) => {
        if (canvas.ID === canvasId) {
          return {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: canvas.calendar.layers.map((layer) => {
                if (layer.ID === layerId && newName !== undefined) {
                  return {
                    ...layer,
                    Name: newName,
                  };
                } else if (layer.ID === layerId && fillColor !== undefined) {
                  return {
                    ...layer,
                    fillColor: fillColor,
                  };
                } else if (layer.ID === layerId && strokeColor !== undefined) {
                  return {
                    ...layer,
                    strokeColor: strokeColor,
                  };
                } else if (layer.ID === layerId && IsLocked !== undefined) {
                  return {
                    ...layer,
                    IsLocked: IsLocked,
                  };
                } else if (layer.ID === layerId && IsVisible !== undefined) {
                  return {
                    ...layer,
                    IsVisible: IsVisible,
                  };
                }
                return layer;
              }),
            },
          };
        }
        return canvas;
      });
      return {
        ...state,
        pages: updatedCanvasData,
      };
    }

    case SELECT_SHAPE_TYPE:
      return {
        ...state,
        selectedShapeType: action.payload,
      };

    case MERGE_LAYERS:
      const { selectedCanvasId, layerIds, mergedLayerName } = action.payload;
      const updatedCanvasShapesMerged = state.pages.map((canvas) => {
        if (canvas.ID === selectedCanvasId) {
          let mergedShapes = [];
          let remainingShapes = [];

          canvas.calendar.layers.forEach((shape) => {
            if (layerIds.includes(shape.ID)) {
              mergedShapes = [...mergedShapes, ...shape.annotations];
            } else {
              remainingShapes.push(shape);
            }
          });

          const newLayerId = createId(); // Create the new layer ID
          mergedShapes.forEach((annotation) => {
            annotation.set("LayerID", newLayerId); // Use the set method to update the LayerId
          });

          const newLayer = {
            ID: newLayerId,
            annotations: mergedShapes,
            Name: mergedLayerName, // Set a name for the merged layer
          };

          return {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: [...remainingShapes, newLayer],
            },
          };
        }
        return canvas;
      });

      return {
        ...state,
        pages: updatedCanvasShapesMerged,
      };

    case DELETE_LAYER: {
      const { delCanvasId, layerId } = action.payload;
      let deletedlayer = [];
      const updatedCanvasaData = state.pages.map((canvasData) => {
        if (canvasData.ID === delCanvasId) {
          const deletelayerFind = canvasData.calendar.layers.find(
            (item) => item.ID === layerId
          );
          deletedlayer.push(deletelayerFind);
          const updatedUserShapes = canvasData.calendar.layers.filter(
            (item) => item.ID !== layerId
          );
          return {
            ...canvasData,
            calendar: {
              ...canvasData.calendar,
              layers: updatedUserShapes,
            },
          };
        }
        return canvasData;
      });
      // Return updated state with modified canvasShapes array
      return {
        ...state,
        pages: updatedCanvasaData,
        deletedlayer,
      };
    }

    case UPDATE_CANVAS_POSITION:
      return {
        ...state,
        X_Cord: action.payload.x,
        Y_Cord: action.payload.y,
      };
      break;

    case UPDATE_WIDTH_HEIGHT:
      return {
        ...state,
        currentObjHeight: action.payload.ht,
        currentObjWidth: action.payload.wd,
      };
      break;
    // Handle other actions here
    case UPDATE_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload,
      };
    case UPDATE_CURRENT_OBJ:
      return {
        ...state,
        selectedObject: action.payload?.selectedObj,
        selectedObjIdx: action.payload?.selectedObjIdx,
      };
    case RESET_SHAPE_PROPERTIES:
      return {
        ...state,
        properties: {
          ...state.properties,
          fillColor: "#ffffff",
          opacity: 0,
          fillType: "Solid",
          fillEnabled: true,
          color1: "#ffffff",
          color2: "#1DB8CE",
          pattern: "Diagonal",
          fontStyle: "Inter",
          fontSize: 10,
          fontWeight: "Normal",
          align: "left",
          decoration: "",
          strokeColor: "#000",
          strokeWidth: 2,
          strokeType: "Solid",
          strokeOpacity: 0,
        },
      };
    case UPDATE_COMMENT_FLAG:
      return {
        ...state,
        commentAddEditFlag: action.payload,
      };
    case UPDATE_COMMENT:
      return {
        ...state,
        commentText: action.payload,
      };
    case UPDATE_TITLE:
      return {
        ...state,
        titleText: action.payload,
      };
    case "GET_CANVAS_DATA":
      return {
        ...state,
        pages: action.payload,
      };
    case "ADD_CANVAS":
      const newCanvasId = action.payload;
      // Create a new canvas object
      const newCanvas = { id: newCanvasId };
      // Add the new canvas to the 'canvases' array
      const updatedCanvases = [...state.canvases, newCanvas];
      // Create a new entry in the 'pages' array
      const newCanvasShapesEntry = {
        ID: newCanvasId,
        calendar: {
          ID: createId(),
          Date: new Date().toLocaleDateString(),
          layers: [
            {
              ID: createId(),
              Name: "user 1",
              annotations: [],
              IsLocked: false,
              IsVisible: true,
              fillColor: "#ffffff",
              strokeColor: "#000000",
            },
          ],
        },
        background: {
          id: new Date().getTime(),
          type: "solid",
          value: "#444",
          assignType: "single",
          assignedDate: new Date().toLocaleDateString(),
          startDate: null,
          endDate: null,
          flag: "default",
        },
      };
      // Update the 'canvasId' for the userShapes
      const updatedCanvasShapes = [...state.pages];

      return {
        ...state,
        canvases: updatedCanvases,
        pages: [...updatedCanvasShapes, newCanvasShapesEntry],
      };

    case REMOVE_CANVAS_ID:
      return {
        ...state,
        isCanvasDelete: action.payload,
      };

    case REMOVE_CANVAS:
      const removeCanvasId = action.payload;
      const canvasFindIndex = state.canvases.filter(
        (res) => res.id !== removeCanvasId
      );
      const totalCanvases = state.canvases.filter(
        (canvas) => canvas.id !== removeCanvasId
      );
      const totalPages = state.pages.filter(
        (pageItem) => pageItem.ID !== removeCanvasId
      );
      return {
        ...state,
        activeCanvas: canvasFindIndex[0].id,
        canvases: totalCanvases,
        pages: totalPages,
      };

    case UPDATE_ACTIVE_CANVAS:
      return {
        ...state,
        activeCanvas: action.payload,
      };

    case UPDATE_CANVAS:
      const page = state.pages.find((res) => res?.ID === state?.activeCanvas);
      let currentLayer = null;

      if (page) {
        currentLayer = page.calendar?.layers.find(
          (layer) => layer?.ID === state?.currentUser
        );
      }

      const updatedShapesCanvas = currentLayer.annotations.map((shape) => {
        // Handle different shape types
        switch (shape.type) {
          case "triangle":
          case "rectangle":
          case "ellipse": // Assuming ellipse represents a circle
          case "hexagon":
            return {
              ...shape,
              canvas: action.payload,
            };
          default:
            return shape;
        }
      });

      return {
        ...state,
        shapes: updatedShapesCanvas,
      };

    case SET_SHOW_EMOJI:
      return {
        ...state,
        showEmoji: action.payload,
      };
    case TOGGLE_HIGHLIGHT:
      return {
        ...state,
        isHighlightOn: action.payload,
      };
    case UPDATE_TEXT_TRANSFORM:
      return {
        ...state,
        currentTextTransform: action.payload,
      };
    case UPDATE_CANVAS_BACKGROUND:
      const { canvasId5, newColor, id } = action.payload; // Extract canvasId and newColor from the action payload

      // Find the canvas with the specified canvasId
      const canvasIdx2 = state.pages.findIndex(
        (canvas) => canvas.ID === canvasId5
      );

      // If the canvas is found, update its background color
      if (canvasIdx2 !== -1) {
        const updatedCanvasShapes = [...state.pages]; // Create a copy of the canvasShapes array
        updatedCanvasShapes[canvasIdx2].background.value = newColor; // Assuming the background color is the first element in the background array
        updatedCanvasShapes[canvasIdx2].background.ID = id;
        updatedCanvasShapes[canvasIdx2].background.type = "solid";
        updatedCanvasShapes[canvasIdx2].background.assignType = "all";
        updatedCanvasShapes[canvasIdx2].background.assignedDate = new Date();

        // Return the updated state
        return {
          ...state,
          pages: updatedCanvasShapes,
        };
      }
      // If the canvas with the specified canvasId is not found, return the current state
      return state;

    case ADD_BACKGROUND:
      const { canvasId6, data, startDate, endDate, type, id2 } = action.payload; // Extract canvasId and other necessary data from the action payload

      // Find the canvas with the specified canvasId
      const canvasIdx3 = state.pages.findIndex(
        (canvas) => canvas.canvasId === canvasId6
      );

      // If the canvas is found, check if the background with the same ID already exists
      if (canvasIdx3 !== -1) {
        const canvas = state.pages[canvasIdx3];
        const existingBackgroundIndex = canvas.background.findIndex(
          (bg) => bg.id === id2
        );

        if (existingBackgroundIndex !== -1) {
          // If background with the same ID exists, update it
          const updatedCanvasShapes = [...state.pages]; // Create a copy of the canvasShapes array
          updatedCanvasShapes[canvasIdx3].background[existingBackgroundIndex] =
            {
              ...canvas.background[existingBackgroundIndex],
              value: data, // Update background data
              startDate, // Update start date
              endDate, // Update end date
            };

          // Return the updated state
          return {
            ...state,
            pages: updatedCanvasShapes,
          };
        } else {
          // If background with the same ID doesn't exist, add a new background
          const updatedCanvasShapes = [...state.pages]; // Create a copy of the canvasShapes array
          const newBackground = {
            id: id2,
            type: type, // Example type, replace with the actual type
            value: data, // New background data
            assignType: "single", // Example assignType, replace with the actual assignType
            assignedDate: new Date(), // Example assignedDate, replace with the actual date
            startDate, // Start date
            endDate, // End date
          };
          updatedCanvasShapes[canvasIdx3].background.push(newBackground); // Push the new background object to the background array

          // Return the updated state
          return {
            ...state,
            pages: updatedCanvasShapes,
          };
        }
      }

      // If the canvas with the specified canvasId is not found, return the current state
      return state;

    case UPDATE_BG_DATA:
      const {
        canvasId7,
        data2,
        startDate2,
        endDate2,
        type2,
        id3,
        assignedDate,
      } = action.payload; // Extract necessary data from the action payload

      // Find the index of the canvas with the specified canvasId
      const canvasIndex6 = state.pages.findIndex(
        (canvas) => canvas.ID === canvasId7
      );

      // If the canvas is found
      if (canvasIndex6 !== -1) {
        const updatedCanvasShapes = [...state.pages]; // Create a copy of the canvasShapes array
        const backgroundIndex = updatedCanvasShapes[
          canvasIndex6
        ].background.findIndex((bg) => bg.id === id3);

        // If the background object with the given ID is found
        if (backgroundIndex !== -1) {
          // Update the startDate and endDate properties of the existing background object
          updatedCanvasShapes[canvasIndex6].background[
            backgroundIndex
          ].startDate = startDate2;
          updatedCanvasShapes[canvasIndex6].background[
            backgroundIndex
          ].endDate = endDate2;
          updatedCanvasShapes[canvasIndex6].background[
            backgroundIndex
          ].assignType = type2;
          updatedCanvasShapes[canvasIndex6].background[
            backgroundIndex
          ].assignedDate = assignedDate;
        } else {
          // Create a new background object
          const newBackground = {
            id: id3,
            assignType: type2,
            value: data2,
            assignType: "single",
            assignedDate: new Date().toLocaleDateString(),
            startDate: startDate2,
            endDate: endDate2,
          };
          updatedCanvasShapes[canvasIndex6].background.push(newBackground); // Push the new background object to the background array
        }

        // Return the updated state
        return {
          ...state,
          pages: updatedCanvasShapes,
        };
      }

      // If the canvas with the specified canvasId is not found, return the current state
      return state;

    default:
      return state;
  }
};

// Create the provider component
export const ShapeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shapeReducer, initialState);

  // Actions
  const addShape = (shape) => {
    dispatch({ type: ADD_SHAPE, payload: shape });
  };
  const selectShapeType = (shape) => {
    dispatch({ type: SELECT_SHAPE_TYPE, payload: shape });
  };

  const removeShape = (shape) => {
    dispatch({ type: REMOVE_SHAPE, payload: shape });
  };

  const addLayer = (layer) => {
    dispatch({ type: ADD_LAYER, payload: layer });
  };

  const updateLayer = (layer) => {
    dispatch({ type: UPDATE_LAYER, payload: layer });
  };

  const deleteLayer = (data) => {
    dispatch({ type: DELETE_LAYER, payload: data });
  };

  const mergeLayers = (data) => {
    dispatch({ type: MERGE_LAYERS, payload: data });
  };

  const updateBGdata = (data) => {
    dispatch({ type: UPDATE_BG_DATA, payload: data });
  };
  const updateTextTransform = (text) => {
    dispatch({ type: UPDATE_TEXT_TRANSFORM, payload: text });
  };

  const updateShape = (shape) => {
    dispatch({ type: UPDATE_SHAPE, payload: shape });
  };

  const updateActiveCanvas = (canvasId) => {
    dispatch({ type: UPDATE_ACTIVE_CANVAS, payload: canvasId });
  };

  const getCanvasData = (data) => {
    dispatch({ type: GET_CANVAS_DATA, payload: data });
  };

  const addCanvas = (canvasId) => {
    dispatch({ type: ADD_CANVAS, payload: canvasId });
  };

  const removeCanvas = (canvasId) => {
    dispatch({ type: REMOVE_CANVAS, payload: canvasId });
  };

  const removeCanvasID = (canvasId) => {
    dispatch({ type: REMOVE_CANVAS_ID, payload: canvasId });
  };

  const resetShape = () => {
    dispatch({ type: RESET_SHAPE_PROPERTIES });
  };

  const updateCommentAddEditFlag = (value) => {
    dispatch({ type: UPDATE_COMMENT_FLAG, payload: value });
  };

  const updateCanvas = (canvasData) => {
    dispatch({ type: UPDATE_CANVAS, payload: canvasData });
  };

  const updateCanvasPosition = (positions) => {
    dispatch({ type: UPDATE_CANVAS_POSITION, payload: positions });
  };

  const updateProperties = (updatedProperties) => {
    dispatch({ type: UPDATE_PROPERTIES, payload: updatedProperties });
  };

  const addUserShapes = (userShape) => {
    dispatch({ type: ADD_USER_SHAPES, payload: userShape });
  };
  const removeUserShape = (userShape) => {
    dispatch({ type: REMOVE_USER_SHAPE, payload: userShape });
  };

  const updateObjWidHeight = (data) => {
    dispatch({ type: UPDATE_WIDTH_HEIGHT, payload: data });
  };

  const updateCurrentUser = (newUserId) => {
    dispatch({ type: UPDATE_CURRENT_USER, payload: newUserId });
  };

  const updateCurrentObj = (newObj) => {
    dispatch({ type: UPDATE_CURRENT_OBJ, payload: newObj });
  };

  const selectFilterShape = (selectedShapes) => {
    dispatch({ type: SELECT_FILTER_SHAPE, payload: selectedShapes });
  };

  const updateCurrentOpt = (newOpt) => {
    dispatch({ type: UPDATE_OPTION, payload: newOpt });
  };

  const updateCommentText = (comment) => {
    dispatch({ type: UPDATE_COMMENT, payload: comment });
  };

  const selectedCalendarDate = (date) => {
    dispatch({ type: SELECTED_DATE, payload: date });
  };

  const updateTitleText = (title) => {
    dispatch({ type: UPDATE_TITLE, payload: title });
  };

  const toggleShowEmoji = (val) => {
    dispatch({ type: "SET_SHOW_EMOJI", payload: val });
  };

  const toggleIsHighLight = (val) => {
    dispatch({ type: "TOGGLE_HIGHLIGHT", payload: val });
  };

  const updateShapeBackground = (shape) => {
    dispatch({ type: UPDATE_CANVAS_BACKGROUND, payload: shape });
  };

  const addBackgroundToCanvas = (bgData) => {
    dispatch({ type: "ADD_BACKGROUND", payload: bgData });
  };

  const removeBackground = (bgId) => {
    dispatch({ type: "REMOVE_BACKGROUND", payload: bgId });
  };

  // Provide the state and actions to the Components
  const contextValue = {
    state,
    actions: {
      addShape,
      updateShape,
      addUserShapes,
      updateCurrentUser,
      updateCurrentObj,
      resetShape,
      updateCommentAddEditFlag,
      updateCommentText,
      updateProperties,
      selectFilterShape,
      updateTitleText,
      addCanvas,
      removeCanvas,
      removeCanvasID,
      updateActiveCanvas,
      updateCurrentOpt,
      removeShape,
      removeUserShape,
      toggleShowEmoji,
      // Add more actions here
      updateCanvas,
      toggleIsHighLight,
      updateCanvasPosition,
      updateTextTransform,
      updateShapeBackground,
      addBackgroundToCanvas,
      updateBGdata,
      removeBackground,
      updateObjWidHeight,
      addLayer,
      updateLayer,
      deleteLayer,
      mergeLayers,
      selectedCalendarDate,
      getCanvasData,
      selectShapeType,
    },
  };

  return (
    <ShapeContext.Provider value={contextValue}>
      {children}
    </ShapeContext.Provider>
  );
};

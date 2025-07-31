import React, { createContext, useContext, useReducer } from "react";
import createId from "../Common/Constants/CreateId";
import { GlobalValues } from "../Lib/GlobalValues";
import { postApiCaller } from "../Lib/apiCaller";
import {
  updateAnnotationLayerAPI,
  updateLayerAPI,
} from "../Components/Modals/AddLayerModal";
import UseSaveData from "../Components/SaveData/SaveEditorData";
import _ from "lodash";

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

let undoStack = {};
let redoStack = {};

function initializeStacks(pageID) {
  if (!undoStack[pageID]) {
    undoStack[pageID] = [];
  }
  if (!redoStack[pageID]) {
    redoStack[pageID] = [];
  }
}

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
            ID: "1111111111",
            Name: "user 1",
            fillColor: "#ffffff",
            strokeColor: "#000000",
            IsVisible: true,
            IsLocked: false,
            annotations: [], //shapes,
            Layer_order: 1,
            strokeWidth: 2,
            font_size: 20,
            font_family: "Arial",
            strokeType: "Solid",
            UserID: createId(),
            PageID: createId(),
          },
        ],
      },
      background: [
        {
          ID: localStorage.getItem("bgImageId"),
          type: "solid",
          BackGroundColor: "#f7f7fa",
          assignType: "single",
          assignedDate: new Date(),
          startDate: null,
          endDate: null,
          flag: "default",
        },
      ],
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
    fontStyle: "Normal",
    fontSize: 20,
    fontWeight: "Normal",
    align: "left",
    decoration: "",
    strokeColor: "#000000",
    strokeWidth: 2,
    strokeType: "Solid",
    strokeOpacity: 0,
    fontFamily: "Arial",
  },
  fieldProperty: {},
  currentUser: "1111111111",
  selectedObject: null,
  activeObjects: [],
  selectedObjIdx: -1,
  selectDate: new Date(),
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
  currentObjWidth: 0,
  currentObjHeight: 0,
  currentObjLeft: 0,
  currentObjTop: 0,
  currentObjScaleY: 0,
  currentObjScaleX: 0,
  selectedShapeType: false,
  selectedShapeFilter: [],
  multipleSelection: false,
  saveAs: false,
  isAnyChanges: false,
  isSelectSpeacial: false,
  isPasteSpecial: false,
  openProject: {
    isOpen: false,
    name: "",
  },
  currentCategory: 1,
  currentSubCategory: 1,
  changesThings: false,
  userRole: "",
  userType: "",
  isProjecteEditable: false,
  // Add other states as needed
};

// Action types
const ADD_SHAPE = "ADD_SHAPE";
const UPDATE_ROLE = "UPDATE_ROLE";
const UPDATE_TYPE = "UPDATE_TYPE";
const MULTI_SELECTION = "MULTI_SELECTION";
const INITIAL_DATA = "INITIAL_DATA";
const REMOVE_SHAPE = "REMOVE_SHAPE";
const UPDATE_SHAPE = "UPDATE_SHAPE";
const DRAG_AND_DROP_SHAPE = "DRAG_AND_DROP_SHAPE";
const UPDATE_PROPERTIES = "UPDATE_PROPERTIES";
const UPDATE_FIELD = "UPDATE_FIELD";
const ADD_USER_SHAPES = "ADD_USER_SHAPES";
const REMOVE_USER_SHAPE = "REMOVE_USER_SHAPE";
const UPDATE_CURRENT_USER = "UPDATE_CURRENT_USER";
const UPDATE_CURRENT_OBJ = "UPDATE_CURRENT_OBJ";
const UPDATE_ACTIVE_OBJS = "UPDATE_ACTIVE_OBJS";
const RESET_SHAPE_PROPERTIES = "RESET_SHAPE_PROPERTIES";
const UPDATE_COMMENT_FLAG = "UPDATE_COMMENT_FLAG";
const UPDATE_COMMENT = "UPDATE_COMMENT";
const UPDATE_TITLE = "UPDATE_TITLE";
const ADD_CANVAS = "ADD_CANVAS";
const REMOVE_CANVAS = "REMOVE_CANVAS";
const REMOVE_CANVAS_ID = "REMOVE_CANVAS_ID";
const UPDATE_ACTIVE_CANVAS = "UPDATE_ACTIVE_CANVAS";
const SELECT_FILTER_SHAPE = "SELECT_FILTER_SHAPE";
const SELECT_FILTER_LAYER = "SELECT_FILTER_LAYER";
const SELECT_FILTER_ORGANIZATION = "SELECT_FILTER_ORGANIZATION";
const SELECT_FILTER_USER = "SELECT_FILTER_USER";
const SELECT_ALL_FILTER_USER = "SELECT_ALL_FILTER_USER";
const SELECT_FILTER_CATEGORY = "SELECT_FILTER_CATEGORY";
const SELECT_FILTER_SUB_CATEGORY = "SELECT_FILTER_SUB_CATEGORY";
const SELECT_FILTER_TEXT = "SELECT_FILTER_TEXT";
const UPDATE_OPTION = "UPDATE_OPTION";
const SAVE_AS = "SAVE_AS";
const OPEN_PROJECT = "OPEN_PROJECT";
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
const DRAG_AND_DROP_LAYER = "DRAG_AND_DROP_LAYER";
const COLLAPSED_LAYER = "COLLAPSED_LAYER";
const DELETE_LAYER = "DELETE_LAYER";
const MERGE_LAYERS = "MERGE_LAYERS";
const SELECTED_DATE = "SELECTED_DATE";
const GET_CANVAS_DATA = "GET_CANVAS_DATA";
const SELECT_SHAPE_TYPE = "SELECT_SHAPE_TYPE";
const UNDO = "UNDO";
const REDO = "REDO";
const PAGE_ID = "PAGE_ID";
const PRINT_SCALING = "PRINT_SCALING";
const IS_ANY_CHANGE = "IS_ANY_CHANGE";
const IS_SELECT_SPECIAL = "IS_SELECT_SPECIAL";
const IS_PASTE_SPECIAL = "IS_PASTE_SPECIAL";
const UPDATE_STATE = "UPDATE_STATE";
const UPDATE_CURRENT_CATEGORY = "UPDATE_CURRENT_CATEGORY";
const UPDATE_CURRENT_SUB_CATEGORY = "UPDATE_CURRENT_SUB_CATEGORY";
const CHANGES_THINGS = "CHANGES_THINGS";
const BG_LOADING = "BG_LOADING";
const BG_ASSIGN = "BG_ASSIGN";
const PDF_MODAL_TYPE = "PDF_MODAL_TYPE";
const IS_PROJECT_EDITABLE = "IS_PROJECT_EDITABLE";
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

// Reducer function
const shapeReducer = (state, action) => {
  const xyz = _.cloneDeep(state);

  function updateState() {
    if (
      undoStack.length === 0 ||
      !_.isEqual(undoStack[undoStack.length - 1], xyz)
    ) {
      undoStack.push(xyz);
      redoStack = []; // Clear redoStack when a new state is added
    }
    // Ensure the undoStack does not exceed 7 entries
    if (undoStack.length > 100) {
      undoStack.shift(); // Remove the oldest state if the stack exceeds 7 entries
    }
  }

  switch (action.type) {
    case "ADD_SHAPE":
      // updateState()
      const newShape = action.payload;
      const canvasIdx = newShape.PageID;
      // Find the canvas with the provided canvasId
      const canvasIndex = state.pages.findIndex(
        (canvas) =>
          canvas.ID === canvasIdx || canvas.ID === `canvas-${canvasIdx}`
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
            changesThings: !state.changesThings,
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
            BackGroundColor: "#f7f7fa",
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
          changesThings: !state.changesThings,
        };
      }

    // case "ADD_SHAPE":
    //   console.log("add shape work")
    //   const newShape = action.payload;
    //   const canvasIdx = newShape.PageID;

    //   const newUndoState = [...state.undoStack, state];
    //   if (newUndoState.length > 7) {
    //     newUndoState.shift(); // Remove the oldest entry if the limit is exceeded
    //   }
    //   console.log(newUndoState)
    //   // Save the current state to the undo stack before making changes
    //   return {
    //     ...state,
    //     undoStack: newUndoState, // Save current state to undo stack
    //     redoStack: [], // Clear redo stack since we are making a new change
    //     // Proceed with adding the shape
    //     pages: (() => {
    //       const canvasIndex = state.pages.findIndex(
    //         (canvas) =>
    //           canvas.ID === canvasIdx || canvas.ID === `canvas-${canvasIdx}`
    //       );
    //       if (canvasIndex !== -1) {
    //         // If the canvas exists, update it
    //         const updatedPages = [...state.pages];
    //         const canvas = { ...updatedPages[canvasIndex] };
    //         const layerIndex = canvas.calendar.layers.findIndex(
    //           (layer) => layer.ID === newShape.LayerID
    //         );

    //         if (layerIndex !== -1) {
    //           const updatedLayers = [...canvas.calendar.layers];
    //           const layer = { ...updatedLayers[layerIndex] };
    //           const updatedAnnotations = [...layer.annotations, newShape];
    //           layer.annotations = updatedAnnotations;
    //           updatedLayers[layerIndex] = layer;
    //           canvas.calendar = { ...canvas.calendar, layers: updatedLayers };
    //           updatedPages[canvasIndex] = canvas;
    //           return updatedPages;
    //         }
    //       } else {
    //         // If the canvas doesn't exist, create a new one
    //         const newCanvas = {
    //           ID: canvasIdx,
    //           calendar: {
    //             ID: createId(),
    //             Date: new Date().toLocaleDateString(),
    //             layers: [
    //               {
    //                 ID: createId(),
    //                 Name: "user 1",
    //                 annotations: [newShape], // Add the new shape to the new canvas
    //               },
    //             ],
    //           },
    //           background: {
    //             ID: localStorage.getItem("bgImageId"),
    //             type: "solid",
    //             BackGroundColor: "#f7f7fa",
    //             assignType: "single",
    //             assignedDate: new Date().toLocaleDateString(),
    //             startDate: null,
    //             endDate: null,
    //             flag: "default",
    //           },
    //         };
    //         return [...state.pages, newCanvas];
    //       }
    //     })(),
    //   };

    case "UPDATE_ROLE":
      return {
        ...state,
        userRole: action.payload,
      };
    case "UPDATE_TYPE":
      return {
        ...state,
        userType: action.payload,
      };
    case "IS_ANY_CHANGE":
      return {
        ...state,
        isAnyChanges: action.payload,
      };
    case "IS_SELECT_SPECIAL":
      return {
        ...state,
        isSelectSpeacial: action.payload,
      };
    case "IS_PASTE_SPECIAL":
      return {
        ...state,
        isPasteSpecial: action.payload,
      };

    case "MULTI_SELECTION":
      return {
        ...state,
        multipleSelection: action.payload,
      };
    case "INITIAL_DATA":
      const { project, pages } = action.payload;

      const cId = [];
      pages.map((item) => {
        cId.push({ id: item.ID });
      });

      return {
        ...state,
        projectDetails: project,
        pages: pages,
        canvases: cId,
        activeCanvas: pages[0].ID,
      };
    case "UPDATE_OPTION":
      return {
        ...state,
        currentOption: action.payload.currentOption,
        currentObj: action.payload.currentObj,
      };
    case "SAVE_AS":
      return {
        ...state,
        saveAs: action.payload,
      };
    case "OPEN_PROJECT":
      return {
        ...state,
        openProject: action.payload,
      };
    case "SELECT_FILTER_SHAPE":
      return {
        ...state,
        selectedShapeFilter: action.payload,
      };
    case "SELECT_FILTER_LAYER":
      return {
        ...state,
        selectedLayerFilter: action.payload,
      };
    case "SELECT_FILTER_ORGANIZATION":
      return {
        ...state,
        selectedOrganizationFilter: action.payload,
      };
    case "SELECT_FILTER_USER":
      return {
        ...state,
        selectedUserFilter: action.payload,
      };
    case "SELECT_ALL_FILTER_USER":
      return {
        ...state,
        selectedAllUserFilter: action.payload,
      };
    case "SELECT_FILTER_CATEGORY":
      return {
        ...state,
        selectedCategoryFilter: action.payload,
      };
    case "SELECT_FILTER_SUB_CATEGORY":
      return {
        ...state,
        selectedSubCategoryFilter: action.payload,
      };
    case "SELECT_FILTER_TEXT":
      return {
        ...state,
        selectedTextFilter: action.payload,
      };
    case "CHANGES_THINGS":
      return {
        ...state,
        changesThings: !state.changesThings,
      };
    case "CLEAR_UNDO_REDO":
      const clearPageID = state.activeCanvas;
      initializeStacks(clearPageID);

      undoStack[clearPageID] = [];
      redoStack[clearPageID] = [];

      return {
        ...state,
      };

    case "REMOVE_SHAPE": {
      const { shapeId, canvasId2 } = action.payload;
      const updatedPages = state.pages.map((canvas) => {
        if (canvas.ID === canvasId2) {
          const updatedLayers = canvas.calendar.layers.map((layer) => {
            // Find the shape in the annotations array
            const shapeIndex = layer.annotations.findIndex(
              (shape) => shape.ID === shapeId.ID
            );
            const subShapeIndex = layer.annotations.findIndex(
              (shape) =>
                shape.ID === shapeId.ShapeID ||
                shape.ID === shapeId.ParentAnnotationID
            );
            let updatedAnnotations = [...layer.annotations];

            if (shapeIndex !== -1) {
              const shape = updatedAnnotations[shapeIndex];

              if (
                shapeId.label === "comment" ||
                shapeId.label === "title" ||
                shapeId.label === "icon"
              ) {
                const parentShape = updatedAnnotations.find(
                  (annotation) => annotation.ID === shapeId.ParentAnnotationID
                );
                if (parentShape) {
                  parentShape[shapeId.label] = null;
                }
              } else {
                // Remove the shape from the annotations array
                updatedAnnotations.splice(shapeIndex, 1);
              }
            } else if (subShapeIndex !== -1) {
              const subShape = updatedAnnotations[subShapeIndex];

              if (
                shapeId.label === "comment" ||
                shapeId.label === "title" ||
                shapeId.label === "icon"
              ) {
                subShape[shapeId.label] = null;
              }
            }

            return {
              ...layer,
              annotations: updatedAnnotations,
            };
          });

          return {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: updatedLayers,
            },
          };
        }

        return canvas;
      });

      return {
        ...state,
        pages: updatedPages,
        changesThings: !state.changesThings,
      };
    }

    case "UPDATE_SHAPE":
      const updatedCanvasShape = state.pages.map((canvasShape) => {
        // Check if it's the correct canvas by comparing the canvasId.
        if (canvasShape.ID === action.payload.PageID) {
          const updatedLayers = canvasShape.calendar.layers.map((layer) => {
            // Find the correct shape within the annotations
            const updatedAnnotations = layer.annotations.map((annotation) => {
              if (annotation?.ID === action.payload?.ID) {
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
        changesThings: !state.changesThings,
      };
    // case "UPDATE_SHAPE":
    //   return {
    //     ...state,
    //     // Proceed with updating the shape
    //     pages: state.pages.map((canvasShape) => {
    //       if (canvasShape.ID === action.payload.PageID) {
    //         const updatedLayers = canvasShape.calendar.layers.map((layer) => {
    //           const updatedAnnotations = layer.annotations.map((annotation) => {
    //             if (annotation?.ID === action.payload?.ID) {
    //               // If a comment, title, or icon is being added, update only those properties
    //               if (
    //                 action.payload.label === "comment" ||
    //                 action.payload.label === "title" ||
    //                 action.payload.label === "icon"
    //               ) {
    //                 return {
    //                   ...annotation,
    //                   [action.payload.label]:
    //                     action.payload[action.payload.label],
    //                 };
    //               }
    //               // Otherwise, replace the entire annotation with the updated one
    //               return action.payload;
    //             }
    //             return annotation;
    //           });
    //           return {
    //             ...layer,
    //             annotations: updatedAnnotations,
    //           };
    //         });
    //         return {
    //           ...canvasShape,
    //           calendar: {
    //             ...canvasShape.calendar,
    //             layers: updatedLayers,
    //           },
    //         };
    //       }
    //       return canvasShape;
    //     }),
    //   };

    case "DRAG_AND_DROP_SHAPE": {
      const { shapeID, sourceLayerID, targetLayerID, pageID } = action.payload;
      const updatedPages = state.pages.map((canvasShape) => {
        if (
          canvasShape.ID.split("-")[1] == pageID ||
          canvasShape.ID === pageID
        ) {
          const updatedLayers = canvasShape.calendar.layers.map((layer) => {
            // Remove the shape from the source layer
            if (layer.ID === sourceLayerID) {
              return {
                ...layer,
                annotations: layer.annotations.filter(
                  (annotation) => annotation.ID !== shapeID
                ),
              };
            }

            // Add the shape to the target layer
            if (layer.ID === targetLayerID) {
              // Find the shape in the source layer
              const sourceLayer = canvasShape.calendar.layers.find(
                (l) => l.ID === sourceLayerID
              );
              const shapeToMove = sourceLayer.annotations.find(
                (annotation) => annotation.ID === shapeID
              );

              // Ensure shapeToMove is defined before proceeding
              if (shapeToMove !== undefined) {
                const userID = shapeToMove?.UserID;
                updateAnnotationLayerAPI(shapeID, targetLayerID, userID);
                shapeToMove.set({ LayerID: targetLayerID });

                return {
                  ...layer,
                  annotations: [...layer.annotations, shapeToMove],
                };
              }

              return layer;
            }

            return layer;
          });

          return {
            ...canvasShape,
            calendar: {
              ...canvasShape.calendar,
              layers: updatedLayers,
            },
          };
        }

        return canvasShape;
      });

      // const saveData = UseSaveData()
      // saveData()

      return {
        ...state,
        pages: updatedPages,
        // changesThings: !state.changesThings,
      };
    }

    case "UPDATE_STATE":
      const clonedState = action.payload; // Clone the new state from the action
      const activePageID = state.activeCanvas; // Get the active page ID
      initializeStacks(activePageID); // Ensure the undo/redo stacks are initialized for the active page
      // Find the current state of the active page
      const currentActivePageState = clonedState
        ? clonedState.pages.find((page) => page.ID === activePageID)
        : state.pages.find((page) => page.ID === activePageID);
      // Ensure the last state in the undoStack for the active page is not the same as the new state
      if (
        undoStack[activePageID].length === 0 ||
        (!_.isEqual(
          undoStack[activePageID][undoStack[activePageID].length - 1],
          currentActivePageState
        ) &&
          !_.isEqual(
            undoStack[activePageID][undoStack[activePageID].length],
            undoStack[activePageID][undoStack[activePageID].length - 1]
          ))
      ) {
        undoStack[activePageID].push(_.cloneDeep(currentActivePageState)); // Push current page state to undoStack
        redoStack[activePageID] = []; // Clear redoStack when a new state is added
      }

      // Ensure the undoStack for the active page does not exceed 100 entries
      if (undoStack[activePageID].length > 100) {
        undoStack[activePageID].shift(); // Remove the oldest state if the stack exceeds 100 entries
      }

      return {
        ...state,
      };

    case "UNDO":
      const undoPageID = state.activeCanvas; // Get the active page
      initializeStacks(undoPageID); // Ensure stacks are initialized for the page

      if (undoStack[undoPageID].length > 0) {
        const previousState = _.cloneDeep(undoStack[undoPageID].pop()); // Get last state for the active page
        redoStack[undoPageID].push(
          _.cloneDeep(state.pages.find((page) => page.ID === undoPageID))
        ); // Save current state

        return {
          ...state,
          pages: state.pages.map(
            (page) => (page.ID === undoPageID ? previousState : page) // Apply undo only to the active page
          ),
          changesThings: !state.changesThings,
        };
      }
      return state;

    case "REDO":
      const redoPageID = state.activeCanvas; // Get the active page
      initializeStacks(redoPageID); // Ensure stacks are initialized for the page

      if (redoStack[redoPageID].length > 0) {
        const nextState = _.cloneDeep(redoStack[redoPageID].pop()); // Get the next state for the active page
        undoStack[redoPageID].push(
          _.cloneDeep(state.pages.find((page) => page.ID === redoPageID))
        ); // Save current state

        return {
          ...state,
          pages: state.pages.map(
            (page) => (page.ID === redoPageID ? nextState : page) // Apply redo only to the active page
          ),
          changesThings: !state.changesThings,
        };
      }
      return state;

    case UPDATE_PROPERTIES:
      return {
        ...state,
        properties: {
          ...state.properties,
          [action.payload.field]: action.payload.value,
        },
        changesThings: !state.changesThings,
      };

    case UPDATE_FIELD:
      return {
        ...state,
        fieldProperty: {
          property: action.payload.field,
          value: action.payload.value,
          // [action.payload.field]: action.payload.value,
        },
        changesThings: !state.changesThings,
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
        // If the canvas exists, make a copy of the canvasShapes array to update`
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
        changesThings: !state.changesThings,
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
        strokeWidth,
        font_size,
        font_family,
        strokeType,
      } = action.payload;
      const updatedCanvasData = state.pages.map((canvas) => {
        if (canvas.ID === canvasId) {
          return {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: canvas.calendar.layers.map((layer) => {
                if (layer.ID === layerId) {
                  const updatedLayer = {
                    ...layer,
                    Name: newName !== undefined ? newName : layer.Name,
                    fillColor:
                      fillColor !== undefined ? fillColor : layer.fillColor,
                    strokeColor:
                      strokeColor !== undefined
                        ? strokeColor
                        : layer.strokeColor,
                    IsLocked:
                      IsLocked !== undefined ? IsLocked : layer.IsLocked,
                    IsVisible:
                      IsVisible !== undefined ? IsVisible : layer.IsVisible,
                    strokeWidth:
                      strokeWidth !== undefined
                        ? strokeWidth
                        : layer.strokeWidth,
                    font_size:
                      font_size !== undefined ? font_size : layer.font_size,
                    font_family:
                      font_family !== undefined
                        ? font_family
                        : layer.font_family,
                    strokeType:
                      strokeType !== undefined ? strokeType : layer.strokeType,
                  };

                  updateLayerAPI(canvasId, updatedLayer);
                  return updatedLayer;
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
        changesThings: !state.changesThings,
      };
    }

    case DRAG_AND_DROP_LAYER: {
      const { canvasId, node, index } = action.payload;
      const updatedCanvasData = state.pages.map((canvas) => {
        if (canvas.ID === canvasId) {
          return {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: canvas.calendar.layers.map((layer) => {
                if (layer.ID === node.ID) {
                  const updatedLayer = {
                    ...layer,
                    Layer_order: index + 1,
                  };

                  // updateLayerAPI(canvasId, updatedLayer);
                  return updatedLayer;
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

    case COLLAPSED_LAYER: {
      const { canvasId, layerID, collapsed } = action.payload;
      const updatedCanvasData = state.pages.map((canvas) => {
        if (canvas.ID === canvasId) {
          return {
            ...canvas,
            calendar: {
              ...canvas.calendar,
              layers: canvas.calendar.layers.map((layer) => {
                if (layer.ID === layerID) {
                  const updatedLayer = {
                    ...layer,
                    collapsed: !collapsed,
                  };

                  // updateLayerAPI(canvasId, updatedLayer);
                  return updatedLayer;
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
      const { selectedCanvasId, layerIds, mergedLayerName, newId } =
        action.payload;
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

          const newLayerId = newId;
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
        changesThings: !state.changesThings,
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
        changesThings: !state.changesThings,
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
        currentObjLeft: action.payload.currentObjLeft,
        currentObjTop: action.payload.currentObjTop,
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
    case UPDATE_ACTIVE_OBJS:
      return {
        ...state,
        activeObjects: action.payload,
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
          fontStyle: "Normal",
          fontSize: 20,
          fontWeight: "Normal",
          align: "left",
          decoration: "",
          strokeColor: "#000000",
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
      const { newCanvasId, layerId, calenderID, userID, pageID, backgroundID } =
        action.payload;
      // Create a new canvas object
      const newCanvas = { id: newCanvasId };
      // Add the new canvas to the 'canvases' array
      const updatedCanvases = [...state.canvases, newCanvas];
      // Create a new entry in the 'pages' array
      const newCanvasShapesEntry = {
        ID: newCanvasId,
        calendar: {
          ID: calenderID,
          Date: new Date(),
          BgID: backgroundID,
          Notes: "",
          PageID: pageID,
          UserID: userID,
          layers: [
            // {
            //   ID: layerId,
            //   userID,
            //   Name: "user 1",
            //   annotations: [],
            //   IsLocked: false,
            //   IsVisible: true,
            //   fillColor: "#ffffff",
            //   strokeColor: "#000000",
            //   strokeWidth: 2,
            //   font_size: 20,
            //   font_family: "Arial",
            //   strokeType: "Solid",
            // },
          ],
        },
        background: {
          ID: backgroundID,
          type: "solid",
          BackGroundColor: "#f7f7fa",
          assignType: "single",
          assignedDate: new Date().toLocaleDateString(),
          startDate: null,
          endDate: null,
          flag: "default",
        },
      };
      // // Update the 'canvasId' for the userShapes
      const updatedCanvasShapes = [...state.pages];
      // undoStack = [];
      // redoStack = [];

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
    case UPDATE_CURRENT_CATEGORY:
      return {
        ...state,
        currentCategory: action.payload,
        // changesThings: !state.changesThings,
      };
    case UPDATE_CURRENT_SUB_CATEGORY:
      return {
        ...state,
        currentSubCategory: action.payload,
        // changesThings: !state.changesThings,
      };
    case SET_SHOW_EMOJI:
      return {
        ...state,
        showEmoji: action.payload,
        changesThings: !state.changesThings,
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
        // changesThings: !state.changesThings,
      };
    case IS_PROJECT_EDITABLE:
      return {
        ...state,
        isProjecteEditable: action.payload,
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
        updatedCanvasShapes[canvasIdx2].background.BackGroundColor = newColor; // Assuming the background color is the first element in the background array
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
        (canvas) => canvas.id === canvasId6
      );

      // If the canvas is found, check if the background with the same ID already exists
      if (canvasIdx3 !== -1) {
        const canvas = state.pages[canvasIdx3];
        const existingBackgroundIndex = canvas.background.findIndex(
          (bg) => bg.ID === id2
        );

        if (existingBackgroundIndex !== -1) {
          // If background with the same ID exists, update it
          const updatedCanvasShapes = [...state.pages]; // Create a copy of the canvasShapes array
          updatedCanvasShapes[canvasIdx3].background[existingBackgroundIndex] =
            {
              ...canvas.background[existingBackgroundIndex],
              BackGroundColor: data, // Update background data
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
            BackGroundColor: data, // New background data
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
            BackGroundColor: data2,
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

    case PAGE_ID:
      return {
        ...state,
        printPageId: action.payload,
      };
    case PRINT_SCALING:
      return {
        ...state,
        printScaling: action.payload,
      };
    case BG_LOADING:
      return {
        ...state,
        bgLoading: action.payload,
      };
    case BG_ASSIGN:
      return {
        ...state,
        bgAssign: action.payload,
      };
    case PDF_MODAL_TYPE:
      return {
        ...state,
        pdfModalType: action.payload,
      };

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

  const isUserRole = (role) => {
    dispatch({ type: UPDATE_ROLE, payload: role });
  };

  const isUserType = (type) => {
    dispatch({ type: UPDATE_TYPE, payload: type });
  };

  const isAnyDataChanges = (data) => {
    dispatch({ type: IS_ANY_CHANGE, payload: data });
  };

  const isSelectSpecialChanges = (data) => {
    dispatch({ type: IS_SELECT_SPECIAL, payload: data });
  };

  const isPasteSpecialChanges = (data) => {
    dispatch({ type: IS_PASTE_SPECIAL, payload: data });
  };

  const initialData = (data) => {
    dispatch({ type: INITIAL_DATA, payload: data });
  };

  const selectShapeType = (shape) => {
    dispatch({ type: SELECT_SHAPE_TYPE, payload: shape });
  };
  const multipleSelection = (shape) => {
    dispatch({ type: MULTI_SELECTION, payload: shape });
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

  const dragAndDropLayer = (layer) => {
    dispatch({ type: DRAG_AND_DROP_LAYER, payload: layer });
  };

  const collapsedLayer = (layer) => {
    dispatch({ type: COLLAPSED_LAYER, payload: layer });
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

  const dragAndDropShape = (shape) => {
    dispatch({ type: DRAG_AND_DROP_SHAPE, payload: shape });
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

  const updateField = (property) => {
    dispatch({ type: UPDATE_FIELD, payload: property });
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

  const updateCurrentCategory = (newCategoryId) => {
    dispatch({ type: UPDATE_CURRENT_CATEGORY, payload: newCategoryId });
  };

  const updateCurrentSubCategory = (newSubCategoryId) => {
    dispatch({ type: UPDATE_CURRENT_SUB_CATEGORY, payload: newSubCategoryId });
  };

  const updateCurrentObj = (newObj) => {
    dispatch({ type: UPDATE_CURRENT_OBJ, payload: newObj });
  };

  const updateActiveObjs = (newObjs) => {
    dispatch({ type: UPDATE_ACTIVE_OBJS, payload: newObjs });
  };

  const selectFilterShape = (selectedShapes) => {
    dispatch({ type: SELECT_FILTER_SHAPE, payload: selectedShapes });
  };

  const selectFilterLayer = (selectedLayer) => {
    dispatch({ type: SELECT_FILTER_LAYER, payload: selectedLayer });
  };

  const selectFilterOrganization = (selectedOrganization) => {
    dispatch({
      type: SELECT_FILTER_ORGANIZATION,
      payload: selectedOrganization,
    });
  };

  const selectFilterUser = (selectedUser) => {
    dispatch({
      type: SELECT_FILTER_USER,
      payload: selectedUser,
    });
  };

  const selectAllFilterUser = (selectedAllUser) => {
    dispatch({
      type: SELECT_ALL_FILTER_USER,
      payload: selectedAllUser,
    });
  };

  const selectFilterCategory = (selectedCategory) => {
    dispatch({
      type: SELECT_FILTER_CATEGORY,
      payload: selectedCategory,
    });
  };

  const selectFilterSubCategory = (selectedSubCategory) => {
    dispatch({
      type: SELECT_FILTER_SUB_CATEGORY,
      payload: selectedSubCategory,
    });
  };

  const selectFilterText = (selectedText) => {
    dispatch({ type: SELECT_FILTER_TEXT, payload: selectedText });
  };

  const isProjecteEditable = (payload) => {
    dispatch({ type: IS_PROJECT_EDITABLE, payload });
  };

  const updateCurrentOpt = (newOpt) => {
    dispatch({ type: UPDATE_OPTION, payload: newOpt });
  };

  const saveAsModal = (newOpt) => {
    dispatch({ type: SAVE_AS, payload: newOpt });
  };
  const openProjectFromPDF = (newOpt) => {
    dispatch({ type: OPEN_PROJECT, payload: newOpt });
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

  const undo = () => {
    dispatch({ type: "UNDO" });
  };

  const redo = () => {
    dispatch({ type: "REDO" });
  };

  const changesThings = () => {
    dispatch({ type: "CHANGES_THINGS" });
  };

  const clearUndoRedo = () => {
    dispatch({ type: "CLEAR_UNDO_REDO" });
  };

  const currentPagePrintId = (pageId) => {
    dispatch({ type: "PAGE_ID", payload: pageId });
  };
  const printScaling = (scale) => {
    dispatch({ type: "PRINT_SCALING", payload: scale });
  };

  const updateState = (state) => {
    dispatch({ type: "UPDATE_STATE", payload: state });
  };
  const bgLoading = (state) => {
    dispatch({ type: BG_LOADING, payload: state });
  };
  const bgAssign = (state) => {
    dispatch({ type: BG_ASSIGN, payload: state });
  };
  const pdfModalType = (state) => {
    dispatch({ type: PDF_MODAL_TYPE, payload: state });
  };

  // Provide the state and actions to the Components
  const contextValue = {
    state,
    actions: {
      addShape,
      isUserRole,
      isUserType,
      updateShape,
      dragAndDropShape,
      addUserShapes,
      updateCurrentUser,
      updateCurrentCategory,
      updateCurrentSubCategory,
      updateCurrentObj,
      updateActiveObjs,
      resetShape,
      updateCommentAddEditFlag,
      updateCommentText,
      updateProperties,
      updateField,
      selectFilterShape,
      selectFilterLayer,
      selectFilterOrganization,
      selectFilterUser,
      selectAllFilterUser,
      selectFilterCategory,
      selectFilterSubCategory,
      selectFilterText,
      updateTitleText,
      addCanvas,
      removeCanvas,
      removeCanvasID,
      updateActiveCanvas,
      updateCurrentOpt,
      saveAsModal,
      openProjectFromPDF,
      removeShape,
      removeUserShape,
      toggleShowEmoji,
      initialData,
      multipleSelection,
      isAnyDataChanges,
      isSelectSpecialChanges,
      isPasteSpecialChanges,
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
      dragAndDropLayer,
      collapsedLayer,
      deleteLayer,
      mergeLayers,
      selectedCalendarDate,
      getCanvasData,
      selectShapeType,
      undo,
      redo,
      currentPagePrintId,
      printScaling,
      updateState,
      changesThings,
      clearUndoRedo,
      bgLoading,
      bgAssign,
      pdfModalType,
      isProjecteEditable,
    },
    undoStack,
    redoStack,
  };

  return (
    <ShapeContext.Provider value={contextValue}>
      {children}
    </ShapeContext.Provider>
  );
};

// async function addShare(req, res, next) {
//   // #swagger.tags = ['Share']
//   // #swagger.description = 'Add or update Share details'
//   const { UserID, ProjectID, User_access } = req.body;

//   try {
//       // Check if a share record already exists for the ProjectID
//       let existingShare = await ShareModel.findOne({ where: { ProjectID } });

//       if (existingShare) {
//           // Append new User_access entries without removing existing ones
//           let updatedUserAccess = [...existingShare.User_access];

//           User_access.forEach(newUserAccess => {
//               const userExists = updatedUserAccess.some(userAccess => userAccess.UserID === newUserAccess.UserID);

//               // if (!userExists) {
//               //     // Add new user access
//               //     updatedUserAccess.push(newUserAccess);
//               // }
//           });

//           // Update the existing share record with new User_access
//           existingShare.User_access = updatedUserAccess;
//           console.log("Updated User_access:", updatedUserAccess);

//           await existingShare.save({ fields: ['User_access'] });

//           await sendShareEmails(User_access, ProjectID, existingShare);
//           return res.status(200).json({ message: messages.success.SHARE_UPDATED, status: messages.success.STATUS });
//       } else {
//           // Create a new share record
//           const newShare = await ShareModel.create({
//               UserID,
//               ProjectID,
//               User_access
//           });

//           // Send emails to users with the project link and access type
//           await sendShareEmails(User_access, ProjectID, newShare);
//           return res.status(200).json({ message: messages.success.SHARE_CREATED, status: messages.success.STATUS });
//       }
//   } catch (error) {
//       return next(error);
//   }
// }

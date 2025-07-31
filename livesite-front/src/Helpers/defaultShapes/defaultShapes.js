// import { fabric } from "fabric";
// const smallScreenCornerSize = 15; // Corner size for small screens
// const largeScreenCornerSize = 25; // Corner size for large screens

// export const defaultRectShapeValue = {
//   left: 100,
//   top: 100,
//   width: 120,
//   height: 80,
//   fill: "#ffffff",
//   stroke: "#000000",
//   strokeWidth: 2,
//   strokeDashArray: null,
//   strokeUniform: true,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };
// export const defaultSquareShapeValue = {
//   left: 400,
//   top: 300,
//   width: 80,
//   height: 80,
//   fill: "#ffffff",
//   stroke: "#000000",
//   strokeWidth: 2,
//   strokeDashArray: null,
//   strokeUniform: true,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
//   lockScalingX: false, // Lock scaling on the X-axis
//   lockScalingY: false, // Lock scaling on the Y-axis
//   lockUniScaling: false, // Lock uniform scaling
// };

// export const defaultCircleShapeValue = {
//   left: 200,
//   top: 200,
//   radius: 40,
//   fill: "#ffffff",
//   stroke: "#000",
//   strokeWidth: 2,
//   strokeDashArray: null,
//   strokeUniform: true,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };

// export const defaultLineValue = {
//   x1: 50,
//   y1: 50,
//   x2: 150,
//   y2: 150,
//   stroke: "#000000",
//   strokeWidth: 2,
//   strokeDashArray: null,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };

// export const defaultTextValue = {
//   left: 300,
//   top: 300,
//   fontSize: 20,
//   fontFamily: "Arial",
//   strokeWidth: 0,
//   fill: "#000",
//   width: 150,
//   strokeDashArray: null,
//   strokeUniform: true,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };

// export const defaultTriangleShapeValue = {
//   left: 300,
//   top: 200,
//   width: 80,
//   height: 80,
//   fill: "#ffffff",
//   stroke: "#000",
//   strokeWidth: 2,
//   strokeDashArray: null,
//   strokeUniform: true,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };

// export const defaultStarShapeValue = {
//   left: 100,
//   top: 100,
//   fill: "#ffffff",
//   stroke: "#000000",
//   strokeWidth: 2,
//   strokeUniform: true,
//   strokeDashArray: null,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };

// export const defaultOctagonShapeValue = {
//   left: 100,
//   top: 100,
//   fill: "#ffffff",
//   stroke: "#000000",
//   strokeWidth: 2,
//   strokeUniform: true,
//   strokeDashArray: null,
//   cornerSize: 15,
//   originX: "center",
//   originY: "center",
//   visible: true, // Initially visible
// };

// export const defaultHexagonShapeValue = {
//   left: 100,
//   top: 100,
//   fill: "#fff",
//   stroke: "#000000",
//   strokeWidth: 2,
//   strokeUniform: true,
//   strokeDashArray: null,
//   originX: "center",
//   originY: "center",
//   visible: true,
// };
// export function getSquare() {
//   // console.log(" window.innerWidth", window.innerWidth);
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;
//   const square = new fabric.Rect({
//     ...defaultSquareShapeValue,
//     cornerSize: cornerSize,
//   });
//   return square;
// }

// export function getCircle() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const circle = new fabric.Circle({
//     ...defaultCircleShapeValue,
//     cornerSize: cornerSize,
//   });
//   return circle;
// }

// export function getLine() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const line = new fabric.Line(
//     [
//       defaultLineValue.x1,
//       defaultLineValue.y1,
//       defaultLineValue.x2,
//       defaultLineValue.y2,
//     ],
//     {
//       ...defaultLineValue,
//       cornerSize: cornerSize,
//     }
//   );
//   return line;
// }

// export function getText() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const text = new fabric.Textbox("Enter text here", {
//     ...defaultTextValue,
//     cornerSize: cornerSize,
//   });
//   return text;
// }

// export function getTriangle() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const triangle = new fabric.Triangle({
//     ...defaultTriangleShapeValue,
//     cornerSize: cornerSize,
//   });
//   return triangle;
// }

// export function getStar() {
//   const starPoints = [
//     { x: 349.9, y: 75 },
//     { x: 379, y: 160.9 },
//     { x: 469, y: 160.9 },
//     { x: 397, y: 214.9 },
//     { x: 423, y: 300.9 },
//     { x: 350, y: 249.9 },
//     { x: 276.9, y: 301 },
//     { x: 303, y: 215 },
//     { x: 231, y: 161 },
//     { x: 321, y: 161 },
//   ];

//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const star = new fabric.Polygon(starPoints, {
//     ...defaultStarShapeValue,
//     cornerSize: cornerSize,
//   });
//   return star;
// }
// export function getOctagon() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const octagonPoints = [
//     { x: -37.282, y: 90 },
//     { x: 37.282, y: 90 },
//     { x: 90, y: 37.282 },
//     { x: 90, y: -37.282 },
//     { x: 37.282, y: -90 },
//     { x: -37.282, y: -90 },
//     { x: -90, y: -37.282 },
//     { x: -90, y: 37.282 },
//   ];

//   const octagon = new fabric.Polygon(octagonPoints, {
//     ...defaultOctagonShapeValue,
//     cornerSize: cornerSize,
//   });
//   return octagon;
// }

// export function getHexagon() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const hexagonPoints = [
//     { x: 0, y: -100 },
//     { x: 86.60254037844385, y: -50 },
//     { x: 86.60254037844385, y: 50 },
//     { x: 0, y: 100 },
//     { x: -86.60254037844385, y: 50 },
//     { x: -86.60254037844385, y: -50 },
//   ];

//   const hexagon = new fabric.Polygon(hexagonPoints, {
//     ...defaultHexagonShapeValue,
//     cornerSize: cornerSize,
//   });
//   return hexagon;
// }

// export function getRectangle() {
//   const cornerSize =
//     window.innerWidth >= 1200 ? largeScreenCornerSize : smallScreenCornerSize;

//   const rect = new fabric.Rect({
//     ...defaultRectShapeValue,
//     cornerSize: cornerSize,
//   });
//   return rect;
// }

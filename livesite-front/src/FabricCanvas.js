import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

const FabricCanvas = () => {
  let activeLine;
  let activeShape;
  let canvas;
  let lineArray = [];
  let pointArray = [];
  let drawMode = false;

  const canvasRef = useRef(null);

  useEffect(() => {
    initCanvas();

    // return () => {
    //   if (canvas) {
    //     canvas.dispose();
    //     canvas = null;
    //   }
    // };
  }, []);

  const initCanvas = () => {
    canvas = new fabric.Canvas(canvasRef.current);
    canvas.backgroundColor = "rgba(0,0,0,0.3)";
    canvas.setHeight(500);
    canvas.setWidth(500);

    // fabric.Object.prototype.originX = "center";
    // fabric.Object.prototype.originY = "center";

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("object:moving", onObjectMove);
  };

  const onMouseDown = (options) => {
    if (drawMode) {
      if (options.target && options.target.id === pointArray[0].id) {
        generatePolygon(pointArray);
      } else {
        addPoint(options);
      }
    }
  };

  const onMouseMove = (options) => {
    if (drawMode) {
      if (activeLine && activeLine.class === "line") {
        const pointer = canvas.getPointer(options.e);
        activeLine.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        const points = activeShape.get("points");
        points[pointArray.length] = {
          x: pointer.x,
          y: pointer.y,
        };
        activeShape.set({
          points,
        });
      }
      canvas.renderAll();
    }
  };

  const onObjectMove = (option) => {
    const object = option.target;
    object._calcDimensions();
    object.setCoords();
    canvas.renderAll();
  };

  const toggleDrawPolygon = (event) => {
    if (drawMode) {
      activeLine = null;
      activeShape = null;
      lineArray = [];
      pointArray = [];
      canvas.selection = true;
      drawMode = false;
    } else {
      canvas.selection = false;
      drawMode = true;
    }
  };

  const addPoint = (options) => {
    const pointOption = {
      id: new Date().getTime(),
      radius: 5,
      fill: "#ffffff",
      stroke: "#333333",
      strokeWidth: 0.5,
      left: options.e.layerX / canvas.getZoom(),
      top: options.e.layerY / canvas.getZoom(),
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: "center",
      originY: "center",
      objectCaching: false,
    };
    const point = new fabric.Circle(pointOption);

    if (pointArray.length === 0) {
      point.set({
        fill: "red",
      });
    }

    const linePoints = [
      options.e.layerX / canvas.getZoom(),
      options.e.layerY / canvas.getZoom(),
      options.e.layerX / canvas.getZoom(),
      options.e.layerY / canvas.getZoom(),
    ];
    const lineOption = {
      strokeWidth: 2,
      fill: "#999999",
      stroke: "#999999",
      originX: "center",
      originY: "center",
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    };
    const line = new fabric.Line(linePoints, lineOption);
    line.class = "line";

    if (activeShape) {
      const pos = canvas.getPointer(options.e);
      const points = activeShape.get("points");
      points.push({
        x: pos.x,
        y: pos.y,
      });
      const polygon = new fabric.Polygon(points, {
        stroke: "#333333",
        strokeWidth: 1,
        fill: "#cccccc",
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });
      canvas.remove(activeShape);
      canvas.add(polygon);
      activeShape = polygon;
      canvas.renderAll();
    } else {
      const polyPoint = [
        {
          x: options.e.layerX / canvas.getZoom(),
          y: options.e.layerY / canvas.getZoom(),
        },
      ];
      const polygon = new fabric.Polygon(polyPoint, {
        stroke: "#333333",
        strokeWidth: 1,
        fill: "#cccccc",
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });
      activeShape = polygon;
      canvas.add(polygon);
    }

    activeLine = line;
    pointArray.push(point);
    lineArray.push(line);

    canvas.add(line);
    canvas.add(point);
  };

  const generatePolygon = (pointArray) => {
    const points = [];
    for (const point of pointArray) {
      points.push({
        x: point.left,
        y: point.top,
      });
      canvas.remove(point);
    }

    for (const line of lineArray) {
      canvas.remove(line);
    }

    canvas.remove(activeShape).remove(activeLine);

    const polygon = new fabric.Polygon(points, {
      id: new Date().getTime(),
      stroke: "#eee",
      fill: "#f00",
      objectCaching: false,
      moveable: false,
    });
    canvas.add(polygon);

    toggleDrawPolygon();
    editPolygon();
  };

  // Modify polygonPositionHandler to accept pointIndex as an argument
  const polygonPositionHandler = (
    dim,
    finalMatrix,
    fabricObject,
    pointIndex
  ) => {
    const transformPoint = {
      x: fabricObject.points[pointIndex].x - fabricObject.pathOffset.x,
      y: fabricObject.points[pointIndex].y - fabricObject.pathOffset.y,
    };
    return fabric.util.transformPoint(
      transformPoint,
      fabricObject.calcTransformMatrix()
    );
  };

  const actionHandler = (eventData, transform, x, y) => {
    const polygon = transform.target;
    const currentControl = polygon.controls[polygon.__corner];
    const mouseLocalPosition = polygon.toLocalPoint(
      new fabric.Point(x, y),
      "center",
      "center"
    );
    const size = polygon._getTransformedDimensions(0, 0);
    const finalPointPosition = {
      x: (mouseLocalPosition.x * polygon.width) / size.x + polygon.pathOffset.x,
      y:
        (mouseLocalPosition.y * polygon.height) / size.y + polygon.pathOffset.y,
    };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
  };

  const anchorWrapper = (anchorIndex, fn) => {
    return (eventData, transform, x, y) => {
      const fabricObject = transform.target;
      const point = {
        x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
        y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
      };

      fabricObject._setPositionDimensions({});

      const newX = point.x / fabricObject.width;
      const newY = point.y / fabricObject.height;

      const absolutePoint = fabric.util.transformPoint(
        point,
        fabricObject.calcTransformMatrix()
      );
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);

      return fn(eventData, transform, x, y);
    };
  };
  
  function editPolygon() {
    let activeObject = canvas.getActiveObject();
    if (!activeObject) {
      activeObject = canvas.getObjects()[0];
      canvas.setActiveObject(activeObject);
    }

    activeObject.edit = true;
    activeObject.objectCaching = false;

    const lastControl = activeObject.points.length - 1;
    activeObject.cornerStyle = "circle";
    activeObject.controls = activeObject.points.reduce((acc, point, index) => {
      const pointIndex = index === 0 ? lastControl : index - 1;
      // Define acc and index here
      acc["p" + index] = new fabric.Control({
        positionHandler: (dim, finalMatrix, fabricObject) =>
          polygonPositionHandler(dim, finalMatrix, fabricObject, pointIndex),
        actionHandler: anchorWrapper(pointIndex, actionHandler),
        actionName: "modifyPolygon",
        pointIndex: pointIndex,
      });
      return acc;
    }, {});

    activeObject.hasBorders = false;

    canvas.requestRenderAll();
  }

  const resizePolygon = () => {
    let activeObject = canvas.getActiveObject();
    if (!activeObject) {
      activeObject = canvas.getObjects()[0];
      canvas.setActiveObject(activeObject);
    }

    activeObject.edit = false;
    activeObject.objectCaching = false;
    activeObject.controls = fabric.Object.prototype.controls;
    activeObject.cornerStyle = "rect";
    activeObject.cornerColor = "#f00";
    activeObject.cornerStrokeColor = "#000";
    activeObject.transparentCorners = false;
    activeObject.borderColor = "#000";
    activeObject.hasBorders = true;

    canvas.requestRenderAll();
  };

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500}></canvas>
      <button onClick={toggleDrawPolygon}>Toggle Draw Polygon</button>
      <button onClick={resizePolygon}>Resize Polygon</button>
    </div>
  );
};

export default FabricCanvas;
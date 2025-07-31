import { fabric } from "fabric";

class Annotation {
  constructor(geometricalProps) {
    this.geometricalProps = {
      fill:
        geometricalProps.type === "text"
          ? "#000000"
          : geometricalProps.fill || "#ffffff",
      stroke:
        (geometricalProps.type !== "text" && geometricalProps.stroke) ||
        "#000000",
      strokeWidth: geometricalProps.strokeWidth || 2,
      strokeDashArray: geometricalProps.strokeDashArray || null,
      fontSize: geometricalProps.fontSize || 20,
      fontFamily: geometricalProps.fontFamily || "Arial",
      fontWeight: geometricalProps.fontWeight || "normal",
      fontStyle: geometricalProps.fontStyle || "normal",
      textAlign: geometricalProps.textAlign || "left",
      strokeUniform: true,
      visible: true,
      selectable: false,
      IsLocked: false,
      IsVisible: true,
      isEditable: true,
      icon: null,
      comment: null,
      PageID: geometricalProps.canvasId,
      LayerID: geometricalProps.currentUser,
      bob_no_id: geometricalProps.bob_no_id,
      ...geometricalProps, // spread custom geometrical properties,
    };
  }

  createShape(shapeType, startX, startY, commonProps) {
    switch (shapeType) {
      case "rectangle":
        return new fabric.Rect({
          left: startX,
          top: startY,
          width: 0,
          height: 0,
          ...commonProps,
          ...this.geometricalProps,
        });
      case "circle":
        return new fabric.Ellipse({
          left: startX,
          top: startY,
          rx: 0,
          ry: 0,
          ...commonProps,
          ...this.geometricalProps,
        });
      case "square":
        return new fabric.Rect({
          left: startX,
          top: startY,
          width: 0,
          height: 0,
          ...commonProps,
          ...this.geometricalProps,
        });
      case "triangle":
        return new fabric.Triangle({
          left: startX,
          top: startY,
          width: 0,
          height: 0,
          ...commonProps,
          ...this.geometricalProps,
        });
      case "hexagon":
        return new fabric.Polygon(
          this.generatePolygonPoints(6, startX, startY),
          { ...commonProps, ...this.geometricalProps }
        );
      case "star":
        return new fabric.Polygon(
          this.generatePolygonPoints(10, startX, startY, true),
          { ...commonProps, ...this.geometricalProps }
        );
      case "line":
        return new fabric.Line([startX, startY, startX, startY], {
          fill: "black",
          stroke: "black",
          strokeWidth: 2,
          ...commonProps,
          ...this.geometricalProps,
        });
      case "text":
        return new fabric.Textbox("Enter text", {
          left: startX,
          top: startY,
          width: 150,
          ...commonProps,
          ...this.geometricalProps,
        });
      default:
        return null;
    }
  }

  generatePolygonPoints(sides, centerX, centerY, isStar = false) {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const radius = isStar && i % 2 === 0 ? 50 : 25;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return points;
  }
}

export default Annotation;

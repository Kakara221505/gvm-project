import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./PdfPreviewModal.css";
import { fabric } from "fabric";
import { useShapeContext } from "../../../../contexts/shapeContext";
import { useApiContext } from "../../../../contexts/apiContext";
import * as pdfjsLib from "pdfjs-dist";

// Define A4 dimensions in pixels
const A4_WIDTH = 820; // Width of A4 page in pixels
const A4_HEIGHT = 1100; // Height of A4 page in pixels
const PADDING = 5; // Padding around the canvas content

const PdfPreviewModal = ({ show, onClose, canvasRef, showTitle }) => {
  const { state } = useShapeContext();
  const { importData } = useApiContext();
  const {
    pages,
    activeCanvas,
    printPageId,
    printScaling,
    projectDetails,
    selectDate,
  } = state;
  const [backgroundColor, setBackgroundColor] = useState();
  const [backgroundImage, setBackgroundImage] = useState();

  const [canvasId, setCanvasId] = useState(printPageId);

  const [projectName, setProjectName] = useState("");
  useEffect(() => {
    setProjectName(projectDetails?.Name);
  }, [projectDetails]);

  useEffect(() => {
    setCanvasId(printPageId);
  }, [printPageId, canvasId]);

  // Find the current canvas data
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    // Find the current canvas data
    const currentCanvasData = pages.find((page) => page.ID === canvasId);
    // Extract layers from currentCanvasData
    const layers = currentCanvasData?.calendar?.layers || [];
    // Update state with layers
    setLayers(layers);
  }, [canvasId, pages]);

  // Function to convert annotation to Fabric.js object
  const convertToFabricObject = (annotation) => {
    switch (annotation.type) {
      case "ellipse":
        return new fabric.Ellipse({
          left: annotation.left,
          top: annotation.top,
          rx: annotation.rx,
          ry: annotation.ry,
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "rect":
        return new fabric.Rect({
          left: annotation.left,
          top: annotation.top,
          width: annotation.width,
          height: annotation.height,
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "square":
        const squareSize = Math.max(annotation.width, annotation.height);
        return new fabric.Rect({
          left: annotation.left,
          top: annotation.top,
          width: squareSize,
          height: squareSize,
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "triangle":
        return new fabric.Polygon(
          [
            { x: annotation.left, y: annotation.top + annotation.height },
            { x: annotation.left + annotation.width / 2, y: annotation.top },
            {
              x: annotation.left + annotation.width,
              y: annotation.top + annotation.height,
            },
          ],
          {
            fill: annotation.fill,
            stroke: annotation.stroke,
            strokeWidth: annotation.strokeWidth,
            angle: annotation.angle,
            opacity: annotation.opacity,
            originX: annotation.originX,
            originY: annotation.originY,
          }
        );

      case "hexagon":
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          hexPoints.push({
            x:
              annotation.left + annotation.radius * Math.cos((i * Math.PI) / 3),
            y: annotation.top + annotation.radius * Math.sin((i * Math.PI) / 3),
          });
        }
        return new fabric.Polygon(hexPoints, {
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "star":
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
          const radius =
            i % 2 === 0 ? annotation.outerRadius : annotation.innerRadius;
          starPoints.push({
            x: annotation.left + radius * Math.cos(angle),
            y: annotation.top + radius * Math.sin(angle),
          });
        }
        return new fabric.Polygon(starPoints, {
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "line":
        // Calculate end coordinates based on left/top and width/height
        const endX = annotation.left + annotation.width;
        const endY = annotation.top + annotation.height;

        // Create a new fabric.Line with corrected coordinates
        return new fabric.Line([annotation.left, annotation.top, endX, endY], {
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle, // Apply rotation angle
          originX: "center",
          originY: "center",
          opacity: annotation.opacity,
        });
      case "pentagon":
        const pentagonPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          pentagonPoints.push({
            x: annotation.left + annotation.radius * Math.cos(angle),
            y: annotation.top + annotation.radius * Math.sin(angle),
          });
        }
        return new fabric.Polygon(pentagonPoints, {
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "octagon":
        const octagonPoints = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i * 2 * Math.PI) / 8 - Math.PI / 8;
          octagonPoints.push({
            x: annotation.left + annotation.radius * Math.cos(angle),
            y: annotation.top + annotation.radius * Math.sin(angle),
          });
        }
        return new fabric.Polygon(octagonPoints, {
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "parallelogram":
        const parallelogramPoints = [
          { x: annotation.left, y: annotation.top },
          { x: annotation.left + annotation.width, y: annotation.top },
          {
            x: annotation.left + annotation.width + annotation.offset,
            y: annotation.top + annotation.height,
          },
          {
            x: annotation.left + annotation.offset,
            y: annotation.top + annotation.height,
          },
        ];
        return new fabric.Polygon(parallelogramPoints, {
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      case "textbox":
        return new fabric.Textbox(annotation.text || "", {
          left: annotation.left,
          top: annotation.top,
          width: annotation.width,
          height: annotation.height,
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
          fontFamily: annotation.fontFamily,
          fontSize: parseInt(annotation.fontSize, 10),
          fontWeight: annotation.fontWeight,
          textAlign: annotation.textAlign,
          lineHeight: annotation.lineHeight,
          charSpacing: annotation.charSpacing,
        });
      case "polygon":
        return new fabric.Polygon(annotation.points, {
          fill: annotation.fill,
          stroke: annotation.stroke,
          strokeWidth: annotation.strokeWidth,
          angle: annotation.angle,
          opacity: annotation.opacity,
          originX: annotation.originX,
          originY: annotation.originY,
        });
      default:
        return null;
    }
  };

  function formatDateString(inputDateStr) {
    // Check if the input is already in the desired format (DD/MM/YYYY)
    const desiredFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (desiredFormatRegex.test(inputDateStr)) {
      return inputDateStr;
    }

    // Parse the input date string
    const date = new Date(inputDateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }

    // Extract the date components
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    // Format the date into the desired "DD/MM/YYYY" format
    const formattedDateStr = `${day}/${month}/${year}`;
    return formattedDateStr;
  }

  let dateForHeading = formatDateString(selectDate);
  // let dateForHeading = "hello"

  useEffect(() => {
    if (show && canvasRef.current) {
      const canvasElement = canvasRef.current;

      // Initialize Fabric.js Canvas
      const canvas = new fabric.Canvas(canvasElement, {
        backgroundColor: backgroundColor,
        width: A4_WIDTH + 30,
        height: A4_HEIGHT + 10,
        selection: false, // Disable selection for a view-only canvas
        interactive: false, // Make the canvas non-interactive
      });

      // Add objects to the canvas
      layers.forEach((layer) => {
        const annotations = layer.annotations || [];
        annotations.forEach((annotation) => {
          const fabricObject = convertToFabricObject(annotation);
          if (fabricObject) {
            fabricObject.selectable = false; // Make each object non-selectable
            fabricObject.evented = false; // Make each object non-interactive
            canvas.add(fabricObject);
          }
        });
      });

      // Calculate the bounding box of all objects
      const objects = canvas.getObjects();
      const boundingBox = objects.reduce(
        (box, obj) => {
          const { left, top, width, height, scaleX, scaleY } = obj;
          const objWidth = width * scaleX;
          const objHeight = height * scaleY;
          const objLeft = left * scaleX;
          const objTop = top * scaleY;

          return {
            minX: Math.min(box.minX, objLeft),
            minY: Math.min(box.minY, objTop),
            maxX: Math.max(box.maxX, objLeft + objWidth),
            maxY: Math.max(box.maxY, objTop + objHeight),
          };
        },
        {
          minX: Infinity,
          minY: Infinity,
          maxX: -Infinity,
          maxY: -Infinity,
        }
      );

      // Calculate scaling factors
      const boundingBoxWidth = boundingBox.maxX - boundingBox.minX;
      const boundingBoxHeight = boundingBox.maxY - boundingBox.minY;
      const scaleX = (A4_WIDTH - 2 * PADDING) / boundingBoxWidth;
      const scaleY = (A4_HEIGHT - 2 * PADDING) / boundingBoxHeight;
      const scale = Math.min(scaleX, scaleY);

      // Apply scaling to fit within A4 dimensions
      if (scale < 1) {
        canvas.setZoom(scale);
        canvas.setDimensions({ width: A4_WIDTH + 30, height: A4_HEIGHT + 10 });
        canvas.setViewportTransform([
          scale,
          0,
          0,
          scale,
          (A4_WIDTH + 30 - boundingBoxWidth * scale) / 2 -
            boundingBox.minX * scale +
            PADDING,
          (A4_HEIGHT + 10 - boundingBoxHeight * scale) / 2 -
            boundingBox.minY * scale +
            PADDING,
        ]);
      } else {
        canvas.setZoom(1);
        canvas.setDimensions({ width: A4_WIDTH + 30, height: A4_HEIGHT + 10 });
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      }

      // Add background image
      fabric.Image.fromURL(
        backgroundImage,
        (img) => {
          if (!img) {
            console.error("Image failed to load");
            return;
          }

          const desiredWidth = canvas.width * 6.8;
          const desiredHeight = canvas.height * 6.8;

          img.scaleToWidth(desiredWidth);
          img.scaleToHeight(desiredHeight);
          img.setCoords();

          canvas.add(img);
          canvas.sendToBack(img);
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      )?.catch((error) => {
        console.error("Error loading image:", error);
      });

      // Add project name text
      const textStyle = {
        fontSize: 20,
        fontWeight: "bold",
        fill: "#000",
        textAlign: "center",
      };

      const topText = new fabric.Text(dateForHeading, {
        ...textStyle,
        left: A4_WIDTH / 2,
        top: 10, // Initial top position before scaling
        originX: "center",
        originY: "top",
      });

      const bottomText = new fabric.Text(dateForHeading, {
        ...textStyle,
        left: A4_WIDTH / 2,
        top: -10, // Initial bottom position before scaling
        originX: "center",
        originY: "top",
      });

      // {
      //   showTitle === "Header" ?
      //     canvas.add(topText)
      //     :
      //     canvas.add(bottomText);
      // }

      // Add watermark
      const watermarkText = new fabric.Text("Watermark", {
        fontSize: 80,
        fill: "rgba(0, 0, 0, 0.2)",
        originX: "center",
        originY: "center",
        angle: 20, // Angle to rotate the watermark text
        left: 1200 / 2, // Center horizontally based on A4 dimensions
        top: 1000 / 2, // Center vertically based on A4 dimensions
        selectable: false,
        evented: false,
      });

      // Add watermark to the canvas
      canvas.add(watermarkText);

      // Render all objects
      canvas.renderAll();
    }
  }, [show, layers, backgroundColor, canvasId, printScaling, showTitle]);

  const isColor = (colorString) => {
    const regex = /^(#([0-9a-f]{3}){1,2}|(rgb|hsl)a?\([\d.%, ]+\))$/i;
    return regex.test(colorString);
  };

  const renderPdfUrlAsImage = async (pdfUrl) => {
    try {
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      // Get the first page (you can modify this for other pages)
      const page = await pdf.getPage(1);

      // Set scale for rendering
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      // Create a canvas element for rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the PDF page into the canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      // Convert canvas to image data URL (PNG format)
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error rendering PDF:", error);
      return null;
    }
  };

  useEffect(() => {
    if (canvasId) {
      let date = new Date();
      let currentDate = date.toISOString().split("T")[0];
      let selecteDate = localStorage.getItem("selecteDate") || currentDate;
      let newDate = selecteDate.split(" ")[0];
      let pageId = canvasId.split("-")[1];

      let bgAssign = importData?.filter((data) => {
        const pageIdMatches = data?.PageID === parseInt(pageId);
        const dateMatches = data?.DateRanges.some((dateRange) => {
          const dataDate = dateRange?.split(" ")[0];
          return dataDate === newDate;
        });
        return pageIdMatches && dateMatches;
      });
      let defaultBg = importData?.filter((data) => {
        const isDefault = data?.Is_default === true;
        return isDefault;
      });

      const setPdfBackground = async (pdfUrl) => {
        try {
          const imageUrl = await renderPdfUrlAsImage(pdfUrl);
          if (imageUrl) {
            setBackgroundColor(activeCanvas, "#f7f7fa"); // default background color
            setBackgroundImage(imageUrl); // set background image for the canvas
          } else {
            console.error("Failed to render PDF as an image.");
          }
        } catch (error) {
          console.error("Error rendering PDF as image:", error);
        }
      };

      if (bgAssign?.length > 0) {
        const bgColorOrImage = bgAssign[0]?.BackGroundColor;
        if (isColor(bgColorOrImage)) {
          setBackgroundColor(bgColorOrImage);
          setBackgroundImage();
        } else if (bgAssign[0]?.BackGroundColor.endsWith(".pdf")) {
          setPdfBackground(bgAssign[0]?.BackGroundColor);
        } else {
          setBackgroundColor("#f7f7fa");
          setBackgroundImage(bgColorOrImage);
        }
      } else if (defaultBg?.length > 0) {
        const bgColorOrImage = defaultBg[0]?.BackGroundColor;
        if (isColor(bgColorOrImage)) {
          setBackgroundColor(bgColorOrImage);
          setBackgroundImage();
        } else if (bgAssign[0]?.BackGroundColor.endsWith(".pdf")) {
          setPdfBackground(bgAssign[0]?.BackGroundColor);
        } else {
          setBackgroundColor("#f7f7fa");
          setBackgroundImage(bgColorOrImage);
        }
      } else {
        setBackgroundColor("#f7f7fa");
        setBackgroundImage();
      }
    }
  }, [show, importData, canvasId, printScaling]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      backdrop={false}
      dialogClassName="custom-modal-dialog"
      className="custom-modal"
      style={{
        maxHeight: `${A4_HEIGHT}px`,
        overflow: "scroll",
        margin: "8% 0px",
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Canvas Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          padding: 0,
          width: `${A4_WIDTH + 30}px`,
          height: `${A4_HEIGHT + 10}px`,
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          id={canvasId}
          width={A4_WIDTH + 30}
          height={A4_HEIGHT + 10}
          className="pdf-preview-canvas"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PdfPreviewModal;

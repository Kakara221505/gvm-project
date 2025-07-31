import React,{useEffect} from "react";
import EditorCanvas from "../EditorLayout/EditorMainCanvasArea/EditorCanvas/EditorCanvas";
import EditorMainCanvasArea from "../EditorLayout/EditorMainCanvasArea/EditorMainCanvasArea";

export default function MainLayoutArea({ filesPreviewShape, filePreview,shapeToDraw, setShapeToDraw ,backgroundColor,canvasBackgroundColor }) {
  useEffect(() => {
    // console.log('EditorCanvas ',backgroundColor)
  }, [backgroundColor])
  return (

      <EditorMainCanvasArea filesPreviewShape={filesPreviewShape} filePreview={filePreview} shapeToDraw={shapeToDraw} setShapeToDraw={setShapeToDraw}  backgroundColor={backgroundColor} canvasBackgroundColor={canvasBackgroundColor}/>
  
  );
}

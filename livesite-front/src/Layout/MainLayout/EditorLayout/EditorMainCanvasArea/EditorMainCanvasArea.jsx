import React,{useEffect} from "react";
import './EditorMainCanvasArea.css'
import EditorCanvas from './EditorCanvas/EditorCanvas'


export default function EditorMainCanvasArea({ filePreview,filesPreviewShape, shapeToDraw, setShapeToDraw ,backgroundColor,canvasBackgroundColor }) {
  useEffect(() => {
    // console.log('EditorCanvas ',backgroundColor)
  }, [backgroundColor])
  return (

    <EditorCanvas filesPreviewShape={filesPreviewShape} filePreview={filePreview} shapeToDraw={shapeToDraw} setShapeToDraw={setShapeToDraw}  backgroundColor={backgroundColor} canvasBackgroundColor={canvasBackgroundColor}  />

  )
}

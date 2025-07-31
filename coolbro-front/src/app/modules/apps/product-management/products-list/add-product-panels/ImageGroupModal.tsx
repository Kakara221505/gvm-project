import {useState, useCallback, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'

function ImageGroupModal({
  updateTableData,
  mediaColor,
  editOptionValue,
  tableData,
  alreadyExists,
  editTable,
  MediaIDsToRemove,
  setMediaIDsToRemove,
  editValue,
  setEditNewImages,
  setEditTable,
  editNewImages,
  ID
}: any) {
  let editOption = editOptionValue
  const [files, setFiles] = useState<File[]>([])
  const [beforeUpdate, setBeforeUpdate] = useState<string[]>([])
  const [toRemove, setToRemove] = useState<string[]>([])
  const [newEditfiles, setNewEditFiles] = useState<string[]>([])
  const [isChanged, setIsChanged] = useState(false)
  const [isNewColor, setIsNewColor] = useState(false)
  const [object, setObject] = useState<{images: any[]} | null>({images: []})
  const [objectFiles, setObjectFiles] = useState<{Media_urls: any, Type: any, ID: any, Value: any}>()
  const [objectExists, setObjectExists] = useState<{optionValue: string; images: any[]} | null>(
    null
  )
  const [newImages, setNewImages] = useState<File[]>([]) // State to hold newly added images

  const [IDsToRemove, setIDsToRemove] = useState<number[]>([])

  const newColor = mediaColor


  

  const randomNumber = () => {
    let a = Math.floor(Math.random() * 999999) + 1
    return a
  }


  const updateDataAndCloseModal = () => {
    if(!objectFiles || !ID){
   
      
    if (editOptionValue || alreadyExists) {
      if (object) {
        const updatedObjectImages = [...object.images, ...newImages]
        setObject({...object, images: updatedObjectImages})
      }
      let updatedImages = [...(object?.images ?? []), ...newImages]
      if (editOptionValue) {
        updateTableData(editOptionValue, updatedImages, editOption)
        setIsChanged(true)
        setObjectExists({
          optionValue: editOptionValue,
          images: [...(object?.images ?? []), ...newImages],
        })
        setNewImages([])
      } else {
        updateTableData(alreadyExists.optionValue, updatedImages, alreadyExists.optionValue)
        setIsChanged(true)
        setObjectExists({
          optionValue: alreadyExists.optionValue,
          images: [...(object?.images ?? []), ...newImages],
        })
        setNewImages([])
      }
    } else {
      updateTableData(mediaColor, files)
    }
  } 
  if(editTable && objectFiles){

    setMediaIDsToRemove([...MediaIDsToRemove ,...IDsToRemove])
    // console.log("MMEDIA TO REMOVE:", IDsToRemove , MediaIDsToRemove);
    

    setIDsToRemove([])
 
    if(editValue){ 
      
      if(files.length !== 0){
     
        
        const findExistingObject: any = newEditfiles.find((single: any) => single.optionValue === objectFiles.Value)
     
        
        if(findExistingObject){
          const updatedArray = newEditfiles.filter((single: any) => single.optionValue !== findExistingObject.optionValue )
          files.map((single: any) => findExistingObject.images.push(single))  // findExistingObject.images.push([...single])
          setNewEditFiles([...updatedArray, findExistingObject])
          setEditNewImages([...updatedArray, findExistingObject])
        } else {
      const sendNewVariationImages : any = {
        optionValue: editValue,
        images : files,
      }
      setNewEditFiles([...newEditfiles, sendNewVariationImages])
      setEditNewImages([...newEditfiles, sendNewVariationImages])
    }
    }
 
    
      const getObject = editTable.filter((single: any) => single.Value !== editValue)
   
      files.map((single: any, index) => {
     
        const Media_url = single.preview

        const newObject = {
          ID : `N_${randomNumber()}`,
          Media_url : Media_url
        }
        objectFiles.Media_urls.push(newObject)
      })

   
      setEditTable([...getObject, objectFiles])
    }
    else if(!editValue){

    }

    
     if(toRemove.length !== 0){
      const otherColorObjects = newEditfiles.filter((single: any) => single.optionValue !== objectFiles.Value)
      const getObjectToUpdate:any = newEditfiles.find((single: any) => single.optionValue === objectFiles.Value)
      let getArrayOfImages = getObjectToUpdate.images
      let theArray
      toRemove.map((singleImage: any) => {
        const getUpdatedArrayOfImages = getArrayOfImages.filter((single: any) => single.preview !== singleImage )
        theArray = getUpdatedArrayOfImages
        getArrayOfImages = getUpdatedArrayOfImages
      })
      setToRemove([])
      const updatedObject: any = {
        optionValue : objectFiles.Value,
        images : theArray, 
      }
      setNewEditFiles([...otherColorObjects, updatedObject])
      setEditNewImages([...otherColorObjects, updatedObject])
    }
  }

    //setTableData(updateTableData)
    setFiles([])
    setNewImages([]) // Clear the new images state
  }

  const closeModal = () => {
    if(editTable.length !== 0){
      console.log("TO REMOVE", toRemove)  
      setToRemove([])
      setFiles([])
      setIDsToRemove([])
      // setNewEditFiles(beforeUpdate)
      if(editValue){
        const getObject = editTable.find((single: any) => single.Value === mediaColor)
        if(getObject){
          setObjectFiles(getObject)
        } else {
          setObjectFiles(objectFiles)
        }      
      }
    }
    setNewImages([])
       setFiles([])
    if(tableData.length !== 0){
   
        if(editOptionValue){
          const getObject = tableData.find((single: any) => single.optionValue === editOptionValue)
          setObject(getObject)
        }
        if(!editOptionValue && alreadyExists){
            const getObject = tableData.find((single: any) => single.optionValue === alreadyExists.optionValue)
            setObject(getObject)
        }
    }
  }


  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, {preview: URL.createObjectURL(file)})
        ),
      ])
      setNewImages((prevImages) => [...prevImages, ...acceptedFiles])
    }
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    }})



  // Handle file upload

  const removeImageEdit = (indexToRemove: number) => {
    if (object && object.images) {
      const updatedImages = object.images.filter((_, index) => index !== indexToRemove)
      const updatedObject = {optionValue: editOptionValue, images: updatedImages}
      setObject(updatedObject)
      console.log(object)
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFiles((files) => files.filter((_, index) => index !== indexToRemove))
  }

  const handleRemoveImage = (indexToRemove: number) => {
    if (object && indexToRemove < object.images.length) {
      removeImageEdit(indexToRemove)
    } else {
      // If the index is beyond the range of object.images, remove from newImages
      const updatedNewImages = [...newImages]
      if (object) updatedNewImages.splice(indexToRemove - object.images.length, 1)
      setNewImages(updatedNewImages)
    }
  }

  const handleEditRemoveImage = (IdToRemove: any, indexToRemove: number, previewPath: string, editValue: string) => {
    const stringID = String(IdToRemove)
    if(stringID[0] === "N")
    setToRemove([...toRemove, previewPath])

    const findImageToRemove = objectFiles?.Media_urls.find((single: any) => single.ID === IdToRemove)  
    if(objectFiles && findImageToRemove){

      const updatedImages = objectFiles.Media_urls.filter((ab: any, index: any) => ab.ID !== IdToRemove)
      const updatedObject = {ID: objectFiles.ID, Type: objectFiles.Type, Value: objectFiles.Value, Media_urls: updatedImages}
      setObjectFiles(updatedObject)
      if(String(IdToRemove[0]) !== "N")
      {
        setIDsToRemove([...IDsToRemove, IdToRemove])
      }      
    } else {
      const updatedNewImages = [...files]
      console.log("CHECKER", updatedNewImages);  
      if (objectFiles) updatedNewImages.splice(indexToRemove - objectFiles.Media_urls.length, 1)
      setFiles(updatedNewImages)
    }
  }


  useEffect(() => {
  
    if(editTable.length !== 0){
    
      if(mediaColor){
        const alreadyExistingObject = editTable.find((obj: any) => obj.Value === mediaColor)
        if(alreadyExistingObject){
     
          setObjectFiles(alreadyExistingObject)
        } if(!alreadyExistingObject || objectFiles === undefined) {
         
          
          const newObject = {
            ID: alreadyExistingObject?.ID || `C_${randomNumber()}`,
            Value: alreadyExistingObject?.Value ||  editValue,
            Media_urls: alreadyExistingObject?.Media_urls || [],
            Type: "Color",
          }
          // setIsNewColor(true)
     
          setObjectFiles(newObject)
        }
      }
      if(editNewImages?.length>0){
     
        
        setNewEditFiles(editNewImages)
      }
    }
    if(tableData?.length>0){
    
    if (!editOptionValue && mediaColor) {
     
      const alreadyExistingObject = tableData.find((obj: any) => obj.optionValue === mediaColor)
  
      if (alreadyExists) {
  
        setObject(alreadyExistingObject)
      } else {
        setObject({images: []})
      }
    }

    if (editOptionValue) {
  
      const foundObject = tableData.find((obj: any) => obj.optionValue === editOptionValue)
      setObject(foundObject)
      if (isChanged) {
        setObject(objectExists)
        setIsChanged(false)
      }
    }
  }


  }, [editOptionValue, mediaColor, tableData, alreadyExists, editTable, editValue, newEditfiles, editNewImages])

  const checker = () => {
    console.log("editOptionValue",editOptionValue);
    console.log("alreadyExists",alreadyExists);
    console.log("tableData",tableData);
    console.log("object", object);
    console.log("editValue",editValue);
    console.log("editTable",editTable);
    console.log("objectFiles",objectFiles);
    console.log("mediaColor", mediaColor); 
    console.log("files", files);
    console.log("MediaIDsToRemove", MediaIDsToRemove);
    console.log("newEditFiles", newEditfiles);
    console.log("toRemove", toRemove);
  }

  return (
    <div>
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 style={{color: '#412d6c'}} className='modal-title fs-5' id='exampleModalLabel'>
              Add Image Group
            </h1>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
              onClick={closeModal}
            ></button>
          </div>
          <div className='modal-body'>
            {editOptionValue || alreadyExists || editValue ? (
              <>
                <div className='form-group mb-3'>
                  <input
                    type='text'
                    className=' form-control bg-transparent shadow-none  customInput'
                    id='floatingInputOptionValue'
                    placeholder='Option Value'
                    value={mediaColor}
                    // accept='image/png'
                    disabled
                  />
                  <label htmlFor='floatingInputOptionValue' className='form-label fs-6 fw-bolder text-dark required'>Option Value</label>
                </div>
                <div className='customDashedImageBorder col-md-12 p-2 text-center'>
                  <div>
                    {object && !editValue &&
                      object.images &&
                      [...object.images, ...newImages].map((path: any, index: any) => (
                        <div key={index} className='image-container'>
                          <img
                            className='image-group'
                            alt={path.name}
                            key={index}
                            src={path.preview}
                            style={{margin: '10px 5px'}}
                          />
                          <button
                            type='button'
                            className='custom-remove-button'
                            onClick={() => handleRemoveImage(index)}
                          >
                            <i className='ki-duotone ki-abstract-11 text-danger fs-2'>
                              <span className='path1'></span>
                              <span className='path2'></span>
                            </i>
                          </button>
                        </div>
                      ))}
                      {
                        editTable && objectFiles &&
                        [...objectFiles.Media_urls, ...files].map((path: any, index: any) =>(
                        <div key={index} className='image-container'>
                          <img
                            className='image-group'
                            alt={path.ID}
                            key={index}
                            src={path?.Media_url ||  path?.preview }
                            style={{margin: '10px 5px'}}
                          />
                          <button
                            type='button'
                            className='custom-remove-button'
                            onClick={() => handleEditRemoveImage(path.ID, index, path.Media_url, objectFiles.Value)}
                          >
                            <i className='ki-duotone ki-abstract-11 text-danger fs-2'>
                              <span className='path1'></span>
                              <span className='path2'></span>
                            </i>
                          </button>
                        </div>
                        ))}
                  </div>

                  <div>
                    <div
                      {...getRootProps({className: 'dropzone'})}
                      style={{backgroundColor: 'aliceblue'}}
                    >
                      <input {...getInputProps()} type="file"  accept='image/png' />

                      {object && object.images && object.images.length ? (
                        <div>
                          <br />
                          <i className='ki-duotone ki-picture text-info fs-3x'>
                            <span className='path1'></span>
                            <span className='path2'></span>
                          </i>
                          <br />
                          <br />
                          <p>Click here or drag images here to add more</p>
                          <br />
                        </div>
                      ) : (
                        <div>
                          <br />
                          <br />
                          <i className='ki-duotone ki-picture text-info fs-3x'>
                            <span className='path1'></span>
                            <span className='path2'></span>
                          </i>
                          <br />
                          <br />
                          <p>Drag and drop files here, or click to select files</p>
                          <br />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='form-floating mb-3'>
                  <input
                    type='text'
                   
                    className=' form-control bg-transparent shadow-none  customInput'
                    id='floatingInputOptionValue'
                    placeholder='Option Value'
                    value={newColor}
                    accept='image/png'
                    disabled
                  />
                  <label htmlFor='floatingInputOptionValue' className='form-label fs-6 fw-bolder text-dark required'>Option Value</label>
                </div>
                <div className='customDashedImageBorder col-md-12 p-2 text-center'>
                  <div>
                    {files.map((path: any, index) => (
                      <div key={index} className='image-container'>
                        <img
                          className='image-group'
                          alt={path.name}
                          key={index}
                          src={path.preview}
                          style={{margin: '10px 5px'}}
                        />
                        <button
                          type='button'
                          className='custom-remove-button'
                          onClick={() => removeImage(index)}
                        >
                          <i className='ki-duotone ki-abstract-11 text-danger fs-2'>
                            <span className='path1'></span>
                            <span className='path2'></span>
                          </i>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div
                      {...getRootProps({className: 'dropzone'})}
                      style={{backgroundColor: 'aliceblue'}}
                    >
                      <input {...getInputProps()}  accept='image/png/jpg/jpeg' />

                      {files.length ? (
                        <div>
                          <br />
                          <i className='ki-duotone ki-picture text-info fs-3x'>
                            <span className='path1'></span>
                            <span className='path2'></span>
                          </i>
                          <br />
                          <br />
                          <p>Click here or drag images here to add more</p>
                          <br />
                        </div>
                      ) : (
                        <div>
                          <br />
                          <br />
                          <i className='ki-duotone ki-picture text-info fs-3x'>
                            <span className='path1'></span>
                            <span className='path2'></span>
                          </i>
                          <br />
                          <br />
                          <p>Drag and drop files here, or click to select files</p>
                          <br />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className='modal-footer'>
            <button
              type='button'
              className='primaryOutlineBtn btn btn-lg py-4 rounded-4 custom-button-color'
              data-bs-dismiss='modal'
              onClick={closeModal}
            >
              Close
            </button>
            <button
              type='button'
              data-bs-dismiss='modal'
              className='primaryBtn btn btn-lg py-4 rounded-4 custom-button-color'
              onClick={updateDataAndCloseModal}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageGroupModal

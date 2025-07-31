import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { ICreateAccount } from '../CreateAccountWizardHelper'
import { useFormikContext } from 'formik';


interface Step5Props {
    editDistributor: any; // Replace 'any' with the actual type of editDistributor if known
    editFlag: boolean;
  
  }

const Step5: FC<Step5Props> = ({editFlag,editDistributor}) => {
  const formik = useFormikContext<ICreateAccount>() // Specify the form values type
  const [images, setImages] = useState<any[]>([])
  const [MediaIDsToRemove, setMediaIDsToRemove] = useState<any[]>([])
  const [files, setFiles] = useState([{}])

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, {Media_url: URL.createObjectURL(file)})
        ),
      ])
      setImages((prevImages) => [...prevImages, ...acceptedFiles])
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  useEffect(() => {
    if (editFlag) {
      formik.setFieldValue('Company_images', editDistributor?.OtherMedia)
      setImages(editDistributor?.OtherMedia)
    }
  }, [editDistributor, editFlag])

  const handleRemoveImage = (indexToRemove: number) => {
    if (editFlag && images[indexToRemove]?.ID) {
      setMediaIDsToRemove((prev) => [...prev, images[indexToRemove]?.ID])
    }

    setImages((prevImages) => {
      const newImages = [...prevImages]
      newImages.splice(indexToRemove, 1)
      return newImages
    })
  }

  useEffect(() => {
    formik.setFieldValue('Company_images', images)
  }, [images])

  useEffect(() => {
    formik.setFieldValue('MediaIDsToRemove', MediaIDsToRemove)
  }, [MediaIDsToRemove])

  return (
    <div className='w-100'>
      <div className=''>
        <h1 className='primaryTextSemiBold text-dark'>Media</h1>
      </div>

      <div className='row editSection marginPageMYMobile'>
        <div className='col-lg-12  mobilePaddingNone'>
          <div className='card boxNavPills'>
            <div className='card-body pb-0 pt-0 px-0'>
              <div className=''>
                <div className='customDashedImageBorder col-md-12 p-2 text-center'>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'space-around',
                    }}
                  >
                    {images &&
                      images.map((path: any, index: any) => (
                        <div key={index} className='image-container'>
                          <img
                            className='image-group'
                            alt={path.id}
                            key={index}
                            src={path.Media_url}
                            style={{margin: '10px 5px'}}
                            width={220}
                            height={220}
                          />
                          <br></br>
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
                  </div>

                  <div>
                
                    <div
                      {...getRootProps({className: 'dropzone'})}
                      style={{backgroundColor: 'aliceblue', marginTop: '1rem'}}
                    >
                      <input {...getInputProps()} accept='image/jpg,image/png' />

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
                    </div>
                    {/* : 
                    <div>
                        Only 5 images Allowed
                        </div>
                        } */}
                  </div>
                  {formik.touched.Company_images && formik.errors.Company_images && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.Company_images}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {Step5}

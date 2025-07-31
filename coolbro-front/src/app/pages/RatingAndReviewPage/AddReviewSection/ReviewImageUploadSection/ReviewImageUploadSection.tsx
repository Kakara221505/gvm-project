import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { ReviewImageUploadSectionStyles } from './ReviewImageUploadSectionStyles'
import { toAbsoluteUrl } from '../../../../../_metronic/helpers'

function ReviewImageUploadSection({ onMediaUpload }: any) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: any) => {
    console.log('Files dropped:', acceptedFiles);
    if (acceptedFiles.length) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    }
  }, []);

  useEffect(() => {
    // Call onMediaUpload when files state is updated
    onMediaUpload(files);
  }, [files, onMediaUpload]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  // Handle file upload

  const removeImage = (indexToRemove: number) => {
    setFiles((files) => files.filter((_, index) => index !== indexToRemove))
  }

  const uploadMedia = () => {
    console.log('Upload media button clicked');
    // Create FormData and append each file
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`media${index + 1}`, file);
    });

    // Notify the parent component with FormData and acceptedFiles
    // onMediaUpload(files);
  };

  return (
    <ReviewImageUploadSectionStyles>
      <div className='headRateText py-2 pb-4'>
        <h4 className='text-black'>Share a video or photo</h4>
      </div>
      <section className='imageUploadSection'>
        <div className='customDashedImageBorder col-md-12 p-2 text-center'>
          <div className='d-flex align-items-center justify-content-center'>
            {files.map((path: any, index) => (
              <div key={index} className='image-container'>
                <img
                  className='image-group'
                  alt={path.name}
                  key={index}
                  src={URL.createObjectURL(path)}
                  style={{ margin: '10px 5px' }}
                />
                <button
                  type='button'
                  className='primaryBtn rounded-circle custom-remove-button'
                  onClick={() => removeImage(index)}
                >
                  <i className='fa fa-close text-white fs-4'>
                  </i>
                </button>
              </div>

            ))}
            {files.length ? (
              <>

                <div {...getRootProps({ className: 'my-10 dropzone cursor-pointer image-group d-flex align-items-center justify-content-center' })} >
                  <input {...getInputProps()} accept='image/*' />
                  <i className='fa fa-add fs-1' />
                </div>
              </>
            ) : ('')}
          </div>

          <div className='py-4 pb-0'>
            {files.length > 0 ? (
              <></>
            ) : (
              <div>
                <div {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} accept='image/*' />
                  <img
                    className='img-fluid'
                    src={toAbsoluteUrl('/media/vectors/DragImage.png')}
                    alt='Card cap'
                  />

                  <div className='my-4'>
                    <p className='dragText my-6'>Drag and drop media here, or click add image</p>
                    <div className='addImageBtn my-3'>
                      <button className='primaryBtn btn btn-default' onClick={uploadMedia}>Add Image</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </ReviewImageUploadSectionStyles>
  )
}

export default ReviewImageUploadSection

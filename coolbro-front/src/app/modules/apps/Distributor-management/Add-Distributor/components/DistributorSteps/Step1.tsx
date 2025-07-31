/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useEffect, useState} from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../../../../../_metronic/helpers'
import {ErrorMessage, Field, useFormikContext} from 'formik'
import { StepsStyles } from './StepsStyles'
import CustomDropdown from '../../../../../../pages/HelperComponents/CustomDropdown'
import { ICreateAccount } from '../CreateAccountWizardHelper'
import {toast} from 'react-toastify'

interface Step1Props {
  editDistributor: any; // Replace 'any' with the actual type of editDistributor if known
  editFlag: boolean
}

const Step1: FC<Step1Props> = ({editFlag,editDistributor}) => {
  const [imagePreview, setImagePreview] = useState<string | null>('null')
  const [mediaBuisness, setMediaBuisness] = useState<string>('')
  const [legalStatus, setLegalStatus] = useState<string>('')
  const BuisnessOptions = ['Wholesale', 'Trader']
  const legalStatusOptions=['Individual', "Proprietor"];
  const formik = useFormikContext<ICreateAccount>(); // Specify the form values type
  const [dealerMainImage,setDealerMainImage]= useState<File | null>(null);


  const handleDropdownChangeBuisness = (BuisnessOptions: string) => {
    setMediaBuisness(BuisnessOptions)
    formik.setFieldValue('BusinessType',BuisnessOptions )
  }
  const handleDropdownLegalStatus = (legalStatusOptions:string)=>{
    setLegalStatus(legalStatusOptions);
    formik.setFieldValue('LegalStatus',legalStatusOptions)
  }
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      const fileExtension = file.name.split('.').pop();
      if (fileExtension && (fileExtension.toLowerCase() === 'png' || fileExtension.toLowerCase() === 'jpg' || fileExtension.toLowerCase() === 'jpeg'   )) {
        setDealerMainImage(file);
        formik.setFieldValue('UserMainImage', file);

        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Only PNG files are accepted for the thumbnail image.');
      }
    }
  }
  function getFormattedYear(originalDateStr:any)
  {
    // Create a Date object from the original string
    const originalDate = new Date(originalDateStr);
    // Extract year, month, and day from the original Date object
    const year = originalDate.getUTCFullYear();
    const month = String(originalDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(originalDate.getUTCDate()).padStart(2, "0");
const formattedDateStr = `${year}`;
return formattedDateStr;
  }


  console.log("FOR:", formik?.initialValues);

  useEffect(()=>{
    if(editFlag){

    formik.setFieldValue('UserMainImage',editDistributor?.UserMedia);
    setImagePreview(editDistributor?.UserMedia);
     setMediaBuisness(editDistributor?.UserDetails?.BusinessType)
    formik.setFieldValue('Company_name',editDistributor?.UserDetails?.Company_name);
    formik.setFieldValue('BusinessType',editDistributor?.UserDetails?.BusinessType);
    formik.setFieldValue('GST_number',editDistributor?.BusinessDetails?.GST_number);
    formik.setFieldValue('PAN_number', editDistributor?.BusinessDetails?.PAN_number);
    formik.setFieldValue('NumberOfEmployees',editDistributor?.UserDetails?.NumberOfEmployees);
    formik.setFieldValue('LegalStatus',editDistributor?.UserDetails?.LegalStatus);
  setLegalStatus(editDistributor?.UserDetails?.LegalStatus);
    formik.setFieldValue('Description',editDistributor?.UserDetails?.Description);
    formik.setFieldValue('Year_of_establishment', getFormattedYear(editDistributor?.UserDetails?.Year_of_establishment));
    // formik.setFieldValue('Contact_phone',editDistributor?.UserDetails?.Contact_phone);
    }



  }, [editDistributor,editFlag])
  

  return (
    <StepsStyles>
    <div className='w-100'>


      <div className='fv-row'>
        <div className='row pb-10 pb-lg-15'>
        <div className='col-lg-4 '>
          <h1 className='pb-10 pb-lg-15 fw-bolder primaryTextSemiBold d-flex align-items-center text-dark'>
        Company Profile
        </h1>
          <div className='card-body py-0 text-center pt-0'>
              <div className='centerImage'>
                {imagePreview && (
                  <img src={imagePreview} className='thumbnailPreview position-relative' />
                )}
                <div className='thumbnailButton'>
                  <label
                    className=' btn btn-icon btn-active-color-primary w-20px h-20px bg-body shadow'
                    data-bs-toggle='tooltip'
                    aria-label='Change avatar'
                    data-bs-original-target='Change Avatar'
                    data-kt-initialized={1}
                    htmlFor='thumbnailUpload'
                  >
                    <img
                      alt='Logo'
                      src={toAbsoluteUrl('/media/vectors/Edit Square.png')}
                      className='fs-2'
                    />
                  </label>
                  <input
                    type='file'
                   onChange={handleFileSelect}
                    // accept='image/*'
                    accept='image/png/jpg/jpeg'
                    style={{display: 'none'}}
                    id='thumbnailUpload'
                  />
                </div>
              </div>

              {formik.touched.UserMainImage && formik.errors.UserMainImage && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.UserMainImage}</div>
                </div>
              )} 

              <br />

              <p className='text-black fs-5 text-center' >
                Set the Company's thumbnail image. Only *.png *jpg and *jpeg image files are accepted{' '}
              </p>
            </div>
          </div>

          <div className='col-lg-8 '>
          <h1 className='pb-10 pb-lg-15 primaryTextSemiBold d-flex align-items-center text-dark'>
        Company Details
        </h1>
           <form>
            <div className='row mb-3'>
           <div className='col-md-6'>
                <div className='mb-3'>
                  <div className='form-group'>
                  <input
                      id='Company_name'
                      placeholder=''
                      className='form-control bg-transparent shadow-none  customInput'
                      type='text'
                      name='Company_name'
                      autoComplete='off'
                      value={formik?.values?.Company_name?.trimStart()}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <label className='form-label fs-6 fw-bolder ' htmlFor='CompanyName'>
                    Company Name
                    </label>
                    {formik.touched.Company_name && formik.errors.Company_name && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.Company_name}</div>
                </div>
              )}
                  </div>
                  {/* <input
                    type='text'
                    className='form-control'
                    id='floatingInputVariable'
                    placeholder='Variation'
                  /> */}
                </div>
              </div>
              <div className='col-md-6'>
              <CustomDropdown
                  options={BuisnessOptions}
                  label='Buisness Type'
                  selectedOption={mediaBuisness}
                  onChange={handleDropdownChangeBuisness}
     

                />
                  {formik.touched.BusinessType && formik.errors.BusinessType && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.BusinessType}</div>
                </div>
              )}
              </div>
            </div>
            <div className='row mb-3'>
           <div className='col-md-6'>
                <div className='mb-3'>
                  <div className='form-group'>
                  <input
                      id='GST_number'
                      placeholder=''
                      className='form-control bg-transparent shadow-none  customInput'
                      type='text'
                      name='GST_number'
                      autoComplete='off'
                      onChange={formik.handleChange}
                      value={formik.values?.GST_number.trim()}
                      onBlur={formik.handleBlur}
                    />
                    <label className='form-label fs-6 fw-bolder ' htmlFor='GST_number'>
                    GST Number
                    </label>
                    {formik.touched.GST_number && formik.errors.GST_number && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.GST_number}</div>
                </div>
              )}
                  </div>
                  {/* <input
                    type='text'
                    className='form-control'
                    id='floatingInputVariable'
                    placeholder='Variation'
                  /> */}
                </div>
              </div>
              <div className='col-md-6'>
              <div className='mb-3'>
                  <div className='form-group '>
                  <input
                      id='PAN_number'
                      placeholder=''
                      className='form-control bg-transparent shadow-none  customInput'
                      type='text'
                      name='PAN_number'
                      autoComplete='off'
                      value={formik?.values?.PAN_number.trim()}
                      onChange={(e) => formik.setFieldValue('PAN_number', e.target.value.toUpperCase())}
                      onBlur={formik.handleBlur}
                    />
                    <label className='form-label fs-6 fw-bolder ' htmlFor='PAN_number'>
                    PAN Number
                    </label>
                    {formik.touched.PAN_number && formik.errors.PAN_number && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.PAN_number}</div>
                </div>
              )}
                  </div>
                  {/* <input
                    type='text'
                    className='form-control'
                    id='floatingInputVariable'
                    placeholder='Variation'
                  /> */}
                </div>
              </div>
            </div>
            <div className='row mb-3'>
           <div className='col-md-6'>
                <div className='mb-3'>
                <div className='form-group'>
                    <input
                      id='NumberOfEmployees'
                      placeholder=''
                      className='form-control bg-transparent shadow-none  customInput'
                      type='number'
                      name='NumberOfEmployees'
                      autoComplete='off'
                      onChange={formik.handleChange}
                      value={formik?.values?.NumberOfEmployees}
                      onBlur={formik.handleBlur}
                    />
                    <label className='form-label fs-6 fw-bolder ' htmlFor='NumberOfEmployees'>
                    Number of Employees
                    </label>
                    {formik.touched.NumberOfEmployees && formik.errors.NumberOfEmployees && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.NumberOfEmployees}</div>
                </div>
              )}
                  </div>
                </div>
              </div>
              <div className='col-md-6'>
              <CustomDropdown
                  options={legalStatusOptions}
                  label='Legal Status'
                  selectedOption={legalStatus}
                  onChange={handleDropdownLegalStatus}
                />
                        {formik.touched.LegalStatus && formik.errors.LegalStatus && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.LegalStatus}</div>
                </div>
              )}
              </div>
            </div>
            <div className='row mb-3'>
           <div className='col-md-6'>
                <div className='mb-3'>
                <div className='form-group'>
                    <input
                      id='Year_of_establishment'
                      placeholder=''
                      className='form-control bg-transparent shadow-none  customInput'
                      type='text'
                      name='Year_of_establishment'
                      value={formik.values.Year_of_establishment.trim()}
                      autoComplete='off'
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <label className='form-label fs-6 fw-bolder ' htmlFor='Year_of_establishment'>
                    Year of Establishment
                    </label>
                    {formik.touched.Year_of_establishment && formik.errors.Year_of_establishment && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.Year_of_establishment}</div>
                </div>
              )}
                  </div>
                </div>
              </div>
   
            </div>
            <div className='row '>
            <div className='col-lg-12'>
                            <div className='form-group'>
                            <textarea
                                className='form-control customInput'
                                id='exampleFormControlTextarea1'
                                name="Description"
                                onChange={formik.handleChange}
                                value={formik.values.Description}
                                onBlur={formik.handleBlur}
                              ></textarea>
                              <label className='form-label fs-6 fw-bolder ' htmlFor='description'>
                                Description
                              </label>
                            </div>
                          </div>
            </div>
           </form>
          </div>

          <div className='text-danger mt-2'>
            <ErrorMessage name='accountType' />
          </div>
        </div>
      </div>
    </div>
    </StepsStyles>
  )
}

export {Step1}

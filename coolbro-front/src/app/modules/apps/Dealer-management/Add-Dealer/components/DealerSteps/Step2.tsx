import React, {FC, useEffect, useState} from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../../../../../_metronic/helpers'
import {StepsStyles} from './StepsStyles'
import {ICreateAccount} from '../CreateAccountWizardHelper'
import {useFormikContext} from 'formik'
interface Step2Props {
  editDealer: any // Replace 'any' with the actual type of editDealer if known
  editFlag: boolean
}

const Step2: FC<Step2Props> = ({editDealer, editFlag}) => {
  
  const [selectedOption, setSelectedOption] = useState<string>('')
  const formik = useFormikContext<ICreateAccount>() // Specify the form values type



  const handleEmailChange = (email: any) => {
    formik.setFieldValue('Email', email.target.value)
    formik.setFieldValue('Contact_email', email.target.value)
  }

  const handleButtonClick = (option: string) => {
    setSelectedOption(option)
    formik.setFieldValue('Gender', option)
  }

  function getFormattedDate(originalDateStr: any) {
    // Create a Date object from the original string
    const originalDate = new Date(originalDateStr)
    // Extract year, month, and day from the original Date object
    const year = originalDate.getUTCFullYear()
    const month = String(originalDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(originalDate.getUTCDate()).padStart(2, '0')
    const formattedDateStr = `${year}-${month}-${day}`;
    return formattedDateStr;
  }

  useEffect(() => {
    if (editFlag) {
      let nameArray: string[] = editDealer?.User?.Name.split(' ')
      // Extracting first and last names
      let firstName: string = nameArray[0]
      let lastName: string = nameArray.slice(1).join(' ')
      setSelectedOption(editDealer?.UserDetails?.Gender.toLowerCase())
      formik.setFieldValue('First_name', firstName)
      formik.setFieldValue('Last_name', lastName)
      formik.setFieldValue('Contact_phone', editDealer?.UserDetails?.Contact_phone)
      // formik.setFieldValue('Phone_number_2', editDealer?.UserDetails?.Contact_phone);

      formik.setFieldValue('Gender', editDealer?.UserDetails?.Gender.toLowerCase())
      formik.setFieldValue('Email', editDealer?.UserDetails?.Contact_email)

      formik.setFieldValue('Contact_email', editDealer?.UserDetails?.Contact_email)
      formik.setFieldValue(
        'Date_of_birth',
        getFormattedDate(editDealer?.UserDetails?.Date_of_birth)
      )
    }
  }, [editDealer, editFlag])

  const handlePhoneChange = (phone: any) => {
    formik.setFieldValue('Contact_phone', phone.target.value)
  }

  return (
    <StepsStyles>
      <div className='w-100'>
        <div className='pb-lg-8'>
          <h1 className='primaryTextSemiBold text-dark'>General</h1>
        </div>

        <div className='row mb-3'>
          <div className='col-lg-6'>
            <div className='mb-3'>
              <div className='form-group'>
                <input
                  id='First_name'
                  placeholder=''
                  className='form-control bg-transparent shadow-none  customInput'
                  type='text'
                  name='First_name'
                  value={formik?.values?.First_name.trimStart()}
                  autoComplete='off'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder ' htmlFor='First_name'>
                  First Name
                </label>
                {formik.touched.First_name && formik.errors.First_name && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.First_name}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='mb-3'>
              <div className='form-group'>
                <input
                  id='Last_name'
                  placeholder=''
                  className='form-control bg-transparent shadow-none  customInput'
                  type='text'
                  name='Last_name'
                  value={formik?.values?.Last_name.trimStart()}
                  autoComplete='off'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder ' htmlFor='Last_name'>
                  Last Name
                </label>
                {formik.touched.Last_name && formik.errors.Last_name && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{'This field is Required'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='row mb-3'>
          <div className='col-lg-6'>
            <div className='mb-3'>
              <div className='form-group'>
                <input
                  id='Contact_phone'
                  placeholder=''
                  value={formik?.values?.Contact_phone}
                  className='form-control bg-transparent shadow-none  customInput'
                  type='text'
                  name='Contact_phone'
                  autoComplete='off'
                  onChange={handlePhoneChange}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder ' htmlFor='Contact_phone'>
                  Phone Number
                </label>
                {formik.touched.Contact_phone && formik.errors.Contact_phone && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Contact_phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='col-lg-6'>
            <div className='mb-3'>
              <div className='form-group'>
                <input
                  id='Contact_email'
                  placeholder=''
                  className='form-control bg-transparent shadow-none  customInput'
                  type='email'
                  name='Contact_email'
                  value={formik?.values?.Contact_email}
                  autoComplete='off'
                  onChange={handleEmailChange}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder ' htmlFor='Contact_email'>
                  Email Id
                </label>
                {formik.touched.Contact_email && formik.errors.Contact_email && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Contact_email}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-6 marginPageMYMobile'>
            <div className='d-flex  mobileFlexColumn align-items-center'>
              <button
                type='button'
                className={`navbarMarginForSearch mobileMarginNone me-5 py-4 px-10 d-flex align-items-center btn btn-default btn-sm ${
                  selectedOption === 'male'
                    ? 'navbarMarginForSearch mobileMarginNone selected-button-male'
                    : 'navbarMarginForSearch mobileMarginNone unselected-button-male'
                }`}
                onClick={() => handleButtonClick('male')}
              >
                <img
                  src={toAbsoluteUrl('/media/vectors/maleSign.png')}
                  className={`img-fluid ${
                    selectedOption === 'male' ? 'selected-button-Image' : ''
                  }`}
                  alt='Logout'
                />{' '}
                Male
              </button>
              <button
                type='button'
                id='femaleOutlineBtn'
                className={`navbarMarginForSearch mobileMarginNone me-5 py-4 px-8 d-flex align-items-center btn btn-default btn-sm ${
                  selectedOption === 'female'
                    ? 'navbarMarginForSearch mobileMarginNone selected-button-female'
                    : 'navbarMarginForSearch mobileMarginNone unselected-button-female'
                }`}
                onClick={() => handleButtonClick('female')}
              >
                <img
                  src={toAbsoluteUrl('/media/vectors/femaleSign.png')}
                  className={`img-fluid ${
                    selectedOption === 'female' ? 'selected-button-Image' : ''
                  }`}
                  alt='Logout'
                />{' '}
                Female
              </button>
              <button
                type='button'
                id='otherOutlineBtn'
                className={` navbarMarginForSearch py-4 px-10 d-flex align-items-center btn btn-default btn-sm ${
                  selectedOption === 'other'
                    ? 'navbarMarginForSearch mobileMarginNone selected-button-other'
                    : 'navbarMarginForSearch   mobileMarginNone unselected-button-other'
                }`}
                onClick={() => handleButtonClick('other')}
              >
                <img
                  src={toAbsoluteUrl('/media/vectors/otherSign.png')}
                  className={`img-fluid ${
                    selectedOption === 'other' ? 'selected-button-Image' : ''
                  }`}
                  alt='Logout'
                />{' '}
                Other
              </button>
            </div>
            {formik.touched.Gender && formik.errors.Gender && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.Gender}</div>
              </div>
            )}
          </div>
          <div className='col-lg-6 '>
            <div className='form-group'>
              <input
                id='Date_of_birth'
                placeholder=''
                className='form-control bg-transparent shadow-none customInput'
                type='date'
                name='Date_of_birth'
                value={formik?.values?.Date_of_birth}
                autoComplete='off'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <label className='form-label fs-6 fw-bolder ' htmlFor='dob'>
                Date of Birth
              </label>
              {formik.touched.Date_of_birth && formik.errors.Date_of_birth && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.Date_of_birth}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepsStyles>
  )
}

export {Step2}

import React, {useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {FormikHelpers, useFormik} from 'formik'
import {useAuth} from '../../../auth'
import * as authHelper from '../../../auth/core/AuthHelpers'
import * as Yup from 'yup'
import axios from 'axios'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'
import clsx from 'clsx'
import CustomDropdown from '../../../../pages/HelperComponents/CustomDropdown'
// import "../../../../../../node_modules/flatpickr/dist/themes/material_blue.css";
import Flatpickr from 'react-flatpickr'
import '../../../../../../node_modules/flatpickr/dist/flatpickr.css'

const editBtn = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  right: 0,
  bottom: 0,
}

interface UserFormValues {
  Name: string
  Email: string
  CountryCode: string
  Phone: string
  Gender: string
  Date_of_birth: string
  UserMedia: File | string
  ThumbnailURL: string
}

const validationSchema = Yup.object().shape({
  Name: Yup.string().trim().required('Name is required'),
  Email: Yup.string().trim().email('Invalid email').required('Email is required'),
  CountryCode: Yup.string().trim().nullable(),
  Phone: Yup.string().trim().required('Phone is required'),
  Gender: Yup.string()
    .transform((value) => value.trim())
    .required('Gender is required'),
  Date_of_birth: Yup.string()
    .transform((value) => value.trim())
    .required('Date of Birth is required'),
  ThumbnailURL: Yup.mixed().required('Image is required'),
})

const GenderOptions = ['Male', 'Female', 'Diverse']

function AddEditUser() {
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()
  const {userId} = useParams<{userId: string}>()

  const navigate = useNavigate()
  // const [countryArray, setCountryArray] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string[]>([])
  const TOKEN = authHelper.getAuth()


  
  const initialValues: UserFormValues = {
    Name: '',
    Email: '',
    CountryCode: '',
    Phone: '',
    Gender: '',
    Date_of_birth: '',
    UserMedia: '',
    ThumbnailURL: '',
  }

  const handleSubmit = async (
    values: UserFormValues,
    formikHelpers: FormikHelpers<UserFormValues>
  ) => {
    formikHelpers.setSubmitting(true)
    setLoading(true)
    try {
      const formData = new FormData()

      Object.keys(values).forEach((key) => {
        const value = values[key as keyof UserFormValues]
        if (value !== null && typeof value !== 'undefined') {
          formData.append(key, String(value))
        }
      })

      if (values.UserMedia instanceof File) {
        formData.append('UserMedia', values.UserMedia)
      }
      if (userId !== null) {
        formData.append('UserID', userId as string)
      }
      await submitFormValues(values, formData)
    } catch (error) {
      console.log(error)
    }
    formikHelpers.setSubmitting(false)
    setLoading(false)
  }

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  })

  useEffect(() => {
    if (userId) {
      getUser()
    } else {
      formik.setValues(initialValues)
    }
    fetchCountryData()
  }, [userId])

  const getUser = () => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/userdetail/${userId}`, {
        headers: {Authorization: `Bearer ${TOKEN?.AccessToken}`},
      })
      .then((res) => {
        if (res.data.data.User) {
          const user = res.data.data.User
          const userDetails = res.data.data.UserDetails
          const userMedia = res.data.data.UserMedia

          formik.setValues({
            Name: user.Name || initialValues.Name,
            Email: user.Email || initialValues.Email,
            Phone: user.Phone || initialValues.Phone,
            CountryCode: initialValues.CountryCode,
            Gender: userDetails.Gender ? userDetails.Gender : '',
            Date_of_birth: userDetails.Date_of_birth ? userDetails.Date_of_birth : '',
            UserMedia: userMedia?.Media_url || initialValues.UserMedia,
            ThumbnailURL: userMedia?.Media_url || initialValues.UserMedia,
          })
        } else {
          console.log('err')
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleDropdownCountryCode = (colorOptions: string) => {
    formik.setFieldValue('CountryCode', colorOptions || '')
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      formik.setFieldValue('ThumbnailURL', URL.createObjectURL(file))
      formik.setFieldValue('UserMedia', file)
      formik.setFieldError('ThumbnailURL', '')
    }
  }

  const submitFormValues = async (values: UserFormValues, formData: FormData) => {
    try {
      if (userId) {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/userdetail/update_userdetail`,
          formData,
          {
            headers: {Authorization: `Bearer ${TOKEN?.AccessToken}`},
          }
        )
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchCountryData = () => {
    const countries = require('country-data').callingCountries
    const processedCountries: Record<string, boolean> = {}
    const result: string[] = []

    for (const countryCode in countries) {
      if (countries.hasOwnProperty(countryCode) && countryCode !== 'all') {
        const country = countries[countryCode]
        const countryCallingCodes = country.countryCallingCodes
        const countryName = country.name

        if (!processedCountries[countryCallingCodes] && !processedCountries[countryName]) {
          const countryObject = `${countryName} ${countryCallingCodes}`
          result.push(countryObject)
          processedCountries[countryCallingCodes] = true
          processedCountries[countryName] = true
        }
      }
    }
    // setCountryArray(result);
 
    
    setCountryCode(result)
  }

  return (
    <div>
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0 cursor-pointer'>
          <div className='card-title m-0'>
            {userId ? (
              <h1 className='primaryTextSemiBold fw-bolder m-0'>Edit User </h1>
            ) : (
              <h1 className='primaryTextSemiBold fw-bolder m-0'>Add User </h1>
            )}
          </div>
        </div>
        <div className='collapse show'>
          <form onSubmit={formik.handleSubmit}>
            <div className='card-body border-top p-9'>
              <div className='fv-row mb-7 d-flex flex-column align-items-center'>
                <div
                  className='image-input image-input-outline image-input-placeholder'
                  data-kt-image-input='true'
                  style={{backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})`}}
                >
                  <div
                    className='position-relative image-input-wrapper w-150px h-150px rounded-circle shadow-sm'
                    style={{backgroundImage: `url(${toAbsoluteUrl(formik.values.ThumbnailURL)})`}}
                  ></div>
                  <label
                    style={{top: 'auto', bottom: '0'}}
                    className='pe-10 btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body '
                    data-kt-image-input-action='change'
                    data-bs-toggle='tooltip'
                    aria-label='Change avatar'
                    data-bs-original-title='Change avatar'
                    data-kt-initialized='1'
                  >
                    <img
                      alt='Logo'
                      src={toAbsoluteUrl('/media/vectors/Edit Square.png')}
                      className=' fs-2'
                    />
                    <input
                      type='file'
                      name='Image_url'
                      accept='.png, .jpg, .jpeg'
                      onChange={handleProfileChange}
                    />
                  </label>
                  <span
                    className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow'
                    data-kt-image-input-action='cancel'
                    data-bs-toggle='tooltip'
                    aria-label='Cancel avatar'
                    data-bs-original-title='Cancel avatar'
                    data-kt-initialized='1'
                  >
                    <i className='ki-duotone ki-cross fs-2'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                  </span>
                </div>
                <p className='text-black fs-6 mt-4 mb-0 text-center'>
                  Set the user profile image. <br /> Only *.png *jpg and *jpeg image files are
                  accepted{' '}
                </p>
                {formik.touched.ThumbnailURL && formik.errors.ThumbnailURL && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{String(formik.errors.ThumbnailURL)}</div>
                  </div>
                )}
              </div>
              <div className='row'>
                <div className='fv-row col-lg-6 mb-8 paddingPagePXMobile'>
                  <div className='form-group'>
                    <input
                      id='Name'
                      placeholder=''
                      className={clsx('form-control bg-transparent shadow-none customInput', {
                        'is-invalid': formik.touched.Name && formik.errors.Name,
                      })}
                      type='text'
                      autoComplete='off'
                      {...formik.getFieldProps('Name')}
                    />
                    <label
                      className={clsx('form-label fs-6 fw-bolder floating-label', {
                        float: formik.values.Name !== '', // Add this class to make the label float when there's a value
                      })}
                      htmlFor='Name'
                    >
                      Name
                    </label>
                  </div>
                  {formik.touched.Name && formik.errors.Name && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{String(formik.errors.Name)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className='fv-row col-lg-6 mb-8'></div>
              </div>
              <div className='row'>
                <div className='fv-row col-lg-6 mb-8'>
                  <div className='form-group'>
                    <input
                      id='Email'
                      placeholder=''
                      className={clsx('form-control bg-transparent shadow-none customInput', {
                        'is-invalid': formik.touched.Email && formik.errors.Email,
                      })}
                      type='text'
                      autoComplete='off'
                      disabled={userId ? true : false}
                      {...formik.getFieldProps('Email')}
                    />
                    <label
                      className={clsx('form-label fs-6 fw-bolder floating-label', {
                        float: formik.values.Email !== '', // Add this class to make the label float when there's a value
                      })}
                      htmlFor='Email'
                    >
                      Email
                    </label>
                  </div>
                  {formik.touched.Email && formik.errors.Email && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{String(formik.errors.Email)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className='fv-row col-lg-6 mb-8'>
                  <div className='form-group'>
                    <input
                      id='Phone'
                      placeholder=''
                      type='text'
                      autoComplete='off'
                      disabled={userId ? true : false}
                      className={clsx('form-control bg-transparent shadow-none customInput', {
                        'is-invalid': formik.touched.Phone && formik.errors.Phone,
                      })}
                      {...formik.getFieldProps('Phone')}
                    />
                    <label
                      className={clsx('form-label fs-6 fw-bolder floating-label', {
                        float: formik.values.Phone !== '', // Add this class to make the label float when there's a value
                      })}
                      htmlFor='Phone'
                    >
                      Phone
                    </label>
                  </div>
                  {formik.touched.Phone && formik.errors.Phone && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{String(formik.errors.Phone)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className='row'>
                <div className='fv-row col-lg-6 mb-8'>
                  <CustomDropdown
                    options={GenderOptions}
                    label='Gender'
                    selectedOption={formik.values.Gender}
                    onChange={(selectedOption) =>
                      formik.setFieldValue('Gender', selectedOption || '')
                    }
                  />
                  {formik.touched.Gender && formik.errors.Gender && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{formik.errors.Gender}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className='fv-row col-lg-6 mb-8'>
                  <div className='form-group'>
                    <Flatpickr
                      value={formik.values.Date_of_birth}
                      className='form-control flatpickr-input active'
                      options={{
                        enableTime: false, // Disable the time component
                        altInput: true, // Enable an alternate input field for a human-friendly date display
                        altFormat: 'Y-m-d', // Format for the alternate input
                        dateFormat: 'Y-m-d', // Format for the actual input (to match the Formik value format)
                      }}
                      onChange={([date]) => {
                        console.log(date)
                        formik.setFieldValue('Date_of_birth', date || '')
                      }}
                    />
                    <label
                      className={clsx('form-label fs-6 fw-bolder floating-label', {
                        float: formik.values.Date_of_birth !== '', // Add this class to make the label float when there's a value
                      })}
                      htmlFor='Date_of_birth'
                    >
                      Date of birth
                    </label>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='fv-row col-lg-6 mb-8'>
                  <CustomDropdown
                    options={countryCode}
                    label='Country Code'
                    // disabled={userId ? true : false}
                    selectedOption={formik.values.CountryCode}
                    onChange={handleDropdownCountryCode}
                  />
                  {formik.touched.CountryCode && formik.errors.CountryCode && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{String(formik.errors.CountryCode)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='card-footer d-flex justify-content-end py-6 px-9'>
              <button
                type='submit'
                className='primaryBtn border-0 fw-bolder fs-6 px-8 py-4 my-3 me-3'
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <div
                onClick={() => navigate(`/admin/user/list`)}
                className='primaryOutlineBtn cursor-pointer fw-bolder fs-6 px-8 py-4 my-3 me-3'
              >
                Cancel
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddEditUser

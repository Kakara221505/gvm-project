/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState, FC } from 'react'
import { Link } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { ContactUsPageCardStyles } from './ContactUsPageCardStyles'
import axios from 'axios'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  defaultFormErrorConfig,
  defaultContactUsFormConfig
} from '../../../config/sweetAlertConfig'
import { useAuth } from '../../../modules/auth'
import * as authHelper from '../../../modules/auth/core/AuthHelpers'

interface Contact {
  Name: string
  Email: string
  Subject: string
  Message: string
  Phone: string
}
const validationSchema = Yup.object().shape({
  FirstName: Yup.string().trim().required('Name is required'),
  Email: Yup.string()
    .test('is-valid-email','Invalid email format', function (value: string | undefined) {
      if (!value) { return false; }
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return emailRegex.test(value);
    }).required('Email is required'),

  Phone: Yup.string()
    .test('is-valid-phone-number','Invalid phone number format',function (value: string | undefined) {
      if (!value) { return false; }
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(value);
    }).required('Phone is required'),
  Subject: Yup.string().trim().required('Subject is required'),
  Message: Yup.string().trim().required('Message is required')
})

const ContactUsPageCard: FC = () => {
  const [loading, setLoading] = useState(false)
  const TOKEN = authHelper.getAuth()
  const { currentUser, setCurrentUser } = useAuth()
  const [contactdata, setContactData] = useState<Contact[]>([])
  const formik = useFormik({
    initialValues: {
      FirstName: '',
      LastName: '',
      Email: '',
      Subject: '',
      Message: '',
      Phone: ''
    },
    validationSchema,

    onSubmit: (values) => {
      console.log("hii")
      try {
        setLoading(true)
        const fullName = `${values.FirstName} ${values.LastName}`;
        const requestData: Contact = {
          Name: fullName,
          Email: values.Email,
          Subject: values.Subject,
          Message: values.Message,
          Phone: values.Phone
        }
        axios
          .post(`${process.env.REACT_APP_SERVER_URL}/contactus/add_contactus`, requestData, {
            headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
          })
          .then(async (res) => {
            if (res.status === 200 && res.data.message) {
              setLoading(false)
              formik.resetForm()
              Swal.fire(defaultContactUsFormConfig)
            } else {
              setLoading(false)
              Swal.fire(defaultFormErrorConfig)
              // Handle other status codes or error messages
              if (res.status === 400) {
                // Display an error message for bad request
                console.log('Bad Request: ', res.data.error)
              } else if (res.status === 401) {
                // Display an error message for unauthorized access
                console.log('Unauthorized: ', res.data.error)
              } else {
                // Handle other status codes
                console.log('Error: ', res.data.error)
              }
            }
          })
          .catch((err) => {
            console.log(err)
            Swal.fire(defaultFormErrorConfig)
            //formik.setFieldError('Name', err.response.data.message);
            setLoading(false)
            // Handle the error
          })
      } catch (err) {
        Swal.fire(defaultFormErrorConfig)
        setLoading(false)
        // Handle the error
      }
    },
  })
  return (
    <ContactUsPageCardStyles>
      <div className='row bg-white contactPadding  mx-0 align-items-baseline my-16 rounded-4  py-20 px-6'>
        <div className='col-lg-6  px-20 mobilePaddingNone'>
          <div className='innerContactusSection  '>
            <h1 className='primaryTextMediumBold'>OTHER WAYS TO CONNECT</h1>
            <p className='my-5 fs-4'>
              We' love to hear from you. Our friendly team is always here to chat.
            </p>
          </div>

          <div className='marginPageMY'>
            <div className='contactusSection'>
              <div className='d-flex'>
                <img
                  height={30}
                  width={30}
                  src={toAbsoluteUrl('/media/vectors/ConatctusFrame1.png')}
                  className='me-3'
                  alt='Manage Address'
                />{' '}
                <div className='d-flex flex-column'>
                  <div className=''>
                    <h4 className='mb-0'>Reach us on email</h4>
                  </div>
                  <h5 className='my-4 fw-normal'>Our friendly team is here to help.</h5>

                  <h5 className='primaryTextMedium'>info@coolbro.com</h5>
                </div>
              </div>
              <div className='d-flex my-10'>
                <img
                  height={30}
                  width={30}
                  src={toAbsoluteUrl('/media/vectors/ConatctusFrame2.png')}
                  className='me-3'
                  alt='Manage Address'
                />{' '}
                <div className='d-flex flex-column'>
                  <div className=''>
                    <h4 className='mb-0'>Phone</h4>
                  </div>
                  <h5 className='my-4 fw-normal'>Mon-Fri from 8am to 5pm.</h5>

                  <h5 className='primaryTextMedium'>+01 (455) 875 8005</h5>
                  <h5 className='primaryTextMedium'>+01 (455) 652 6254</h5>
                </div>
              </div>
              <div className='d-flex my-10'>
                <img
                  height={30}
                  width={30}
                  src={toAbsoluteUrl('/media/vectors/ConatctusFrame3.png')}
                  className='me-3'
                  alt='Manage Address'
                />{' '}
                <div className='d-flex flex-column'>
                  <div className=''>
                    <h4 className='mb-0'>Office</h4>
                  </div>
                  <h5 className='my-4 fw-normal'>Come say hello at our office HQ.</h5>

                  <h5 className='primaryTextMedium'>
                    1st floor, Nilkanth Chambers, near Sai Baba Temple, Katargam Darwaja, Surat, Gujarat 395004.
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-lg-6  px-20 mobilePaddingNone'>
          <div className=''>
            <h2 className='primaryTextMediumBold textAlignCenterMobile mb-5'>GET IN TOUCH TODAY !</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className='fv-row d-block input-group  mb-2'>
                <div className='row'>
                  <div className='col-lg-6 '>
                    <div className='form-group'>
                      <input
                        id='FirstName'
                        placeholder=''
                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.FirstName && formik.errors.FirstName
                          ? 'is-invalid'
                          : ''
                          }`}
                        type='text'
                        name='FirstName'
                        autoComplete='off'
                        value={formik.values.FirstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>
                        First Name
                      </label>
                      {formik.touched.FirstName && formik.errors.FirstName && (
                        <div className='invalid-feedback'>
                          {formik.errors.FirstName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='col-lg-6 marginBottomContact'>
                    <div className='form-group mb-0'>
                      <input
                        id='LastName'
                        placeholder=''
                        className='form-control bg-transparent shadow-none  customInput'
                        type='text'
                        name='LastName'
                        autoComplete='off'
                        value={formik.values.LastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>
                        Last Name
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className='fv-row mb-8  d-block input-group  form-group'>
                <div className='row'>
                  <div className='col-lg-12'>
                    <div className='form-group mb-0'>
                      <input
                        id='Email'
                        placeholder=' '
                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Email && formik.errors.Email
                          ? 'is-invalid'
                          : ''
                          }`}
                        type='text'
                        name='Email'
                        autoComplete='off'
                        value={formik.values.Email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='emailId'>
                        Email ID
                      </label>
                      {formik.touched.Email && formik.errors.Email && (
                        <div className='invalid-feedback'>
                          {formik.errors.Email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='fv-row mb-8  d-block input-group  form-group'>
                <div className='row'>
                  <div className='col-lg-12'>
                    <div className='form-group mb-0'>

                      <input
                        id='Phone'
                        placeholder=''
                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Phone && formik.errors.Phone
                          ? 'is-invalid'
                          : ''
                          }`}
                        type='text'
                        name='Phone'
                        autoComplete='off'
                        value={formik.values.Phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}

                      />

                      <label className='form-label fs-6 fw-bolder ' htmlFor='phoneNumber'>
                        Phone Number
                      </label>
                      {formik.touched.Phone && formik.errors.Phone && (
                        <div className='invalid-feedback'>
                          {formik.errors.Phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='fv-row mb-8  d-block input-group  form-group'>
                <div className='row'>
                  <div className='col-lg-12'>
                    <div className='form-group mb-0'>
                      <input
                        id='Subject'
                        placeholder=''
                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Subject && formik.errors.Subject
                          ? 'is-invalid'
                          : ''
                          }`}
                        type='text'
                        name='Subject'
                        autoComplete='off'
                        value={formik.values.Subject}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='phoneNumber'>
                        Subject
                      </label>
                      {formik.touched.Subject && formik.errors.Subject && (
                        <div className='invalid-feedback'>
                          {formik.errors.Subject}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='fv-row mb-8  d-block input-group  form-group'>
                <div className='row'>
                  <div className='col-lg-12'>
                    <div className='form-group'>
                      <textarea
                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Message && formik.errors.Message
                          ? 'is-invalid'
                          : ''
                          }`}
                        id='Message'
                        name='Message'
                        value={formik.values.Message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder=""
                      ></textarea>
                      <label
                        className='form-label fs-6 fw-bolder '
                        htmlFor='Message'
                      >
                        Message
                      </label>
                      {formik.touched.Message && formik.errors.Message && (
                        <div className='invalid-feedback'>
                          {formik.errors.Message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='d-flex ms-auto justify-content-end'>
                <button type='submit' className='primaryBtn btn btn-default'>
                  {loading ? 'Sending...' : 'Send Message'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ContactUsPageCardStyles>
  )
}

export default ContactUsPageCard

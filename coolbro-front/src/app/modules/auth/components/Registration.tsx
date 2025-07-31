/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react'
import { auth } from "../../../config/firebaseConfig";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";

import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { getUserByToken, register } from '../core/_requests'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { PasswordMeterComponent } from '../../../../_metronic/assets/ts/components'
import { useAuth } from '../core/Auth'

const initialValues = {
  name: '',
  emailOrPhone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

const separatorStyles = {
  display: 'flex',
  alignItems: 'center',
}

const lineStyles = {
  height: '1px',
  flex: 1,
  backgroundColor: '#262262',
}

const headingStyles = {
  padding: '0 0.7rem',
  fontSize: 16,
  color: '#262262',
  fontWeight: 'medium',
}


const registrationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Name is required'),
  emailOrPhone: Yup.string()
    .test('is-email-or-phone', 'Invalid email format', function (value: string | undefined) {

      if (!value) { return false; }

      // Custom validation logic to check if it's a valid email or phone
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      // const phoneRegex = /^\d{10}$/;

      return emailRegex.test(value); // || phoneRegex.test(value);
    })
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must not exceed 20 characters')
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  acceptTerms: Yup.bool().oneOf([true], 'You must accept the terms and conditions'),
})

export function Registration() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword1, setShowPassword1] = useState(false)

  const { saveAuth, setCurrentUser } = useAuth()
  console.log("AUTHL123:", auth);
  
  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      try {
        const { data: auth } = await register(
          values.emailOrPhone,
          '',
          values.name,
          values.password,
          '',
          '0',
          'User'
        )
        saveAuth(auth)
        // const { data: user } = await getUserByToken(auth.api_token)
        console.log("CURENT USER", auth);
        setCurrentUser(auth?.User)  
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        setStatus('The registration details are incorrect')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

  async function registerUsingGoogle(){
    const provider = new GoogleAuthProvider();
    try {
      if(auth===null)
      {
         console.log("Auth not defined");
         return ;
      }

      const result = await signInWithPopup(auth, provider);
      const registeredUser = result.user;
      console.log("User logged in is",result,  registeredUser);

  
      setLoading(true)
       if(registeredUser.email === null || registeredUser.email=== "")
       {
         console.error("Email doesn't exist.") 
         return ;
       }
      try {
        const { data: authData } = await register(
          registeredUser.email  ,
          '',
          registeredUser.displayName || '' ,
          '',
          '',
          '2',
          'User'
        )
     
        saveAuth(authData)
        setCurrentUser(authData?.User)
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        setLoading(false)
      }

    } catch (error:any) {
      console.log("Google Sign-In Error:", error.message);
      throw error;
    }
  }

  return (
    <form className='form' onSubmit={formik.handleSubmit} noValidate id='kt_signup_form'>
      <div className='marginPageMYMobile mobileDisplayNoneDesktop'>
        <a href='/'>
          <img
            src={toAbsoluteUrl('/media/logos/logo.png')}
            className='logoResMobile img-fluid'
            alt=''
          />
        </a>
      </div>
      <div className='headerLoginText text-center mb-12'>
        <h2 className='primaryTextBold fs-2tx mb-6'>Register</h2>
        <span className='welcomeText fs-xl-3 '>
          Just fill up details below and you are good to go !
        </span>
      </div>
      <div className='fv-row mb-8  d-block input-group  form-group'>
        <div className='form-group'>

          <input
            id="Name"
            placeholder=''
            {...formik.getFieldProps('name')}
            className={clsx(
              'form-control bg-transparent shadow-none  customInput',
              { 'is-invalid': formik.touched.name && formik.errors.name },
              {
                'is-valid': formik.touched.name && !formik.errors.name,
              }
            )}
            type='name'
            name='name'
            autoComplete='off'
          />
          <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>Name</label>
          {formik.touched.name && formik.errors.name && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='fv-row mb-8 d-block input-group form-group'>
        <div className='form-group'>
          <input
            id='emailOrPhone'
            placeholder=''
            {...formik.getFieldProps('emailOrPhone')}
            className={clsx(
              'form-control bg-transparent shadow-none  customInput',
              { 'is-invalid': formik.touched.emailOrPhone && formik.errors.emailOrPhone },
              {
                'is-valid': formik.touched.emailOrPhone && !formik.errors.emailOrPhone,
              }
            )}
            type='email'
            name='emailOrPhone'
            autoComplete='off'
          />
          <label className='form-label fs-6 fw-bolder ' htmlFor='Email'>
            {/* Phone Number / Email Address */}
            Email
          </label>
          {formik.touched.emailOrPhone && formik.errors.emailOrPhone && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.emailOrPhone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fv-row d-block input-group form-group mb-8 fv-plugins-icon-container" data-kt-password-meter="true">
        <div className="form-group mb-1">
          <div className="position-relative mb-3">
            <input
              id='pass'
              type={showPassword ? 'text' : 'password'}
              placeholder=''
              autoComplete='new-password'
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent shadow-none  customInput',
                {
                  'is-invalid1': formik.touched.password && formik.errors.password,
                },
                {
                  'is-valid1': formik.touched.password && !formik.errors.password,
                }
              )}
            />
            <label className='form-label fw-bolder fs-6 mb-0' htmlFor='pass'>Password</label>
            <span
              className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
              data-kt-password-meter-control="visibility"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <i className="fas fa-eye"></i>
              ) : (
                <i className="fas fa-eye-slash"></i>
              )}
            </span>
          </div>
          <div className="d-flex align-items-center mb-3" data-kt-password-meter-control="highlight">
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
          </div>
        </div>
        {/* <div className="text-muted">
          Use 8 or more characters with a mix of letters, numbers, and symbols.
        </div> */}
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>
      <div className='fv-row d-block input-group form-group mb-3'>
        <div className='form-group'>
          <div className='position-relative'>
            <input
              id='cPass'
              type={showPassword1 ? 'text' : 'password'}
              placeholder=''
              autoComplete='off'
              {...formik.getFieldProps('confirmPassword')}
              className={clsx(
                'form-control bg-transparent shadow-none  customInput',
                {
                  'is-invalid1': formik.touched.confirmPassword && formik.errors.confirmPassword,
                },
                {
                  'is-valid1': formik.touched.confirmPassword && !formik.errors.confirmPassword,
                }
              )}
            />
            <label className='form-label fw-bolder fs-6 mb-0' htmlFor='cPass'>Confirm Password</label>
            <div
              style={{
                position: 'absolute',
                right: '10px', // Adjust the position as needed
                top: '50%', // Adjust the position as needed
                transform: 'translateY(-50%)', // Center vertically
                cursor: 'pointer',
              }}
              onClick={() => setShowPassword1(!showPassword1)}
            >
              {showPassword1 ? (
                <i className='fas fa-eye'></i> // You can replace this with your own eye icon
              ) : (
                <i className='fas fa-eye-slash'></i> // You can replace this with your own eye-slash icon
              )}
            </div>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.confirmPassword}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fv-row mb-8 fv-plugins-icon-container fv-plugins-bootstrap5-row-invalid">
        <label className="form-check form-check-inline">
          <input
            type='checkbox'
            className={clsx('form-check-input', 'custom-checkbox', {
              'is-invalid': formik.touched.acceptTerms && formik.errors.acceptTerms,
            })}
            id='acceptTerms'
            {...formik.getFieldProps('acceptTerms')}
          />
          <span className="form-check-label fw-semibold text-gray-700 fs-base ms-1">
            I Accept the <Link to="/terms-and-conditions" target='_blank' className="ms-1 link-primary" >Terms and Conditions</Link>
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.acceptTerms}</span>
            </div>
          </div>
        )}
      </div>
      <div className='d-grid mt-8'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-default primaryBtn'
          disabled={formik.isSubmitting}
        >
          {!loading && <span className='indicator-label'>Sign Up</span>}
          {loading && (
            <span className='indicator-progress d-block'>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <div className='d-flex text-center justify-content-center my-4'>
          <span className='fs-5 dontText'>Already have an account? </span>
          <span className='fs-5 primaryTextBold ms-1 cursor-pointer'>
            <Link to='/auth/login' className='primaryTextBold'>
              Login
            </Link>
          </span>
        </div>
      </div>
      {formik.status && <div className='text-danger text-center'>{formik.status}</div>}
      <div className='d-grid mt-8'>
        <div style={separatorStyles}>
          <div style={lineStyles}></div>
          <div style={headingStyles}>Or continue with</div>
          <div style={lineStyles}></div>
        </div>
        <div className='row g-3 '>
          <div className='d-flex justify-content-center my-10'>
            <div className='mx-2' onClick={registerUsingGoogle}>
              <img
                src={toAbsoluteUrl('/media/vectors/google.png')}
                className='cursor-pointer img-fluid'
                alt=''
              />
            </div>
            <div className='mx-2'>
              <img
                src={toAbsoluteUrl('/media/vectors/facebook.png')}
                className='cursor-pointer img-fluid'
                alt=''
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

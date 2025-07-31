/* eslint-disable jsx-a11y/anchor-is-valid */
import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
// import {Link} from 'react-router-dom'
import {useFormik} from 'formik'
import {login, register} from '../core/_requests'
// import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {useAuth} from '../core/Auth'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import store from '../../../../redux/Store'
import {fetchCartItemCount} from '../../../../redux/Slices/cartSlice'
import OtpInput from 'react-otp-input'
import {auth} from '../../../config/firebaseConfig'
import {signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider} from 'firebase/auth'

const loginSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .test('is-email-or-phone', 'Invalid email format', function (value: string | undefined) {
      if (!value) {
        return false
      }

      // Custom validation logic to check if it's a valid email or phone
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
      // const phoneRegex = /^\d{10}$/

      return emailRegex.test(value) // || phoneRegex.test(value)
    })
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
})

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

const initialValues = {
  emailOrPhone: '',
  password: '',
}

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export function Login() {
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showFormLogin, setshowFormLogin] = useState(true)
  const [showFormLoginOTP, setshowFormLoginOTP] = useState(true)
  const [otp, setOtp] = useState('')

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        const {data: auth} = await login(values.emailOrPhone, values.password)
        saveAuth(auth)
        // const {data: user} = await getUserByToken(auth.AccessToken)
        setCurrentUser(auth.User)
        store.dispatch(fetchCartItemCount())
        localStorage.removeItem("shippingId")
        localStorage.removeItem("selectedDealerId")
        localStorage.removeItem("billingId")
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        setStatus('Please enter valid credentials')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })
  const handleLoginVia = () => {
    // Add logic for handling OTP login
    // For example, make an API call to send OTP and show OTP input fields
    // Also, you can set setshowFormLogin(false) to hide the entire form
    // You may need to update this logic based on your requirements
    setshowFormLogin(false)
  }
  const handleLoginViaOTP = () => {
    // Add logic for handling OTP login
    // For example, make an API call to send OTP and show OTP input fields
    // Also, you can set setshowFormLogin(false) to hide the entire form
    // You may need to update this logic based on your requirements
    setshowFormLoginOTP(false)
  }

  async function handleLoginViaGoogle() {
    const provider = new GoogleAuthProvider()
    try {
      if (auth === null) {
        console.log('Auth not defined')
        return
      }

      const result = await signInWithPopup(auth, provider)
      const registeredUser = result.user
      console.log('User logged in is', result, registeredUser)

      setLoading(true)
      if (registeredUser.email === null || registeredUser.email === '') {
        console.error("Email doesn't exist.")
        return
      }

      // const {data: user} = await getUserByToken(auth.AccessToken)
      //  setCurrentUser(auth.User)
      //  store.dispatch(fetchCartItemCount())

      try {
        const {data: authData} = await register(
          registeredUser.email,
          '',
          registeredUser.displayName || '',
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
    } catch (error: any) {
      console.log('Google Sign-In Error:', error.message)
      throw error
    }
  }

  return (
    <>
      {showFormLogin && (
        <form className='form' onSubmit={formik.handleSubmit} noValidate id='kt_login_signin_form'>
          <div className='mb-8 '>
            <div className=''>
              <div className='marginPageMYMobile mobileDisplayNoneDesktop'>
                <a href='/'>
                  <img
                    src={toAbsoluteUrl('/media/logos/logo.png')}
                    className='logoResMobile img-fluid'
                  />
                </a>
              </div>
              <div className='headerLoginText text-center mb-12'>
                <h2 className='primaryTextBold fs-2tx mb-6'>Login</h2>
                <span className='welcomeText fs-xl-3 '>
                  Just fill up details below and you are good to go !
                </span>
              </div>
            </div>
            <div className='form-group'>
              <input
                id='Email'
                placeholder=''
                {...formik.getFieldProps('emailOrPhone')}
                className={clsx(
                  'form-control bg-transparent shadow-none  customInput',
                  {'is-invalid': formik.touched.emailOrPhone && formik.errors.emailOrPhone},
                  {
                    'is-valid': formik.touched.emailOrPhone && !formik.errors.emailOrPhone,
                  }
                )}
                type='emailOrPhone'
                name='emailOrPhone'
                autoComplete='off'
              />
              <label className='form-label fs-6 fw-bolder ' htmlFor='Email'>
                {/* Phone/Email */}
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
          <div className='fv-row d-block input-group mb-3'>
            <div className='form-group'>
              <div style={{position: 'relative'}}>
                <input
                  id='Password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder=''
                  autoComplete='off'
                  {...formik.getFieldProps('password')}
                  className={clsx(
                    'form-control bg-transparent shadow-none customInput',
                    {
                      'is-invalid1': formik.touched.password && formik.errors.password,
                    },
                    {
                      'is-valid1': formik.touched.password && !formik.errors.password,
                    }
                  )}
                />
                <label className='form-label fw-bolder fs-6 mb-0' htmlFor='Password'>
                  Password
                </label>
                <div
                  style={{
                    position: 'absolute',
                    right: '10px', // Adjust the position as needed
                    top: '50%', // Adjust the position as needed
                    transform: 'translateY(-50%)', // Center vertically
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <i className='fas fa-eye'></i> // You can replace this with your own eye icon
                  ) : (
                    <i className='fas fa-eye-slash'></i> // You can replace this with your own eye-slash icon
                  )}
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>
                    <span role='alert'>{formik.errors.password}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='d-grid mt-8'>
            {/* <button
              type='submit'
              id='kt_sign_in_submit'
              className='btn btn-default primaryBtn my-4'
              onClick={handleLoginVia}
            >
              {!loading && <span className='indicator-label'>Login Via OTP</span>}
              {loading && (
                <span className='indicator-progress d-block'>
                  Please wait...
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button> */}

            <button
              type='submit'
              id='kt_sign_in_submit'
              className='btn btn-default primaryBtn'
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {!loading && <span className='indicator-label'>Login</span>}
              {loading && (
                <span className='indicator-progress d-block'>
                  Please wait...
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
            <div className='d-flex text-center justify-content-center my-4'>
              <span className='fs-5 dontText'>Don't have an account?</span>
              <span className='fs-5 primaryTextBold ms-1 cursor-pointer'>
                <Link to='/auth/registration' className='primaryTextBold'>
                  Sign Up
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
                <div className='mx-2'>
                  <img
                    src={toAbsoluteUrl('/media/vectors/google.png')}
                    className='cursor-pointer img-fluid'
                    onClick={handleLoginViaGoogle}
                  />
                </div>
                <div className='mx-2'>
                  <img
                    src={toAbsoluteUrl('/media/vectors/facebook.png')}
                    className='cursor-pointer img-fluid'
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {showFormLoginOTP && !showFormLogin && (
        <div>
          <form
            className='form'
            onSubmit={formik.handleSubmit}
            noValidate
            id='kt_login_signin_form'
          >
            <div className='marginPageMYMobile mobileDisplayNoneDesktop'>
              <a href='/'>
                <img
                  src={toAbsoluteUrl('/media/logos/logo.png')}
                  className='logoResMobile img-fluid'
                />
              </a>
            </div>
            <div className='headerLoginText text-center mb-12'>
              <h2 className='primaryTextBold fs-2tx mb-6'>Login</h2>
              <span className='welcomeText fs-xl-3 '>
                Just fill up details below and you are good to go !
              </span>
            </div>

            <div className='mb-8 '>
              <div className='form-group'>
                <input
                  id='Email'
                  placeholder=''
                  {...formik.getFieldProps('emailOrPhone')}
                  className={clsx(
                    'form-control bg-transparent shadow-none  customInput',
                    {'is-invalid': formik.touched.emailOrPhone && formik.errors.emailOrPhone},
                    {
                      'is-valid': formik.touched.emailOrPhone && !formik.errors.emailOrPhone,
                    }
                  )}
                  type='emailOrPhone'
                  name='emailOrPhone'
                  autoComplete='off'
                />
                <label className='form-label fs-6 fw-bolder ' htmlFor='Email'>
                  Enter Phone Number
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

            <div className='d-grid mt-8'>
              <button
                type='submit'
                id='kt_sign_in_submit'
                className='btn btn-default primaryBtn my-4'
                onClick={() => setshowFormLogin(true)}
              >
                {!loading && <span className='indicator-label'>Login Via Email</span>}
                {loading && (
                  <span className='indicator-progress d-block'>
                    Please wait...
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                )}
              </button>

              <button
                type='submit'
                id='kt_sign_in_submit'
                className='btn btn-default primaryBtn'
                onClick={handleLoginViaOTP}
              >
                {!loading && <span className='indicator-label'>Get OTP</span>}
                {loading && (
                  <span className='indicator-progress d-block'>
                    Please wait...
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                )}
              </button>
              <div className='d-flex text-center justify-content-center my-4'>
                <span className='fs-5 dontText'>Don't have an account?</span>
                <span className='fs-5 primaryTextBold ms-1 cursor-pointer'>
                  <Link to='/auth/registration' className='primaryTextBold'>
                    Sign Up
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
                  <div className='mx-2'>
                    <img
                      src={toAbsoluteUrl('/media/vectors/google.png')}
                      className='cursor-pointer img-fluid'
                    />
                  </div>
                  <div className='mx-2'>
                    <img
                      src={toAbsoluteUrl('/media/vectors/facebook.png')}
                      className='cursor-pointer img-fluid'
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {!showFormLoginOTP && (
        <form className='form' onSubmit={formik.handleSubmit} noValidate id='kt_login_signin_form'>
          <div className='marginPageMYMobile mobileDisplayNoneDesktop'>
            <a href='/'>
              <img
                src={toAbsoluteUrl('/media/logos/logo.png')}
                className='logoResMobile img-fluid'
              />
            </a>
          </div>
          <div className='headerLoginText text-center mb-12'>
            <h2 className='primaryTextBold fs-2tx mb-6'>OTP Verification</h2>
            <span className='welcomeText fs-xl-5 '>We have sent an OTP to your phone number !</span>
          </div>

          <div className='mb-8 '>
            <div className='form-group d-flex justify-content-center'>
              <OtpInput
                value={otp}
                onChange={setOtp}
                inputType='tel'
                numInputs={4}
                renderSeparator={<span className='mx-4'> </span>}
                renderInput={(props) => <input {...props} />}
                inputStyle={{
                  width: '5rem',
                  borderColor: '#262262',
                  borderRadius: 12,
                  marginBottom: '10px',
                  height: '5rem',
                  backgroundColor: 'transparent',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div className='d-grid mt-8'>
            <button
              type='submit'
              id='kt_sign_in_submit'
              className='btn btn-default primaryBtn my-4'
              onClick={() => setshowFormLogin(true)}
            >
              {!loading && <span className='indicator-label'>Verify</span>}
              {loading && (
                <span className='indicator-progress d-block'>
                  Please wait...
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>

            <span className='fs-5 dontText text-center'>00:120 Sec</span>

            <div className='d-flex text-center justify-content-center my-4'>
              <span className='fs-5 dontText'>Didn't receive OTP ?</span>
              <span className='fs-5 primaryTextBold ms-1 cursor-pointer'>
                <Link to='/auth/registration' className='primaryTextBold'>
                  Resend OTP
                </Link>
              </span>
            </div>
          </div>
          {formik.status && <div className='text-danger text-center'>{formik.status}</div>}
        </form>
      )}
    </>
  )
}

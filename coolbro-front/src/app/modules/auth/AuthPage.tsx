/* eslint-disable jsx-a11y/anchor-is-valid */
import {useEffect} from 'react'
import {Outlet, Route, Routes} from 'react-router-dom'
import {Registration} from './components/Registration'
import {ForgotPassword} from './components/ForgotPassword'
import {Login} from './components/Login'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {AuthStyles} from '../auth/AuthPage.styles'
// import {banner} from '../../../../public/media/vectors/loginSideVector.png'

const AuthLayout = () => {
  useEffect(() => {
    document.body.classList.add('bg-body')
    document.body.classList.add('contentAround')
    document.body.classList.add('contentCenter')

    return () => {
      document.body.classList.remove('bg-body')
    document.body.classList.add('contentAround')
    document.body.classList.add('contentCenter')


    }
  }, [])

  return (
    // <div
    //   className='d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed'
    //   style={{
    //     backgroundImage: `url(${toAbsoluteUrl('/media/illustrations/sketchy-1/14.png')})`,
    //   }}
    // >
    //   {/* begin::Content */}
    //   <div className='d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20'>
    //     {/* begin::Logo */}
    //     <a href='#' className='mb-12'>
    //       <img alt='Logo' src={toAbsoluteUrl('/media/logos/logo.png')} className='h-45px' />
    //     </a>
    //     {/* end::Logo */}
    //     {/* begin::Wrapper */}
    //     <div className='w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto'>
    //       <Outlet />
    //     </div>
    //     {/* end::Wrapper */}
    //   </div>
    //   {/* end::Content */}
    //   {/* begin::Footer */}
    //   <div className='d-flex flex-center flex-column-auto p-10'>
    //     <div className='d-flex align-items-center fw-bold fs-6'>
    //       <a href='#' className='text-muted text-hover-primary px-2'>
    //         About
    //       </a>

    //       <a href='#' className='text-muted text-hover-primary px-2'>
    //         Contact
    //       </a>

    //       <a href='#' className='text-muted text-hover-primary px-2'>
    //         Contact Us
    //       </a>
    //     </div>
    //   </div>
    //   {/* end::Footer */}
    // </div>

    <>
      <AuthStyles>
        <section className='loginPageSection'>
          <div className='login-4'>
            <div className='container-fluid'>
              <div className='row h-100 mh-75 form-sections'>
                <div className='mobileDisplayNone col-lg-7 bg-img clip-home'>
                  <div className='m-login__logo'>
                    <a href='/'>
                      <img
                        src={toAbsoluteUrl('/media/vectors/vectorLoginLogo.png')}
                        className='main-logo img-fluid'
                      />
                    </a>
                  </div>
                </div>
                <div className='col-lg-5 form-section'>
                  <div className='col-lg-12 d-flex justify-content-center'>
                    <div className='col-lg-6 '>
                      <Outlet />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AuthStyles>
    </>
  )
}

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path='login' element={<Login />} />
      <Route path='registration' element={<Registration />} />
      <Route path='forgot-password' element={<ForgotPassword />} />
      <Route index element={<Login />} />
    </Route>
  </Routes>
)

export {AuthPage}

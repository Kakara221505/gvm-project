/* eslint-disable react/jsx-no-target-blank */
import { useEffect } from 'react'
import { ILayout, useLayout } from '../../core'
import { FooterStyles } from './FooterStyles'
import { Link, useNavigate } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../helpers'

const Footer = () => {
  const { config } = useLayout()
  const navigate = useNavigate()

  const navigateToAboutUs = () => {
    navigate('/about-us')
  }
  const navigateToFAQs = () => {
    navigate('/faq')
  }

  const navigateToContactUs = () => {
    navigate('/contact-us')
  }

  const navigateToTermsAndConditions = () => {
    navigate('/terms-and-conditions')
  }

  const navigateToPrivacyAndPolicy = () => {
    navigate('/privacy-and-policy')
  }

  useEffect(() => {
    updateDOM(config)
  }, [config])
  return (
    <>
      <FooterStyles>
        {/* <footer>
          <div className=''>
            <section className='justify-content-between ft-main my-6'>
              <div className='ft-main-item d-flex flex-column justify-content-center'>
              <span className='position-relative navbar-brand me-0'>
                  <Link to='/' className=''>
                    <img
                      alt='Logo'
                      src={toAbsoluteUrl('/media/logos/logo.png')}
                      className='w-300px d-flex justify-content-center m-auto'
                    />
                  </Link>
                </span>
                <ul className='mainDiscUL ps-0'>
              
                  <li>
                    <div className=''>
                    <a className='d-flex justify-content-around align-items-center mt-15' href='#'>
                      <i className='fab fa-facebook fs-1 text-white' />
                      <i className='fab fa-twitter fs-1 text-white' />
                      <i className='fab fa-linkedin fs-1 text-white' />
                      <i className='fab fa-instagram fs-1 text-white' />
                    </a>
                    </div>
                  </li>
                </ul>
              </div>
              <div className='ft-main-item'>
                <h2 className='ft-title'>USEFUL LINKS</h2>
                <ul className='mainDiscUL ps-0'>
                  <li className='cursor-pointer text-white' onClick={navigateToAboutUs}>
                    <span>About Us</span>
                  </li>
                  <li className='cursor-pointer text-white' onClick={navigateToContactUs}>
                    <span>Contact Us</span>
                  </li>
                  <li className='cursor-pointer text-white' onClick={navigateToPrivacyAndPolicy}>
                    <span>Privacy & Policy</span>
                  </li>
                  <li className='cursor-pointer text-white' onClick={navigateToFAQs}>
                    <span>FAQs</span>
                  </li>
                  <li className='cursor-pointer text-white' onClick={navigateToTermsAndConditions}>
                    <span>Terms & Condition</span>
                  </li>
                </ul>
              </div>
              <div className='ft-main-item'>
                <h2 className='ft-title'>Address</h2>
                <ul className='mainDiscUL ps-0'>
                  <li className='mb-0'>
                    <span className='my-0'>1st floor, Nilkanth Chambers, near Sai</span>
                    <span className='my-0'> Baba Temple, Katargam Darwaja,</span>
                    <span className='my-0'> Surat, Gujarat 395004.</span>
                  </li>
                  <li className='d-inline-flex align-items-center mt-4'>
                    <span className='my-0'>Phone :</span> <span className='my-0 ps-2'>+91 00000 00000</span>
                  </li> <br/>
                  <li className='d-inline-flex align-items-center mt-2'>
                    <span className='my-0'>Email :</span> <span className='my-0 ps-2'>coolbro@gmail.com</span>
                  </li>
                </ul>
              </div>
            </section>
            <section className='ft-social mainDarkChildFooter'>
              <ul className='mainDiscUL ft-social-list mb-0'>
                <li>
                  <a href='/'>© Copyright 2023 CoolBro. All rights reserved</a>
                </li>
              </ul>
            </section>
          </div>
        </footer> */}
        <footer className="footer-section">
          <div className="container-fluid commonMobilePX">
            <div className="footer-cta pt-8 pb-8">
              <div className="row">
                <div className="col-xl-4 col-md-4 mb-30">
                  <div className="single-cta d-flex">
                    <i className="fas fa-map-marker-alt"></i>
                    <div className="cta-text">
                      <h4>Find us</h4>
                      <span>1st floor, Nilkanth Chamber, near Sai Baba Temple, Katargam Darwaja, Surat, Gujarat 395004.</span>
                    </div>
                  </div>
                </div>
                <div className="contactFindMail col-xl-4 px-16 col-md-4 mb-30">
                  <div className="single-cta">
                    <i className="fas fa-phone"></i>
                    <div className="cta-text">
                      <h4>Call us</h4>
                      <span>0261 253 2253</span>
                    </div>
                  </div>
                </div>
                <div className="contactFindMail col-xl-4 px-16 col-md-4 mb-30">
                  <div className="single-cta">
                    <i className="far fa-envelope-open"></i>
                    <div className="cta-text">
                      <h4>Mail us</h4>
                      <span>info@coolbro.in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-content pt-8 pb-8">
              <div className="row">
                <div className="col-xl-4 col-lg-4 mb-50">
                  <div className="footer-widget">
                    <div className="footer-logo">
                      <a ><img src={toAbsoluteUrl('/media/logos/logo.png')} className="img-fluid" alt="logo" /></a>
                    </div>
                    <div className="footer-text">
                      <p>Lorem ipsum dolor sit amet, consec tetur adipisicing elit, sed do eiusmod tempor incididuntut consec tetur adipisicing
                        elit,Lorem ipsum dolor sit amet.</p>
                    </div>
                    <div className="d-flex flex-column footer-social-icon">
                      <span>Follow us</span>
                      <div className='d-flex'>
                        <i className='me-2 d-flex justify-content-center align-items-center fab fa-facebook fs-1 text-white' />
                        <i className='me-2 d-flex justify-content-center align-items-center fab fa-twitter fs-1 text-white' />
                        <i className='me-2 d-flex justify-content-center align-items-center fab fa-linkedin fs-1 text-white' />
                        <i className='me-2 d-flex justify-content-center align-items-center fab fa-instagram fs-1 text-white' />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="usefulLink col-xl-4 px-16 col-lg-4 col-md-6 mb-30">
                  <div className="footer-widget">
                    <div className="footer-widget-heading">
                      <h3>Useful Links</h3>
                    </div>
                    <ul className='ps-0'>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToAboutUs(); }}>About Us</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToContactUs(); }}>Contact Us</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToPrivacyAndPolicy(); }}>Privacy & Policy</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToFAQs(); }}>FAQs</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToTermsAndConditions(); }}>Terms & Condition</a></li>
                    </ul>
                  </div>
                </div>
                <div className="contactFindMail subScribe px-16 col-xl-4 col-lg-4 col-md-6 mb-50">
                  <div className="footer-widget">
                    <div className="footer-widget-heading">
                      <h3>Subscribe</h3>
                    </div>
                    <div className="footer-text mb-25">
                      <p>Don’t miss to subscribe to our new feeds, kindly fill the form below.</p>
                    </div>
                    <div className="subscribe-form">
                      <form action="#">
                        <input type="text" placeholder="Email Address" />
                        <button><i className="fab fa-telegram-plane"></i></button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="copyright-area">
            <div className="container-fluid commonMobilePX">
              <div className="row">
                <div className="col-xl-6 col-lg-6 text-center text-lg-left">
                  <div className="copyright-text">
                    <p className='text-start'>Copyright &copy; 2023, All Right Reserved <span>Coolbro</span></p>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 d-none d-lg-block text-right">
                  <div className="footer-menu">
                    <ul className='d-flex ms-auto justify-content-end'>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToAboutUs(); }}>About Us</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToContactUs(); }}>Contact Us</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToPrivacyAndPolicy(); }}>Privacy & Policy</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToFAQs(); }}>FAQs</a></li>
                      <li><a href="#!" className='cursor-pointer' onClick={(e) => { e.preventDefault(); navigateToTermsAndConditions(); }}>Terms & Condition</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </FooterStyles>
    </>
  )
}

const updateDOM = (config: ILayout) => {
  if (config.app?.footer?.fixed?.desktop) {
    document.body.classList.add('data-kt-app-footer-fixed', 'true')
  }

  if (config.app?.footer?.fixed?.mobile) {
    document.body.classList.add('data-kt-app-footer-fixed-mobile', 'true')
  }
}

export { Footer }

/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import {Link} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {ContactUsBannerStyles} from './TermsAndConditionPageBannerStyles'

const ContactUsPageBanner: FC = () => {
  return (
    <ContactUsBannerStyles>
      <div className='bgBanner'>
        <div className='position-relative'>
          <img
            className='img-fluid w-100'
            src={toAbsoluteUrl('/media/vectors/TermsAndConditionVector.png')}
            alt='Card cap'
          />
          <h1 className='centered-text contactUsBefore text-white'>
            <span className='white-line'></span> TERMS & CONDITIONS
          </h1>
        </div>
      </div>
    </ContactUsBannerStyles>
  )
}

export default ContactUsPageBanner

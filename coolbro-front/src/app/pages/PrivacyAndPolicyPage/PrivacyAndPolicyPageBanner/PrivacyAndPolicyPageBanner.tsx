/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import {Link} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {PrivacyAndPolicyPageBannerStyles} from './PrivacyAndPolicyPageBannerStyles'

const PrivacyAndPolicyPageBanner: FC = () => {
  return (
    <PrivacyAndPolicyPageBannerStyles>
      <div className='bgBanner'>
        <div className='position-relative'>
          <img
            className='img-fluid w-100'
            src={toAbsoluteUrl('/media/vectors/PrivacyVector.png')}
            alt='Card cap'
          />
          <h1 className='centered-text contactUsBefore text-white'>
            <span className='white-line'></span> PRIVACY POLICY
          </h1>
        </div>
      </div>
    </PrivacyAndPolicyPageBannerStyles>
  )
}

export default PrivacyAndPolicyPageBanner

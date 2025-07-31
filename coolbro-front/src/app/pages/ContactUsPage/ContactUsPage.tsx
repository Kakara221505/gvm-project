import { FC } from 'react';
import { ContactUsPageStyles } from './ContactUsPageStyles';
import { toAbsoluteUrl } from '../../../_metronic/helpers';
import ContactUsPageBanner  from './ContactUsPageBanner/ContactUsPageBanner';
import ContactUsPageCard  from './ContactUsPageCard/ContactUsPageCard';

const ContactUsPage: FC = () => {
  return (
    <ContactUsPageStyles>
      <div className='mobilePaddingNew container-fluid px-20'>
        <div className=''>
          <div className=''>
            <div className='row'>
              <div className='col-lg-12 mobileDisplayNone'>
                <ContactUsPageBanner/>
              </div>
              <div className='col-lg-12'>
                <ContactUsPageCard/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContactUsPageStyles>
  );
};

export default  ContactUsPage ;

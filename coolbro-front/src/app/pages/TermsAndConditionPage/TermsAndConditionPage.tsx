import { FC } from 'react';
import { TermsAndConditionPageStyles } from './TermsAndConditionPageStyles';
import ContactUsPageBanner  from './TermsAndConditionPageBanner/TermsAndConditionPageBanner';
import TermsAndConditionPageCard  from './TermsAndConditionPageCard/TermsAndConditionPageCard';

const TermsAndConditionPage: FC = () => {
  return (
    <TermsAndConditionPageStyles>
      <div className='mobilePaddingNew container-fluid px-20'>
        <div className=''>
          <div className=''>
            <div className='row'>
              <div className='col-lg-12 mobileDisplayNone'>
                <ContactUsPageBanner/>
              </div>
              <div className='col-lg-12'>
                <TermsAndConditionPageCard/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TermsAndConditionPageStyles>
  );
};

export default  TermsAndConditionPage ;

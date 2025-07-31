import { FC } from 'react';
import { PrivacyAndPolicyPageStyles } from './PrivacyAndPolicyPageStyles';
import PrivacyAndPolicyPageBanner from './PrivacyAndPolicyPageBanner/PrivacyAndPolicyPageBanner';
import PrivacyAndPolicyPageCard from './PrivacyAndPolicyPageCard/PrivacyAndPolicyPageCard';

const PrivacyAndPolicyPage: FC = () => {
  return (
    <PrivacyAndPolicyPageStyles>
      <div className='mobilePaddingNew container-fluid px-20'>
        <div className=''>
          <div className=''>
            <div className='row'>
              <div className='col-lg-12 mobileDisplayNone'>
                <PrivacyAndPolicyPageBanner />
              </div>
              <div className='col-lg-12'>
                <PrivacyAndPolicyPageCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivacyAndPolicyPageStyles>
  );
};

export default PrivacyAndPolicyPage;

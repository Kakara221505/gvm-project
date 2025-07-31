import { useState, useEffect } from 'react'
import { FC } from 'react'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import { MyProfileStyles } from './MyProfileStyles'
import ProfileDetailsSection from './MyProfileInnerPages/ProfileDetailsSection/ProfileDetailsSection'
import ManageAddressSection from './MyProfileInnerPages/ManageAddressSection/ManageAddressSection'
import MyOrdersSection from './MyProfileInnerPages/MyOrdersSection/MyOrdersSection'

const MyProfile: FC = () => {
  // const [activeTab, setActiveTab] = useState('first')
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('myProfileActiveTab') || 'first';
  });

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    localStorage.setItem('myProfileActiveTab', tabKey);
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem('myProfileActiveTab');
    };
  }, []);
  return (
    <MyProfileStyles>
      <div className='mobilePaddingNew container-fluid px-20'>
        <div className='mobilePaddingNone '>
          <div className=''>
            <div className=''>
              <Tab.Container id='left-tabs-example' defaultActiveKey={activeTab}>
                <Row className='profileFlexColumn navbarMarginForSearch'>
                  <Col className='col-lg-3 col-md-4 my-8 marginPageMYMobile'>
                    <Nav variant='pills' className='me-0 flex-column boxNavPills'>
                      <Nav.Item className='me-0 border-bottom border-1  border-0'>
                        <Nav.Link
                          className={`py-4 ${activeTab === 'first' ? 'custom-active-tab0' : 'custom-tab'
                            }`}
                          eventKey='first'
                          onClick={() => handleTabChange('first')}
                        >
                          <img
                            src={toAbsoluteUrl('/media/vectors/Profile.png')}
                            className='pe-3 img-fluid'
                            alt='Profile'
                          />{' '}
                          My Profile
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className='me-0 border-bottom border-1  border-0'>
                        <Nav.Link
                          className={`py-4 ${activeTab === 'second' ? 'noRadius' : 'custom-tab'}`}
                          eventKey='second'
                          onClick={() => handleTabChange('second')}
                        >
                          <img
                            src={toAbsoluteUrl('/media/vectors/Orders.png')}
                            className=' pe-3 img-fluid'
                            alt='Orders'
                          />{' '}
                          My Orders
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className='me-0 border-bottom border-1  border-0'>
                        <Nav.Link
                          className={`py-4 ${activeTab === 'third' ? 'noRadius' : 'custom-tab'}`}
                          eventKey='third'
                          onClick={() => handleTabChange('third')}
                        >
                          <img
                            src={toAbsoluteUrl('/media/vectors/Location.png')}
                            className='pe-3 img-fluid'
                            alt='Manage Address'
                          />{' '}
                          Manage Address
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className='me-0 border-bottom border-1  border-0'>
                        <Nav.Link
                          className={`py-4 ${activeTab === 'fourth' ? 'noRadius' : 'custom-tab'}`}
                          eventKey='fourth'
                          onClick={() => handleTabChange('fourth')}
                        >
                          <img
                            src={toAbsoluteUrl('/media/vectors/Notification.png')}
                            className='pe-3 img-fluid'
                            alt='Notification'
                          />{' '}
                          Notification
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className='me-0 '>
                        <Nav.Link
                          className={`py-4 ${activeTab === 'fifth' ? 'custom-active-tab1' : 'custom-tab'
                            }`}
                          eventKey='fifth'
                          onClick={() => handleTabChange('fifth')}
                        >
                          <img
                            src={toAbsoluteUrl('/media/vectors/Logout.png')}
                            className='pe-3 img-fluid'
                            alt='Logout'
                          />{' '}
                          Logout
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col className='col-lg-9 col-md-8 my-8 marginPageMYMobile'>
                    <Tab.Content>
                      <Tab.Pane eventKey='first'>
                        <ProfileDetailsSection />
                      </Tab.Pane>
                      <Tab.Pane eventKey='second'>
                        <MyOrdersSection />
                      </Tab.Pane>
                      <Tab.Pane eventKey='third'>
                        <ManageAddressSection />
                      </Tab.Pane>
                      <Tab.Pane eventKey='fourth'>Second tab content</Tab.Pane>
                      <Tab.Pane eventKey='fifth'>Second tab content</Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </div>
          </div>
        </div>
      </div>
    </MyProfileStyles>
  )
}

export default MyProfile

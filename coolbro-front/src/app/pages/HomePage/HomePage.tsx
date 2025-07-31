/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import axios from 'axios'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import HomeBanner from './HomeBanner/HomeBanner'
import HomeExclusiveProduct from './HomeExclusiveProduct/HomeExclusiveProduct'
import HomeDealsPage from './HomeDealsPage/HomeDealsPage'
import HomeSizeUpRoomPage from './HomeSizeUpRoomPage/HomeSizeUpRoomPage'
import HomeRecentViewPage from './HomeRecentViewPage/HomeRecentViewPage'
import HomeBrandPage from './HomeBrandPage/HomeBrandPage'
import HomeNewArrivalPage from './HomeNewArrivalPage/HomeNewArrivalPage'
import HomeDealerPage from './HomeDealerPage/HomeDealerPage'
import HomeClimateSolutionPage from './HomeClimateSolutionPage/HomeClimateSolutionPage'
import { useAuth } from '../../modules/auth'

interface Section {
  ID: number;
  Section_name: string;
  Display_name: string;
  Status: boolean;
  Order: number;
  Is_app: boolean;
  Is_web: boolean;
  Created_at: string;
  Updated_at: string;
}

const mystyle = { fontSize: 35 };
const mystyle1 = { fontSize: 30 };
const posStyle = { right: 0 };

const HomePage: FC = () => {
  const [show, setShow] = useState(false);
  const { currentUser } = useAuth()
  const [sections, setSections] = useState<Section[]>([]);

  const [modelOpenedAfterLogin, setModelOpenedAfterLogin] = useState<boolean>(() => {
    // Retrieve the value from local storage
    const storedValue = localStorage.getItem('modelOpenedAfterLogin');
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const handleClose = () => setShow(false)

  const handleModalLogic = () => {
    if (!modelOpenedAfterLogin && currentUser) {
      openModel();

      // Update User State and store in local storage
      setModelOpenedAfterLogin(true);
      localStorage.setItem('modelOpenedAfterLogin', JSON.stringify(true));
    }
  };

  useEffect(() => {
    //fixed sidebar and header issue after logout
    document.body.setAttribute('data-kt-app-sidebar-fixed', 'false')
    document.body.setAttribute('data-kt-app-header-fixed', 'false')

    handleModalLogic();
  }, [modelOpenedAfterLogin, currentUser])

  const openModel = () => {
    setShow(true);
  };

  useEffect(() => {
    fetchHomePageSection();
  }, []);

  const fetchHomePageSection = () => {
    // Fetch data from your API using Axios
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/homepagesection/homepagesection_all`)
      .then((response) => {
        const data = response.data.data;
        console.log(data);
        setSections(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };


  return (
    <>
      <section className='mobilePaddingNew container-fluid px-20'>
        <div className=''>
          <HomeBanner />
          {sections
            .filter((section) => section.Is_web && section.Status)
            .sort((a, b) => a.Order - b.Order)
            .map((section) => {
              switch (section.Section_name) {
                case 'SIZE UP YOUR ROOM':
                  return <HomeSizeUpRoomPage key={section.ID} />;
                case 'PICK YOUR AIR CONDITIONER BRAND':
                  return <HomeBrandPage key={section.ID} />;
                case 'EXCLUSIVE PRODUCT':
                  return <HomeExclusiveProduct key={section.ID} />;
                case 'DEALS OF THE DAY':
                  return <HomeDealsPage key={section.ID} />;
                case 'RECENTLY VIEWED':
                  return <HomeRecentViewPage key={section.ID} />;
                case 'NEW ARRIVAL':
                  return <HomeNewArrivalPage key={section.ID} />;
                case 'PICK YOUR TOP DEALERS':
                  return <HomeDealerPage key={section.ID} />;
                case 'DISCOVER CLIMATE SOLUTIONS FOR YOUR BUSINESS':
                  return <HomeClimateSolutionPage key={section.ID} />;
                default:
                  return null;
              }
            })}

          <Modal show={show} onHide={handleClose} centered size='lg'>
            <div className='position-relative'>
              <div style={posStyle} className='position-absolute  '>
                <i className='fa fa-close m-3 cursor-pointer fs-1 text-black' onClick={handleClose}></i>
              </div>
              <div className='row align-items-center'>
                <div className='col-lg-6'>
                  <img
                    className='img-fluid'
                    src={toAbsoluteUrl('/media/vectors/modalSideVector.png')}
                    alt=''
                  />
                </div>
                <div className='col-lg-6'>
                  <div className='row'>
                    <div className='d-flex flex-column align-items-center'>
                      <div style={mystyle} className='primaryTextBold qq'>नमस्ते {currentUser?.Name} 😊</div> <br />
                      <div style={mystyle1} className='primaryTextBold qq'>How Can I Help You?</div>
                    </div>
                    <div className='d-flex mt-10 '>
                      <button className='btn btn-default px-4 primaryBtn fs-6 mx-2'>For Need AC Service</button>
                      <button className='btn btn-default primaryBtn fs-6 mx-2'>Find Your Requirements</button>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </Modal>

        </div>
      </section>
    </>
  )
}

export default HomePage

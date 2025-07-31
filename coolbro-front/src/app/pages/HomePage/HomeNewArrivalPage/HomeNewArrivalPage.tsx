import { FC, useState, useEffect } from 'react'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import Carousel from 'react-bootstrap/Carousel'
import {HomeNewArrivalPageStyles} from '../HomeNewArrivalPage/HomeNewArrivalPageStyles'
import {useNavigate} from 'react-router-dom'
import Slider from 'react-slick'
import axios from 'axios'
import HorizontalProductCard from '../../CommonComponents/HorizontalProductCard/HorizontalProductCard'

const HomeNewArrivalPage: FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivalProduct();
  }, []);

  const fetchNewArrivalProduct = async () => {
    setLoading(true);
        axios
          .get(`${process.env.REACT_APP_SERVER_URL}/product/get_new_arrival_product`)
          .then((res: any) => {
              setLoading(false);
              setProducts(res.data.data);
              // console.log(products,"hii");
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
   
  };
  const navigateToProdList = () => {
    navigate('/product-list')
  }

  return (
    <>
      <HomeNewArrivalPageStyles>
        <section className='marginPageMYMobile mt-xxl-8 mt-xl-8 mt-lg-8 mt-md-8'>
          <div className='innerTextMain'>
            <div className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>
            New Arrival
            </div>
            <div
              onClick={navigateToProdList}
              className='mobileDisplayNone fs-md-2 fs-lg-2 viewText'
            >
              View all
            </div>
          </div>
        </section>
        <div className='innerExcGrid mb-10'>
          <div className='row' id='r1'>
            <HorizontalProductCard products={products}/>
          </div>
        </div>
      </HomeNewArrivalPageStyles>
    </>
  )
}

export default HomeNewArrivalPage

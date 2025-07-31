
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { ProductOverviewPageStyles } from './ProductOverviewPageStyles'
import { useNavigate } from 'react-router-dom'
import SimilarProductsPage from '../../SimilarProductsPage/SimilarProductsPage'
import PeopleAlsoBoughtPage from '../../PeopleAlsoBoughtPage/PeopleAlsoBoughtPage'
import React, { FC, useEffect, useState } from 'react';
import axios from 'axios'
import { useAuth } from '../../../modules/auth/core/Auth'
import HtmlReactParser from 'html-react-parser';


interface ProductOverviewPageProps {
  productsData: any; // Define the prop for productsData
}
const sortingOptions = [
  { label: 'Most Recent', value: 'MostRecent' },
  { label: 'Positive First', value: 'PositiveFirst' },
  { label: 'Negative First', value: 'NegativeFirst' }
];
const ProductOverviewPage: FC<ProductOverviewPageProps> = ({ productsData }: ProductOverviewPageProps) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<any[]>([]);
  const [reviewAllData, setReviewAllData] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDiv, onToggle] = useState(true)
  const [selectedSort, setSelectedSort] = useState<{ label: string; value: string }>({ label: 'SORT BY', value: '' });
  useEffect(() => {
    // Define a function to fetch review data
    if (productsData.ID) {
      fetchReviewData();
    }
  }, [productsData.ID, selectedSort]);
  const fetchReviewData = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/rating/get_rating`, {
        Rated_item_type: 'product',
        Rated_item_id: productsData.ID,
        Sort_by: selectedSort.value
      });
      if (response.data.status === 'success') {
        setLoading(false);
        setReviewAllData(response.data.data);
        setReviewData(response.data.data.ReviewDetails);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  const navigateToProdList = () => {
    navigate('/product-list')
  }

  const onToggleDiv = () => {
    onToggle(isOpenDiv)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  function formatDate(inputDate: any) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
  const handleSortChange = (sortOption: string) => {
    const selectedOption = sortingOptions.find((option) => option.value === sortOption);
    if (selectedOption) {
      setSelectedSort(selectedOption);
      setIsOpen(false);
    }
  };

  const renderRatingStars = (rating: any) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <div className={`rating-label ${i <= rating ? 'checked' : ''}`} key={i}>
          <i className={`ki-duotone ki-star ${i <= rating ? 'checked' : ''}`}></i>
        </div>
      );
    }
    return stars;
  };
  const handleWriteReviewClick = () => {
    if (currentUser) {
      navigate(`/reviews/product/${productsData.ID}`)
    } else {
      navigate('/');
    }
  };
  return (
    <>
      <ProductOverviewPageStyles>
        <section className='mt-10'>
          <div className='accordion' id='accordionExample1'>
            <div className='accordion-item'>
              <h2 className='accordion-header' id='headingOne'>
                <button
                  className='accBtn1 accordion-button  '
                  type='button'
                  data-bs-toggle='collapse'
                  data-bs-target='#collapseOne'
                  aria-expanded='false'
                  aria-controls='collapseOne'
                >
                  Specification
                </button>
              </h2>
              <div
                id='collapseOne'
                className='accordion-collapse collapse show'
                aria-labelledby='headingOne'
                data-bs-parent='#accordionExample1'
              >
                <div className='accordion-body bodyAcc'>
                  <div className='row'>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Air Conditioner Type</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.CategoryName}</h5>
                          </div>
                          {/* <div className='my-6'>
                            <h4 className='text-black fw-normal my-3'>
                              Approximate Coverage Area(Sq.M)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>13.93 Sq.m</h5>
                          </div> */}
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Air Conditioner Capacity
                            </h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Cooling_capacity} Ton</h5>
                          </div>
                          {/* <div className='my-6'>
                            <h4 className='text-black fw-normal my-3'>Installation Type</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Installation_type}</h5>
                          </div> */}
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          {/* <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Approximate Coverage Area(Sq.Ft)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>150 Sq. Ft.</h5>
                          </div> */}
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Installation Type</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Installation_type}</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h4 className='text-black fw-bolder my-5 mb-3'>MANUFACTURER DETAILS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Brand</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.BrandName}</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Model Series</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Model_series}</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Model Number</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Model_number}</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>PRODUCT DIMENSIONS (OPEN)</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Dimensions (WxDxH)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Dimensions_indoor_width}*{productsData.Dimensions_indoor_height}*{productsData.Dimensions_indoor_depth}</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          {/* <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>IC518Y0NU</h5>
                          </div> */}
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 '>Model Number</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Model_number}</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <h4 className='text-black fw-bolder my-5 mb-3'>AIR CONDITIONER FEATURES</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Air Conditioner Modes
                            </h4>
                            <h5>Super Turbo Mode</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Inverter Technology</h4>
                            <h5>Yes</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Convertible Mode</h4>
                            <h5 className='text-black fw-medium my-3'>No</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Cooling Capacity</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Cooling_capacity} Ton</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Air Flow Volume</h4>
                            <h5 className='text-black fw-medium my-3'>580 CFM</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Cooling Capacity</h4>
                            <h5 className='text-black fw-medium my-3'>
                              Self Diagnosis | Comfort Sleep | Smart Ready | Anti-Corrosive Blue
                              Fins for Protection | Acoustic Insulation Compressor Jacket
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div> */}

                    <h4 className='text-black fw-bolder my-5 mb-3'>AIR CONDITIONER FUNCTIONS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Compressor Type</h4>
                            <h5>{productsData.Cooling_technology}</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Noise Level (Outdoor Unit)
                            </h4>
                            <h5>{productsData.Noise_level_outdoor} dB</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Refrigerant Type</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Refrigerant}</h5>
                          </div>
                          {/* <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Air Conditioner Filters</h4>
                            <h5 className='text-black fw-medium my-3'>Anti Dust Filter</h5>
                          </div> */}
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Noise Level (Indoor Unit)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Noise_level_indoor}db</h5>
                          </div>

                          {/* <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Additional Air Conditioner Functions
                            </h4>
                            <h5 className='text-black fw-medium my-3'>
                              Annual Consumption: 770.98 Units/Year
                            </h5>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* <h4 className='text-black fw-bolder my-5 mb-3'>
                      AIR CONDITIONER PHYSICAL ATTRIBUTES
                    </h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Connecting Pipe Type</h4>
                            <h5>{productsData.Condenser_coil} Connecting Pipe</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Leakage Detector</h4>
                            <h5>Yes</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Connecting Pipe Length</h4>
                            <h5 className='text-black fw-medium my-3'>3 Meters</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Louvers Swing Type</h4>
                            <h5 className='text-black fw-medium my-3'>Up/Down | Left/Right</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Condenser Coil Type</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Condenser_coil}</h5>
                          </div>
                        </div>
                      </div>
                    </div> */}

                    <h4 className='text-black fw-bolder my-5 mb-3'>NETWORK CONNECTIVITY</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>WiFi Supported</h4>
                            <h5>{productsData.Is_wifi_enabled === 1 ? 'Yes' : 'No'}</h5>
                          </div>
                        </div>
                      </div>
                      {/* <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>WiFi Features</h4>
                            <h5 className='text-black fw-medium my-3'>Smart Ready</h5>
                          </div>
                        </div>
                      </div> */}
                      <div className='col-lg-4'></div>
                    </div>

                    {/* <h4 className='text-black fw-bolder my-5 mb-3'>REMOTE CONTROL DETAILS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Remote Additional Features
                            </h4>
                            <h5>Glow Buttons</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'></div>
                      <div className='col-lg-4'></div>
                    </div> */}

                    <h4 className='text-black fw-bolder my-5 mb-3'>ENERGY STANDARDS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Energy Efficiency (Star Rating)
                            </h4>
                            <h5>{productsData.EnergyEfficiencyRatingName}</h5>
                          </div>
                        </div>
                      </div>
                      {/* <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>
                              Indian Seasonal Energy Efficiency Ratio (ISEER)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>5.02</h5>
                          </div>
                        </div>
                      </div> */}
                      <div className='col-lg-4'></div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>AIR CONDITIONER PLUG DETAILS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Power</h4>
                            <h5>{productsData.Wattage} Watts</h5>
                          </div>
                          {/* <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Phase</h4>
                            <h5>Single Phase</h5>
                          </div> */}
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Voltage Rating</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Voltage}V</h5>
                          </div>
                          {/* <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>
                              Maximum Operating Temperature
                            </h4>
                            <h5 className='text-black fw-medium my-3'>52 Degree Celsius</h5>
                          </div> */}
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Frequency</h4>
                            <h5 className='text-black fw-medium my-3'>{productsData.Frequency}Hz</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <h4 className='text-black fw-bolder my-5 mb-3'>AESTHETICS</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Color</h4>
                          <h5>White</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>Color Family</h4>
                          <h5 className='text-black fw-medium my-3'>White</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'></div>
                  </div> */}

                  <h4 className='text-black fw-bolder my-5 mb-3'>IN THE BOX</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Generic Name</h4>
                          <h5>{productsData.Name}</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'></div>
                    <div className='col-lg-4'></div>
                  </div>

                  {/* <h4 className='text-black fw-bolder my-5 mb-3'>IN THE BOX</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Accessories Quantity</h4>
                          <h5>0</h5>
                        </div>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>In The Box</h4>
                          <h5>0</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>Main product</h4>
                          <h5 className='text-black fw-medium my-3'>1 x Air Conditioner U</h5>
                        </div>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>Accessories Details</h4>
                          <h5 className='text-black fw-medium my-3'>Not Applicable</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Accessories</h4>
                          <h5 className='text-black fw-medium my-3'>NA</h5>
                        </div>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Generic Name</h4>
                          <h5 className='text-black fw-medium my-3'>{productsData.Name}</h5>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <h4 className='text-black fw-bolder my-5 mb-3'>PRODUCT DIMENSIONS (OPEN)</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Dimensions (WxDxH)
                          </h4>
                          <h5>{productsData.Dimensions_indoor_width}*{productsData.Dimensions_indoor_height}*{productsData.Dimensions_indoor_depth}</h5>
                        </div>
                      </div>
                    </div>
                    {/* <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>Dimensions In CM (WxDxH)</h4>
                          <h5 className='text-black fw-medium my-3'>95.9 x 21.4 x 31.9</h5>
                        </div>
                      </div>
                    </div> */}
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                          <h5 className='text-black fw-medium my-3'>{productsData.Outdoor_unit_weight}</h5>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className='text-black fw-bolder my-5 mb-3'>
                    PRODUCT DIMENSIONS OUTDOOR UNIT
                  </h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Dimensions (WxDxH)
                          </h4>
                          <h5>{productsData.Dimensions_outdoor_width}*{productsData.Dimensions_outdoor_height}*{productsData.Dimensions_outdoor_depth}</h5>
                        </div>
                      </div>
                    </div>
                    {/* <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>
                            Dimensions In Inches (WxDxH)
                          </h4>
                          <h5 className='text-black fw-medium my-3'>34.97 x 14.44 x 22.87</h5>
                        </div>
                      </div>
                    </div> */}
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                          <h5 className='text-black fw-medium my-3'>{productsData.Outdoor_unit_weight} Kg</h5>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <h4 className='text-black fw-bolder my-5 mb-3'>PACKAGED DIMENSIONS</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Dimensions In Inches (WxDxH)
                          </h4>
                          <h5>38.98 x 15.55 x 11.81</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                          <h5 className='text-black fw-medium my-3'>27.8 Kg</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>
                            Dimensions In Inches (WxDxH)
                          </h4>
                          <h5 className='text-black fw-medium my-3'>34.97 x 14.44 x 22.87</h5>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* <h4 className='text-black fw-bolder my-5 mb-3'>
                    PRODUCT PACKAGED DIMENSIONS OUTDOOR UNIT
                  </h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Dimensions In Inches (WxDxH)
                          </h4>
                          <h5>38.98 x 15.55 x 11.81</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3'>
                            Dimensions In Inches (WxDxH)
                          </h4>
                          <h5 className='text-black fw-medium my-3'>34.97 x 14.44 x 22.87</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                          <h5 className='text-black fw-medium my-3'>27.8 Kg</h5>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <h4 className='text-black fw-bolder my-5 mb-3'>AFTER SALES & SERVICES</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Warranty on Main Product
                          </h4>
                          <h5>{productsData.Warranty_period}</h5>
                        </div>

                        {/* <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Standard Warranty Includes
                          </h4>
                          <h5>Manufacturing Defect</h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Installation & Demo Details
                          </h4>
                          <h5>0</h5>
                        </div> */}
                      </div>
                    </div>
                    {/* <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Additional Warranties</h4>
                          <h5>5 Years Warranty on Condenser| 10 Years Warranty on Compressor</h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Standard Warranty Excludes
                          </h4>
                          <h5>Physical Damage</h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Warranty on Accessories
                          </h4>
                          <h5>12 Months</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Warranty Type</h4>
                          <h5 className='text-black fw-medium my-3'>Onsite</h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Installation & Demo</h4>
                          <h5 className='text-black fw-medium my-3'>
                            Croma will coordinate for Installation and Demo on Chargeable Basis
                          </h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Installation & Demo applicable
                          </h4>
                          <h5 className='text-black fw-medium my-3'>Yes</h5>
                        </div>
                      </div>
                    </div> */}
                  </div>
                  {/* 
                  <h4 className='text-black fw-bolder my-5 mb-3'>COMPANY CONTACT INFORMATION</h4>
                  <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                    <div className='col-lg-4 '>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Customer Support Number
                          </h4>
                          <h5>{productsData}</h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'></h4>
                          <h5></h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Country of Manufacture</h4>
                          <h5>India</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>Customer Support Email</h4>
                          <h5>customerservice@bluestarindia.com</h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'></h4>
                          <h5></h5>
                        </div>

                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Country of Brand Origin
                          </h4>
                          <h5>India</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className=''>
                        <div className='my-4'>
                          <h4 className='text-black fw-normal my-3 mt-0'>
                            Manufacturer/Marketer Name & Address
                          </h4>
                          <h5 className='text-black fw-medium my-3'>
                            Manufacturer Name & Address: Blue Star Engineering & Electronics Ltd.
                            Kasturi Buildings, Mohan T Advani Chowk, Jamshedji Tata Road, Mumbai
                            400020, Maharashtra, India India
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          <div className='accordion my-5' id='accordionExample2'>
            <div className='accordion-item'>
              <h2 className='accordion-header' id='headingTwo'>
                <button
                  className='accBtn1 accordion-button collapsed'
                  type='button'
                  data-bs-toggle='collapse'
                  data-bs-target='#collapseTwo'
                  aria-expanded='false'
                  aria-controls='collapseTwo'
                >
                  Overview
                </button>
              </h2>
              <div
                id='collapseTwo'
                className='accordion-collapse collapse'
                aria-labelledby='headingTwo'
                data-bs-parent='#accordionExample2'
              >
                <div className='accordion-body bodyAcc'>
                  <div className=''>
                    <h4 className='card-title my-4'>
                      {HtmlReactParser(productsData.Description || '')}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {reviewAllData.TotalRating > 0 || reviewAllData.TotalReview > 0 ? (
            <div className='accordion my-5' id='accordionExample3'>
              <div className='accordion-item'>
                <h2 className='accordion-header' id='headingThree'>
                  <button
                    className='accBtn1 accordion-button collapsed'
                    type='button'
                    onClick={onToggleDiv}
                    data-bs-toggle='collapse'
                    data-bs-target='#collapseThree'
                    aria-expanded='false'
                    aria-controls='collapseThree'
                  >
                    Reviews
                  </button>
                </h2>
                <div
                  id='collapseThree'
                  className={`accordion-collapse collapse ${isOpenDiv ? 'show' : ''}`}
                  aria-labelledby='headingThree'
                  data-bs-parent='#accordionExample3'
                >
                  <div className='accordion-body bodyAcc'>
                    <div className='border-bottom border-gray-200 pb-5 border-2'>
                      <div className='d-flex '>
                        <div className='d-flex flex-column'>
                          <h1 className='bigRateText'>{reviewAllData.AverageRating}</h1>
                          <small className='ratingReviewText'>
                            {reviewAllData.TotalReview} reviews <br />
                            {reviewAllData.TotalRating} ratings
                          </small>
                        </div>
                        <div className='ratingDiv ps-4'>
                          {reviewAllData && reviewAllData.StarredCount && [5, 4, 3, 2, 1].map((rating, index) => (
                            <div className='mainRating d-flex align-items-center' key={index}>
                              <div>
                                <div className='rating'>
                                  {renderRatingStars(rating)}
                                </div>
                              </div>
                              <div className='mx-2'>
                                <div className={`ratingProcessBar${rating}`}></div>
                              </div>
                              <div className='fs-5 text-body-tertiary'>{reviewAllData.StarredCount[rating]}</div>
                            </div>
                          ))}
                        </div>


                      </div>
                      <div className='mt-10'>
                        <h2 className='text-black fw-medium my-3'>Review this product</h2>
                        <h5 className='text-black fw-normal my-3'>
                          Help other customers make their decision
                        </h5>
                        <div className=''>
                          <a
                            className='mx-0 px-8 btn btn-default primaryOutlineBtn  mt-8 '
                            onClick={handleWriteReviewClick}
                          >
                            <div className='ms-2 fw-medium'>Write a review</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className='innerSecondDiv'>
                      <div className='d-flex justify-content-between align-items-center py-8'>
                        <div className='respoTextReview'>
                          <h2 className='respoTextReview1 mb-0'>Customer Reviews:</h2>
                        </div>
                        <div className='btn-group'>
                          <button
                            type='button'
                            className={`respoTextReview px-2 primaryOutlineBtn justify-content-between btn btn-default btn-active-light-primary btn-flex  btn-center btn-sm ${isOpen ? 'open' : ''}`}
                            onClick={toggleDropdown}
                            aria-expanded={isOpen ? 'true' : 'false'}
                          >
                            {selectedSort.label}
                            <i className={`ki-duotone ki-down primaryTextMediumBold fs-5 ms-1 mt-1 ${isOpen ? 'open' : ''}`}></i>
                          </button>
                          <div className={`dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600  menu-state-bg-light-primary fw-semibold fs-7  py-4 ${isOpen ? 'show' : ''}`}>
                            {sortingOptions.map((option) => (
                              <div
                                key={option.value}
                                className={`dropdown-item menu-item ${selectedSort.value === option.value ? 'active' : ''}`}
                                onClick={() => handleSortChange(option.value)}
                              >
                                <div className='primaryTextMediumBold menu-link '>{option.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        {reviewData.map((review, index) => (
                          <div className='mainReviewDiv' key={index}>
                            <div className='d-flex '>
                              <div className='d-flex'>
                                <img
                                  src={review.UserMainImage || '/media/vectors/defaultAvatar.png'}
                                  className='rounded-circle'
                                  height={50}
                                  width={50}
                                  alt='User Avatar'
                                />
                                <div className='d-flex flex-column ps-3'>
                                  <h5>{review.Name || 'Anonymous'}</h5>
                                  <div className=''>
                                    <img
                                      src={toAbsoluteUrl('/media/vectors/clock.png')}
                                      className=''
                                      alt='Clock Icon'
                                    />
                                    <small className='ps-1'>{formatDate(review.Created_at)}</small>
                                  </div>
                                  <div className=''>
                                    <div className='rating'>
                                      {renderRatingStars(parseInt(review.Rating))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className=''>
                              <h4 className='fw-medium w-auto my-4'>{review.Review}</h4>
                            </div>
                            <div className='d-flex mb-4'>
                              {review.MediaUrl.map((media: any, mediaIndex: any) => (

                                <img
                                  key={mediaIndex}
                                  src={media.URL || '/media/vectors/NoProductImage.png'}
                                  width={60} height={60}
                                  // src={toAbsoluteUrl(media || '/media/vectors/reviewProd3.png')}
                                  className='card-img1 me-2 ps-0 border'
                                  alt={`Review ${mediaIndex + 1}`}
                                />

                              ))}
                            </div>
                          </div>
                        ))}
                      </div>




                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* <div className='accordionMain'>
            <div className='accordion bg-white border-bottom-2 my-5 ' id='accordionExample'>
              <div className='accordion-item'>
                <h2 className='accordion-header' id='headingOne'>
                  <button
                    className='accBtn1 accordion-button'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#collapseOne'
                    aria-expanded="false"
                    aria-controls='collapseOne'
                  >
                    Specification
                  </button>
                </h2>
                <div
                  id='collapseOne'
                  className='accordion-collapse collapse '
                  aria-labelledby='headingOne'
                  data-bs-parent='#accordionExample'
                >
                  <div className='accordion-body bodyAcc'>
                    <div className='row'>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Air Conditioner Type
                              </h4>
                              <h5 className='text-black fw-medium my-3'>Split</h5>
                            </div>
                            <div className='my-6'>
                              <h4 className='text-black fw-normal my-3'>
                                Approximate Coverage Area(Sq.M)
                              </h4>
                              <h5 className='text-black fw-medium my-3'>13.93 Sq.m</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Air Conditioner Capacity
                              </h4>
                              <h5 className='text-black fw-medium my-3'>1.5 Ton</h5>
                            </div>
                            <div className='my-6'>
                              <h4 className='text-black fw-normal my-3'>Installation Type</h4>
                              <h5 className='text-black fw-medium my-3'>Wall Mount</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Approximate Coverage Area(Sq.Ft)
                              </h4>
                              <h5 className='text-black fw-medium my-3'>150 Sq. Ft.</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h4 className='text-black fw-bolder my-5 mb-3'>MANUFACTURER DETAILS</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Brand</h4>
                              <h5 className='text-black fw-medium my-3'>Blue Star</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Model Series</h4>
                              <h5 className='text-black fw-medium my-3'>IC518YNU</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Model Number</h4>
                              <h5 className='text-black fw-medium my-3'>IC518YNU</h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>PRODUCT DIMENSIONS (OPEN)</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Dimensions In CM (WxDxH)
                              </h4>
                              <h5 className='text-black fw-medium my-3'>0</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>
                                Dimensions In Inches (WxDxH)
                              </h4>
                              <h5 className='text-black fw-medium my-3'>IC518Y0NU</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Model Number</h4>
                              <h5 className='text-black fw-medium my-3'>IC518YNU</h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>AIR CONDITIONER FEATURES</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Air Conditioner Modes
                              </h4>
                              <h5>Super Turbo Mode</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Inverter Technology
                              </h4>
                              <h5>Yes</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Convertible Mode</h4>
                              <h5 className='text-black fw-medium my-3'>No</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Cooling Capacity</h4>
                              <h5 className='text-black fw-medium my-3'>5000 Watts</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Air Flow Volume</h4>
                              <h5 className='text-black fw-medium my-3'>580 CFM</h5>
                            </div>

                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Cooling Capacity</h4>
                              <h5 className='text-black fw-medium my-3'>
                                Self Diagnosis | Comfort Sleep | Smart Ready | Anti-Corrosive Blue
                                Fins for Protection | Acoustic Insulation Compressor Jacket
                              </h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>AIR CONDITIONER FUNCTIONS</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Compressor Type</h4>
                              <h5>Inverter Rotary Compressor</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Noise Level (Outdoor Unit)
                              </h4>
                              <h5>60 dB</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Refrigerant Type</h4>
                              <h5 className='text-black fw-medium my-3'>R-32</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Air Conditioner Filters</h4>
                              <h5 className='text-black fw-medium my-3'>Anti Dust Filter</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Noise Level (Indoor Unit)
                              </h4>
                              <h5 className='text-black fw-medium my-3'>57.4db</h5>
                            </div>

                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Additional Air Conditioner Functions
                              </h4>
                              <h5 className='text-black fw-medium my-3'>
                                Annual Consumption: 770.98 Units/Year
                              </h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>
                        AIR CONDITIONER PHYSICAL ATTRIBUTES
                      </h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Connecting Pipe Type
                              </h4>
                              <h5>Copper Connecting Pipe</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Leakage Detector</h4>
                              <h5>Yes</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Connecting Pipe Length</h4>
                              <h5 className='text-black fw-medium my-3'>3 Meters</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Louvers Swing Type</h4>
                              <h5 className='text-black fw-medium my-3'>Up/Down | Left/Right</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Condenser Coil Type
                              </h4>
                              <h5 className='text-black fw-medium my-3'>Copper Condenser Coil</h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>NETWORK CONNECTIVITY</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>WiFi Supported</h4>
                              <h5>Yes</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>WiFi Features</h4>
                              <h5 className='text-black fw-medium my-3'>Smart Ready</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'></div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>REMOTE CONTROL DETAILS</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Remote Additional Features
                              </h4>
                              <h5>Glow Buttons</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'></div>
                        <div className='col-lg-4'></div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>ENERGY STANDARDS</h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>
                                Energy Efficiency (Star Rating)
                              </h4>
                              <h5>5 Star</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>
                                Indian Seasonal Energy Efficiency Ratio (ISEER)
                              </h4>
                              <h5 className='text-black fw-medium my-3'>5.02</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'></div>
                      </div>

                      <h4 className='text-black fw-bolder my-5 mb-3'>
                        AIR CONDITIONER PLUG DETAILS
                      </h4>
                      <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                        <div className='col-lg-4 '>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Power</h4>
                              <h5>1315 Watts</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Phase</h4>
                              <h5>Single Phase</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>Voltage Rating</h4>
                              <h5 className='text-black fw-medium my-3'>230V</h5>
                            </div>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3'>
                                Maximum Operating Temperature
                              </h4>
                              <h5 className='text-black fw-medium my-3'>52 Degree Celsius</h5>
                            </div>
                          </div>
                        </div>
                        <div className='col-lg-4'>
                          <div className=''>
                            <div className='my-4'>
                              <h4 className='text-black fw-normal my-3 mt-0'>Frequency</h4>
                              <h5 className='text-black fw-medium my-3'>50Hz</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>AESTHETICS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Color</h4>
                            <h5>White</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Color Family</h4>
                            <h5 className='text-black fw-medium my-3'>White</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'></div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>IN THE BOX</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Generic Name</h4>
                            <h5>Air Conditioner</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'></div>
                      <div className='col-lg-4'></div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>IN THE BOX</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Accessories Quantity</h4>
                            <h5>0</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>In The Box</h4>
                            <h5>0</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Main product</h4>
                            <h5 className='text-black fw-medium my-3'>1 x Air Conditioner U</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Accessories Details</h4>
                            <h5 className='text-black fw-medium my-3'>Not Applicable</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Accessories</h4>
                            <h5 className='text-black fw-medium my-3'>NA</h5>
                          </div>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Generic Name</h4>
                            <h5 className='text-black fw-medium my-3'>Air Conditioner</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>PRODUCT DIMENSIONS (OPEN)</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5>37.79 x 8.46 x 12.59</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>Dimensions In CM (WxDxH)</h4>
                            <h5 className='text-black fw-medium my-3'>95.9 x 21.4 x 31.9</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                            <h5 className='text-black fw-medium my-3'>11 Kg</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>
                      PRODUCT DIMENSIONS OUTDOOR UNIT
                    </h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5>88.84 x 36.7 x 58.15</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>34.97 x 14.44 x 22.87</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                            <h5 className='text-black fw-medium my-3'>27.8 Kg</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>PACKAGED DIMENSIONS</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5>38.98 x 15.55 x 11.81</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                            <h5 className='text-black fw-medium my-3'>27.8 Kg</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>34.97 x 14.44 x 22.87</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>
                      PRODUCT PACKAGED DIMENSIONS OUTDOOR UNIT
                    </h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5>38.98 x 15.55 x 11.81</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3'>
                              Dimensions In Inches (WxDxH)
                            </h4>
                            <h5 className='text-black fw-medium my-3'>34.97 x 14.44 x 22.87</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Weight</h4>
                            <h5 className='text-black fw-medium my-3'>27.8 Kg</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>AFTER SALES & SERVICES</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Warranty on Main Product
                            </h4>
                            <h5>38</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Standard Warranty Includes
                            </h4>
                            <h5>Manufacturing Defect</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Installation & Demo Details
                            </h4>
                            <h5>0</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Additional Warranties
                            </h4>
                            <h5>5 Years Warranty on Condenser| 10 Years Warranty on Compressor</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Standard Warranty Excludes
                            </h4>
                            <h5>Physical Damage</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Warranty on Accessories
                            </h4>
                            <h5>12 Months</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Warranty Type</h4>
                            <h5 className='text-black fw-medium my-3'>Onsite</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>Installation & Demo</h4>
                            <h5 className='text-black fw-medium my-3'>
                              Croma will coordinate for Installation and Demo on Chargeable Basis
                            </h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Installation & Demo applicable
                            </h4>
                            <h5 className='text-black fw-medium my-3'>Yes</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className='text-black fw-bolder my-5 mb-3'>COMPANY CONTACT INFORMATION</h4>
                    <div className='col-lg-12 d-flex justify-content-between border-bottom border-1 border-gray-300  mobileFlexColumn'>
                      <div className='col-lg-4 '>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Customer Support Number
                            </h4>
                            <h5>18002091177</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'></h4>
                            <h5></h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Country of Manufacture
                            </h4>
                            <h5>India</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Customer Support Email
                            </h4>
                            <h5>customerservice@bluestarindia.com</h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'></h4>
                            <h5></h5>
                          </div>

                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Country of Brand Origin
                            </h4>
                            <h5>India</h5>
                          </div>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className=''>
                          <div className='my-4'>
                            <h4 className='text-black fw-normal my-3 mt-0'>
                              Manufacturer/Marketer Name & Address
                            </h4>
                            <h5 className='text-black fw-medium my-3'>
                              Manufacturer Name & Address: Blue Star Engineering & Electronics Ltd.
                              Kasturi Buildings, Mohan T Advani Chowk, Jamshedji Tata Road, Mumbai
                              400020, Maharashtra, India India
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='accordion bg-white border-bottom-2 my-5' >
              <div className='accordion-item'>
                <h2 className='accordion-header' id='headingOne1'>
                  <button
                    className='accBtn1 accordion-button'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#collapseOne1'
                    aria-expanded="false"
                    aria-controls='collapseOne1'
                  >
                    Overview
                  </button>
                </h2>
                <div
                  id='collapseOne1'
                  className='accordion-collapse'
                  aria-labelledby='headingOne1'
                  data-bs-parent='#accordionExample1'
                >
                  <div className='accordion-body bodyAcc'>
                    <div className=''>
                      <h4 className='card-title '>
                        Why Buy Blue Star 1.5 Ton 5 Star Inverter Split AC with Turbo Cool
                      </h4>
                      <ul className='ps-5 mt-5'>
                        <li className='text-black fs-4 fw-medium'>
                          Dust Filter captures dust and circulates pure air inside the room
                        </li>
                        <li className='text-black fs-4 fw-medium'>
                          R32- Refrigerant that helps with zero ozone depletion & better cooling in
                          high ambient temperatures
                        </li>
                        <li className='text-black fs-4 fw-medium'>
                          1.5 Ton Capacity gives the perfect cooling experience for your living room
                        </li>
                      </ul>

                      <h4 className='card-title my-4'>
                        Do you want to experience the most preferable cooling performance with a
                        compact design AC? Then bring home Blue Star 1.5 Ton 5 Star Inverter Split
                        AC with Turbo Cool. Comes with turbo cooling mode which works at high speed
                        to reach the preset temperature at cooling in the shortest time possible.
                        Chill more and relax without any inhibitions with Blue Star Split AC.
                      </h4>
                      <h4 className='card-title my-4'>
                        The Blue Star 1.5 Ton 5 Star Inverter Split AC with Turbo Cool is designed
                        with modern technology that provides additional comfort every day. Its
                        meticulous design is aimed at delivering optimal performance even in extreme
                        weather conditions. Moreover, the Eco Mode of this AC significantly reduces
                        electricity consumption thereby cutting down on the power bills whilst
                        delivering incredible cool air. This product comes with a Dry mode for
                        comfort in humid weather. Special evaporator and condenser fins with
                        hydrophilic blue fins. The AC is ready to be operated using Blue Star's
                        Smart App and through Voice Command using Amazon Alexa or Google Home (To
                        operate through Smart App or Voice Command, user has to pay an additional
                        charge to convert the AC into Smart AC completely). So, grab the Blue Star
                        1.5 Ton 5 Star Inverter Split AC with Turbo Cool online!
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='accordion bg-white border-bottom-2 my-5'>
              <div className='accordion-item'>
                <h2 className='accordion-header' id='headingOne2'>
                  <button
                    className='accBtn1 accordion-button'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#collapseOne2'
                    aria-expanded="false"
                    aria-controls='collapseOne2'
                  >
                    Reviews
                  </button>
                </h2>
                <div
                  id='collapseOne2'
                  className='accordion-collapse'
                  aria-labelledby='headingOne2'
                  data-bs-parent='#accordionExample2'
                >
                  <div className='accordion-body bodyAcc'>
                    <div className='border-bottom border-gray-200 pb-5 border-2'>
                      <div className='d-flex '>
                        <div className='d-flex flex-column'>
                          <h1 className='bigRateText'>4.3</h1>
                          <small className='ratingReviewText'>
                            23 reviews <br />
                            54 ratings
                          </small>
                        </div>
                        <div className='ratingDiv ps-4'>
                          <div className='mainRating d-flex align-items-center'>
                            <div className=''>
                              <div className='rating'>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                            </div>
                            <div className='mx-2'>
                              <div className='ratingProcessBar'></div>
                            </div>
                            <div className='fs-5 text-body-tertiary '>12</div>
                          </div>
                          <div className='mainRating d-flex align-items-center'>
                            <div className=''>
                              <div className='rating'>
                      
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                            </div>
                            <div className='mx-2'>
                              <div className='ratingProcessBar4'></div>
                            </div>
                            <div className='fs-5 text-body-tertiary '>12</div>
                          </div>

                          <div className='mainRating d-flex align-items-center'>
                            <div className=''>
                              <div className='rating'>
                            
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                            </div>
                            <div className='mx-2'>
                              <div className='ratingProcessBar3'></div>
                            </div>
                            <div className='fs-5 text-body-tertiary '>12</div>
                          </div>

                          <div className='mainRating d-flex align-items-center'>
                            <div className=''>
                              <div className='rating'>
                        
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                            </div>
                            <div className='mx-2'>
                              <div className='ratingProcessBar2'></div>
                            </div>
                            <div className='fs-5 text-body-tertiary '>2</div>
                          </div>

                          <div className='mainRating d-flex align-items-center'>
                            <div className=''>
                              <div className='rating'>
                        
                           
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                            </div>
                            <div className='mx-2'>
                              <div className='ratingProcessBar1'></div>
                            </div>
                            <div className='fs-5 text-body-tertiary '>0</div>
                          </div>
                        </div>
                      </div>
                      <div className='mt-10'>
                        <h3 className='text-black fw-medium my-3'>Review this product</h3>
                        <h3 className='text-black fw-normal my-3'>
                          Help other customers make their decision
                        </h3>
                        <div className=''>
                          <a className='col-lg-2 mx-0 px-8 btn btn-default primaryOutlineBtn  mt-8 d-flex align-items-center justify-content-center'>
                            <div className='ms-2 fw-medium'>Write a review</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className='innerSecondDiv'>
                      <div className='d-flex justify-content-between align-items-center py-8'>
                        <div className=''>
                          <h1>Customer Reviews:</h1>
                        </div>
                        <div className=''>
                          <div className='d-flex mb-5 justify-content-end ms-auto align-items-center'>
                            <h2 className='mb-0 col-lg-4 text-center'>Sort by</h2>
                            <select
                              className='form-select col-lg-8 ms-2 bg-transparent rounded-4 primaryTextBold border border-1 border-dark'
                              aria-label='Default select example'
                            >
                              <option selected className='primaryTextBold '>
                                Newest First
                              </option>
                              <option value='1'>One</option>
                              <option value='2'>Two</option>
                              <option value='3'>Three</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className='mainReviewDiv'>
                        <div className='d-flex '>
                          <div className='d-flex'>
                            <img
                              src={toAbsoluteUrl('/media/vectors/avatar1.png')}
                              className=''
                              height={50}
                              width={50}
                              alt='...'
                            />
                            <div className='d-flex flex-column ps-3'>
                              <h5>Ronald Richards</h5>
                              <div className=''>
                                <img
                                  src={toAbsoluteUrl('/media/vectors/clock.png')}
                                  className=''
                                  alt='...'
                                />
                                <small className='ps-1'>13 Sep, 2020</small>
                              </div>
                              <div className=''>
                              <div className='rating'>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className=''>
                          <h4 className='fw-medium w-25 my-4'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
                            malesuada eget vitae amet...
                          </h4>
                        </div>
                        <div className='d-flex'>
                          <img
                            src={toAbsoluteUrl('/media/vectors/reviewProd1.png')}
                            className='card-img1 px-2 ps-0'
                            alt='...'
                          />
                          <img
                            src={toAbsoluteUrl('/media/vectors/reviewProd2.png')}
                            className='card-img1 px-2'
                            alt='...'
                          />
                          <img
                            src={toAbsoluteUrl('/media/vectors/reviewProd3.png')}
                            className='card-img1 px-2'
                            alt='...'
                          />
                        </div>
                      </div>

                      <div className='mainReviewDiv my-8'>
                        <div className='d-flex '>
                          <div className='d-flex'>
                            <img
                              src={toAbsoluteUrl('/media/vectors/avatar2.png')}
                              className=''
                              height={50}
                              width={50}
                              alt='...'
                            />
                            <div className='d-flex flex-column ps-3'>
                              <h5>John Doe</h5>
                              <div className=''>
                                <img
                                  src={toAbsoluteUrl('/media/vectors/clock.png')}
                                  className=''
                                  alt='...'
                                />
                                <small className='ps-1'>13 Sep, 2020</small>
                              </div>
                              <div className=''>
                              <div className='rating'>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                                <div className='rating-label checked'>
                                  <i className='ki-duotone ki-star '></i>
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className=''>
                          <h4 className='fw-medium w-25 my-4'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
                            malesuada eget vitae amet...
                          </h4>
                        </div>
                        <div className='d-flex'>
                          <img
                            src={toAbsoluteUrl('/media/vectors/reviewProd1.png')}
                            className='card-img1 px-2 ps-0'
                            alt='...'
                          />
                          <img
                            src={toAbsoluteUrl('/media/vectors/reviewProd2.png')}
                            className='card-img1 px-2'
                            alt='...'
                          />
                          <img
                            src={toAbsoluteUrl('/media/vectors/reviewProd3.png')}
                            className='card-img1 px-2'
                            alt='...'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>  */}

          <div className='prodMain'>
            <SimilarProductsPage />
            <PeopleAlsoBoughtPage />
          </div>

        </section>
      </ProductOverviewPageStyles>
    </>
  )
}

export default ProductOverviewPage

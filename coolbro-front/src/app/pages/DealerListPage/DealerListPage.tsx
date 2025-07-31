import { FC, useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { DealerListPageStyles } from './DealerListPageStyles'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import HorizontalDealerCard from '../CommonComponents/HorizontalDealerCard/HorizontalDealerCard'
import { useGeolocation, Coordinates } from '../../../context/GeolocationContext';
import ReactPaginate from 'react-paginate'

const DealerListPage: FC = () => {
  const navigate = useNavigate()
  const coordinates: Coordinates | null  = useGeolocation();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10)
  const [length, setLength] = useState(0)

  useEffect(() => {
    fetchDealers(currentPage, pageSize, coordinates);
  }, [currentPage, coordinates, pageSize]);

  const fetchDealers = async (page: number, limit: number, coords: Coordinates | null) => {
    setLoading(true);

    if (coords) {
      try {
        axios
          .post(`${process.env.REACT_APP_SERVER_URL}/dealer/search-dealer`, {
            Page: page.toString(),
            Limit: limit.toString(),
            latitude: coords.latitude,
            longitude: coords.longitude,
            // Below For Static 
            // "latitude": 26.18972570,
            // "longitude": 80.81015720
          })
          .then((res: any) => {
            if (res.data && res.data.data) {
              setLoading(false);
              setDealers(res.data.data);
              setLength(res.data.totalRecords);
            } else {
              setLoading(false);
              setDealers([]);
            }
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } catch (error) {
        console.error("Error getting geolocation:", error);
        setLoading(false);
      }
    } else {
      console.error("Geolocation is not supported in this browser.");
      setLoading(false);
    }
  };

  const pageCount = Math.ceil(length / pageSize)

  const changePage = ({ selected }: any) => {
    setCurrentPage(selected + 1)
    fetchDealers(selected + 1, pageSize, coordinates)
  }
  const navigateToProdList = () => {
    navigate('/product-list')
  }
  return (
    <DealerListPageStyles>

      <div className='mobilePaddingNew container-fluid px-20'>
        <section className=''>

          <div className='my-10'>

            {dealers.length > 0 ? (
              <div>
                <HorizontalDealerCard dealers={dealers} loading={loading} />
                <div className='row'>
                  <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'></div>
                  <div className='col-sm-12  d-flex align-items-center justify-content-center justify-content-md-end'>
                    <div
                      className='dataTables_paginate paging_simple_numbers'
                      id='kt_table_users_paginate'
                    >
                      {dealers.length > 0 ? (
                        <ReactPaginate
                          previousLabel={'Previous'}
                          nextLabel={'Next'}
                          pageCount={pageCount}
                          onPageChange={changePage}
                          containerClassName={'pagination'}
                          pageClassName={'page-item'}
                          pageLinkClassName={'page-link'}
                          previousClassName={'page-item'}
                          breakClassName={'break-me'}
                          previousLinkClassName={'page-link'}
                          nextClassName={'page-item'}
                          nextLinkClassName={'page-link'}
                          activeClassName={'active'}
                          marginPagesDisplayed={2} // Number of pages to display at the beginning and end of the pagination
                          pageRangeDisplayed={3}  // Number of pages to display around the currently selected page
                        />

                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : loading ?
              (
                <span className='indicator-progress text-center d-block'>
                  Please wait...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              ) : (
                <div className=''>
                  <div className='row my-20'>
                    <div className='col-lg-12'>
                      <div className='d-flex flex-column align-items-center  justify-content-center'>
                        <img
                          className='mobileWFull'
                          src={toAbsoluteUrl('/media/vectors/NoRecordVector.png')}
                          alt='Card cap'
                        />
                        <div className='innerTextBottomNoCart d-flex justify-content-center flex-column align-items-center'>
                          <h1 className='primaryTextBold '>
                            Sorry, no records found!
                          </h1>
                          {/* <h3 className='primaryTextBold my-6  textAlignCenterMobile'>
                          Please check the spelling or try searching for something else
                          </h3> */}

                          <button className='primaryBtn btn btn-default px-15 mt-6' onClick={navigateToProdList}>Continue Shopping</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* <nav aria-label='...'>
              <ul className='pagination d-flex justify-content-end'>
                <li className='page-item disabled'>
                  <span className='page-link'>
                    <i className='fas fa-angle-left fs-2'></i>
                  </span>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className='page-link fs-2' onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                  </button>
                </li>
                <li className='page-item mainPagination active' aria-current='page'>
                  <span className='page-link fs-2'>{currentPage}</span>
                </li>
                <li className='page-item'>
                  <button className='page-link fs-2' onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav> */}
          </div>

        </section>
      </div>
    </DealerListPageStyles>
  )
}

export default DealerListPage





import { FC, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProductCardPageStyles } from './ProductCardPageStyles'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { Filters } from '../../../constants/common'
import { Link, useParams } from 'react-router-dom'


const sortingOptions = [
  { label: 'New Arrivals', value: 'New Arrivals' },
  { label: 'Best Selling', value: 'Best Selling' },
  { label: 'Price: Low to High', value: 'Price (Low to High)' },
  { label: 'Price: High to Low', value: 'Price (High to Low)' },
  { label: 'Alphabetical: A-Z', value: 'Alphabetical:A-Z' },
  { label: 'Alphabetical: Z-A', value: 'Alphabetical:Z-A' },
]

interface ProductCardProps {
  visibleOffCanvas: (isVisibleOffCanvas: boolean) => void
  selectedFilters: Filters
  searchQuery: string
}
const ProductCardPage: FC<ProductCardProps> = ({
  visibleOffCanvas,
  selectedFilters,
  searchQuery,
}) => {
  const [isVisibleOffCanvas, setIsVisibleOffCanvas] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [length, setLength] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null);



  const [selectedSort, setSelectedSort] = useState<{ label: string; value: string }>({
    label: 'SORT BY',
    value: '',
  })

  const handleShowMobileFilter = (action: boolean) => {
    //setIsVisibleOffCanvas(action);
    visibleOffCanvas(action)
  }
  const navigate = useNavigate()
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const brandId = searchParams.get('brandId');

  const handleClickOutside = (event: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, pageSize, selectedSort.value, selectedFilters)
    // console.log("viv", brandId)
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentPage, pageSize, selectedSort, isVisibleOffCanvas, selectedFilters, searchQuery])



  const fetchProducts = (page: number, limit: number, sortOption: string, filters: Filters) => {
    setLoading(true)

    // Make a POST request to your API with pagination, sorting, and filtering parameters
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/product/search-product`, {
        Page: page.toString(),
        Limit: limit.toString(),
        search: searchQuery,
        Sort_by: sortOption,
        Capacity: filters.capacities,
        Brand: filters.brands,
        Energy_rating: filters.energyRating,
        Price_range: filters.price,
        Type: filters.type,
        Features: filters.feature,
        Room_size: filters.roomSize,
        Noise_level: filters.noiseLevel,
        Availability: filters.availability,
        Air_Purification: filters.airPurification,
        Cooling_Capacity: filters.coolingCapacity,
        Warranty_period: filters.warrantyPeriod,
        Rating: filters.rating,
      })
      .then((res: any) => {
        if (res.data && res.data.data) {
          setLoading(false)
          setProducts(res.data.data)
          setLength(res.data.totalRecords)
        }
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  const navigateToProdList = (id: string) => {
    navigate('/product-details/' + id)
  }

  const handleSortChange = (sortOption: string) => {
    const selectedOption = sortingOptions.find((option) => option.value === sortOption)
    if (selectedOption) {
      setSelectedSort(selectedOption)
      setIsOpen(false)
    }
  }

  const pageCount = Math.ceil(length / pageSize)

  const changePage = ({ selected }: any) => {
    setCurrentPage(selected + 1)
    fetchProducts(selected + 1, pageSize, selectedSort.value, selectedFilters)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <ProductCardPageStyles>
      <section className=''>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='d-flex col-lg-4 mb-4 justifyContentMobileBetween justify-content-end ms-auto align-items-center marginPageMYMobile'>
              {/* <h2 className='mb-0 col-lg-4 text-center'>Sort by</h2> */}
              <div className='btn-group mobileDisplayNoneDesktop'>
                <button
                  type='button'
                  className='primaryOutlineBtn pe-2 justify-content-between btn btn-default btn-active-light-primary btn-flex  btn-center btn-sm'
                  onClick={() => handleShowMobileFilter(!isVisibleOffCanvas)}
                >
                  FILTER
                  <img
                    className='ms-1'
                    src={toAbsoluteUrl('/media/vectors/Filter.svg')}
                    alt='Card cap'
                  />
                  {/* <i className='fa fab-filter primaryTextMediumBold fs-5 ms-1 mt-1'></i> */}
                </button>
              </div>
              <div className='btn-group' ref={dropdownRef}>
                <button
                  type='button'
                  className={`primaryOutlineBtn justify-content-between btn btn-default btn-active-light-primary btn-flex  btn-center btn-sm ${isOpen ? 'open' : ''
                    }`}
                  onClick={toggleDropdown}
                  aria-expanded={isOpen ? 'true' : 'false'}
                >
                  {selectedSort.label}
                  <i
                    className={`ki-duotone ki-down primaryTextMediumBold fs-5 ms-1 mt-1 ${isOpen ? 'open' : ''
                      }`}
                  ></i>
                </button>
                <div
                  className={`dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600  menu-state-bg-light-primary fw-semibold fs-7  py-4 ${isOpen ? 'show' : ''
                    }`}
                >
                  {sortingOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`dropdown-item menu-item ${selectedSort.value === option.value ? 'active' : ''
                        }`}
                      onClick={() => handleSortChange(option.value)}
                    >
                      <div className='primaryTextMediumBold menu-link '>{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {products.length > 0 ? (
              <div>


                {products.map((product: any) => (
                  <div key={product.ID}>
                    <div className='card filterMain my-10 mt-0'>
                      <div className='card-horizontal align-items-center profileFlexColumn'>
                        <div className='img-square-wrapper p-6'>
                          <div className=''>
                            {product.Media_url ? (
                              <div className='commonBGMain'>
                                <img
                                  className='img-fluid'
                                  src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImage.png')}
                                  alt='Card cap'
                                />
                                <div className='commonBGACMain'>
                                  <img
                                    className='img-fluid ACImageCommon'
                                    src={toAbsoluteUrl(
                                      product.Media_url || '/media/vectors/default-image.png'
                                    )}
                                    alt=''
                                  />
                                </div>
                              </div>
                            ) : (
                              <img
                                className='img-fluid'
                                src={toAbsoluteUrl('/media/vectors/NoProductImage.png')}
                                alt='Card cap'
                              />
                            )}
                          </div>
                        </div>
                        <div className='card-body p-6 py-0 pe-10'>
                          <h4 className='card-title primaryTextBold productName' onClick={() => navigateToProdList(product.ID)}>{product.Name}</h4>
                          <p className='card-text d-flex align-items-center primaryTextBold my-5'>
                            SKU: {product.SKU_number}
                          </p>

                          <div className='card-text d-flex align-items-center secondaryText my-9 mt-0'>
                            <div className='ratingMainDiv1'>
                              <div className='rateText1'>{product.averageRating || 0}</div>
                              <div className=''>
                                <i className='fa fa-star ps-2 text-white' aria-hidden='true'></i>
                              </div>
                            </div>
                            <div className='ps-4'>
                              {product.totalRating || 0} Ratings & {product.totalReview || 0}{' '}
                              Reviews
                            </div>
                          </div>
                          <div className='d-flex align-items-center'>
                            <h1 className='respoPriceText1 mb-0 normal viewTitle11 primaryTextSemiBold'>
                              ₹ {product.Sale_price}
                            </h1>
                            <h5 className='mb-0 respoPriceText2 mb-0 fw-medium viewChildTitle mx-2 text-decoration-line-through '>
                              MRP: ₹{product.Price}{' '}
                            </h5>
                          </div>
                          <p className='card-text secondaryText mb-0'>(Incl. all Taxes)</p>
                          <div className='col-xxl-3 col-xl-4 col-lg-5 col-md-6'>
                            <a className='w-auto btn btn-default primaryBtn mt-5 d-flex align-items-center  marginPageMYMobile justify-content-center'>
                              <img
                                className='img-fluid'
                                src={toAbsoluteUrl('/media/vectors/Buy.png')}
                                alt='Buy'
                              />{' '}
                              <div
                                onClick={() => navigateToProdList(product.ID)}
                                className='ms-2 fw-medium'
                              >
                                Buy Now
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className='row'>
                  <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'></div>
                  <div className='col-sm-12  d-flex align-items-center justify-content-center justify-content-md-end'>
                    <div
                      className='dataTables_paginate paging_simple_numbers'
                      id='kt_table_users_paginate'
                    >
                      {products.length > 0 ? (
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
                          pageRangeDisplayed={2}  // Number of pages to display around the currently selected page
                        />

                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <span className='indicator-progress text-center d-block' >
                Please wait...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            ) : (
              <>
                <section>
                  <div className='container'>
                    <div className='row my-20'>
                      <div className='col-lg-12'>
                        <div className='d-flex flex-column align-items-center  justify-content-center'>
                          <img
                            className='mobileWFull'
                            src={toAbsoluteUrl('/media/vectors/NoRecordVector.png')}
                            alt='Card cap'
                          />
                          <div className='innerTextBottomNoCart d-flex justify-content-center flex-column align-items-center'>
                            <h1 className='primaryTextBold my-10 mb-2'>
                              Sorry, no result found!
                            </h1>
                            <h3 className='primaryTextBold my-6  textAlignCenterMobile'>
                              Please check the spelling or try searching for something else
                            </h3>
                            <Link to='/' className=''>
                            <button className='primaryBtn btn btn-default px-15 mt-6' >Continue Shopping</button>
                      </Link>
                          
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </>
            )}


          </div>
        </div>
      </section>
    </ProductCardPageStyles>
  )
}

export default ProductCardPage

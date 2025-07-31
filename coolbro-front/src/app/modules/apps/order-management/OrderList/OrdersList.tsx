import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import * as authHelper from '../../../auth/core/AuthHelpers';
import { useAuth } from '../../../auth/core/Auth';
import ReactPaginate from 'react-paginate';
import { toAbsoluteUrl } from '../../../../../_metronic/helpers';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { OrdersListStyles } from './OrdersListStyles';
import { getFormattedDate } from '../../../../common/common';

export default function OrdersList() {
  const { saveAuth, setCurrentUser } = useAuth();
  const TOKEN = authHelper.getAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchItem, setSearchItem] = useState('');
  const [length, setLength] = useState(0);
  const paginationOptions = [10, 20, 50];
  const [selectedPageSize, setSelectedPageSize] = useState(paginationOptions[0]);
const statusOptions=['Processing', "Shipped", 'Delivered', "Cancelled"]
const [selectedStatus,setSelectedStatus] = useState()
  const changePage = ({ selected }: any) => {
    setPageNumber(selected + 1);
    getOrders(selected + 1, searchItem);
  };

  const handlePageSizeChange = (size: any) => {
    setPageNumber(1);
    setSelectedPageSize(size);
  };

const getOrders = useCallback(
  (pageNumber: number, selectedStatus: string | undefined = '') => {
    try {
      setLoading(true);
      axios
        .get(
          // order/get_order_with_pagination?page=1&limit=10 
          `${process.env.REACT_APP_SERVER_URL}/order/get_order_with_pagination?page=${pageNumber}&limit=${selectedPageSize}&deliveryStatus=${selectedStatus}`,
          { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
        )
        .then((res: any) => {
          if (res.data) {
            console.log("RES DATA DEALER", res.data);
            
            setLoading(false);
            if (res.data.data.length !== 0) {
              setOrders(res.data.data);
              setLength(res.data.totalRecords);
            } else {
              if (pageNumber > 1) {
                getOrders(pageNumber - 1, searchItem);
                setPageNumber(pageNumber - 1);
              }
            }
          } else {
            saveAuth(undefined);
            setCurrentUser(undefined);
          }
        })
        .catch((err) => {
          console.log(err);
          setCurrentUser(undefined);
          saveAuth(undefined);
        });
    } catch (err) {
      console.log(err);
      setCurrentUser(undefined);
      saveAuth(undefined);
    }
  },
  [TOKEN?.AccessToken, selectedPageSize, setOrders, setLength, setCurrentUser, saveAuth]
);

// const SearchData = (e: any) => {
//   const searchText = e.target.value;
//   setSearchItem(searchText);
//   setPageNumber(1);
//   getOrders(1, searchText);
// };


//   const deleteDealer = (id: any) => {
//     console.log("Got id is:", id);
    
    
//     confirmAlert({
//       title: 'Are you sure?',
//       message: 'Do you want to delete this user?',
//       buttons: [
//         {
//           label: 'Yes',
//           onClick: () => {
//             axios
//               .delete(`${process.env.REACT_APP_SERVER_URL}/dealer/${id}`, {
//                 headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
//               })
//               .then((res) => {
//                 if (res.data.message) {
//                   getDealer(pageNumber);
//                 }
//               });
//           },
//         },
//         {
//           label: 'Cancel',
//         },
//       ],
//     });
//   };
//   const handlePageSizeChange = (size: any) => {
//     setPageNumber(1);
//     setSelectedPageSize(size);
//   };
//   const getDealer = useCallback(
//     (pageNumber: number, searchItem: string | undefined = '') => {
//       try {
//         setLoading(true);
//         axios
//           .get( 
//             `${process.env.REACT_APP_SERVER_URL}/dealer/get_dealerdetails_with_pagination?page=${pageNumber}&limit=${selectedPageSize}&search=${searchItem}`,
//             { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
//           )
//           .then((res: any) => {
//             if (res.data) {
//               console.log("RES DATA DEALER", res.data);
              
//               setLoading(false);
//               if (res.data.data.length !== 0) {
//                 setDealer(res.data.data);
//                 setLength(res.data.totalRecords);
//               } else {
//                 if (pageNumber > 1) {
//                   getDealer(pageNumber - 1, searchItem);
//                   setPageNumber(pageNumber - 1);
//                 }
//               }
//             } else {
//               saveAuth(undefined);
//               setCurrentUser(undefined);
//             }
//           })
//           .catch((err) => {
//             console.log(err);
//             setCurrentUser(undefined);
//             saveAuth(undefined);
//           });
//       } catch (err) {
//         console.log(err);
//         setCurrentUser(undefined);
//         saveAuth(undefined);
//       }
//     },
//     [TOKEN?.AccessToken, selectedPageSize, setDealer, setLength, setCurrentUser, saveAuth]
//   );

//   const SearchData = (e: any) => {
//     const searchText = e.target.value;
//     setSearchItem(searchText);
//     setPageNumber(1);
//     getDealer(1, searchText);
//   };

  // const statusClasses: { [key: string]: string } = {
  //   Published: 'badge badge-light-success border-0',
  //   Inactive: 'badge badge-light-danger border-0',
  //   Publish: 'badge badge-light-info border-0',
  // };


  const renderStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      delivered: 'badge badge-light-success border-0',
      cancelled: 'badge badge-light-danger border-0',
      processing: 'badge badge-light-info border-0',
    };
    return (
      <button className={`fs-7 p-3 fw-bolder ${statusClasses[status] || ''}`}>
        {status}
      </button>
    );
  };

  useEffect(() => {
    getOrders(pageNumber, selectedStatus);
  }, [pageNumber, selectedStatus, getOrders]);

  const pageCount = Math.ceil(length / selectedPageSize);

  return (
    <OrdersListStyles>
      <div className='content d-flex flex-column flex-column-fluid '>
        <div className='post flex-column-fluid'>
          <div className='kt_content_container'>
            <div className='card rounded-4 border-1 shadow-xs'>
              <div className='card-header border-0 pt-6 justify-content-end'>
               
                <div className='card-toolbar flex-column-fluid1'>
               
                   <div className='btn-group'>
                  <button
                    type='button'
                    className='py-4 rounded-4 btn btn-light w-180px d-flex justify-content-between btn-active-light-primary btn-flex btn-center btn-lg me-4'
                    data-bs-toggle='dropdown'
                    data-kt-menu-trigger='click'
                    data-kt-menu-placement='bottom-end'
                  >
                    {selectedStatus ? selectedStatus : 'Delivery Status'}
                    <i className='ki-duotone ki-down fs-5 ms-1'></i>
                  </button>
                  <div className='dropdown-menu menu menu-sub w-150px menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                    {statusOptions.map((status:any) => (
                      <div
                        key={status}
                        className={`fs-6 py-2 dropdown-item menu-item px-3 cursor-pointer ${selectedStatus === status ? 'selected' : ''
                          }`}
                        onClick={() => setSelectedStatus(status.toLowerCase())}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
                  <div className='btn-group'>
                    <button
                      type='button'
                      className='py-4 rounded-4 btn btn-light d-flex justify-content-between btn-active-light-primary btn-flex btn-center btn-lg me-4'
                      data-bs-toggle='dropdown'
                      data-kt-menu-trigger='click'
                      data-kt-menu-placement='bottom-end'
                    >
                      Status
                      <i className='ki-duotone ki-down fs-5 ms-1'></i>
                    </button>
                    <div className='dropdown-menu menu menu-sub  menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>All</div>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Cancelled</div>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Completed</div>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Denied</div>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Expired</div>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Failed</div>




                    </div>
                  </div>
                  {/* <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
                    <NavLink to='/admin/dealer/add' className='primaryBtn rounded-4 commonMobilePX py-4 btn btn-primary'>
                      <i className='ki-duotone ki-plus fs-2'></i> Add Dealer
                    </NavLink>
                  </div> */}
                </div>
              </div>

    
              <div className='card-body py-4'>
                {orders.length > 0 ? (
                  <div className='dataTables_wrapper dt-bootstrap4 no-footer'>
                    <div className='table-responsive'>
                      <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                        <thead>
                          <tr className='text-start  fw-bold fs-7 text-uppercase gs-0'>
                            <th className='text-black min-w-125px fw-medium fs-6'>
                              Invoice Number
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              NAME
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              EMAIL
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Purchase Date
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Delivery Date
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Delivery Status
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Is Delivered
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Payment Status
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Total Amount
                            </th>
                            <th className='text-black min-w-125px fw-medium fs-6 text-end'>
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody className='text-gray-600 fw-semibold'>
                          {orders.map((data: any, index) => (
                            <tr key={index}>
                              {/* <td>
                                {data.Media_url ? (
                                  <div
                                    className='image-input '
                                    data-kt-image-input='true'
                                    style={{
                                      backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})`,
                                    }}
                                  >
                                    <div
                                      className='image-input-wrapper w-35px h-35px '
                                      style={{
                                        backgroundImage: `url(${toAbsoluteUrl(data.Media_url)})`,
                                      }}
                                    ></div>
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td> */}
                              <td className="text-black text-center">{data.Invoice_number ? data.Invoice_number : ''}</td>
                              <td className="text-center cellText">{data.UserName ? data.UserName : '-'}</td>
                              <td className="text-center cellText">{data.Email ? data.Email : '-'}</td>
                              <td className="text-center cellText">{data.Order_date ? getFormattedDate(data.Order_date) : '-'}</td>
                              <td className="text-center cellText">{data.Delivered_at ? getFormattedDate(data.Delivered_at) : ''}</td>
                              <td className="text-center cellText">{data.Delivery_status ?  renderStatusBadge(data.Delivery_status) : '-'}</td>
                              <td className="text-center cellText">{data.Is_delivered ? "Delivered" : 'Not Delivered'}</td>
                              <td className="text-center cellText">{data.Payment_status ? data.Payment_status : ''}</td>
                              <td className="text-center cellText">{data.Total_amount ? data.Total_amount : '-'}</td>


                       



                        
                              <td className='text-end'>
                                <div className='btn-group'>
                                  <button
                                    type='button'
                                    className='btn btn-light btn-active-light-primary btn-flex btn-center btn-sm'
                                    data-bs-toggle='dropdown'
                                    data-kt-menu-trigger='click'
                                    data-kt-menu-placement='bottom-end'
                                  >
                                    Actions
                                    <i className='ki-duotone ki-down fs-5 ms-1'></i>
                                  </button>
                                  <div className=' dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4 '>
                                    <div className='dropdown-item menu-item px-3'>
                                      <NavLink
                                        className='menu-link px-3'
                                        to={`/admin/orders/details/${data?.ID}`}
                                      >
                                        View Details
                                      </NavLink>
                                    </div>
                                    {/* <div className='dropdown-item menu-item px-3'>
                                      <div className='menu-link px-3' onClick={() => deleteDealer(data.UserDetails.UserID)}>
                                        Delete
                                      </div>
                                    </div> */}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : loading ? (
                  <span className='indicator-progress text-center d-block'>
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                ) : (
                  <div className='text-center w-90'>
                    <h2 className='mt-9'>Records not found</h2>
                  </div>
                )}
              <div className='d-flex justify-content-between align-items-center mt-5'>
                <button
                  type='button'
                  className='py-4 rounded-4 btn btn-light  btn-active-light-primary btn-flex btn-center btn-lg me-4'
                  data-bs-toggle='dropdown'
                  data-kt-menu-trigger='click'
                  data-kt-menu-placement='bottom-end'
                >
                  10
                  <i className='ki-duotone ki-down fs-5 ms-1'></i>
                </button>

                <div className='dropdown-menu menu menu-sub w-150px menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                      {paginationOptions.map((size) => (
                        <div
                          key={size}
                          className={`fs-6 py-2 dropdown-item menu-item px-3 ${selectedPageSize === size ? 'selected' : ''}`}
                          onClick={() => handlePageSizeChange(size)}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                <div className='dataTables_paginate paging_simple_numbers' id='kt_table_users_paginate'>
                  {orders.length > 0 ? (
                    <ReactPaginate
                      previousLabel={<i className='fa fa-angle-left'></i>}
                      nextLabel={<i className='fa fa-angle-right'></i>}
                      pageCount={pageCount}
                      onPageChange={changePage}
                      containerClassName={'pagination'}
                      pageClassName={'page-item'}
                      breakClassName={'break-me'}
                      pageLinkClassName={'page-link'}
                      previousClassName={'page-item'}
                      previousLinkClassName={'page-link'}
                      nextClassName={'page-item'}
                      nextLinkClassName={'page-link'}
                      activeClassName={'activePageStyle'}
                    />
                  ) : (
                    ''
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrdersListStyles>

  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import * as authHelper from '../../../auth/core/AuthHelpers';
import { useAuth } from '../../../auth/core/Auth';
import ReactPaginate from 'react-paginate';
import { KTIcon, toAbsoluteUrl } from '../../../../../_metronic/helpers';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { DealerListStyles } from './DealerListStyles';

export default function DealerList() {
  const { saveAuth, setCurrentUser } = useAuth();
  const TOKEN = authHelper.getAuth();
  const [dealer, setDealer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchItem, setSearchItem] = useState('');
  const [length, setLength] = useState(0);
  const paginationOptions = [10, 20, 50];
  const [selectedPageSize, setSelectedPageSize] = useState(paginationOptions[0]);


  const changePage = ({ selected }: any) => {
    setPageNumber(selected + 1);
    getDealer(selected + 1, searchItem);
  };

  const deleteDealer = (id: any) => {
    console.log("Got id is:", id);
    
    
    confirmAlert({
      title: 'Are you sure?',
      message: 'Do you want to delete this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            axios
              .delete(`${process.env.REACT_APP_SERVER_URL}/dealer/${id}`, {
                headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
              })
              .then((res) => {
                if (res.data.message) {
                  getDealer(pageNumber);
                }
              });
          },
        },
        {
          label: 'Cancel',
        },
      ],
    });
  };
  const handlePageSizeChange = (size: any) => {
    setPageNumber(1);
    setSelectedPageSize(size);
  };
  const getDealer = useCallback(
    (pageNumber: number, searchItem: string | undefined = '') => {
      try {
        setLoading(true);
        axios
          .get( 
            `${process.env.REACT_APP_SERVER_URL}/dealer/get_dealerdetails_with_pagination?page=${pageNumber}&limit=${selectedPageSize}&search=${searchItem}`,
            { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
          )
          .then((res: any) => {
            if (res.data) {
              console.log("RES DATA DEALER", res.data);
              
              setLoading(false);
              if (res.data.data.length !== 0) {
                setDealer(res.data.data);
                setLength(res.data.totalRecords);
              } else {
                if (pageNumber > 1) {
                  getDealer(pageNumber - 1, searchItem);
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
    [TOKEN?.AccessToken, selectedPageSize, setDealer, setLength, setCurrentUser, saveAuth]
  );

  const SearchData = (e: any) => {
    const searchText = e.target.value;
    setSearchItem(searchText);
    setPageNumber(1);
    getDealer(1, searchText);
  };

  const statusClasses: { [key: string]: string } = {
    Published: 'badge badge-light-success border-0',
    Inactive: 'badge badge-light-danger border-0',
    Publish: 'badge badge-light-info border-0',
  };

  useEffect(() => {
    getDealer(pageNumber, searchItem);
  }, [pageNumber, searchItem, getDealer]);

  const pageCount = Math.ceil(length / selectedPageSize);

  return (
    <DealerListStyles>
      <div className='content d-flex flex-column flex-column-fluid '>
        <div className='post flex-column-fluid'>
          <div className='kt_content_container'>
            <div className='card rounded-4 border-1 shadow-xs'>
              <div className='card-header border-0 pt-6'>
                <div className='card-title'>
                  <div className='d-flex align-items-center position-relative my-1'>
                    <i className='ki-duotone ki-magnifier fs-3 position-absolute ms-5'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                    <input
                      type='text'
                      data-kt-user-table-filter='search'
                      className='form-control rounded-4 py-4 form-control-solid w-250px ps-13 px-8'
                      placeholder='Search dealer'
                      value={searchItem}
                      onChange={SearchData}
                    />
                                     {searchItem.length > 0 && (
    <span onClick={() => setSearchItem('')} className='position-absolute end-0 top-50 translate-middle-y'>
      <KTIcon iconName='cross' className='fs-1 clear-all-icon' />
    </span>
  )}
                  </div>
                </div>
                <div className='card-toolbar flex-column-fluid1'>
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
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Published</div>
                      <div className='fs-6 py-2 dropdown-item menu-item px-3'>Inactive</div>
                    </div>
                  </div>
                  <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
                    <NavLink to='/admin/dealer/add' className='primaryBtn rounded-4 commonMobilePX py-4 btn btn-primary'>
                      <i className='ki-duotone ki-plus fs-2'></i> Add Dealer
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className='card-body py-4'>
                {dealer.length > 0 ? (
                  <div className='dataTables_wrapper dt-bootstrap4 no-footer'>
                    <div className='table-responsive'>
                      <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                        <thead>
                          <tr className='text-start  fw-bold fs-7 text-uppercase gs-0'>
                            <th className='text-black min-w-125px fw-medium fs-6'>
                              IMAGE
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              NAME
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              EMAIL
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              Phone
                            </th>
                            <th className='text-center text-black min-w-125px fw-medium fs-6'>
                              JOINED DATE
                            </th>
                            <th className='text-black min-w-125px fw-medium fs-6 text-end'>
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody className='text-gray-600 fw-semibold'>
                          {dealer.map((data: any, index) => (
                            <tr key={index}>
                              <td>
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
                              </td>
                              <td className="text-black text-center">{data.Name ? data.Name : ''}</td>
                              <td className="text-center cellText">{data.Email ? data.Email : ''}</td>
                              <td className="text-center cellText">{data.Phone ? data.Phone : ''}</td>
                              <td className="text-center">
                                {data.Status ? (
                                  <button className={'fs-7 p-3 fw-bolder ' + statusClasses[data.Status]}>
                                    {data.Status}
                                  </button>
                                ) : (
                                  '-'
                                )}
                              </td>
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
                                        to={`/admin/dealer/edit/${data.UserDetails?.UserID}`}
                                      >
                                        Edit
                                      </NavLink>
                                    </div>
                                    <div className='dropdown-item menu-item px-3'>
                                      <div className='menu-link px-3' onClick={() => deleteDealer(data.UserDetails.UserID)}>
                                        Delete
                                      </div>
                                    </div>
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
                  {dealer.length > 0 ? (
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
    </DealerListStyles>

  );
}

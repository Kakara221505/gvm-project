import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import * as authHelper from '../../../auth/core/AuthHelpers'
import { useAuth } from '../../../auth/core/Auth';
import ReactPaginate from 'react-paginate';
import { toAbsoluteUrl } from '../../../../../_metronic/helpers';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './ProductStatus.css';
import Swal from 'sweetalert2';
import { defaultDeleteErrorConfig, defaultDeleteSuccessConfig, defaultDeleteConfig } from '../../../../config/sweetAlertConfig';

export default function ProductList() {
  const { saveAuth, setCurrentUser } = useAuth();
  const TOKEN = authHelper.getAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchItem, setSearchItem] = useState('');
  const [length, setLength] = useState(0);

  const paginationOptions = [10, 20, 50];
  const [selectedPageSize, setSelectedPageSize] = useState(paginationOptions[0]);

  const statusOptions = ['Published', 'Inactive'];
  const [selectedStatus, setSelectedStatus] = useState('');

  const handlePageSizeChange = (size: any) => {
    setPageNumber(1);
    setSelectedPageSize(size);
  };

  const handleStatusChange = (status: any) => {
    setSelectedStatus(status);
  };

  const changePage = ({ selected }: any) => {
    setPageNumber(selected + 1);
    getProducts(selected + 1, searchItem);
  };

  const deleteProduct = async (id: any) => {
    const confirmDelete = await Swal.fire(defaultDeleteConfig);
    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/product/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN?.AccessToken}` },
        });

        if (response.data.message) {
          getProducts(pageNumber, searchItem);
          Swal.fire(defaultDeleteSuccessConfig);
        } else {
          Swal.fire(defaultDeleteErrorConfig);
        }
      } catch (error) {
        Swal.fire(defaultDeleteErrorConfig);
        console.error('Delete User Error:', error);
      }
    }
  };

  const getProducts = useCallback((page: number, search = '') => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_SERVER_URL}/product/get_product_with_pagination?page=${page}&limit=${selectedPageSize}&search=${search}&status=${selectedStatus}`,
        { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
      )
      .then((res) => {
        if (res.data) {
          console.log("PRODUCT APIDATA", res.data);
          
          setLoading(false);
          if (res.data.data.length !== 0) {
            setProducts(res.data.data);
            setLength(res.data.totalRecords);
          } else {
            if (page > 1) {
              getProducts(page - 1, search);
              setPageNumber(page - 1);
            }
            else{
              setProducts(res.data.data)
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
  }, [TOKEN?.AccessToken, selectedPageSize,selectedStatus, setProducts, setLength, setCurrentUser, saveAuth]);

  useEffect(() => {
    getProducts(1, '');
  }, [getProducts]);

  const searchProducts = (e: any) => {
    const searchText = e.target.value;
    setSearchItem(searchText);
    setPageNumber(1);
    getProducts(1, searchText);
  };

  const renderStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      Published: 'badge badge-light-success border-0',
      Inactive: 'badge badge-light-danger border-0',
      Draft: 'badge badge-light-info border-0',
    };
    return (
      <button className={`fs-7 p-3 fw-bolder ${statusClasses[status] || ''}`}>
        {status}
      </button>
    );
  };

  const renderQuantityColor = (realQuantity: any) => {
    if (realQuantity === 0) {
      return 'text-danger';
    } else if (realQuantity > 10) {
      return '';
    } else if (realQuantity <= 10) {
      return 'text-warning';
    } else {
      return 'text-danger';
    }
  };


  return (
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
                    className='form-control rounded-4 py-4 form-control-solid w-250px ps-13'
                    placeholder='Search Product'
                    value={searchItem}
                    onChange={searchProducts}
                  />
                </div>
              </div>
              <div className='card-toolbar'>
                <div className='btn-group'>
                  <button
                    type='button'
                    className='py-4 rounded-4 btn btn-light w-150px d-flex justify-content-between btn-active-light-primary btn-flex btn-center btn-lg me-4'
                    data-bs-toggle='dropdown'
                    data-kt-menu-trigger='click'
                    data-kt-menu-placement='bottom-end'
                  >
                    {selectedStatus ? selectedStatus : 'Status'}
                    <i className='ki-duotone ki-down fs-5 ms-1'></i>
                  </button>
                  <div className='dropdown-menu menu menu-sub w-150px menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className={`fs-6 py-2 dropdown-item menu-item px-3 cursor-pointer ${selectedStatus === status ? 'selected' : ''
                          }`}
                        onClick={() => handleStatusChange(status)}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
                <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
                  <NavLink to='/admin/product/add' className='primaryBtn rounded-4 py-4 btn btn-primary'>
                    <i className='ki-duotone ki-plus fs-2'></i> Add Product
                  </NavLink>
                </div>
              </div>
            </div>
            <div className='card-body py-4'>
              {products.length > 0 ?
                <div className='dataTables_wrapper dt-bootstrap4 no-footer'>
                  <div className='table-responsive'>
                    <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                      <thead>
                        <tr className='text-start text-muted fw-medium fs-6 text-uppercase gs-0'>
                          <th  className='text-black min-w-125px fw-medium fs-6'>
                            IMAGE
                          </th>
                          <th className='text-center text-black min-w-125px fw-medium fs-6'>
                            NAME
                          </th>
                          <th className='text-center text-black min-w-125px fw-medium fs-6'>
                            SKU
                          </th>
                          <th className='text-center text-black min-w-125px fw-medium fs-6'>
                            QTY
                          </th>
                          <th className='text-center text-black min-w-125px fw-medium fs-6'>
                            PRICE
                          </th>
                          <th className='text-center text-black min-w-125px fw-medium fs-6'>
                            STATUS
                          </th>
                          <th  className='min-w-125px text-black  fw-medium fs-6 text-end'>
                            ACTIONS
                          </th>
                        </tr>
                      </thead>

                      <tbody className='text-gray-600 fw-semibold'>
                        {products && products.length>0 ? products.map((product: any, index) => (
                          <tr key={index}>
                            <td>
                              {product?.Media_url ? (
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
                                      backgroundImage: `url(${toAbsoluteUrl(product.Media_url)})`,
                                    }}
                                  ></div>
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="text-black text-center">
                              {product.Name ? product.Name : '-'}
                            </td>
                            <td className="text-center cellText">
                              {product.SKU_number ? product.SKU_number : 'No'}
                            </td>
                            <td className="text-center">
                              <span className={`fw-bold ms-3 ${renderQuantityColor(product.Quantity)}`} >
                                {product.Quantity ? product.Quantity : '0'}
                              </span>
                            </td>
                            <td className="text-black text-center">
                              {/* { product?.Is_price === true ?  product?.Price : product?.Is_price_range === true ? `${product?.Min_price} - ${product?.Max_price} ` : '-' } */}
                              {product?.Price ? product?.Price : '-'}
                            </td>
                            <td className="text-center">
                              {product.Status ? renderStatusBadge(product.Status) : '-'}
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
                                <div className='dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                                  <div className='dropdown-item menu-item px-3'>
                                    <NavLink
                                      className='menu-link px-3'
                                      to={`/admin/product/edit/${product.ID}`}
                                    >
                                      Edit
                                    </NavLink>
                                  </div>
                                  <div className='dropdown-item menu-item px-3'>
                                    <div
                                      className='menu-link px-3'
                                      onClick={() => deleteProduct(product.ID)}
                                    >
                                      Delete
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )) :
                         <div>No Products Found</div>
                        }
                      </tbody>
                    </table>
                  </div>
                  <div className='d-flex justify-content-between align-items-center'>
                    <button
                      type='button'
                      className='py-4 rounded-4 btn btn-light btn-active-light-primary btn-flex btn-center btn-lg me-4'
                      data-bs-toggle='dropdown'
                      data-kt-menu-trigger='click'
                      data-kt-menu-placement='bottom-end'
                    >
                      {selectedPageSize}
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
                      {products.length > 0 ? (
                        <ReactPaginate
                          previousLabel={<i className='fa fa-angle-left'></i>}
                          nextLabel={<i className='fa fa-angle-right'></i>}
                          pageCount={Math.ceil(length / selectedPageSize)}
                          onPageChange={changePage}
                          containerClassName={'pagination'}
                          pageClassName={'page-item'}
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
                : loading ? (
                  <span className='indicator-progress text-center d-block' >
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                ) : <div className='text-center w-90'><h2 className='mt-9'>Records not found</h2></div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


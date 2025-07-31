import React, {useCallback, useEffect, useState} from 'react'
import {NavLink} from 'react-router-dom'
import axios from 'axios'
import * as authHelper from '../../../auth/core/AuthHelpers'
import {useAuth} from '../../../auth/core/Auth'
import ReactPaginate from 'react-paginate'
import Swal from 'sweetalert2'
import {
  defaultDeleteErrorConfig,
  defaultDeleteSuccessConfig,
  defaultDeleteConfig,
} from '../../../../config/sweetAlertConfig'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'

export default function UserList() {
  const {saveAuth, setCurrentUser} = useAuth()
  const TOKEN = authHelper.getAuth()
  const [Users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  let [pageNumber, setPageNumber] = useState(1)
  const [searchItem, setSearchItem] = useState('')
  const [length, setLength] = useState(0)
  const pagesize = 10

  const changePage = ({selected}: any) => {
    setPageNumber(selected + 1)
    getUsers(selected + 1, searchItem)
  }

  const deleteUser = async (id: any) => {
    const confirmDelete = await Swal.fire(defaultDeleteConfig)
    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/users/${id}`, {
          headers: {Authorization: `Bearer ${TOKEN?.AccessToken}`},
        })

        if (response.data.message) {
          getUsers(pageNumber, searchItem)
          Swal.fire(defaultDeleteSuccessConfig)
        } else {
          Swal.fire(defaultDeleteErrorConfig)
        }
      } catch (error) {
        Swal.fire(defaultDeleteErrorConfig)
        console.error('Delete User Error:', error)
      }
    }
  }

  const getUsers = useCallback(
    (pageNumber: number, searchItem: string | undefined = '') => {
      try {
        setLoading(true)
        axios
          .get(
            `${process.env.REACT_APP_SERVER_URL}/userdetail/get_userdetails_with_pagination?page=${pageNumber}&limit=${pagesize}&search=${searchItem}`,
            {headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken}}
          )
          .then((res: any) => {
            if (res.data) {
              setLoading(false)
              if (res.data.users.length !== 0) {
                setUsers(res.data.users)
                setLength(res.data.totalRecords)
              } else {
                if (pageNumber > 1) {
                  getUsers(pageNumber - 1, searchItem)
                  setPageNumber(pageNumber - 1)
                }
              }
            } else {
              saveAuth(undefined)
              setCurrentUser(undefined)
            }
          })
          .catch((err) => {
            console.log(err)
            setCurrentUser(undefined)
            saveAuth(undefined)
          })
      } catch (err) {
        console.log(err)
        setCurrentUser(undefined)
        saveAuth(undefined)
      }
    },
    [TOKEN?.AccessToken, pagesize, setUsers, setLength, setCurrentUser, saveAuth]
  )

  const SearchData = (e: any) => {
    setSearchItem(e.target.value)
    setPageNumber(1) // Reset to the first page when searching
    getUsers(1, e.target.value)
  }

  useEffect(() => {
    getUsers(pageNumber, searchItem)
  }, [pageNumber, searchItem, getUsers])

  const pageCount = Math.ceil(length / pagesize)

  return (
    <>
      <div className='content d-flex flex-column flex-column-fluid '>
        <div className='post flex-column-fluid'>
          <div className='kt_content_container'>
            <div className='card'>
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
                      className='rounded-4 py-4 form-control form-control-solid w-250px ps-13'
                      placeholder='Search user'
                      value={searchItem}
                      onChange={SearchData}
                    />
                  </div>
                </div>
                {/* <div className='card-toolbar'>
                                <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
                                    <NavLink to="/admin/user/add" className="primaryBtn btn py-4 btn-primary">
                                        <i className="ki-duotone ki-plus fs-2"></i> Add User
                                    </NavLink>
                                </div>
                            </div> */}
              </div>
              <div className='card-body py-4'>
                {Users.length > 0 ? (
                  <div className='dataTables_wrapper dt-bootstrap4 no-footer'>
                    <div className='table-responsive'>
                      <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                        <thead>
                          <tr className='text-start text-muted fw-medium fs-6 text-uppercase gs-0'>
                            <th className='text-black min-w-125px fw-medium'>Image</th>
                            <th className='text-black min-w-125px fw-medium'> Name </th>
                            <th className='text-black min-w-125px fw-medium'> Email </th>
                            <th className='text-black min-w-125px fw-medium'> Phone </th>
                            <th className='text-black min-w-125px fw-medium'> Otp Verified </th>
                            <th className='min-w-125px text-black fw-medium text-end'> Actions </th>
                          </tr>
                        </thead>
                        <tbody className='text-gray-600 fw-semibold'>
                          {Users.map((user: any, index) => (
                            <tr key={index}>
                              <td>
                                <div
                                  className='image-input '
                                  data-kt-image-input='true'
                                  style={{
                                    backgroundImage: `url(${toAbsoluteUrl(
                                      '/media/avatars/blank.png'
                                    )})`,
                                  }}
                                >
                                  <div
                                    className='image-input-wrapper w-35px h-35px '
                                    style={{
                                      backgroundImage: `url(${toAbsoluteUrl(user.Media_url)})`,
                                    }}
                                  ></div>
                                </div>
                              </td>
                              <td className='text-black'>{user.Name ? user.Name : '-'}</td>
                              <td className='text-black'>{user.Email ? user.Email : '-'}</td>
                              <td className='text-black'>
                                {user.Phone
                                  ? (user.Country_code ? user.Country_code : '') + user.Phone
                                  : '-'}
                              </td>
                              <td className='text-black'>{user.Is_otp_verified ? 'Yes' : 'No'}</td>
                              <td className='text-end'>
                                <div className='btn-group' style={{position: 'relative'}}>
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
                                  <div
                                    className='dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'
                                    style={{position: 'absolute', top: '100%', zIndex: 9999}}
                                  >
                                    <div className='dropdown-item menu-item px-3'>
                                      <NavLink
                                        className='menu-link px-3'
                                        to={`/admin/user/edit/${user.ID}`}
                                      >
                                        Edit
                                      </NavLink>
                                    </div>
                                    <div className='dropdown-item menu-item px-3'>
                                      <div
                                        className='menu-link px-3'
                                        onClick={() => deleteUser(user.ID)}
                                      >
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
                    <div className=' d-flex justify-content-between align-items-center '>
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
                        <div className='fs-6 py-2 dropdown-item menu-item  px-3'>5</div>
                        <div className='fs-6 py-2 dropdown-item menu-item px-3'>3</div>
                      </div>
                      <div className='col-sm-24  d-flex align-items-center justify-content-center justify-content-md-end'>
                        <div
                          className='dataTables_paginate paging_simple_numbers'
                          id='kt_table_users_paginate'
                        >
                          {Users.length > 0 ? (
                            <ReactPaginate
                              previousLabel={'Previous'}
                              nextLabel={'Next'}
                              pageCount={pageCount}
                              onPageChange={changePage}
                              containerClassName={'pagination'} // CSS class for the pagination container
                              pageClassName={'page-item'} // CSS class for individual page items
                              pageLinkClassName={'page-link'} // CSS class for page links
                              previousClassName={'page-item'}
                              previousLinkClassName={'page-link'}
                              nextClassName={'page-item'}
                              nextLinkClassName={'page-link'}
                              activeClassName={'activePageStyle'} // CSS class for the active page
                            />
                         
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  <span className='indicator-progress text-center' style={{display: 'block'}}>
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                ) : (
                  <div className='text-center w-90'>
                    <h2 className='mt-9'>Records not found</h2>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

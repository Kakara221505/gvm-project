import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../auth'
import * as authHelper from '../../../auth/core/AuthHelpers'
import { Modal, Button } from 'react-bootstrap'
import { KTIcon, toAbsoluteUrl } from '../../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import ReactPaginate from 'react-paginate'
import Swal from 'sweetalert2'
import {
  defaultDeleteErrorConfig,
  defaultDeleteSuccessConfig,
  defaultDeleteConfig,
  defaultFormSubmitConfig,
  defaultFormErrorConfig,
} from '../../../../config/sweetAlertConfig'

const validationSchema = Yup.object().shape({
  Name: Yup.string().trim().required('Category Name is required'),
  Image_url: Yup.string().required('Image is required'),
})

export default function CategoryList() {
  const { saveAuth, setCurrentUser } = useAuth()
  const TOKEN = authHelper.getAuth()
  const [category, setCategory] = useState([])
  const [CategoryID, setCategoryID] = useState(null)
  const [editCategory, setEditCategory] = useState(false)
  const [submitCategory, setSubmitCategory] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [searchItem, setSearchItem] = useState('')
  const [length, setLength] = useState(0)
  const [loading, setLoading] = useState(true)
  const paginationOptions = [10, 20, 50];
  const [selectedPageSize, setSelectedPageSize] = useState(paginationOptions[0]);


  // const pagesize = 10
  // const TOKEN = localStorage.getItem('token');

  const formik = useFormik({
    initialValues: {
      Name: '',
      Image_url: '',
      CategoryImageURL: '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Handle form submission
      try {
        const trimmedCategoryName = values.Name.trim()

        // Check if the DiagnosisName is empty after removing spaces
        if (trimmedCategoryName === '') {
          formik.setFieldError('Name', 'Category Name is required')
          formik.setFieldValue('Name', '')
          return
        }
        setSubmitCategory(true)

        let formData = new FormData()
        formData.append('Name', trimmedCategoryName)
        if (values.CategoryImageURL !== '') {
          formData.append('CategoryImageURL', values.CategoryImageURL)
        }
        try {
          if (editCategory) {
            if (CategoryID !== null) {
              formData.append('id', CategoryID)
            }
          }
          axios
            .post(`${process.env.REACT_APP_SERVER_URL}/category/add_update_category`, formData, {
              headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
            })
            .then(async (res) => {
              if (res.status === 200 && res.data.message) {
                getCategories(pageNumber)
                const confirmAdd = await Swal.fire(defaultFormSubmitConfig)
                if (confirmAdd.isConfirmed) {
                  handleClose()
                }
              } else {
                setSubmitCategory(false)
                Swal.fire(defaultFormErrorConfig)
                // Handle other status codes or error messages
                if (res.status === 400) {
                  // Display an error message for bad request
                  console.log('Bad Request: ', res.data.error)
                } else if (res.status === 401) {
                  // Display an error message for unauthorized access
                  console.log('Unauthorized: ', res.data.error)
                } else {
                  // Handle other status codes
                  console.log('Error: ', res.data.error)
                }
              }
            })
            .catch((err) => {
              console.log(err)
              Swal.fire(defaultFormErrorConfig)
              //formik.setFieldError('Name', err.response.data.message);
              setSubmitCategory(false)
              // Handle the error
            })
        } catch (err) {
          Swal.fire(defaultFormErrorConfig)
          setSubmitCategory(false)
          // Handle the error
        }
      } catch (err) {
        Swal.fire(defaultFormErrorConfig)
        setSubmitCategory(false)
      }
    },
  })

  const handleShow = (item: any) => {
    setSubmitCategory(false)
    setShowModal(true)
    setEditCategory(true)
    setCategoryID(item.ID)
    formik.setValues({ Name: item.Name, Image_url: item.Image_url, CategoryImageURL: '' })
  }

  const openModal = () => {
    setSubmitCategory(false)
    setShowModal(true)
  }

  const changePage = ({ selected }: any) => {
    setPageNumber(selected + 1)
    getCategories(selected + 1, searchItem)
  }

  const deleteCategory = async (id: any) => {
    const confirmDelete = await Swal.fire(defaultDeleteConfig)
    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/category/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN?.AccessToken}` },
        })

        if (response.data.message) {
          getCategories(pageNumber, searchItem)
          Swal.fire(defaultDeleteSuccessConfig)
        } else {
          Swal.fire(defaultDeleteErrorConfig)
        }
      } catch (error) {
        Swal.fire(defaultDeleteErrorConfig)
        console.error('Delete Category Error:', error)
      }
    }
  }
  const handlePageSizeChange = (size: any) => {
    setPageNumber(1);
    setSelectedPageSize(size);
  };
  const handleClose = () => {
    setShowModal(false)
    setEditCategory(false)
    setSubmitCategory(false)
    setCategoryID(null)
    formik.resetForm()
  }

  const handleCategoryImageChange = async (e: any, setFieldValue: any) => {
    if (e.target.value) {
      const file = e.target.files[0]
      // Handle file change logic
      setFieldValue('Image_url', URL.createObjectURL(file))
      setFieldValue('CategoryImageURL', file)
    }
  }

  const getCategories = useCallback(
    (pageNumber: number, searchItem: string | undefined = '') => {
      try {
        setLoading(true)
        axios
          .get(
            `${process.env.REACT_APP_SERVER_URL}/category/get_category_with_pagination?page=${pageNumber}&limit=${selectedPageSize}&search=${searchItem}`,
            { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
          )
          .then((res) => {
            if (res.data) {
              setLoading(false)
              if (res.data.data.length !== 0) {
                setCategory(res.data.data)
                setLength(res.data.totalRecords)
              } else {
                if (pageNumber > 1) {
                  getCategories(pageNumber - 1, searchItem)
                  setPageNumber(pageNumber - 1)
                }
                else{
                  setCategory(res?.data?.data)
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
    [TOKEN?.AccessToken, selectedPageSize, setCategory, setLength, setCurrentUser, saveAuth]
  )

  const SearchData = (e: any) => {
    const searchVal=e.target.value.trimStart();

       setSearchItem(searchVal)
    
    setPageNumber(1) // Reset to the first page when searching
    getCategories(1, e.target.value)
  }

  useEffect(() => {
    getCategories(pageNumber, searchItem)
  }, [pageNumber, searchItem, getCategories])

  const pageCount = Math.ceil(length / selectedPageSize)

  return (<>
    <div className="content d-flex flex-column flex-column-fluid ">
      <div className="post flex-column-fluid">
        <div className="kt_content_container">
          <div className="card">
            <div className="card-header border-0 pt-6">
              <div className="card-title">
                <div className="d-flex align-items-center position-relative my-1">
                  <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5"><span className="path1"></span><span className="path2"></span></i>
                  <input type="text" data-kt-user-table-filter="search" className="py-3 rounded-4 form-control form-control-solid w-250px ps-13 mx-8" placeholder="Search category" value={searchItem}
                    onChange={SearchData} />
                                     {searchItem.length > 0 && (
    <span onClick={() => setSearchItem('')} className='position-absolute end-0 top-50 translate-middle-y'>
      <KTIcon iconName='cross' className='fs-1 clear-all-icon' />
    </span>
  )}
                </div>
              </div>
              <div className='card-toolbar'>
                <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
                  <button className="primaryBtn rounded-4 py-4 btn btn-primary" onClick={openModal}>
                    <i className="ki-duotone ki-plus fs-2"></i>        Add Category
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body py-4">
              {category.length > 0 ?
                <div className='dataTables_wrapper dt-bootstrap4 no-footer'>
                  <div className="table-responsive" >
                    <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
                      <thead>
                        <tr className='text-start text-muted fw-medium fs-6 text-uppercase gs-0'>
                          <th className='text-black min-w-125px fw-medium'>Category Image</th>
                          <th className='text-black min-w-125px fw-medium'>Category Name</th>
                          <th className='min-w-125px text-black fw-medium text-end'>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-gray-600 fw-semibold'>
                        {
                          category.map((item: any, index) => (
                            <tr key={index}>
                              <td>
                                <div
                                  className='image-input '
                                  data-kt-image-input='true'
                                  style={{ backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})` }}
                                >
                                  <div
                                    className='image-input-wrapper w-35px h-35px '
                                    style={{ backgroundImage: `url(${toAbsoluteUrl(item.Image_url)})` }}
                                  ></div>
                                </div>
                              </td>
                              <td className='text-black'>
                                {item.Name ? item.Name : ''}
                              </td>
                              <td className='text-end'>
                                <div className="btn-group">
                                  <button
                                    type="button"
                                    className="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm"
                                    data-bs-toggle="dropdown"
                                    data-kt-menu-trigger="click"
                                    data-kt-menu-placement="bottom-end"
                                  >
                                    Actions
                                    <i className="ki-duotone ki-down fs-5 ms-1"></i>
                                  </button>
                                  <div className="dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4">
                                    <div className="dropdown-item menu-item px-3">
                                      <div className="menu-link px-3" onClick={() => handleShow(item)}>Edit</div>
                                    </div>
                                    <div className="dropdown-item menu-item px-3">
                                      <div className="menu-link px-3" onClick={() => deleteCategory(item.ID)}>Delete</div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
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
                    <div
                      className='dataTables_paginate paging_simple_numbers'
                      id='kt_table_users_paginate'
                    >
                      {category.length > 0 ? (
                        <ReactPaginate
                          previousLabel={<i className='fa fa-angle-left'></i>}
                          nextLabel={<i className='fa fa-angle-right'></i>}
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
                : loading ? (
                  <span className='indicator-progress text-center d-block' >
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                )
                  : <div className='text-center w-90'><h2 className='mt-9'>Records not found</h2></div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal show={showModal} onHide={handleClose} dialogClassName="modal-dialog modal-dialog-centered mw-650px">
      <Modal.Header className='px-10'>
        <h2>{editCategory ? 'Edit Category' : 'Add Category'}</h2>
        <button className="btn btn-sm btn-icon btn-active-color-primary" onClick={handleClose}>
          <i className="ki-duotone ki-cross fs-1"><span className="path1"></span><span className="path2"></span></i>
        </button>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Body className='scroll-y px-10 pb-0'>
          <div className="fv-row mb-7  d-flex flex-column align-items-center">
            <label className="d-block fw-semibold fs-6 mb-5"></label>
            <div className="image-input image-input-outline image-input-placeholder" data-kt-image-input="true" style={{ backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})` }}>
              <div className="position-relative image-input-wrapper w-150px h-150px rounded-circle shadow-sm" style={{ backgroundImage: `url(${toAbsoluteUrl(formik.values.Image_url)})` }}></div>
              <label style={{ top: 'auto', bottom: '0' }}
                className='pe-10 btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body ' data-kt-image-input-action="change" data-bs-toggle="tooltip" aria-label="Change avatar" data-bs-original-title="Change avatar" data-kt-initialized="1">
                <img
                  alt='Logo'
                  src={toAbsoluteUrl('/media/vectors/Edit Square.png')}
                  className=' fs-2'
                />                                <input type="file" name="Image_url" accept=".png, .jpg, .jpeg" onChange={(e) => handleCategoryImageChange(e, formik.setFieldValue)} />
              </label>
              <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="cancel" data-bs-toggle="tooltip" aria-label="Cancel avatar" data-bs-original-title="Cancel avatar" data-kt-initialized="1">
                <i className="ki-duotone ki-cross fs-2"><span className="path1"></span><span className="path2"></span></i>
              </span>
            </div>
            <p className='text-black fs-6 mt-4 mb-0 text-center'>
              Set the product thumbnail image. <br /> Only *.png *jpg and *jpeg <br /> image files are accepted{' '}
            </p>                        {formik.touched.Image_url && formik.errors.Image_url && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{String(formik.errors.Image_url)}</div>
              </div>
            )}
          </div>
          <div className="fv-row mb-7 fv-plugins-icon-container fv-plugins-bootstrap5-row-valid">
            <div className='mb-3'>
              <div className='form-group'>
                <input
                  placeholder=''
                  className={`form-control form-control-solid bg-transparent shadow-none  customInput ${formik.touched.Name && formik.errors.Name ? 'is-invalid' : ''
                    }`}
                  id='Name'
                  name='Name'
                  value={formik.values.Name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete='off'
                />
                {formik.touched.Name && formik.errors.Name && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{formik.errors.Name}</div>
                  </div>
                )}
                <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>
                  Category Name
                </label>
              </div>
              {/* <input
                    type='text'
                    className='form-control'
                    id='floatingInputVariable'
                    placeholder='Variation'
                  /> */}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className='text-center pt-15'>
          <Button className='primaryOutlineBtn bg-transparent px-12' onClick={handleClose}>
            Discard
          </Button>
          <Button className='primaryBtn px-14' disabled={submitCategory} type='submit'>
            <span
              className='indicator-label'
              style={{ display: submitCategory ? 'none' : 'block' }}
            >
              Submit
            </span>
            <span
              className='indicator-progress'
              style={{ display: submitCategory ? 'block' : 'none' }}
            >
              Please wait...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  </>
  )
}

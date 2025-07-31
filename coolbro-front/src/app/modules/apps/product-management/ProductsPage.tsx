import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/admin-layout/core'
import ProductList from './products-list/ProductList'
import EditProduct from './products-list/EditProduct'
import AddProduct from './products-list/AddProduct'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Product Settings',
    path: '/admin/product/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const ProductsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Products</PageTitle>
              <ProductList />
            </>
          }
        />
      </Route>
      <Route
        path='add'
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Add Product</PageTitle>
            <AddProduct />
          </>
        }
      />
      <Route
        path='edit/:productId'
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Edit Product</PageTitle>
            <EditProduct />
          </>
        }
      />

      <Route index element={<Navigate to='/admin/product/list' />} />
    </Routes>
  )
}

export default ProductsPage

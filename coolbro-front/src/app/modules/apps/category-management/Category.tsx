import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
import CategoryList from './category/CategoryList'


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

const Category = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Categories</PageTitle>
              <CategoryList />
            </>
          }
        />
      </Route>

      <Route index element={<Navigate to='/admin/category/list' />} />
    </Routes>
  )
}

export default Category

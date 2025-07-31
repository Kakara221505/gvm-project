import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
import BrandList from './brand/BrandList'


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

const Brand = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Brands</PageTitle>
              <BrandList />
            </>
          }
        />
      </Route>

      <Route index element={<Navigate to='/admin/brand/list' />} />
    </Routes>
  )
}

export default Brand

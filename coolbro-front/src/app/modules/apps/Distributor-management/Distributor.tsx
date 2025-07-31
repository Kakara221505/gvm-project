import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
import DistributorList from './DistributorList/DistributorList'
import AddDistributor from './Add-Distributor/AddDistributor'


const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Distributor',
    path: '/admin/distributor/list',
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

const Distributor = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Distributor</PageTitle>
              <DistributorList />
            </>
          }
        />
      </Route>

      <Route
        path='add'
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Add Distributor</PageTitle>
            <AddDistributor />
          </>
        }
      />

<Route
        path='edit/:distributorId'
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Edit Distributor</PageTitle>
            <AddDistributor  />
          </>
        }
      />

      <Route index element={<Navigate to='/admin/distributor/list' />} />
    </Routes>
  )
}

export default Distributor

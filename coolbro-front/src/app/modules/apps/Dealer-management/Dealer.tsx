import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
import DistributorList from './DealerList/DealerList'
import AddDistributor from './Add-Dealer/AddDealer'


const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Dealer',
    path: '/admin/dealer/list',
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

const Dealer = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Dealer</PageTitle>
              <DistributorList />
            </>
          }
        />
      </Route>

      <Route
        path='add'
        element={
          <>  
            <PageTitle breadcrumbs={usersBreadcrumbs}> Add Dealer</PageTitle>
            <AddDistributor />
          </>
        }
      />

<Route
        path='edit/:dealerId'
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Edit Dealer</PageTitle>
            {/* <EditProduct /> */}
             <AddDistributor />
          </>
        }
      />

      <Route index element={<Navigate to='/admin/dealer/list' />} />
    </Routes>
  )
}

export default Dealer

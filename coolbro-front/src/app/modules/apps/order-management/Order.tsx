import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
import OrdersList from './OrderList/OrdersList'
import OrderDetails from './OrderDetails/OrderDetails'
// import OrderList from './OrderList'
// import DistributorList from './DealerList/DealerList'
// import AddDistributor from './Add-Dealer/AddDealer'


const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Orders',
    path: '/admin/orders/list',
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

const Order = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Orders</PageTitle>
              <OrdersList />
            </>
          }
        />
      </Route>

      <Route
        path={`details/:orderID`}
        element={
          <>  
            <PageTitle breadcrumbs={usersBreadcrumbs}> Order Details</PageTitle>
            <OrderDetails />
          </>
        }
      />



      <Route index element={<Navigate to='/admin/orders/list' />} />
    </Routes>
  )
}

export default Order

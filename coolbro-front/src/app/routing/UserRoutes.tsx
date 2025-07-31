import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'


const UserRoutes = () => {
  const MyProfile = lazy(() => import('../pages/MyProfile/MyProfile'))
  const MyCart = lazy(() => import('../pages/MyCart/MyCart'))
  const Checkout = lazy(() => import('../pages/Checkout/Checkout'))
  const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation/OrderConfirmation'))
  const MyOrderDetails = lazy(() => import('../pages/MyProfile/MyProfileInnerPages/MyOrderDetailsSection/MyOrderDetailsSection'))


  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route path='auth/*' element={<Navigate to='/' />} />
        {/* <Route path='*' element={<Navigate to='/' />} />  */}
        <Route
          path='/my-profile'
          element={
            <SuspenseView>
              <MyProfile />
            </SuspenseView>
          }
        />
        <Route
          path='/cart'
          element={
            <SuspenseView>
              <MyCart />
            </SuspenseView>
          }
        />
        <Route
          path='/checkout'
          element={
            <SuspenseView>
              <Checkout />
            </SuspenseView>
          }
        />
        <Route
          path='/confirmation/:orderId'
          element={
            <SuspenseView>
              <OrderConfirmation />
            </SuspenseView>
          }
        />
        <Route
          path='/order-details/:orderId'
          element={
            <SuspenseView>
              <MyOrderDetails />
            </SuspenseView>
          }
        />

        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspenseView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {UserRoutes}

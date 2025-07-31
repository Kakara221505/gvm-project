import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/admin-layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import DashboardWrapper from '../pages/dashboard/DashboardWrapper'
import MenuTestPage from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'

const PrivateRoutes = () => {
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const CategoryPage = lazy(() => import('../modules/apps/category-management/Category'))
  const DistributorPage = lazy(() => import('../modules/apps/Distributor-management/Distributor'))
  const DealerPage = lazy(() => import('../modules/apps/Dealer-management/Dealer'))
  const BrandPage = lazy(() => import('../modules/apps/brand-management/Brand'))
  const EnergyEfficiencyRatingPage = lazy(
    () => import('../modules/apps/energyEfficiencyRating-management/EnergyEfficiencyRating')
  )
  const ProductsPage = lazy(() => import('../modules/apps/product-management/ProductsPage'))
  const OrdersPage = lazy(()=> import('../modules/apps/order-management/Order'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registration */}
        <Route path='auth/*' element={<Navigate to='/admin/dashboard' />} />
        {/* Pages */}
        <Route path='/dashboard' element={<DashboardWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />
        {/* Lazy Modules */}
        <Route
          path='/user/*'
          element={
            <SuspenseView>
              <UsersPage />
            </SuspenseView>
          }
        />
        <Route
          path='/distributor/*'
          element={
            <SuspenseView>
              <DistributorPage />
            </SuspenseView>
          }
        />
        <Route
          path='/dealer/*'
          element={
            <SuspenseView>
              <DealerPage />
            </SuspenseView>
          }
        />
        <Route
          path='/product/*'
          element={
            <SuspenseView>
              <ProductsPage />
            </SuspenseView>
          }
        />
           <Route
          path='/orders/*'
          element={
            <SuspenseView>
              <OrdersPage />
            </SuspenseView>
          }
        />

        <Route
          path='/category/*'
          element={
            <SuspenseView>
              <CategoryPage />
            </SuspenseView>
          }
        />
        <Route
          path='/brand/*'
          element={
            <SuspenseView>
              <BrandPage />
            </SuspenseView>
          }
        />
        <Route
          path='/energyEfficiencyRating/*'
          element={
            <SuspenseView>
              <EnergyEfficiencyRatingPage />
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

export {PrivateRoutes}

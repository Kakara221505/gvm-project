import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'


const PublicRoutes = () => {
  const HomePage = lazy(() => import('../pages/HomePage/HomePage'))
  const RatingAndReviewPage = lazy(() => import('../pages/RatingAndReviewPage/RatingAndReviewPage'));
  const ProductListPage = lazy(() => import('../pages/ProductListPage/ProductListPage'));
  const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage/ProductDetailsPage'));
  const DealerListPage = lazy(() => import('../pages/DealerListPage/DealerListPage'));
  const DealerDetailsPage = lazy(() => import('../pages/DealerDetailsPage/DealerDetailsPage'));
  const AboutUsPage = lazy(() => import('../pages/AboutUsPage/AboutUsPage'));
  const FAQsPage = lazy(() => import('../pages/FAQsPage/FAQsPage'));
  const ContactUsPage = lazy(() => import('../pages/ContactUsPage/ContactUsPage'));
  const TermsAndConditionPage = lazy(() => import('../pages/TermsAndConditionPage/TermsAndConditionPage'));
  const PrivacyAndPolicyPage = lazy(() => import('../pages/PrivacyAndPolicyPage/PrivacyAndPolicyPage'));
  const DownloadAppPage = lazy(() => import('../pages/DownloadAppPage/DownloadAppPage'));


  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* <Route path='auth/*' element={<Navigate to='/dashboard' />} /> */}
        <Route path='*' element={<Navigate to='/' />} />
        {/* Pages */}
        <Route
          path='/'
          element={
            <SuspenseView>
              <HomePage />
            </SuspenseView>
          }
        />
        <Route
          path='/product-list/:searchQuery?'
          element={
            <SuspenseView>
              <ProductListPage
                visibleFilterOffCanvas={(showOffCanvas) => {
                  // Implement the logic you want for visibleFilterOffCanvas here
                  console.log('visibleFilterOffCanvas called with:', showOffCanvas);
                }}
                showOffCanvas={false}
                setShowOffCanvas={(value) => {
                  // Implement the logic you want for setShowOffCanvas here
                  console.log('setShowOffCanvas called with:', value);
                }}
              />
            </SuspenseView>
          }
        />
        <Route
          path='/product-details/:productId'
          element={
            <SuspenseView>
              <ProductDetailsPage />
            </SuspenseView>
          }
        />
        <Route
          path='/dealer-list'
          element={
            <SuspenseView>
              <DealerListPage />
            </SuspenseView>
          }
        />
        <Route
          path='/dealer-details/:dealerId'
          element={
            <SuspenseView>
              <DealerDetailsPage />
            </SuspenseView>
          }
        />
           <Route
          path='/reviews/:type/:id'
          element={
            <SuspenseView>
              <RatingAndReviewPage />
            </SuspenseView>
          }
        />
        <Route
          path='/about-us'
          element={
            <SuspenseView>
              <AboutUsPage />
            </SuspenseView>
          }
        />
        <Route
          path='/faq'
          element={
            <SuspenseView>
              <FAQsPage />
            </SuspenseView>
          }
        />
        <Route
          path='/contact-us'
          element={
            <SuspenseView>
              <ContactUsPage />
            </SuspenseView>
          }
        />
        <Route
          path='/terms-and-conditions'
          element={
            <SuspenseView>
              <TermsAndConditionPage />
            </SuspenseView>
          }
        />
               <Route
          path='/privacy-and-policy'
          element={
            <SuspenseView>
              <PrivacyAndPolicyPage />
            </SuspenseView>
          }
        />
        <Route
          path='/download-app'
          element={
            <SuspenseView>
              <DownloadAppPage />
            </SuspenseView>
          }
        />

        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspenseView: FC<WithChildren> = ({ children }) => {
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

export { PublicRoutes }

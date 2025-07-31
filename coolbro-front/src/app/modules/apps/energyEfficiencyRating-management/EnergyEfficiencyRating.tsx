import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
import EnergyEfficiencyRatingList from './energyEfficiencyRating/EnergyEfficiencyRatingList'


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

const EnergyEfficiencyRating = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Energy Efficiency Ratings</PageTitle>
              <EnergyEfficiencyRatingList />
            </>
          }
        />
      </Route>

      <Route index element={<Navigate to='/admin/energyEfficiencyRating/list' />} />
    </Routes>
  )
}

export default EnergyEfficiencyRating

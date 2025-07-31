import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../../_metronic/admin-layout/core'
import { useEffect } from 'react'
import { Vertical } from './components/VerticalStepperDistributor'



const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Add Distributor',
    path: '/admin/distributor/add',
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




const AddDistributor = () => {
  return (
    <div>
      <Vertical/>
    </div>
  )
}

export default AddDistributor

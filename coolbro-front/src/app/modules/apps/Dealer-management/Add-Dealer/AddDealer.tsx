import { Route, Routes, Outlet, Navigate, } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../../_metronic/admin-layout/core'
import { useEffect } from 'react'
import { Vertical } from './components/VerticalStepperDealer'



const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Add Dealer',
    path: '/admin/Dealer/add',
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




const AddDealer = () => {
  return (
    <div>
      <Vertical/>
    </div>
  )
}

export default AddDealer

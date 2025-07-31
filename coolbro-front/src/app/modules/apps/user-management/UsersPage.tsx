import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../../_metronic/admin-layout/core'
// import { useState } from 'react'
import UserList from './users-list/UserList'
import AddEditUser from './users-list/AddEditUser'
// import { FaArrowLeft } from 'react-icons/fa';
// import {UsersListWrapper} from './users-list/UsersList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'User Management',
    path: '/admin/user/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'User',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const UsersPage = () => {
  // const navigate = useNavigate();
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Users</PageTitle>
              <UserList />
            </>
          }
        />
      </Route>
      <Route
        path="add"
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Add User</PageTitle>
            <AddEditUser />
          </>
        }
      />
      <Route
        path="edit/:userId"
        element={
          <>
            <PageTitle breadcrumbs={usersBreadcrumbs}> Edit User</PageTitle>
            <AddEditUser />
          </>
        }
      />
      <Route index element={<Navigate to='/admin/user/list' />} />
    </Routes>
  )
}

export default UsersPage

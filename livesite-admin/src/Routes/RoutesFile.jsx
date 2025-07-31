import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../Auth/Login/Login";
import Dashboard from "../Pages/Dashboard/Dashboard";
import LandingPage from "../Pages/LandingPage/LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import LandingOrganization from "../Layout/LandingLayout/LandingContentArea/LandingOrganization/LandingOrganization";
import LandingRecentDesign from "../Layout/LandingLayout/LandingContentArea/LandingRecentDesign/LandingRecentDesign";
import LandingProjects from "../Layout/LandingLayout/LandingContentArea/LandingProjects/LandingProjects";
import LandingProjectsTab from "../Layout/LandingLayout/LandingContentArea/LandingProjectsTab/LandingProjectsTab";
import { GlobalValues } from "../Lib/GlobalValues";
import { getApiCaller } from "../Lib/apiCaller";
import { useShapeContext } from "../contexts/shapeContext";
import { toast } from "react-toastify";
import OrganizationListPage from "../Layout/AdminLayout/AdminPages/OrganizationListPage/OrganizationListPage";
import LandingUserSettings from "../Layout/AdminLayout/AdminPages/UserListPage/UserListPage";

const RoutesFile = () => {
  const { headers, userID } = GlobalValues();
  const { actions } = useShapeContext();

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const getInfo = await getApiCaller(`users/${userID}`, headers);
      const userRole =
        getInfo?.user?.User_type === 0
          ? "ADMIN"
          : getInfo?.user?.User_type === 1
          ? "USER"
          : "ORGANIZATION";
      actions.isUserRole(userRole);
      const userType =
        getInfo?.user?.Role === 0
          ? "Advance_User"
          : getInfo?.user?.Role === 1
          ? "Basic_User"
          : getInfo?.user?.Role === 2
          ? "External_User"
          : "ORGANIZATION";
          
      actions.isUserType(userType);
    } catch (error) {
      if (error.response.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          <Route index element={<LandingRecentDesign />} />
          {/* <Route path="/profile" element={<LandingOrganization />} /> */}
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<LandingRecentDesign />} />
          <Route path="projects" element={<LandingProjects />} />
          <Route path="organization" element={<OrganizationListPage />} />
          <Route path="userList" element={<LandingUserSettings />} />
          <Route path="profile" element={<LandingOrganization />} />
          <Route path="projectstab" element={<LandingProjectsTab />} />
        </Route>

        <Route
          path="/editor/:projectId"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RoutesFile;

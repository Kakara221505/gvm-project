import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../Auth/Login/Login";
import Dashboard from "../Pages/Dashboard/Dashboard";
import LandingPage from "../Pages/LandingPage/LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import LandingOrganization from "../Layout/LandingLayout/LandingContentArea/LandingOrganization/LandingOrganization";
import LandingRecentDesign from "../Layout/LandingLayout/LandingContentArea/LandingRecentDesign/LandingRecentDesign";
import LandingProjects from "../Layout/LandingLayout/LandingContentArea/LandingProjects/LandingProjects";
import UserListPage from "../Layout/AdminLayout/UserListPage/UserListPage";
import ContactUs from "../Layout/OuterPages/ContactUs/ContactUs";
import TermsAndConditions from "../Layout/OuterPages/TermsAndConditions/TermsAndConditions";
import PrivacyPolicyPage from "../Layout/OuterPages/PrivacyPolicyPage/PrivacyPolicyPage";

const RoutesFile = () => {
  return (
    <BrowserRouter>
      {/* <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/login" component={Login} />
        <ProtectedRoute>
           <Route exact path="/dashboard" component={LandingPage} />
           <Route path="/profile" component={LandingOrganization} />
           <Route path="/editor" component={Dashboard} />
        </ProtectedRoute>
      </Switch> */}
      <Routes>
        <Route path="/" element={<LandingPage />}>
          <Route index element={<LandingRecentDesign />} />
          <Route path="userlist" element={<UserListPage />} />
          <Route path="contactus" element={<ContactUs />} />
          <Route path="termsconditions" element={<TermsAndConditions />} />
          <Route path="privacypolicy" element={<PrivacyPolicyPage />} />




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
          <Route path="profile" element={<LandingOrganization />} />

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

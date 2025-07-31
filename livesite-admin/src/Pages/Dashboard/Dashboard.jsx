import React, { useState, useEffect } from "react";
import "../../App.css";
import { Redirect } from "react-router";
import EditorLayout from "../../Layout/MainLayout/EditorLayout/EditorLayout";
import MainLayout from "../../Layout/MainLayout/MainLayout";
import { ShapeProvider } from "../../contexts/shapeContext";

const Dashboard = (props) => {
  // const [loggedIn, setLoggedIn] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem("AdminToken");
  //   if (token === null) {
  //     setLoggedIn(false);
  //   }
  // }, []);

  // if (!loggedIn) {
  //   return <Redirect to="/" />;
  // }

  return (
    <>
        <ShapeProvider>
          <MainLayout/>
        </ShapeProvider>
    </>
  );
};

export default Dashboard;

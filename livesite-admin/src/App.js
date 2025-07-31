import React, { useContext, useEffect, useState } from "react";
import './App.css';
import Routes from './Routes/RoutesFile';
import { ThemeContext } from './Theme/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import RoutesFile from "./Routes/RoutesFile";

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`App ${theme}`}>
       <ToastContainer />
      <RoutesFile/>

    </div>
  );
}

export default App;

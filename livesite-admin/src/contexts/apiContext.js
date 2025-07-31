import React, { createContext, useContext, useState } from "react";
import { getHeaderFile } from "../Lib/headerMenuApi";
import { GlobalValues } from "../Lib/GlobalValues";

// Create a context
const apiContext = createContext();

// Create a custom hook to access the context
export const useApiContext = () => {
  return useContext(apiContext);
};

// Create a provider component
export const ApiProvider = ({ children }) => {
  const [importData, setImportData] = useState([]);



  return (
    <apiContext.Provider value={{importData, setImportData}}>
      {children}
    </apiContext.Provider>
  );
};

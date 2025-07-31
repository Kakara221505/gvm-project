import { useParams } from "react-router-dom";

export const GlobalValues = () => {
  const userID = localStorage.getItem("UserID");
  const token = localStorage.getItem("AdminToken");
  const getDate = localStorage.getItem("CalendarDate");
  const { projectId } = useParams();

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return {
    userID,
    token,
    headers,
    projectId,
    getDate
  };
};

import { useShapeContext } from "../../contexts/shapeContext";
import { toast } from "react-toastify";
import axios from "axios";

const saveData = async (projectData, state, canvasBGColor) => {
  // const { pages, project } = projectData;
  let { canvases, pages } = state;

  pages = pages.map((page) => {
    return {
      ...page,
      calendar: page?.calendar?.layers.map((layer) => {
        return {
          ...layer,
          annotations: layer?.annotations.map((shape) => {
            // Destructure the shape and remove the canvas field
            const { canvas, ...restShape } = shape;

            // Function to remove canvas field from an object
            const removeCanvasField = (obj) => {
              if (obj) {
                const { canvas, ...rest } = obj;
                return rest;
              }
              return obj;
            };

            return {
              properties: {
                ...restShape,
                title: removeCanvasField(shape.title),
                icon: removeCanvasField(shape.icon),
                comment: removeCanvasField(shape.comment),
              },
            };
          }),
        };
      }),
    };
  });
  // console.log("projectData===-=", pages);
  // console.log("state=========", state);
  const payload = {
    projectID: projectData?.projectID,
    projectData: {
      project: {
        UserID: projectData?.UserID,
        Name: projectData?.Name,
        Description: projectData?.Description,
      },
      pages: pages,
    },
  };
  console.log("payload=========", payload);
  try {
    let token = localStorage.getItem("AdminToken");
    if (token) {
      console.log("token", token);
      const apiUrl = `${process.env.REACT_APP_PUBLIC_BASE_URL}project/updateProjectById`;

      const response = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("POST response====>", response);
    }
  } catch (error) {
    if (error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Network error or server is not responding");
    }
  }
};

export default saveData;

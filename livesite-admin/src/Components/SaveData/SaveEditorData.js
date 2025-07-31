import { useShapeContext } from "../../contexts/shapeContext";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalValues } from "../../Lib/GlobalValues";
import { useCallback } from "react";

const UseSaveData = (showMessage, layerFlag) => {
  const { state, actions } = useShapeContext();
  const { token } = GlobalValues();
  let { pages, projectDetails } = state;

  const saveData = useCallback(async () => {
    const pagesInfo = pages.map((page) => {
      const pageID = page.ID.split("-");
      const pageData = page?.calendar?.layers?.map((layer) => {
        // Create a new array to hold the annotations including comments, titles, and icons
        const newAnnotations = [];
        const ShapeData = layer?.annotations?.map((shape) => {
          const UserID = shape.UserID;
          const LayerID = shape.LayerID;
          const ID = shape.ID;
          const Type = shape.type;
          const AssignDate = shape?.AssignDate;
          const CategoryID = shape?.CategoryID || 1;
          const SubCategoryID = shape?.SubCategoryID || 1;
          const bob_no_id = shape?.bob_no_id;
          const parentSelectSpecialId = shape?.parentSelectSpecialId || null;
          const isPasteSpecialParent = shape?.isPasteSpecialParent || false;
          let updatedShape;
          let commentShapeObj = null;
          let titleShapeobj = null;
          let iconShapeobj = null;

          if (shape?.comment !== null) {
            let commentId = shape.comment.ID;
            let label = shape.comment.label;
            let commnetShape = shape.comment?.toObject();
            // Create the new comment object with ParentAnnotationID
            const newComment = {
              ...commnetShape,
              ParentAnnotationID: ID,
              PageID: shape.PageID,
              LayerID: shape?.LayerID,
              UserID: shape?.UserID,
              label: label,
              ID: commentId,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };

            // Push the new comment into the newAnnotations array
            newAnnotations.push({
              ID: commentId,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              ParentAnnotationID: ID,
              properties: newComment,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            });
            // convert to klass to noraml object 
            shape?.toObject();

            updatedShape = {
              ID: shape.ID,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              Type: shape?.type,
              properties: {
                ...shape,
                comment: newComment,
              },
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            commentShapeObj = newComment;
          }

          if (shape?.title !== null) {
            let titleId = shape.title.ID;
            let titleLabel = shape.title.label;
            let titleShape = shape.title?.toObject();
            // Create the new title object
            const newTitle = {
              ...titleShape,
              ID: titleId,
              ParentAnnotationID: ID,
              PageID: shape.PageID,
              LayerID: shape?.LayerID,
              UserID: shape?.UserID,
              label: titleLabel,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            // Push the new title into the newAnnotations array
            newAnnotations.push({
              ID: titleId,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              ParentAnnotationID: ID,
              properties: newTitle,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            });

            updatedShape = {
              ID: shape.ID,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              Type: shape?.type,
              properties: {
                ...shape,
                title: newTitle, // Use the newly created title object here
              },
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            titleShapeobj = newTitle;
          }

          if (shape?.icon !== null) {
            // const { canvas, ShapeID, ...icon } = shape?.icon; // Remove canvas property
            let iconId = shape.icon.ID;
            let iconLabel = shape.icon.label;
            let iconShape = shape.icon?.toObject();
            // Create the new icon object
            const newIcon = {
              ...iconShape,
              ID: iconId,
              ParentAnnotationID: ID,
              PageID: shape.PageID,
              LayerID: shape?.LayerID,
              UserID: shape?.UserID,
              label: iconLabel,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            // Push the new icon into the newAnnotations array
            newAnnotations.push({
              ID: iconId,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              ParentAnnotationID: ID,
              properties: newIcon,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            });

            updatedShape = {
              ID: shape.ID,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              Type: shape?.type,
              properties: {
                ...shape,
                icon: newIcon, // Use the newly created icon object here
              },
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
            };
            iconShapeobj = newIcon;
          }
          let pattern = null;
          if (shape?.fill?.repeat) {
            pattern = shape.pattern;
          }
          let strokeType = shape?.strokeType || "Solid";
          let relativePosition = shape.relativePosition || {};
          shape = shape?.toObject();
          // const { canvas, ...restProperties } = shape;
          updatedShape = {
            ID: ID,
            UserID: UserID,
            LayerID: LayerID,
            Type: Type,
            AssignDate: AssignDate,
            CategoryID: CategoryID,
            SubCategoryID: SubCategoryID,
            bob_no_id: bob_no_id,
            parentSelectSpecialId: parentSelectSpecialId,
            isPasteSpecialParent: isPasteSpecialParent,
            properties: {
              ...shape,
              comment: commentShapeObj || null,
              title: titleShapeobj || null,
              icon: iconShapeobj || null,
              pattern: pattern,
              strokeType,
              parentSelectSpecialId: parentSelectSpecialId,
              isPasteSpecialParent: isPasteSpecialParent,
              relativePosition,
            },
          };
          return updatedShape;
        });
        // Combine the original annotations with the new comments, titles, and icons
        const combinedAnnotations = [...ShapeData, ...newAnnotations];
        const formatDateTime = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };
        const selectedDate =
          localStorage.getItem("selecteDate") || formatDateTime(new Date());
        return {
          ...layer,
          Collapsed: true,
          AssignDate: selectedDate,
          annotations: combinedAnnotations,
        };
      });

      return {
        ...page,
        ID: parseInt(pageID[1]),
        calendar: {
          ...page.calendar,
          layers: pageData,
        },
      };
    });

    const payload = {
      layerFlag,
      projectID: projectDetails?.ID,
      projectData: {
        project: {
          UserID: projectDetails?.UserID || null,
          Name: projectDetails?.Name || null,
          Description: projectDetails?.Description || null,
        },
        pages: pagesInfo,
      },
    };
    try {
      if (token) {
        const apiUrl = `${process.env.REACT_APP_PUBLIC_BASE_URL}project/updateProjectById`;

        const response = await axios.put(apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        actions.isAnyDataChanges(false);
        response.data.status === "success" &&
          showMessage &&
          toast.success("Saved Successfully!");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Network error or server is not responding");
      }
    }
  }, [state, pages, token]);

  return saveData;
};

export default UseSaveData;

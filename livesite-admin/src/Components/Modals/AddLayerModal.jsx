import React, { useState, useContext } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import { useShapeContext } from "../../contexts/shapeContext";
import createId from "../../Common/Constants/CreateId";
import { ThemeContext } from "../../Theme/ThemeContext";
import { postApiCaller, putApiCaller } from "../../Lib/apiCaller";
import { GlobalValues } from "../../Lib/GlobalValues";
import { toast } from "react-toastify";
import _ from "lodash";

const AddLayerModal = (props) => {
  const { userID, headers, projectId, activeCanvas } = GlobalValues();
  // const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { state, actions } = useShapeContext();
  const { theme } = useContext(ThemeContext);

  let { pages } = state;
  const clonedState = _.cloneDeep(state);
  const formik = useFormik({
    initialValues: {
      LayerName: "",
    },
    validationSchema: yup.object().shape({
      LayerName: yup
        .string()
        .trim()
        .required("Layer name is required")
        .test(
          "is-not-empty",
          "Layer name cannot be just spaces",
          (value) => value.trim().length > 0
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        const id = createId();

        let layersLength = pages.find((page) => page.ID === activeCanvas)
          ?.calendar?.layers?.length;
        let pageID = activeCanvas?.split("-")?.[1];
        pageID = Number(pageID);
        const data = {
          UserID: userID,
          PageID: pageID,
          Name: values.LayerName,
          // Layer_order: layersLength + 1,
          IsLocked: false,
          IsVisible: true,
          FillColor: "#ffffff",
          StrokeColor: "#000000",
          StrokeWidth: 2,
          Font_size: 20,
          Font_family: "Arial",
          StrokeType: "Solid",
        };

        try {
          const response = await postApiCaller(
            "layer/add_update_layer",
            data,
            headers
          );
          if (response?.status === "success") {
            actions.updateState(clonedState)
            const newLayer = {
              ID: response.layerID,
              UserID: userID,
              PageID: pageID,
              Name: values.LayerName,
              Layer_order: layersLength + 1,
              IsLocked: false,
              IsVisible: true,
              fillColor: "#ffffff",
              strokeColor: "#000000",
              strokeWidth: 2,
              font_size: 20,
              font_family: "Arial",
              strokeType: "Solid",
              annotations: [],
            };

            actions.addLayer(newLayer);
            actions.isAnyDataChanges(true);
            resetForm();
            props.onHide();
            setIsLoading(false);
          } else {
            resetForm();
            setIsLoading(false);
            toast.error(response.data.message);
          }
        } catch (error) { }
      } catch (error) {
        console.error("Submission error:", error);
      }
    },
  });

  const handleClose = () => {
    setIsLoading(false);
    formik.resetForm();
    props.onHide();
  };

  return (
    <Modal {...props} size="lg" centered dialogClassName={theme}>
      <Modal.Header className="commonModalBg" closeButton onHide={handleClose}>
        <Modal.Title className="menuTextHeader">Add Layer</Modal.Title>
      </Modal.Header>
      <Modal.Body className="commonModalBg">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="LayerName"
              className="yellowText form-label fw-bold"
            >
              Layer Name
            </label>
            <input
              type="text"
              id="LayerName"
              name="LayerName"
              className="form-control"
              placeholder="Enter Layer Name"
              {...formik.getFieldProps("LayerName")}
              autoFocus
            />
            {formik.touched.LayerName && formik.errors.LayerName && (
              <div className="text-danger">{formik.errors.LayerName}</div>
            )}
          </div>
          <Button
            type="submit"
            style={{ width: "140px", height: "45px" }}
            className="mt-2 loginBtn1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner
                animation="border"
                variant="light"
                className="mt-1"
                style={{ width: "23px", height: "23px" }}
              />
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddLayerModal;

export const updateLayerAPI = async (canvasId, layerData) => {
  const token = localStorage.getItem("AdminToken");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formattedData = {
    id: layerData.ID,
    UserID: layerData.UserID,
    PageID: layerData.PageID,
    Name: layerData.Name,
    collapsed: layerData.collapsed,
    Layer_order: layerData.Layer_order,
    // IsLocked: layerData.IsLocked ?? false,
    IsLocked: false,
    // IsVisible: layerData.IsVisible ?? true,
    IsVisible: true,
    FillColor: layerData.fillColor ?? "#ffffff",
    StrokeColor: layerData.strokeColor ?? "#000000",
    StrokeWidth: layerData.strokeWidth ?? 2,
    Font_size: layerData.font_size ?? 20,
    Font_family: layerData.font_family ?? "Arial",
    StrokeType: layerData.strokeType ?? "Solid",
    AssignDate: layerData.AssignDate
  };

  try {
    const response = await postApiCaller(
      "layer/add_update_layer",
      formattedData,
      headers
    );
  } catch (error) { }
};

export const updateAnnotationLayerAPI = async (shapeID, layerId, userID) => {
  const token = localStorage.getItem("AdminToken");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formattedData = {
    id: [shapeID],
    UserID: userID,
    LayerID: layerId,
  };

  try {
    const response = await putApiCaller(
      "annotation/update_annotation",
      formattedData,
      headers
    );
    return response;
  } catch (error) { }
};

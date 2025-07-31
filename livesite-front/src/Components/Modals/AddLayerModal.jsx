import React, { useState,useContext } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import { useShapeContext } from "../../contexts/shapeContext";
import createId from "../../Common/Constants/CreateId";
import { ThemeContext } from "../../Theme/ThemeContext";

const AddLayerModal = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { state, actions } = useShapeContext();
  const { theme } = useContext(ThemeContext);

  const formik = useFormik({
    initialValues: {
      LayerName: "",
    },
    validationSchema: yup.object().shape({
      LayerName: yup.string().required("Layer name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        const id = createId();

        const newLayer = {
          ID: id,
          fillColor: "#ffffff",
          strokeColor: "#000000",
          Name: values.LayerName,
          IsVisible: true,
          IsLocked: false,
          annotations: [],
        };
        actions.addLayer(newLayer);
        // layer created successfully after then
        resetForm();
        props.onHide();
        setIsLoading(false);
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
      <Modal.Header      className='commonModalBg' closeButton onHide={handleClose}>
        <Modal.Title className='menuTextHeader'>Add Layer</Modal.Title>
      </Modal.Header>
      <Modal.Body      className='commonModalBg'>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label htmlFor="LayerName" className="yellowText form-label fw-bold">
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

import React, { useContext, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ThemeContext } from "../../Theme/ThemeContext";
import { postApiCaller } from "../../Lib/apiCaller";
import { GlobalValues } from "../../Lib/GlobalValues";
import { useState } from "react";

const DeleteLayerModal = (props) => {
  const { theme } = useContext(ThemeContext);
  const { layerdata, onHide } = props;
  const { activeCanvas, headers, projectId, userID } = GlobalValues();
  const [layerDates, setLayerDates] = useState([]);
  const handleDelete = () => {
    // Call the delete function with the layer ID
    onHide(layerdata?.ID);
  };

  useEffect(() => {
    const fetchLayersDates = async () => {
      const data = {
        userID: Number(userID),
        layerID: layerdata?.ID,
      };
      try {
        const response = await postApiCaller(
          `layer/get_layer_by_date`,
          data,
          headers
        );
        setLayerDates(response?.data || []);
      } catch (error) {
        console.error("Error fetching layers:", error);
      }
    };

    if (layerdata?.ID !== undefined) {
      fetchLayersDates();
    }
  }, [layerdata]);

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName={theme}
    >
      <Modal.Header closeButton onHide={onHide} className="commonModalBg">
        <Modal.Title
          id="contained-modal-title-vcenter"
          className="menuTextHeader"
        >
          Confirm Delete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="commonModalBg">
        <p className="yellowText">
          Layer <b>{layerdata?.Name}</b> is not empty. If you delete this layer,
          you will also delete all annotations on that layer on all days.
        </p>
        objects are present on following days:
        <textarea
          value={ layerDates?.join("\n")}
          readOnly
          // rows={layerDates.length || 1} 
          rows={3} 
          className="form-control"
        />
        <br/>
         Are you sure you want to proceed?
      </Modal.Body>
      <Modal.Footer className="commonModalBg">
        <Button variant="danger" onClick={handleDelete}>
          Yes
        </Button>
        <Button variant="secondary" onClick={() => onHide()}>
          No
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteLayerModal;

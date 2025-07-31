import React,{useContext} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ThemeContext } from "../../Theme/ThemeContext";

const DeleteLayerModal = (props) => {
  const { theme } = useContext(ThemeContext);
  const { layerdata, onHide } = props;
  const handleDelete = (id) => {
    onHide(id);
  };
  return (
    <>
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered dialogClassName={theme}
      >
        <Modal.Header closeButton onHide={onHide} className='commonModalBg'>
          <Modal.Title id="contained-modal-title-vcenter" className="menuTextHeader">
            Delete Layer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='commonModalBg'>
          <p className="yellowText">Are you sure you want to delete this {layerdata?.user} layer?</p>
        </Modal.Body>
        <Modal.Footer className="commonModalBg">
          <Button variant="danger"  onClick={() => handleDelete(layerdata.ID)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteLayerModal;

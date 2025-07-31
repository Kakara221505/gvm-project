import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

const SaveConfirmModal = ({
  show,
  isLoading,
  handleSave,
  handleDontSave,
  handleClose,
}) => {
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Save Conformation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to save current changes?</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSave}>
            {isLoading ? (
              <Spinner animation="border" variant="white" size="sm" />
            ) : (
              "Save"
            )}
          </Button>
          <Button variant="secondary" onClick={handleDontSave}>
            Don't save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SaveConfirmModal;

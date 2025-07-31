import React, { useEffect, useState,useContext } from "react";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useShapeContext } from "../../../../contexts/shapeContext";
import { ThemeContext } from "../../../../Theme/ThemeContext";

const FilterModal = ({
  show,
  handleClose,
  selectedButtons,
  setSelectedButtons,
  handleButtonClick,
}) => {
  const { state, actions, currentuser } = useShapeContext();
  const isActive = (buttonId) => selectedButtons.includes(buttonId);
  const { theme } = useContext(ThemeContext);

  const handleFilterClick = () => {
    actions.selectFilterShape(selectedButtons);
    handleClose();
  };

  const handleFilterClear = () => {
    actions.selectFilterShape([]);
    setSelectedButtons([]);
    handleClose();
  };

  useEffect(() => {
    setSelectedButtons([]);
  }, [currentuser]);

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName={theme}>
      <Modal.Header   className='commonModalBg' closeButton>
        <Modal.Title className='menuTextHeader'>Filter</Modal.Title>
      </Modal.Header>
      <Modal.Body   className='commonModalBg'>
        <div className="d-flex flex-wrap justify-content-between">
          {["triangle", "polygon", "rect", "ellipse", "line", "textbox"].map(
            (btn, index) => (
              <OverlayTrigger
                key={btn}
                placement="top"
                overlay={<Tooltip id={`tooltip-${btn}`}>{`${btn}`}</Tooltip>}
              >
                <button
                  key={btn}
                  className={`btn btn-default border-1 border-secondary bg-transparent filterBTN ${
                    isActive(btn) ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick(btn)}
                >
                  {index === 0 && (
                    <svg
                      className={`${isActive ? "actives" : ""} customsvg`}
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-triangle"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="#2c3e50"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-hexagon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="#2c3e50"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                    </svg>
                  )}
                  {/* {index === 2 && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="9"
                      cy="4"
                      r="2"
                      stroke="#000"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="19"
                      cy="7"
                      r="2"
                      stroke="#000"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="2"
                      stroke="#000"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="4"
                      cy="18"
                      r="2"
                      stroke="#000"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.9171 4.5752L17.0848 6.4255M19.1544 8.99455L19.8476 18.0061M18.0162 19.7523L5.98574 18.2484M8.32812 5.88435L4.67383 16.1164"
                      stroke="#000"
                      strokeLinecap="round"
                    />
                  </svg>
                )} */}
                  {index === 2 && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 12C2 9.19974 2 7.79961 2.54497 6.73005C3.02433 5.78924 3.78924 5.02433 4.73005 4.54497C5.79961 4 7.19974 4 10 4H14C16.8003 4 18.2004 4 19.27 4.54497C20.2108 5.02433 20.9757 5.78924 21.455 6.73005C22 7.79961 22 9.19974 22 12C22 14.8003 22 16.2004 21.455 17.27C20.9757 18.2108 20.2108 18.9757 19.27 19.455C18.2004 20 16.8003 20 14 20H10C7.19974 20 5.79961 20 4.73005 19.455C3.78924 18.9757 3.02433 18.2108 2.54497 17.27C2 16.2004 2 14.8003 2 12Z"
                        stroke="#000"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {index === 3 && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#000"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {index === 4 && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.28249 14.7175L14.7176 1.28238"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {index === 5 && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 21H9"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.5 3C12.5 2.72386 12.2761 2.5 12 2.5C11.7239 2.5 11.5 2.72386 11.5 3H12.5ZM11.5 21C11.5 21.2761 11.7239 21.5 12 21.5C12.2761 21.5 12.5 21.2761 12.5 21H11.5ZM11.5 3V21H12.5V3H11.5Z"
                        fill="#000"
                      />
                      <path
                        d="M19 6C19 5.37191 19 5.05787 18.9194 4.78267C18.7518 4.21026 18.3066 3.71716 17.7541 3.49226C17.4886 3.38413 17.1885 3.35347 16.5884 3.29216C15.1695 3.14718 13.3874 3 12 3C10.6126 3 8.83047 3.14718 7.41161 3.29216C6.8115 3.35347 6.51144 3.38413 6.24586 3.49226C5.69344 3.71716 5.24816 4.21026 5.08057 4.78267C5 5.05787 5 5.37191 5 6"
                        stroke="#000"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </OverlayTrigger>
            )
          )}
        </div>
      </Modal.Body>
      <Modal.Footer   className='commonModalBg'>
        <Button variant="secondary py-2 px-3" onClick={handleFilterClear}>
          Clear
        </Button>
        <Button
          variant="primary"
          className="px-4 py-2 loginBtn1"
          onClick={handleFilterClick}
        >
          Filter
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;

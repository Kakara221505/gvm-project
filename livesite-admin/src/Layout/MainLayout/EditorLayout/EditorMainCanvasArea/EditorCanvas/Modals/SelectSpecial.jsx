import React, { useState, useContext, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useShapeContext } from "../../../../../../contexts/shapeContext";
import { ThemeContext } from "../../../../../../Theme/ThemeContext";
import { toast } from "react-toastify";
import { GlobalValues } from "../../../../../../Lib/GlobalValues";
import { Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import Spinner from "react-bootstrap/Spinner";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import "./PasteSpecialModal.css";
import createId from "../../../../../../Common/Constants/CreateId";
import { postApiCaller } from "../../../../../../Lib/apiCaller";

export default function SelectSpecial(props) {
  const { show, onHide, selectedShapes, setSelectSpecialDates } = props;
  const { state, actions } = useShapeContext();
  const { theme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [allChildDates, setAllChildDates] = useState([]);

  const { headers } = GlobalValues();

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const selectedDate =
    localStorage.getItem("selecteDate")?.split(" ")[0] || getFormattedDate();

  useEffect(() => {
    if (selectedShapes) {
      setIsLoading(true);
      fetchSelectShapeData(selectedShapes);
    }
  }, [show]);

  // fetch all select special dates
  const fetchSelectShapeData = async (shapes) => {
    try {
      const apiUrl = `annotation/get_select_paste_annotation`;
      const filterShapes = shapes?.map((anno) => anno?.ID);
      const payload = {                          
        front_no_id: filterShapes[0],
      };
      const getResponse = await postApiCaller(apiUrl, payload, headers);
      setAllChildDates(getResponse.AssignDates || []);
      setIsLoading(false);
    } catch (error) {
      if (error?.response) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Network error or server is not responding");
      }
    }
  };

  const validationSchema = Yup.object({
    selectedDates: Yup.array().min(1, "Please select at least one date"),
  });

  // handle submit function
  const handleSubmit = async (values) => {
    setSelectSpecialDates(values?.selectedDates);
    setSubmitLoading(true);
    setAllChildDates([]);
    actions.isSelectSpecialChanges(true);
    onHide();
    setSubmitLoading(false);
  };

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName={theme}
    >
      <Modal.Header closeButton className="commonModalBg">
        <Modal.Title
          id="contained-modal-title-vcenter"
          className="menuTextHeader"
        >
          Select Special
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{ selectedDates: [] }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, handleChange, values, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="commonModalBg">
              {isLoading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="row-cols-1">
                  {allChildDates?.map((res, indx) => (
                    <Form.Check
                      inline
                      key={`checkbox-${indx}`} // Add a unique key for each checkbox
                      label={res}
                      name="selectedDates"
                      type="checkbox"
                      id={`checkbox-${indx}`}
                      value={res}
                      onChange={handleChange}
                      checked={
                        values?.selectedDates?.includes(res) ||
                        res === selectedDate
                      }
                      disabled={res === selectedDate}
                    />
                  ))}
                  {errors.selectedDates && touched.selectedDates && (
                    <div className="text-danger">{errors.selectedDates}</div>
                  )}
                </div>
              )}
              {!isLoading && allChildDates?.length === 0 && (
                <p>Currently, there are no shapes available on the any date.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="px-4"
                type="submit"
                disabled={allChildDates.length === 0 && true}
              >
                {submitLoading ? (
                  <Spinner animation="border" variant="white" size="sm" />
                ) : (
                  "Apply"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

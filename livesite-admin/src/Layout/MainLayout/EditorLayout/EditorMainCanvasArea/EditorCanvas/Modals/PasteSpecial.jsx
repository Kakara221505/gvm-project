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
import "./PasteSpecialModal.css";
import createId from "../../../../../../Common/Constants/CreateId";
import { postApiCaller } from "../../../../../../Lib/apiCaller";
import UseSaveData from "../../../../../../Components/SaveData/SaveEditorData";

export default function PasteSpecial(props) {
  const {
    show,
    onHide,
    selectedShapes,
    fetchCanvasData,
    ShapePasteType,
    removeCutShape,
  } = props;
  const { state, actions } = useShapeContext();
  const [customRangeStart, setCustomRangeStart] = useState(new Date());
  const [customRangeEnd, setCustomRangeEnd] = useState(new Date());
  const [singleDate, setSingleDate] = useState(new Date());
  const { theme } = useContext(ThemeContext);
  const [dateRange, setDateRange] = useState("single");
  const [pagesOptions, setPagesOptions] = useState([]);
  const [layerOptions, setLayerOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selecteDate, setSelecteDate] = useState([]);
  const [selectedPages, setSelectedPages] = useState();
  const [selectedLayer, setSelectedLayer] = useState();
  const [selectedRadioId, setSelectedRadioId] = useState(1);
  const [selectedPageError, setSelectedPageError] = useState("");
  const [selectedLayerError, setSelectedLayerError] = useState("");
  const saveData = UseSaveData(false, true);
  const { headers, getDate, token, projectId } = GlobalValues();

  useEffect(() => {
    setSelecteDate(
      [localStorage?.getItem("selecteDate")?.split(" 00:00")[0]] ||
        formatDate(new Date())
    );
    setSelectedRadioId(1);
    setDateRange("single");
    setSelectedPages({});
    setSelectedLayer({});
  }, [show]);

  useEffect(() => {
    if (selectedRadioId === 2) {
      fetchPagesAndLayers();
    } else {
      setSelectedPages({});
    }
  }, [selectedRadioId]);

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleChange = (value) => {
    setSelectedRadioId(value);
    if (value === 1) {
      setSelectedPages({});
      setSelectedLayer({});
    }
  };

  const handleCustomRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRangeStart(start);
    setCustomRangeEnd(end);

    let startDate = new Date(
      Date.UTC(start?.getFullYear(), start?.getMonth(), start?.getDate())
    );
    let endDate = new Date(
      Date.UTC(end?.getFullYear(), end?.getMonth(), end?.getDate())
    );

    // get all dates from date range picker
    const getDatesBetween = (currentDate, endDates) => {
      let dates = [];
      while (currentDate <= endDates) {
        // Convert date to YYYY-MM-DD format
        let formattedDate = currentDate?.toISOString()?.split("T")[0];
        dates?.push(formattedDate);
        currentDate?.setUTCDate(currentDate?.getUTCDate() + 1);
      }
      return dates;
    };
    const datesBetween = getDatesBetween(startDate, endDate);
    setSelecteDate(datesBetween);
  };

  const handleSingleDateChange = (dates) => {
    const formattedDate = formatDate(new Date(dates));
    setSelecteDate([formattedDate]);
    fetchPagesAndLayers([formattedDate]);
  };

  const fetchPagesAndLayers = async () => {
    const pageArray = await getAllPages();
    setPagesOptions(pageArray);
  };

  const getAllPages = async () => {
    let apiUrl = `page/get_page_all_data_by_project_id`;
    let payload = {
      projectId: projectId,
    };
    const getTotalPages = await postApiCaller(apiUrl, payload, headers);
    const pagesformate =
      getTotalPages.data &&
      getTotalPages.data.map((item, index) => {
        return {
          label: item.Name ? item.Name : `Page ${index + 1}`,
          value: item.ID,
        };
      });
    return pagesformate;
  };

  const getAllLayers = async (item) => {
    let apiUrl = `layer/get_layer_all_data_by_page_id`;
    let payload = {
      pageId: [item.value],
      assignDate: "2024-8-27",
    };
    const getTotalLayers = await postApiCaller(apiUrl, payload, headers);
    const layerformate = getTotalLayers?.data?.map((item, index) => {
      return {
        label: item.Name ? item.Name : `User ${index + 1}`,
        value: item.ID,
        pageId: item.PageID,
      };
    });
    setLayerOptions(layerformate);
  };
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handlePagesChange = async (item) => {
    setSelectedPages(item);
    const layerArray = await getAllLayers(item);
    setSelectedLayer(layerArray);
    setSelectedPageError("");
  };

  const handleChangeLayer = async (item) => {
    setSelectedLayer(item);
    setSelectedLayerError("");
  };

  function resetVals() {
    setSingleDate(new Date());
    setCustomRangeStart(new Date());
    setCustomRangeEnd(new Date());
    setDateRange("single");
  }

  const handlePasteSpecialApply = async () => {
    if (selectedRadioId === 2) {
      if (!selectedPages?.label) {
        setSelectedPageError("Please Select Page");
        return;
      } else if (!selectedLayer?.label) {
        setSelectedLayerError("Please Select Layer");
        return;
      }
    }
    if (ShapePasteType === "cut") {
      removeCutShape();
    }

    try {
      setIsLoading(true);
      await saveData();
      let newDateRange = [];
      let AllAnnotationsId = [];
      if (selectedShapes?.length >= 1) {
        let newChildCommnetId = "";
        let newChildTitleId = "";
        let newChildIconId = "";
        let newShapeID = "";
        let currentShapeID = "";
        selecteDate.map((date) => {
          selectedShapes.map((res) => {
            if (!res.ParentAnnotationID && !res.label) {
              currentShapeID = res.ID;
              AllAnnotationsId.push(currentShapeID);
              newShapeID = createId();
            }
            let commentObj;
            let titleObj;
            let iconObj;
            if (res?.comment) {
              newChildCommnetId = createId();
              commentObj = res?.comment.toObject();
              commentObj.AssignDate = res.AssignDate;
              commentObj.CategoryID = res.CategoryID;
              commentObj.ID = newChildCommnetId;
              commentObj.ParentAnnotationID = newShapeID;
              commentObj.LayerID = selectedLayer.value || res.LayerID;
              commentObj.PageID = selectedLayer.pageId || res.PageID;
              commentObj.SubCategoryID = res.SubCategoryID;
              commentObj.bob_no_id = res.bob_no_id;
              commentObj.UserID = res.UserID;
              commentObj.label = "comment";
            }
            if (res?.title) {
              newChildTitleId = createId();
              titleObj = res?.title.toObject();
              titleObj.AssignDate = res.AssignDate;
              titleObj.CategoryID = res.CategoryID;
              titleObj.ID = newChildTitleId;
              titleObj.ParentAnnotationID = newShapeID;
              titleObj.LayerID = selectedLayer.value || res.LayerID;
              titleObj.PageID = selectedLayer.pageId || res.PageID;
              titleObj.SubCategoryID = res.SubCategoryID;
              titleObj.bob_no_id = res.bob_no_id;
              titleObj.UserID = res.UserID;
              titleObj.label = "title";
            }
            if (res?.icon) {
              newChildIconId = createId();
              iconObj = res?.icon.toObject();
              iconObj.AssignDate = res.AssignDate;
              iconObj.CategoryID = res.CategoryID;
              iconObj.ID = newChildIconId;
              iconObj.ParentAnnotationID = newShapeID;
              iconObj.LayerID = selectedLayer.value || res.LayerID;
              iconObj.PageID = selectedLayer.pageId || res.PageID;
              iconObj.SubCategoryID = res.SubCategoryID;
              iconObj.bob_no_id = res.bob_no_id;
              iconObj.UserID = res.UserID;
              iconObj.label = "icon";
            }

            if (!res.label && res.type !== "image") {
              let relativePosition = res.relativePosition || {};
              newDateRange.push({
                ID: newShapeID,
                LayerID: selectedLayer.value || res.LayerID,
                PageID: selectedLayer.pageId || res.PageID,
                UserID: res.UserID,
                AssignDate: date,
                CategoryID: res.CategoryID,
                SubCategoryID: res.SubCategoryID,
                bob_no_id: res.bob_no_id,
                ParentAnnotationID: null,
                Type: res.type,
                parentSelectSpecialId:
                  res?.parentSelectSpecialId || currentShapeID,
                isPasteSpecialParent: res?.isPasteSpecialParent || false,
                properties: {
                  ...res?.toObject(),
                  ID: newShapeID,
                  LayerID: selectedLayer.value || res.LayerID,
                  PageID: selectedLayer.pageId || res.PageID,
                  UserID: res.UserID,
                  AssignDate: date,
                  CategoryID: res.CategoryID,
                  SubCategoryID: res.SubCategoryID,
                  bob_no_id: res.bob_no_id,
                  strokeType: res?.strokeType || "Solid",
                  ParentAnnotationID: null,
                  comment: commentObj || null,
                  title: titleObj || null,
                  icon: iconObj || null,
                  parentSelectSpecialId:
                    res?.parentSelectSpecialId || currentShapeID,
                  isPasteSpecialParent: res?.isPasteSpecialParent || false,
                  relativePosition,
                },
              });
            } else {
              newDateRange.push({
                ID:
                  res.label === "comment"
                    ? newChildCommnetId
                    : res.label === "title"
                    ? newChildTitleId
                    : newChildIconId,
                LayerID: selectedLayer.value || res.LayerID,
                PageID: selectedLayer.pageId || res.PageID,
                UserID: res.UserID,
                AssignDate: date,
                CategoryID: res.CategoryID,
                SubCategoryID: res.SubCategoryID,
                bob_no_id: res.bob_no_id,
                ParentAnnotationID:
                  res.ParentAnnotationID || res.ShapeID ? newShapeID : null,
                Type: res.type,
                properties: {
                  ...res?.toObject(),
                  ID:
                    res.label === "comment"
                      ? newChildCommnetId
                      : res.label === "title"
                      ? newChildTitleId
                      : newChildIconId,
                  LayerID: selectedLayer.value || res.LayerID,
                  PageID: selectedLayer.pageId || res.PageID,
                  UserID: res.UserID,
                  AssignDate: date,
                  CategoryID: res.CategoryID,
                  SubCategoryID: res.SubCategoryID,
                  bob_no_id: res.bob_no_id,
                  parentSelectSpecialId:
                    res?.parentSelectSpecialId || currentShapeID,
                  isPasteSpecialParent: res?.isPasteSpecialParent || false,
                  ParentAnnotationID:
                    res.ParentAnnotationID || res.ShapeID ? newShapeID : null,
                },
              });
            }
          });
        });
      }
      const apiUrl = `annotation/paste_annotation`;
      const payload = {
        annotations: newDateRange,
        parentAnnotationIds: AllAnnotationsId,
      };
      const submitResponse = await postApiCaller(apiUrl, payload, headers);
      if (submitResponse) {
        actions.isPasteSpecialChanges(true);
        setSelecteDate([]);
        // fetchCanvasData();
        setSelectedPages({});
        setSelectedLayer({});
        setSelectedPageError("");
        setSelectedLayerError("");
        onHide();
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "Network error in paste special or server is not responding"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName={theme}
    >
      <Modal.Header className="commonModalBg">
        <Modal.Title
          id="contained-modal-title-vcenter"
          className="menuTextHeader"
        >
          Paste Special
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="commonModalBg">
        <div className="row mx-0">
          <div className="col-lg-6 ps-0 border-end mb-3 mb-lg-0 setCustomHeight">
            <div className="row mx-0 align-items-center">
              <Row className="pe-0">
                <div className="pe-0 mb-4">
                  <Form.Check
                    inline
                    label="Paste on selected days on the origin page and layer"
                    name="group1"
                    type="radio"
                    id="1"
                    checked={selectedRadioId === 1}
                    onChange={() => handleChange(1)}
                  />
                  <Form.Check
                    inline
                    label="Customize layer and page for annotation to be pasted on"
                    name="group1"
                    type="radio"
                    id="2"
                    className="me-0 mt-3"
                    checked={selectedRadioId === 2}
                    onChange={() => handleChange(2)}
                  />
                </div>
                {selectedRadioId === 2 && (
                  <>
                    <div className="mb-3">
                      <div className="pe-0 align-items-center">
                        <label className="menuTextHeader">Pages:</label>
                        <Select
                          options={pagesOptions}
                          onChange={handlePagesChange}
                          placeholder="Select Pages"
                          className="basic-multi-select w-100 mt-2"
                          classNamePrefix="select"
                        />
                      </div>
                      {selectedPageError && (
                        <p className="text-danger mb-0">{selectedPageError}</p>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="menuTextHeader">Layers:</label>
                      <Select
                        options={layerOptions}
                        onChange={handleChangeLayer}
                        placeholder="Select Layers"
                        className="basic-multi-select w-100 mt-2"
                        classNamePrefix="select"
                      />
                      {selectedLayerError && (
                        <p className="text-danger mb-0">{selectedLayerError}</p>
                      )}
                    </div>
                  </>
                )}
              </Row>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="d-flex justify-content-evenly">
              <div>
                <input
                  type="radio"
                  id="single"
                  name="dateRange"
                  value="single"
                  onChange={handleDateRangeChange}
                  checked={dateRange === "single"}
                />
                <label htmlFor="single" className="px-2 yellowText">
                  Single
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="custom"
                  name="dateRange"
                  value="custom"
                  onChange={handleDateRangeChange}
                  checked={dateRange === "custom"}
                />
                <label htmlFor="custom" className="px-2 yellowText">
                  Custom range
                </label>
              </div>
            </div>
            {dateRange === "single" ? (
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  onChange={handleSingleDateChange}
                  selectRange={false}
                  value={selecteDate}
                />
              </div>
            ) : (
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  onChange={handleCustomRangeChange}
                  selectRange={true}
                  value={[customRangeStart, customRangeEnd]}
                />
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="px-4" onClick={handlePasteSpecialApply}>
          {isLoading ? (
            <Spinner animation="border" variant="white" size="sm" />
          ) : (
            "Apply"
          )}
        </Button>

        <Button
          variant="default"
          className="border-secondary-subtle btn btn-default border border-gray px-4"
          onClick={() => {
            resetVals();
            setIsLoading(false);
            setSelectedPages({});
            setSelectedPageError("");
            setSelectedLayerError("");
            onHide();
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

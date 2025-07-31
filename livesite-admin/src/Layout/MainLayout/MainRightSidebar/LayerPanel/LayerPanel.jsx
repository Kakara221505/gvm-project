import React, { useEffect, useRef, useState } from "react";
import layer from "../../../../Assets/Icons/Layers.svg";
import up from "../../../../Assets/Icons/TriangleUp.png";
import minus from "../../../../Assets/Icons/TriangleDown.png";
import Unlock from "../../../../Assets/Icons/Unlock.png";
import Lock from "../../../../Assets/Icons/Lock.svg";
import Hide from "../../../../Assets/Icons/EyeHide.svg";
import Show from "../../../../Assets/Icons/EyeShow.png";
import TextICO from "../../../../Assets/Icons/TextIcoLayer.png";
import Plus from "../../../../Assets/SVGIcons/Plus.svg";
import Square from "../../../../Assets/Icons/square.png";
import Rect from "../../../../Assets/Icons/rectangular.png";
import threeDot from "../../../../Assets/Icons/three-dots-svgrepo-com.svg";
import circle from "../../../../Assets/Icons/circle.png";
import triangle from "../../../../Assets/Icons/triangle.png";
import Hexa from "../../../../Assets/Icons/hexagon.png";
import star from "../../../../Assets/Icons/star.png";
import DeleteWhite from "../../../../Assets/Icons/trash.svg";
import EditWhite from "../../../../Assets/Icons/Edit.svg";
import ShapesIcon from "../../../../Assets/Icons/ShapesIcon.png";
import LineIcon from "../../../../Assets/Icons/LineIcon.png";
import "./LayerPanel.css";
import Accordion from "react-bootstrap/Accordion";
import { useShapeContext } from "../../../../contexts/shapeContext";
import Layer from "./Layer";
import AddLayerModal, {
  updateLayerAPI,
} from "../../../../Components/Modals/AddLayerModal";
import DeleteLayerModal from "../../../../Components/Modals/DeleteLayerModal";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import FilterModal from "./FilterModel";
import {
  deleteApiCaller,
  postApiCaller,
  putApiCaller,
} from "../../../../Lib/apiCaller";
import { GlobalValues } from "../../../../Lib/GlobalValues";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import {
  RiEdit2Line,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeCloseLine,
  RiLockLine,
  RiLockUnlockLine,
} from "react-icons/ri";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";
import Dropdown from "react-bootstrap/Dropdown";

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./La.css";
import _ from "lodash";
import { getDisableStyle } from "../../../../Lib/Globalfunctions";

const ItemType = "TREE_NODE";

const getImgType = (userShape) => {
  const typeOfShape = userShape?.type;

  switch (typeOfShape) {
    case "rect":
      return Rect;
    case "ellipse":
      return circle;
    case "square":
      return Square;
    case "line":
      return LineIcon;
    case "textbox":
      return TextICO;
    case "triangle":
      return triangle;
    case "Star":
      return star;
    case "polygon":
      return Hexa;
    case "FreeForm":
      // toggleDrawPolygon();
      break;
    default:
      break;
  }
};

const TreeNode = ({
  node,
  nodes,
  index,
  parentIndex,
  moveNode,
  toggleCollapse,
  toggleCheckbox,
  toggleAction,
  handleHideClick,
  handleLockClick,
  handleShapeLockClick,
  handleShapeEyeClick,
  handleEditLayerName,
  handleDelete,
  layerVisibilityStates,
  layerLockStates,
  handleLayerSelect,
  currActiveOpt,
  setCurrentActiveOpt,
  selectedObject,
  shapeLockStates,
  shapeVisibilityStates,
  pages,
  activeCanvas,
  handleDeleteLayer,
  getDisableStyle,
  isProjecteEditable,
}) => {
  const [showOpt, setShowOpt] = useState(false);
  const { state, actions } = useShapeContext();
  const [isHide, setIsHide] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const optionsRef = useRef(null);

  const { activeObjects } = state;

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOpt(false);
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsRef]);

  function handleLayerOptionClick(e) {
    e.stopPropagation();
    actions.isSelectSpecialChanges(false);
    setCurrentActiveOpt(index);
    setIsMenuOpen((prev) => !prev);
    if (index === currActiveOpt) {
      setShowOpt((prev) => !prev);
    } else {
      setShowOpt(true);
    }
  }

  function handleOptions(type) {
    actions.isSelectSpecialChanges(false);
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );

    if (currCanvasData[0].calendar.layers.length > 0) {
      const existingUser = currCanvasData[0].calendar.layers.find(
        (layer) => layer.ID === node.LayerID
      );
      const currentObj = existingUser.annotations.find(
        (anno) => anno.ID === node.ID
      );

      switch (type) {
        case "DUPLICATE":
          actions.updateCurrentOpt({ currentOption: 1, currentObj });
          break;
        case "DELETE":
          actions.updateCurrentOpt({ currentOption: 2, currentObj });
          break;
        case "ADD_COMMENT":
          actions.updateCurrentOpt({ currentOption: 3, currentObj });
          break;
        case "UPDATE_COMMENT":
          actions.updateCurrentOpt({ currentOption: 3, currentObj });
          break;
        case "ADD_TITLE":
          actions.updateCurrentOpt({ currentOption: 4, currentObj });
          break;
        case "ADD_ICON":
          actions.updateCurrentOpt({ currentOption: 5, currentObj });
          break;
        case "SELECT_SHAPE":
          actions.updateCurrentOpt({ currentOption: 7, currentObj });
          break;
        case "HIDE_INDIVIDUAL_SHAPE":
          const propertiesToUpdate = ["visible", "comment", "title", "icon"];

          propertiesToUpdate.forEach((prop) => {
            if (prop === "visible") {
              currentObj.set({ visible: isHide });
            } else if (node[prop]) {
              currentObj[prop].set({ visible: isHide });
            }
          });

          actions.updateCurrentOpt({ currentObj });
          break;
        default:
          break;
      }
    }
    handleLayerRemove();
  }

  function handleLayerRemove() {
    setShowOpt(false);
    setCurrentActiveOpt(null);
    setIsMenuOpen(false);
  }

  const handleShapeClick = () => {
    actions.isSelectSpecialChanges(false);
    if (!isMenuOpen) {
      setCurrentActiveOpt(index);
      handleOptions("SELECT_SHAPE");
    }
  };

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: node.ID, index, parentIndex, isAnnotation: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) =>
      moveNode(
        item.id,
        node.ID,
        item.parentIndex,
        parentIndex,
        item.isAnnotation
      ),
  });

  const opacity = isDragging ? 0.5 : 1;

  const handleCheckboxChange = () => {
    toggleCheckbox(node.ID, !node.checked);
    handleLayerSelect(node.ID);
  };

  const nodeClass = node.children ? "parent-node" : "child-node";

  const nodeImageMap = {
    rect: Rect,
    textbox: TextICO,
    ellipse: circle,
    triangle: triangle,
    line: LineIcon,
    polygon: Hexa,
  };
  const isActive = activeObjects.some((obj) => obj.ID === node.ID);

  return (
    <>
      <div
        onClick={() => nodeClass === "child-node" && handleShapeClick()}
        ref={(nodeRef) => drag(drop(nodeRef))}
        className={`node ${nodeClass} ${isActive ? "active" : ""}`}
        style={{ opacity }}
      >
        <div className="node-header">
          {node.actions.includes("checkbox") && (
            <span
              className="checkbox"
              style={getDisableStyle(!isProjecteEditable)}
            >
              <input
                type="checkbox"
                checked={node.checked}
                onChange={handleCheckboxChange}
              />
            </span>
          )}
          {node.actions.includes("img") && (
            <img
              src={nodeImageMap[node.Name]}
              className="img-fluid"
              alt={node.type}
              width={30}
            />
          )}
          {node.actions.includes("arrow") && (
            <span className="arrow" onClick={() => toggleCollapse(node.ID)}>
              {node.collapsed ? (
                <MdKeyboardArrowRight className="action" />
              ) : (
                <MdKeyboardArrowDown className="action" />
              )}
            </span>
          )}
          {node.title ? node.title?.text : node?.Name}
          <div className="actions">
            {node.actions.includes("edit") && isProjecteEditable && (
              <OverlayTrigger
                key={`${node.ID}-edit-tooltip`}
                placement="top"
                overlay={<Tooltip>Edit</Tooltip>}
              >
                <span
                  className="action"
                  role="button"
                  onClick={() => handleEditLayerName(node.ID, node?.Name)}
                >
                  <RiEdit2Line />
                </span>
              </OverlayTrigger>
            )}
            {node.actions.includes("delete") && isProjecteEditable && (
              <OverlayTrigger
                key={`${node.ID}-delete-tooltip`}
                placement="top"
                overlay={<Tooltip>Delete</Tooltip>}
              >
                <span
                  className="action"
                  role="button"
                  onClick={(e) => handleDelete(e, node)}
                >
                  <RiDeleteBinLine />
                </span>
              </OverlayTrigger>
            )}
            {node.actions.includes("layerEye") && (
              <OverlayTrigger
                key={`${node.ID}-eye-tooltip`}
                placement="top"
                overlay={
                  <Tooltip>
                    {!layerVisibilityStates[node.ID] ? "Hide" : "Show"}
                  </Tooltip>
                }
              >
                <span
                  className="action"
                  role="button"
                  onClick={(e) => handleHideClick(e, node)}
                >
                  {!layerVisibilityStates[node.ID] ? (
                    <RiEyeLine />
                  ) : (
                    <RiEyeCloseLine />
                  )}
                </span>
              </OverlayTrigger>
            )}
            {node.actions.includes("shapeEye") && (
              <OverlayTrigger
                key={`${node.ID}-hide-tooltip`}
                placement="top"
                overlay={
                  <Tooltip>
                    {!shapeVisibilityStates[node.ID] ? "Show" : "Hide"}
                  </Tooltip>
                }
              >
                <span
                  className="action"
                  role="button"
                  onClick={(e) => handleShapeEyeClick(e, node)}
                >
                  {!shapeVisibilityStates[node.ID] ? (
                    <RiEyeLine />
                  ) : (
                    <RiEyeCloseLine />
                  )}
                </span>
              </OverlayTrigger>
            )}
            {node.actions.includes("layerLock") && (
              <OverlayTrigger
                // key={`${node.ID}-lock-tooltip`}
                // key={`${node.ID}-${node.IsLocked ? 'lock' : 'unlock'}-tooltip`}
                placement="top"
                overlay={
                  <Tooltip>
                    {layerLockStates[node.ID] ? "UnLock" : "Lock"}
                  </Tooltip>
                }
              >
                <span
                  className="action"
                  role="button"
                  onClick={(e) => handleLockClick(e, node)}
                >
                  {layerLockStates[node.ID] ? (
                    <RiLockLine />
                  ) : (
                    <RiLockUnlockLine />
                  )}
                </span>
              </OverlayTrigger>
            )}
            {node.actions.includes("shapeLock") &&
              node.isEditable &&
              isProjecteEditable && (
                <OverlayTrigger
                  // key={`${node.ID}-${node.IsLocked ? 'lock' : 'unlock'}-tooltip`}
                  placement="top"
                  overlay={
                    <Tooltip>
                      {shapeLockStates[node.ID] ? "UnLock" : "Lock"}
                    </Tooltip>
                  }
                >
                  <span
                    className="action"
                    role="button"
                    onClick={(e) => handleShapeLockClick(e, node)}
                  >
                    {shapeLockStates[node.ID] ? (
                      <RiLockLine />
                    ) : (
                      <RiLockUnlockLine />
                    )}
                  </span>
                </OverlayTrigger>
              )}
            <>
              {node.actions.includes("menu") && isProjecteEditable && (
                <>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Menu</Tooltip>}
                  >
                    <img
                      src={threeDot}
                      className="img-fluid cursor-pointer ms-1"
                      alt="three-dot"
                      width={20}
                      onClick={handleLayerOptionClick}
                    />
                  </OverlayTrigger>

                  <Dropdown
                    show={currActiveOpt === index && showOpt}
                    className="position-relative"
                  >
                    <Dropdown.Toggle
                      variant="white"
                      id="dropdown-basic"
                      onClick={handleLayerOptionClick}
                      style={{
                        opacity: 0, // Make it invisible
                        position: "absolute", // Remove it from normal flow
                        pointerEvents: "none", // Ensure it doesn't interfere with clicks
                      }}
                    />

                    <Dropdown.Menu className="MainHome fs-6 border p-2 shadow text-black z-2 rounded-xl bg-white text-start">
                      <Dropdown.Item
                        className="hover-layer my-1  cursor-pointer"
                        onClick={() => handleOptions("DELETE")}
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="hover-layer my-1  cursor-pointer"
                        onClick={() => handleOptions("DUPLICATE")}
                      >
                        Duplicate
                      </Dropdown.Item>
                      {!node.text && (
                        <>
                          <Dropdown.Item
                            onClick={() =>
                              handleOptions(
                                node?.comment ? "UPDATE_COMMENT" : "ADD_COMMENT"
                              )
                            }
                            className="hover-layer my-1  cursor-pointer"
                          >
                            {node?.comment ? "Update Comment" : "Add Comment"}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleOptions("ADD_TITLE")}
                            className="hover-layer my-1  cursor-pointer"
                          >
                            {node?.title ? "Update Title" : "Add Title"}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleOptions("ADD_ICON")}
                            className="hover-layer my-1  cursor-pointer"
                          >
                            {node?.icon ? "Update Icon" : "Add Icon"}
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}
            </>
          </div>
        </div>
        {!node.collapsed && node.children && (
          <div className="children">
            {node.children.map((child, idx) => (
              <TreeNode
                key={child.ID}
                node={child}
                index={idx}
                parentIndex={index}
                moveNode={moveNode}
                toggleCollapse={toggleCollapse}
                toggleCheckbox={toggleCheckbox}
                toggleAction={toggleAction}
                handleLockClick={handleLockClick}
                handleShapeLockClick={handleShapeLockClick}
                handleShapeEyeClick={handleShapeEyeClick}
                handleHideClick={handleHideClick}
                layerVisibilityStates={layerVisibilityStates}
                layerLockStates={layerLockStates}
                currActiveOpt={currActiveOpt}
                setCurrentActiveOpt={setCurrentActiveOpt}
                selectedObject={selectedObject}
                shapeLockStates={shapeLockStates}
                shapeVisibilityStates={shapeVisibilityStates}
                pages={pages}
                activeCanvas={activeCanvas}
                getDisableStyle={getDisableStyle}
                isProjecteEditable={isProjecteEditable}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default function LayerPanel() {
  const { userID, headers, projectId } = GlobalValues();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [currActiveOpt, setCurrentActiveOpt] = useState();
  const [isHide, setIsHide] = useState(false);
  const [isHideId, setIsHideId] = useState();
  const [layerId, setLayerId] = useState();
  const [users, setUsers] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [mergeModalShow, setMergeModalShow] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [mergedLayerName, setMergedLayerName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState(null);
  const { state, actions } = useShapeContext();
  const [layerLockStates, setLayerLockStates] = useState({});
  const [layerVisibilityStates, setLayerVisibilityStates] = useState({});
  const [layerNameError, setLayerNameError] = useState("");
  const {
    pages,
    shapes,
    canvases,
    currentUser,
    activeCanvas,
    selectedObject,
    selectedShapeFilter,
    selectedLayerFilter,
    selectedTextFilter,
    selectedCategoryFilter,
    selectedSubCategoryFilter,
    selectedOrganizationFilter,
    selectedUserFilter,
    selectedAllUserFilter,
    selectDate,
    isProjecteEditable,
  } = state;
  const clonedState = _.cloneDeep(state);
  const [show, setShow] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [selectedFilterLayers, setSelectedFilterLayers] = useState([]);
  const [selectedFilterOrganizations, setSelectedFilterOrganizations] =
    useState([]);
  const [selectedFilterUsers, setSelectedFilterUsers] = useState([]);
  const [selectedAllFilterUsers, setSelectedAllFilterUsers] = useState([]);
  const [textFilter, setTextFilter] = useState("");
  const [selectedFilterCategories, setSelectedFilterCategories] = useState([]);
  const [selectedFilterSubCategories, setSelectedFilterSubCategories] =
    useState([]);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [shapeLockStates, setShapeLockStates] = useState({});
  const [shapeVisibilityStates, setShapeVisibilityStates] = useState({});

  // const handleExpandCollapse = (nodeId) => {
  //   setExpandedNodes((prev) =>
  //     prev.includes(nodeId)
  //       ? prev.filter((id) => id !== nodeId)
  //       : [...prev, nodeId]
  //   );
  // };
  useEffect(() => {
    const fetchData = async () => {
      const currCanvasData = pages.filter(
        (canvasShape) => canvasShape.ID === activeCanvas
      );
      if (currCanvasData[0].calendar.layers.length > 0) {
        const existingUser = currCanvasData[0].calendar.layers.find(
          (layer) => layer.ID === currentUser
        );
        if (!existingUser) {
          actions.updateCurrentUser(currCanvasData[0].calendar.layers[0]?.ID);
        }
      }

      const sortedLayers = currCanvasData[0].calendar.layers.sort(
        (a, b) => a.Layer_order - b.Layer_order
      );
      setUsers(sortedLayers);
      const formattedData = formatData(
        sortedLayers,
        selectedLayerFilter,
        selectedShapeFilter,
        selectedTextFilter,
        selectedCategoryFilter,
        selectedSubCategoryFilter,
        selectedOrganizationFilter,
        selectedUserFilter,
        selectedAllUserFilter
      );
      setNodes(formattedData);
    };
    fetchData();
  }, [
    selectedLayerFilter,
    selectedShapeFilter,
    selectedTextFilter,
    selectedCategoryFilter,
    selectedSubCategoryFilter,
    selectedOrganizationFilter,
    selectedUserFilter,
    selectedAllUserFilter,
    pages,
    activeCanvas,
    state.selectDate,
    // currentUser,
  ]);

  useEffect(() => {
    const updateOriginalData = () => {
      const transformNodesToOriginal = (nodes) => {
        return nodes.map((node, index) => ({
          ID: node.ID,
          Name: node.Name,
          PageID: node.PageID,
          UserID: node.UserID,
          Layer_order: index + 1,
          IsLocked: node.IsLocked,
          IsVisible: node.IsVisible,
          FillColor: node.FillColor,
          StrokeColor: node.StrokeColor,
          StrokeWidth: node.StrokeWidth,
          Font_size: node.Font_size,
          Font_family: node.Font_family,
          StrokeType: node.StrokeType,
          collapsed: node.collapsed,
        }));
      };
      const updatedData = transformNodesToOriginal(nodes);
    };
    updateOriginalData();
  }, [nodes]);

  useEffect(() => {
    if (selectDate) {
      setLayerLockStates({});
    }
  }, [selectDate]);

  const handleExpandCollapse = (nodeId) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const formatData = (
    data,
    selectedLayerFilter,
    selectedShapeFilter,
    selectedTextFilter,
    selectedCategoryFilter,
    selectedSubCategoryFilter,
    selectedOrganizationFilter,
    selectedUserFilter,
    selectedAllUserFilter
  ) => {
    return (
      data
        // .filter(
        //   (item) =>
        //     (selectedUserFilter?.length > 0
        //       ? selectedUserFilter?.some((filter) => filter.value === item.UserID)
        //       : selectedOrganizationFilter?.length === 0 ||
        //         selectedOrganizationFilter?.some(
        //           (filter) => filter.value === item.UserID
        //         )) &&
        //     (selectedLayerFilter?.some((filter) => filter.value === 0) ||
        //       selectedLayerFilter?.length === 0 ||
        //       selectedLayerFilter?.some((filter) => filter.value === item.ID))
        // )
        .filter(
          (item) =>
            selectedLayerFilter?.some((filter) => filter.value === 0) ||
            selectedLayerFilter?.length === 0 ||
            selectedLayerFilter?.some((filter) => filter.value === item.ID)
        )
        .map((item) => ({
          ...item,
          ID: item.ID,
          Name: item.Name,
          IsGroup: item.Group_Name !== "",
          collapsed: item.collapsed,
          checked: false,
          actions: [
            "edit",
            "delete",
            "layerEye",
            "layerLock",
            "checkbox",
            "arrow",
          ],
          children: item.annotations
            ? item.annotations
                .filter(
                  (annotation) =>
                    // Annotation filtering for user and organization
                    (selectedUserFilter?.length > 0
                      ? selectedUserFilter?.some(
                          (filter) => filter.value === annotation?.UserID
                        ) ||
                        selectedOrganizationFilter?.some(
                          (filter) => filter.value === annotation?.UserID
                        )
                      : selectedOrganizationFilter?.length === 0 ||
                        selectedOrganizationFilter?.some(
                          (filter) => filter.value === annotation?.UserID
                        )) &&
                    (selectedShapeFilter.length === 0 ||
                      selectedShapeFilter.includes(annotation.type))
                )
                .filter(
                  (annotation) =>
                    selectedTextFilter.length === 0 ||
                    (annotation.text &&
                      annotation.text
                        .toLowerCase()
                        .replace(/\s+/g, "")
                        .includes(
                          selectedTextFilter.toLowerCase().replace(/\s+/g, "")
                        ))
                )
                .filter(
                  (annotation) =>
                    selectedCategoryFilter?.length === 0 ||
                    selectedCategoryFilter?.some(
                      (filter) => filter.value === annotation?.CategoryID
                    )
                )
                .filter(
                  (annotation) =>
                    selectedSubCategoryFilter?.length === 0 ||
                    selectedSubCategoryFilter?.some(
                      (filter) => filter.value === annotation?.SubCategoryID
                    )
                )
                .map((anno) => ({
                  ...anno,
                  ID: anno?.ID,
                  Name: anno?.type,
                  IsGroup: false,
                  // collapsed: item?.collapsed,
                  checked: false,
                  actions: ["menu", "shapeEye", "shapeLock", "img"],
                }))
            : [],
        }))
    );
  };
  // const isActive = (buttonId) => selectedButtons === buttonId;
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleButtonClick = (buttonId) => {
    setSelectedButtons((prevSelected) => {
      if (prevSelected.includes(buttonId)) {
        return prevSelected?.filter((id) => id !== buttonId);
      } else {
        return [...prevSelected, buttonId];
      }
    });
  };

  const handleApplyFilters = (
    buttons,
    layers,
    text,
    organization,
    users,
    categories,
    subCategories,
    selectedAllUsers
  ) => {
    setSelectedButtons(buttons);
    setSelectedFilterLayers(layers);
    setSelectedFilterOrganizations(organization);
    setSelectedFilterUsers(users);
    setSelectedAllFilterUsers(selectedAllUsers);
    setSelectedFilterCategories(categories);
    setSelectedFilterSubCategories(subCategories);
    setTextFilter(text);
    actions.selectFilterShape(buttons);
    actions.selectFilterLayer(layers);
    actions.selectFilterText(text);
    actions.selectFilterOrganization(organization);
    actions.selectFilterUser(users);
    actions.selectFilterCategory(categories);
    actions.selectFilterSubCategory(subCategories);
    actions.selectAllFilterUser(selectedAllUsers);
    handleClose();
  };

  const handleClearFilters = () => {
    actions.selectFilterShape([]);
    actions.selectFilterLayer([]);
    actions.selectFilterText("");
    actions.selectFilterOrganization([]);
    actions.selectFilterUser([]);
    actions.selectFilterCategory([]);
    actions.selectFilterSubCategory([]);
    actions.selectAllFilterUser([]);
    setSelectedButtons([]);
    setSelectedFilterLayers([]);
    setSelectedFilterOrganizations([]);
    setSelectedFilterUsers([]);
    setSelectedAllFilterUsers([]);
    setSelectedFilterCategories([]);
    setSelectedFilterSubCategories([]);
    setTextFilter("");
    handleClose();
  };

  useEffect(() => {
    handleClearFilters();
  }, [activeCanvas, pages]);

  const handleHideClick = (e, layer) => {
    e.stopPropagation();
    // setSelectedLayers([]);
    const layerId = layer.ID;
    const newVisibilityState =
      layer.IsVisible === undefined ? false : !layer.IsVisible;

    setLayerVisibilityStates((prevStates) => ({
      ...prevStates,
      [layerId]: !newVisibilityState,
    }));
    // Update the layer's visibility in your state management
    actions.updateLayer({
      canvasId: activeCanvas,
      layerId: layerId,
      IsVisible: newVisibilityState,
    });

    if (layer.annotations.length >= 1) {
      layer.annotations.forEach((shape) => {
        if (shape.originalVisibilityState === undefined) {
          shape.originalVisibilityState = shape.visible;
        }
        const shouldBeVisible = newVisibilityState
          ? shape.originalVisibilityState
          : false;

        newVisibilityState &&
          setShapeVisibilityStates((prevStates) => ({
            ...prevStates,
            [shape.ID]: false,
          }));

        shape.set({
          visible: newVisibilityState,
          isLayerVisible: newVisibilityState,
          IsVisible: newVisibilityState,
        });
        const propertiesToUpdate = ["comment", "title", "icon"];
        propertiesToUpdate.forEach((prop) => {
          if (shape[prop]) {
            shape[prop].set({
              visible: newVisibilityState,
            });
          }
        });
        actions.updateCurrentOpt({ currentObj: shape });
      });
    }
  };

  const handleDelete = (e, data) => {
    const currentPage = pages.find((res) => res.ID === activeCanvas);
    if (currentPage.calendar.layers.length <= 1) {
      toast.warning("Oops, you are not able to delete this layer");
      return;
    }
    e.stopPropagation();
    setDeleteModalShow(true);
    setLayerId(data);
  };

  const handleDeleteLayer = async (id) => {
    actions.updateState(clonedState);
    if (id) {
      const payload = {
        delCanvasId: activeCanvas,
        layerId: id,
      };
      actions.updateState(clonedState);
      actions.deleteLayer(payload);
      setDeleteModalShow(false);
      actions.isAnyDataChanges(true);
      setLayerId({});
      // try {
      //   const response = await deleteApiCaller(`layer/${id}`, headers);
      //   if (response?.status === "success") {
      //     actions.updateState(clonedState);
      //     const payload = {
      //       delCanvasId: activeCanvas,
      //       layerId: id,
      //     };
      //     actions.deleteLayer(payload);
      //     setDeleteModalShow(false);
      //     actions.isAnyDataChanges(true);
      //     setLayerId({});
      //   }
      // } catch (error) {
      //   setDeleteModalShow(false);
      // }
    } else {
      setDeleteModalShow(false);
      setLayerId({});
    }
  };

  const handleLayerSelect = (layerId) => {
    setSelectedLayers((prevSelectedLayers) => {
      if (prevSelectedLayers.includes(layerId)) {
        return prevSelectedLayers.filter((id) => id !== layerId);
      } else {
        return [...prevSelectedLayers, layerId];
      }
    });
  };

  const handleMergeLayers = () => {
    setMergedLayerName("");
    setMergeModalShow(true);
    setIsEditing(false);
  };

  const handleMergeModalClose = () => {
    setMergeModalShow(false);
    setLayerNameError("");
  };

  const mergeLayerAPI = async () => {
    const token = localStorage.getItem("AdminToken");
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const formattedData = {
      UserID: userID,
      PageID: parseInt(activeCanvas.split("-")[1]),
      Name: mergedLayerName,
      IsLocked: false,
      IsVisible: true,
      FillColor: "#0000FF",
      StrokeColor: "#FF0000",
      StrokeWidth: 2.0,
      Font_size: 14.0,
      Font_family: "Times New Roman",
      StrokeType: "dot",
      IsGroup: true,
      layerIds: selectedLayers,
    };

    try {
      const response = await postApiCaller(
        "layer/merge-layer",
        formattedData,
        headers
      );

      return response;
    } catch (error) {}
  };

  const handleMergeModalSave = async () => {
    const trimmedLayerName = mergedLayerName.trim();
    if (!trimmedLayerName) {
      setLayerNameError("Name is required");
    } else {
      if (isEditing) {
        actions.updateLayer({
          canvasId: activeCanvas,
          layerId: editingLayerId,
          newName: mergedLayerName,
        });
        actions.isAnyDataChanges(true);
      } else {
        const response = await mergeLayerAPI();

        if (response.status === "success") {
          actions.updateState(clonedState);
          actions.mergeLayers({
            selectedCanvasId: activeCanvas,
            layerIds: selectedLayers,
            mergedLayerName,
            newId: response.layerID,
          });
        }
      }
      setSelectedLayers([]);
      setMergeModalShow(false);
      setLayerNameError("");
      actions.isAnyDataChanges(true);
    }
  };

  const handleEditLayerName = (layerId, currentName) => {
    setMergedLayerName(currentName);
    setEditingLayerId(layerId);
    setIsEditing(true);
    setMergeModalShow(true);
  };

  const handleLockClick = (e, layer) => {
    e.stopPropagation();
    // setSelectedLayers([]);
    const layerId = layer.ID;
    const newLockState = !layerLockStates[layerId];

    setLayerLockStates((prevStates) => ({
      ...prevStates,
      [layerId]: newLockState,
    }));

    actions.updateLayer({
      canvasId: activeCanvas,
      layerId: layerId,
      IsLocked: newLockState,
    });

    if (layer.annotations.length >= 1) {
      layer.annotations.forEach((shape) => {
        if (!shape.originalLockState) {
          shape.originalLockState = {
            lockMovementX: shape.lockMovementX,
            lockMovementY: shape.lockMovementY,
            lockScalingX: shape.lockScalingX,
            lockScalingY: shape.lockScalingY,
            lockRotation: shape.lockRotation,
            editable: shape.editable,
            selectable: shape.selectable,
            evented: shape.evented,
          };
        }

        const shouldLock = newLockState;

        shape.set({
          lockMovementX: shouldLock,
          lockMovementY: shouldLock,
          lockScalingX: shouldLock,
          lockScalingY: shouldLock,
          lockRotation: shouldLock,
          editable: !shouldLock,
          selectable: !shouldLock,
          evented: !shouldLock,
        });

        const propertiesToUpdate = ["comment", "title", "icon"];
        propertiesToUpdate.forEach((prop) => {
          if (shape[prop]) {
            shape[prop].set({
              lockMovementX: shouldLock,
              lockMovementY: shouldLock,
              lockScalingX: shouldLock,
              lockScalingY: shouldLock,
              lockRotation: shouldLock,
              editable: !shouldLock,
              selectable: !shouldLock,
              evented: !shouldLock,
            });
          }
        });

        actions.updateCurrentOpt({ currentObj: shape });
      });
    }
  };

  const handleShapeLockClick = (e, shape) => {
    const currentLayer = nodes.find((node) => node.ID === shape.LayerID);
    const userShape = currentLayer.annotations.find(
      (anno) => anno.ID === shape.ID
    );

    const shapeId = userShape.ID;
    e.stopPropagation();
    const isParentLayerLocked = currentLayer.IsLocked;

    if (isParentLayerLocked) {
      // If the parent layer is locked, do not allow unlocking the shape
      return;
    }

    const newLockState = !shapeLockStates[shapeId];
    setShapeLockStates((prevStates) => ({
      ...prevStates,
      [shapeId]: newLockState,
    }));

    const propertiesToUpdate = ["comment", "title", "icon"];

    userShape.set({
      lockMovementX: newLockState,
      lockMovementY: newLockState,
      lockScalingX: newLockState,
      lockScalingY: newLockState,
      lockRotation: newLockState,
      editable: !newLockState,
      selectable: !newLockState,
      evented: !newLockState,
      IsLocked: newLockState,
    });

    propertiesToUpdate.forEach((prop) => {
      if (userShape[prop]) {
        userShape[prop].set({
          lockMovementX: newLockState,
          lockMovementY: newLockState,
          lockScalingX: newLockState,
          lockScalingY: newLockState,
          lockRotation: newLockState,
          editable: !newLockState,
          selectable: !newLockState,
          evented: !newLockState,
          IsLocked: newLockState,
        });
      }
    });

    actions.updateCurrentOpt({ currentObj: userShape });
  };

  const handleShapeEyeClick = (e, shape) => {
    const currentLayer = nodes.find((node) => node.ID === shape.LayerID);
    const userShape = currentLayer.annotations.find(
      (anno) => anno.ID === shape.ID
    );
    const shapeId = userShape.ID;
    e.stopPropagation();
    let isParentLayerHide =
      currentLayer.IsVisible === undefined ? false : !currentLayer.IsVisible;

    if (isParentLayerHide) {
      // If the parent layer is locked, do not allow unlocking the shape
      return;
    }

    const newVisibilityState = !shapeVisibilityStates[shapeId];
    setShapeVisibilityStates((prevStates) => ({
      ...prevStates,
      [shapeId]: newVisibilityState,
    }));

    const propertiesToUpdate = ["comment", "title", "icon"];

    userShape.set({
      visible: !newVisibilityState,
      IsVisible: !newVisibilityState,
    });

    propertiesToUpdate.forEach((prop) => {
      if (userShape[prop]) {
        userShape[prop].set({
          visible: !newVisibilityState,
          IsVisible: !newVisibilityState,
        });
      }
    });

    actions.updateCurrentOpt({ currentObj: userShape });
  };

  const MergeButton = ({ handleMergeLayers, selectedLayers }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="merge-tooltip">Merge Layers</Tooltip>}
    >
      <button
        className="border-0 bg-transparent"
        onClick={handleMergeLayers}
        disabled={selectedLayers.length < 2}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-arrow-merge"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="var(--text-primary)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M8 7l4 -4l4 4" />
          <path d="M12 3v5.394a6.737 6.737 0 0 1 -3 5.606a6.737 6.737 0 0 0 -3 5.606v1.394" />
          <path d="M12 3v5.394a6.737 6.737 0 0 0 3 5.606a6.737 6.737 0 0 1 3 5.606v1.394" />
        </svg>
      </button>
    </OverlayTrigger>
  );

  const FilterButton = () => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="filter-tooltip">Filter</Tooltip>}
    >
      <button className="border-0 bg-transparent">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-adjustments-horizontal"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="var(--text-primary)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 6l8 0" />
          <path d="M16 6l4 0" />
          <path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 12l2 0" />
          <path d="M10 12l10 0" />
          <path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 18l11 0" />
          <path d="M19 18l1 0" />
        </svg>
      </button>
    </OverlayTrigger>
  );

  const AddButton = () => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="filter-tooltip">Add Layer</Tooltip>}
    >
      <button
        className="border-0 bg-transparent"
        onClick={() => setModalShow(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-plus"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="var(--text-primary)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 5l0 14" />
          <path d="M5 12l14 0" />
        </svg>
      </button>
    </OverlayTrigger>
  );

  const toggleCollapse = (id) => {
    setNodes(
      nodes.map((node) =>
        node.ID === id ? { ...node, collapsed: !node.collapsed } : node
      )
    );
    const updatedNode = nodes.find((node) => node.ID === id);
    // actions.collapsedLayer({
    //   canvasId: activeCanvas,
    //   layerID: id,
    //   collapsed: updatedNode.collapsed,
    // });
  };

  const toggleCheckbox = (id, checked) => {
    const updateNodeCheckbox = (node) => {
      if (node.ID === id) {
        node.checked = checked;
      }
      if (node.children) {
        node.children = node.children.map(updateNodeCheckbox);
      }
      return node;
    };
    setNodes(nodes.map(updateNodeCheckbox));
  };

  const moveNode = (
    draggedId,
    targetId,
    draggedParentIndex,
    targetParentIndex,
    isAnnotation
  ) => {
    const updatedNodes = [...nodes];

    // Find node and parent based on ID
    const findNodeAndParent = (nodes, id) => {
      for (const node of nodes) {
        if (node.ID === id) return { node, parent: null };
        if (node.children) {
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (child.ID === id) return { node: child, parent: node };
            if (child.children) {
              const found = findNodeAndParent(child.children, id);
              if (found.node) return found;
            }
          }
        }
      }
      return { node: null, parent: null };
    };

    const draggedNodeData = findNodeAndParent(updatedNodes, draggedId);
    const targetNodeData = findNodeAndParent(updatedNodes, targetId);

    if (draggedNodeData.node && targetNodeData.node) {
      // Moving an annotation (child node) to a different layer (parent node)
      if (isAnnotation && draggedNodeData.parent && targetNodeData.node) {
        const draggedParentNode = draggedNodeData.parent;
        let targetLayerNode = targetNodeData.node;

        if (targetNodeData.parent) {
          targetLayerNode = targetNodeData.parent;
        }

        // Remove the annotation from the original parent
        const draggedIndex = draggedParentNode.children.findIndex(
          (child) => child.ID === draggedId
        );
        const draggedNode = draggedParentNode.children.splice(
          draggedIndex,
          1
        )[0];

        // Ensure the targetLayerNode has a children array
        targetLayerNode.children = targetLayerNode.children || [];
        // Add the annotation to the target layer node
        targetLayerNode.children.push(draggedNode);
        const targetLayerID = targetLayerNode.ID;
        const shapeID = draggedNode.ID;
        const sourceLayerID = draggedNode.LayerID;
        const pageID = draggedNode.PageID;
        if (targetLayerID !== sourceLayerID) {
          actions.updateState(clonedState);
          actions.dragAndDropShape({
            shapeID,
            sourceLayerID,
            targetLayerID,
            pageID,
          });
          actions.changesThings();
        }
      }
      // Moving or reordering nodes within the same parent
      else if (
        draggedNodeData.parent &&
        draggedNodeData.parent === targetNodeData.parent
      ) {
        const parentNode = draggedNodeData.parent;
        const draggedIndex = parentNode.children.findIndex(
          (child) => child.ID === draggedId
        );
        const targetIndex = parentNode.children.findIndex(
          (child) => child.ID === targetId
        );
        const draggedNode = parentNode.children.splice(draggedIndex, 1)[0];
        parentNode.children.splice(targetIndex, 0, draggedNode);
      }
      // Reordering top-level nodes
      else if (
        draggedNodeData.parent === null &&
        targetNodeData.parent === null
      ) {
        const draggedIndex = updatedNodes.findIndex(
          (node) => node.ID === draggedId
        );
        const targetIndex = updatedNodes.findIndex(
          (node) => node.ID === targetId
        );
        const draggedNode = updatedNodes.splice(draggedIndex, 1)[0];
        updatedNodes.splice(targetIndex, 0, draggedNode);
        updatedNodes.forEach((node, index) => {
          actions.updateState(clonedState);
          actions.dragAndDropLayer({ node, index, canvasId: activeCanvas });
          actions.changesThings();
        });
      }
    }

    setNodes(updatedNodes);
  };

  const updateShapeLayer = async () => {
    try {
    } catch (error) {}
  };

  const toggleAction = (id, action) => {
    const updateNodeActions = (node) => {
      if (node.ID === id) {
        if (action === "eye" || action === "hide") {
          node.actions = node.actions.includes("eye")
            ? node.actions.map((act) => (act === "eye" ? "hide" : act))
            : node.actions.map((act) => (act === "hide" ? "eye" : act));
        } else if (action === "lock" || action === "unlock") {
          node.actions = node.actions.includes("lock")
            ? node.actions.map((act) => (act === "lock" ? "unlock" : act))
            : node.actions.map((act) => (act === "unlock" ? "lock" : act));
        }
      }

      if (node.children) {
        node.children = node.children.map(updateNodeActions);
      }

      return node;
    };

    setNodes(nodes.map(updateNodeActions));
  };

  return (
    <>
      <div>
        <div className="LayerSection px-1 layerContainer">
          <div className="LayerHeading">
            <div className="row align-items-center py-2 mx-0 border-bottom border-2">
              <div className="col-lg-6 d-flex align-items-center justify-content-start pe-5">
                <img
                  src={layer}
                  className="fillImg1"
                  alt="layer"
                  width={"36px"}
                  height={"36px"}
                />
                <label className="lightText pe-5">Layers</label>
              </div>
              <div className="col-lg-6 border-start border-2 d-flex justify-content-end">
                <div style={getDisableStyle(!isProjecteEditable)}>
                  <AddButton />
                  <MergeButton
                    handleMergeLayers={handleMergeLayers}
                    selectedLayers={selectedLayers}
                  />
                </div>
                <div onClick={handleShow}>
                  <FilterButton />
                </div>
                <div></div>
              </div>
            </div>
          </div>

          <DndProvider backend={HTML5Backend}>
            <div className="tree">
              {nodes.map((node, index) => (
                <TreeNode
                  key={node.ID}
                  node={node}
                  nodes={nodes}
                  index={index}
                  parentIndex={null}
                  moveNode={moveNode}
                  toggleCollapse={toggleCollapse}
                  toggleCheckbox={toggleCheckbox}
                  toggleAction={toggleAction}
                  handleHideClick={handleHideClick}
                  handleLockClick={handleLockClick}
                  handleShapeLockClick={handleShapeLockClick}
                  handleShapeEyeClick={handleShapeEyeClick}
                  handleEditLayerName={handleEditLayerName}
                  handleDelete={handleDelete}
                  layerVisibilityStates={layerVisibilityStates}
                  layerLockStates={layerLockStates}
                  handleLayerSelect={handleLayerSelect}
                  currActiveOpt={currActiveOpt}
                  setCurrentActiveOpt={setCurrentActiveOpt}
                  selectedObject={selectedObject}
                  shapeLockStates={shapeLockStates}
                  shapeVisibilityStates={shapeVisibilityStates}
                  pages={pages}
                  activeCanvas={activeCanvas}
                  handleDeleteLayer={handleDeleteLayer}
                  getDisableStyle={getDisableStyle}
                  isProjecteEditable={isProjecteEditable}
                />
              ))}
            </div>
          </DndProvider>
        </div>

        <AddLayerModal show={modalShow} onHide={() => setModalShow(false)} />
        <DeleteLayerModal
          layerdata={layerId}
          show={deleteModalShow}
          onHide={(id) => handleDeleteLayer(id)}
        />

        <Modal show={mergeModalShow} onHide={handleMergeModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Layer Name" : "Merge Layers"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="mergedLayerName">
                <Form.Label>
                  {isEditing
                    ? "Enter New Layer Name:"
                    : "Enter Name For Merged Layer:"}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={mergedLayerName}
                  onChange={(e) => setMergedLayerName(e.target.value)}
                />
                {layerNameError && (
                  <p className="text-danger">{layerNameError}</p>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleMergeModalClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleMergeModalSave}>
              {isEditing ? "Save" : "Merge"}
            </Button>
          </Modal.Footer>
        </Modal>
        {show && (
          <FilterModal
            show={show}
            handleClose={handleClose}
            selectedButtons={selectedButtons}
            setSelectedButtons={setSelectedButtons}
            selectedLayers={selectedFilterLayers}
            setSelectedLayers={setSelectedFilterLayers}
            setSelectedOrganizations={setSelectedFilterOrganizations}
            selectedOrganizations={selectedFilterOrganizations}
            selectedUsers={selectedFilterUsers}
            setSelectedUsers={setSelectedFilterUsers}
            setSelectedAllUsers={setSelectedAllFilterUsers}
            selectedAllUsers={selectedAllFilterUsers}
            selectedCategories={selectedFilterCategories}
            setSelectedCategories={setSelectedFilterCategories}
            selectedSubCategories={selectedFilterSubCategories}
            setSelectedSubCategories={setSelectedFilterSubCategories}
            textFilter={textFilter}
            setTextFilter={setTextFilter}
            handleButtonClick={handleButtonClick}
            handleApplyFilters={handleApplyFilters}
            handleClearFilters={handleClearFilters}
          />
        )}
      </div>
    </>
  );
}

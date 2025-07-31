import React, { useEffect, useState, useContext } from "react";
import { Modal, Button, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { useShapeContext } from "../../../../contexts/shapeContext";
import Select from "react-select";
import { ThemeContext } from "../../../../Theme/ThemeContext";
import { GlobalValues } from "../../../../Lib/GlobalValues";
import { getApiCaller, postApiCaller } from "../../../../Lib/apiCaller";
import { toast } from "react-toastify";

const FilterModal = ({
  show,
  handleClose,
  selectedButtons,
  setSelectedButtons,
  selectedLayers,
  setSelectedLayers,
  selectedOrganizations,
  setSelectedOrganizations,
  selectedUsers,
  setSelectedUsers,
  selectedAllUsers,
  setSelectedAllUsers,
  selectedCategories,
  setSelectedCategories,
  selectedSubCategories,
  setSelectedSubCategories,
  textFilter,
  setTextFilter,
  handleButtonClick,
  handleApplyFilters,
  handleClearFilters,
}) => {
  const { state, actions, currentuser } = useShapeContext();
  const { activeCanvas, headers, projectId, userID } = GlobalValues();
  const isActive = (buttonId) => selectedButtons?.includes(buttonId);
  const { theme } = useContext(ThemeContext);
  const [layerOptions, setLayerOptions] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [categorieOptions, setCategorieOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterList, setFilterList] = useState([]);
  const [selectedFilterList, setSelectedFilterList] = useState("");
  useEffect(() => {
    // !isActive("textbox") && setTextFilter("")
  }, [isActive]);
  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const loadSavedFilters = async () => {
    if (!selectedFilterList) {
      toast.warn("Please select at least one filter");
      return
    }

    const response = await getApiCaller(
      `filter/get_filter_by_id?id=${selectedFilterList}`,
      headers
    );
    const savedFilters = response.data.Filter;
    if (savedFilters) {
      setSelectedLayers(savedFilters.selectedLayers || []);
      setSelectedOrganizations(savedFilters.selectedOrganizations || []);
      setSelectedUsers(savedFilters.selectedUsers || []);
      // setSelectedAllUsers(savedFilters.selectedAllUsers || []);
      setSelectedButtons(savedFilters.selectedButtons || []);
      setTextFilter(savedFilters.textFilter || "");
      setSelectedCategories(savedFilters.selectedCategories || []);
      setSelectedSubCategories(savedFilters.selectedSubCategories || []);
    }
  };

  const handleSaveFilter = () => {
    // Check if any filter is selected
    if (
      selectedLayers.length === 0 &&
      selectedOrganizations.length === 0 &&
      selectedUsers.length === 0 &&
      // selectedAllUsers.length === 0 &&
      selectedButtons.length === 0 &&
      !textFilter &&
      selectedCategories.length === 0 &&
      selectedSubCategories.length === 0
    ) {
      toast.warn("Please select at least one filter before saving.");
    } else {
      setShowSaveFilterModal(true);
    }
  };

  const handleCloseModel = () => {
    setFilterName("");
    setShowSaveFilterModal(false);
  };

  const saveFilters = async () => {
    if (!filterName) {
      return toast.error("Filter name is required!");
    }

    const filterInputs = {
      selectedLayers,
      selectedOrganizations,
      selectedUsers,
      selectedAllUsers,
      selectedButtons,
      selectedCategories,
      selectedSubCategories,
      textFilter,
    };

    const data = {
      Name: filterName,
      UserID: userID,
      Filter: filterInputs,
    };

    try {
      const response = await postApiCaller(
        `filter/add_update-filter`,
        data,
        headers
      );
      if (response?.status === "success") {
        // actions.isAnyDataChanges(false);
        toast.success(response?.message);
        setFilterName("");
        setShowSaveFilterModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    const pageID = activeCanvas && activeCanvas?.split("-")?.[1];
    const selectedDate =
      localStorage.getItem("selecteDate") || getFormattedDate();
    const fetchLayers = async () => {
      try {
        const response = await getApiCaller(
          `layer/get_layer_all_data?pageId=${pageID}&AssignDate=${selectedDate}`,
          headers
        );
        const layers = response.data?.map((layer) => ({
          value: layer.ID,
          label: layer.Name,
        }));
        setLayerOptions(layers);
      } catch (error) {
        console.error("Error fetching layers:", error);
      }
    };
    const fetchOrganization = async () => {
      try {
        const response = await getApiCaller(
          `share/get_share_project_by_organization?ProjectID=${projectId}`,
          headers
        );
        const organizations = response.organizations?.map((organization) => ({
          value: organization.OrganizationID,
          label: organization.OrganizationName,
        }));
        setOrganizationOptions(organizations);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await getApiCaller(
          `category/get_category_all_data`,
          headers
        );
        const categories = response.data?.map((categorie) => ({
          value: categorie.ID,
          label: categorie.CatepgoryName,
        }));
        setCategorieOptions(categories);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    const fetchFilterList = async () => {
      try {
        const response = await getApiCaller(
          `filter/get_filter_all_data?UserID=${userID}`,
          headers
        );
        setFilterList(response.data);
      } catch (error) {
        console.error("Error fetching layers:", error);
      }
    };

    if (activeCanvas) {
      fetchLayers();
      fetchOrganization();
      fetchCategories();
      fetchFilterList();
    }
  }, [activeCanvas]);

  useEffect(() => {
    const fetchUsers = async () => {
      const isOrganizationSelect =
        selectedOrganizations.length >= 1 ? true : false;
      if (isOrganizationSelect) {
        const selectedOrganization = selectedOrganizations.map(
          (organization) => {
            return organization.value;
          }
        );
        const data = {
          ProjectID: projectId,
          OrganizationIDs: selectedOrganization,
        };

        try {
          const response = await postApiCaller(
            `share/get_share_all_data_with_access`,
            data,
            headers
          );
          const users = response.UsersWithAccess?.map((user) => ({
            value: user.UserID,
            label: user.Name,
          }));
          setUserOptions(users);
          setSelectedAllUsers(users);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      } else {
        setUserOptions([]);
      }
    };

    if (activeCanvas) {
      fetchUsers();
    }
  }, [activeCanvas, selectedOrganizations]);

  useEffect(() => {
    const fetchSubCategory = async () => {
      const isCategorySelect = selectedCategories?.length >= 1 ? true : false;
      if (isCategorySelect) {
        const selectedCategory = selectedCategories?.map((category) => {
          return category.value;
        });
        const data = {
          ProjectID: projectId,
          CategoryID: selectedCategory,
        };

        try {
          const response = await postApiCaller(
            `category/get_sub_category_all_data`,
            data,
            headers
          );
          const subcategorys = response.data?.map((subcategory) => ({
            value: subcategory.ID,
            label: subcategory.SubCategoryName,
          }));
          setSubCategoryOptions(subcategorys);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      } else {
        setSubCategoryOptions([]);
      }
    };

    if (activeCanvas) {
      fetchSubCategory();
    }
  }, [activeCanvas, selectedCategories]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      centered
      dialogClassName={theme}
    >
      <Modal.Header className="commonModalBg d-flex justify-content-between">
        <Modal.Title className="menuTextHeader">Filter</Modal.Title>
        <div className="d-flex">
          <select
            value={selectedFilterList || ""}
            onChange={(e) => setSelectedFilterList(e.target.value)}
            className="me-2"
          >
            <option value="" disabled>
              Select a filter
            </option>
            {filterList.map((filter) => (
              <option key={filter.ID} value={filter.ID}>
                {filter.Name}
              </option>
            ))}
          </select>
          <Button variant="primary" className="me-2" onClick={loadSavedFilters}>
            Load Filter
          </Button>
          <Modal.Title
            className="menuTextHeader cursor-pointer"
            onClick={handleClose}
            closeButton
          >
            &times;
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className="commonModalBg">
        <div className="mb-3">
          <label className="menuTextHeader">Select Layers:</label>
          <Select
            isMulti
            options={layerOptions}
            value={selectedLayers}
            onChange={setSelectedLayers}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="mb-3">
          <label className="menuTextHeader">Select Organizations:</label>
          <Select
            isMulti
            options={organizationOptions}
            value={selectedOrganizations}
            onChange={setSelectedOrganizations}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="pb-4 mb-4 border-bottom ps-5">
          <label className="menuTextHeader">By Users:</label>
          <Select
            isMulti
            options={userOptions}
            value={selectedUsers}
            onChange={setSelectedUsers}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="mb-3">
          <label className="menuTextHeader">By Category:</label>
          <Select
            isMulti
            options={categorieOptions}
            value={selectedCategories}
            onChange={setSelectedCategories}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="pb-4 mb-4 border-bottom ps-5">
          <label className="menuTextHeader">By Subcategory:</label>
          <Select
            isMulti
            options={subCategoryOptions}
            value={selectedSubCategories}
            onChange={setSelectedSubCategories}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="d-flex flex-wrap justify-content-between">
          {[
            "triangle",
            "polygon",
            "rect",
            "ellipse",
            "line",
            "textbox",
            "polygon",
          ]?.map((btn, index) => (
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
                    stroke="var(--text-secondary)"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                  </svg>
                )}
                {index === 1 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-hexagon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke="var(--text-secondary)"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  </svg>
                )}
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
                      stroke="var(--text-secondary)"
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
                      stroke="var(--text-secondary)"
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
                      stroke="var(--text-secondary)"
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
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.5 3C12.5 2.72386 12.2761 2.5 12 2.5C11.7239 2.5 11.5 2.72386 11.5 3H12.5ZM11.5 21C11.5 21.2761 11.7239 21.5 12 21.5C12.2761 21.5 12.5 21.2761 12.5 21H11.5ZM11.5 3V21H12.5V3H11.5Z"
                      fill="var(--text-secondary)"
                    />
                    <path
                      d="M19 6C19 5.37191 19 5.05787 18.9194 4.78267C18.7518 4.21026 18.3066 3.71716 17.7541 3.49226C17.4886 3.38413 17.1885 3.35347 16.5884 3.29216C15.1695 3.14718 13.3874 3 12 3C10.6126 3 8.83047 3.14718 7.41161 3.29216C6.8115 3.35347 6.51144 3.38413 6.24586 3.49226C5.69344 3.71716 5.24816 4.21026 5.08057 4.78267C5 5.05787 5 5.37191 5 6"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {index === 6 && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class=""
                  >
                    <circle
                      cx="9"
                      cy="4"
                      r="2"
                      stroke="var(--text-secondary)"
                      stroke-linecap="round"
                    ></circle>
                    <circle
                      cx="19"
                      cy="7"
                      r="2"
                      stroke="var(--text-secondary)"
                      stroke-linecap="round"
                    ></circle>
                    <circle
                      cx="20"
                      cy="20"
                      r="2"
                      stroke="var(--text-secondary)"
                      stroke-linecap="round"
                    ></circle>
                    <circle
                      cx="4"
                      cy="18"
                      r="2"
                      stroke="var(--text-secondary)"
                      stroke-linecap="round"
                    ></circle>
                    <path
                      d="M10.9171 4.5752L17.0848 6.4255M19.1544 8.99455L19.8476 18.0061M18.0162 19.7523L5.98574 18.2484M8.32812 5.88435L4.67383 16.1164"
                      stroke="var(--text-secondary)"
                      stroke-linecap="round"
                    ></path>
                  </svg>
                )}
              </button>
            </OverlayTrigger>
          ))}
        </div>
        {isActive("textbox") && (
          <div className="mt-3">
            <label className="menuTextHeader">Search Text:</label>
            <input
              type="text"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              className="form-control"
            />
          </div>
        )}
      </Modal.Body>
      <Modal
        show={showSaveFilterModal}
        onHide={() => setShowSaveFilterModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Save Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Filter Name</Form.Label>
              <Form.Control
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCloseModel()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveFilters}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal.Footer className="commonModalBg">
        <Button
          variant="primary"
          className="px-4 py-2 loginBtn1"
          onClick={() => handleSaveFilter()}
        >
          Save Filter
        </Button>
        <Button variant="secondary py-2 px-3" onClick={handleClearFilters}>
          Reset
        </Button>
        <Button
          variant="primary"
          className="px-4 py-2 loginBtn1"
          onClick={() =>
            handleApplyFilters(
              selectedButtons,
              selectedLayers,
              textFilter,
              selectedOrganizations,
              selectedUsers,
              selectedCategories,
              selectedSubCategories,
              selectedAllUsers
            )
          }
        >
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;

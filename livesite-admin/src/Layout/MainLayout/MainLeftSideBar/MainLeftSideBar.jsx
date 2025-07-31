import React, { useEffect, useState } from "react";
import ToolSidebar from "../EditorLayout/EditorSidebar/ToolSidebar/ToolSidebar";
import PropertySidebar from "../EditorLayout/EditorSidebar/PropertySidebar/PropertySidebar";
import { useShapeContext } from "../../../contexts/shapeContext";
import { getApiCaller, postApiCaller } from "../../../Lib/apiCaller";
import { GlobalValues } from "../../../Lib/GlobalValues";

export default function MainLeftSideBar({
  setShapeToDraw,
  backgroundColor,
  canvasBackgroundColor,
  filesPreviewShape,
  setSelectSpecialFields
}) {
  const [propertySidebarOpen, setPropertySidebarOpen] = useState(false);
  const { state, actions } = useShapeContext();
  const { selectedObject, activeCanvas, currentUser } = state;
  const { headers, projectId, userID } = GlobalValues();
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  useEffect(() => {
    if (!selectedObject) {
      setPropertySidebarOpen(false);
      return;
    }
  }, [selectedObject, activeCanvas]);

  useEffect(() => {
    fetchCategories();
  }, [activeCanvas]);

  // useEffect(() => {
  //   if (selectedObject?.CategoryID) {
  //     fetchSubCategories(selectedObject?.CategoryID);
  //   }
  // }, [selectedObject?.CategoryID]);

  useEffect(() => {
    setPropertySidebarOpen(false);
  }, [currentUser]);

  const togglePropertySidebar = () => {
    actions.multipleSelection(false);
    setPropertySidebarOpen(!propertySidebarOpen);
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
      setCategoryList(categories);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchSubCategories = async (itemID) => {
    const data = {
      ProjectID: projectId,
      CategoryID: [itemID],
    };

    try {
      const response = await postApiCaller(
        `category/get_sub_category_all_data`,
        data,
        headers
      );
      const subcategories = response.data?.map((subcategory) => ({
        value: subcategory.ID,
        label: subcategory.SubCategoryName,
      }));
      setSubCategoryList(subcategories);
      actions.updateCurrentSubCategory(subcategories[0].value);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <>
      <div className="toolSidebar p-0">
        <ToolSidebar
          setShapeToDraw={setShapeToDraw}
          openPropertySidebar={togglePropertySidebar}
        />
        {propertySidebarOpen && (
          <PropertySidebar
            backgroundColor={backgroundColor}
            canvasBackgroundColor={canvasBackgroundColor}
            filesPreviewShape={filesPreviewShape}
            categoryList={categoryList}
            subCategoryList={subCategoryList}
            fetchSubCategory={(itemID) => fetchSubCategories(itemID)}
            setSelectSpecialFields={setSelectSpecialFields}
          />
        )}
      </div>
    </>
  );
}

import { getApiCaller, postApiCaller } from "./apiCaller";

export const headerFileImport = async (
  projectId,
  fileType,
  file,
  defaultType,
  PageID
) => {
  let UserID = localStorage.getItem("UserID");
  try {
    let adminToken = localStorage.getItem("AdminToken");

    let headers = {
      Authorization: `Bearer ${adminToken}`,
    };

    let formData = new FormData();
    formData.append("UserID", UserID);
    formData.append("ProjectID", projectId);
    formData.append("Type", fileType);
    formData.append("BackgroundMedia", file);
    formData.append("Is_default", defaultType);
    formData.append("PageID", PageID);

    let response = await postApiCaller("background/add_background", formData, {
      headers,
    });
    return response;
  } catch (error) {}
};

export const getHeaderFile = async (projectId) => {
  try {
    let adminToken = localStorage.getItem("AdminToken");

    let headers = {
      Authorization: `Bearer ${adminToken}`,
    };

    let response = await getApiCaller(
      `background/get_background_with_pagination?projectID=${projectId}`,
      { headers }
    );
    return response;
  } catch (error) {}
};

export const assignBg = async (projectId, changeBackgroundPayload) => {
  let UserID = localStorage.getItem("UserID");
  try {
    let adminToken = localStorage.getItem("AdminToken");
    let headers = {
      Authorization: `Bearer ${adminToken}`,
    };

    let formData = new FormData();
    formData.append("UserID", UserID);
    formData.append("ProjectID", projectId);
    // formData.append('Type', changeBackgroundPayload.fileType);
    // formData.append('BackgroundMedia', changeBackgroundPayload.BackgroundMedia);
    // formData.append('Is_default', changeBackgroundPayload.default);
    formData.append("PageID", changeBackgroundPayload.canvasId7);
    formData.append(
      "Date",
      changeBackgroundPayload.dateRange === "custom"
        ? `["${changeBackgroundPayload.startDate2}", "${changeBackgroundPayload.endDate2}"]`
        : changeBackgroundPayload.assignedDate.split("T")[0]
    );
    formData.append("ID", changeBackgroundPayload?.id3);

    let response = await postApiCaller(
      "background/add_background-initiate",
      formData,
      { headers }
    );
    return response;
  } catch (error) {}
};

export const assignBgDefault = async (data, newDate, projectId) => {
  let UserID = localStorage.getItem("UserID");
  try {
    let adminToken = localStorage.getItem("AdminToken");
    let headers = {
      Authorization: `Bearer ${adminToken}`,
    };

    let formData = new FormData();
    formData.append("UserID", UserID);
    formData.append("ProjectID", projectId);
    // formData.append('Type', changeBackgroundPayload.fileType);
    // formData.append('BackgroundMedia', changeBackgroundPayload.BackgroundMedia);
    // formData.append('Is_default', changeBackgroundPayload.default);
    formData.append("PageID", data?.PageID);
    formData.append(
      "Date", newDate
    );
    formData.append("ID", data?.ID);

    let response = await postApiCaller(
      "background/add_background-initiate",
      formData,
      { headers }
    );
    return response;
  } catch (error) {}
};

export const unAssignBg = async (projectId, date, pageId, id) => {
  let UserID = localStorage.getItem("UserID");
  try {
    let adminToken = localStorage.getItem("AdminToken");
    let headers = {
      Authorization: `Bearer ${adminToken}`,
    };
    let body = {
      ID: id,
      UserID: UserID,
      PageID: pageId,
      Dates: date,
      ProjectID: projectId,
    };

    let response = await postApiCaller("background/unassign-background", body, {
      headers,
    });
    return response;
  } catch (error) {}
};

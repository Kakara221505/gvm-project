import axios from "axios";
import { toast } from "react-toastify";

const titleGlobal = async (token, payload) => {
  try {
    if (token) {
      const apiUrl = `${process.env.REACT_APP_PUBLIC_BASE_URL}annotation/paste_comment_annotation`;

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    }
  } catch (error) {
    console.log("============>", error);
    if (error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Network error or server is not responding");
    }
  }
};

// Exporting directly as default
export default titleGlobal;

import {
  UPLOAD_DELETE_FAIL,
  UPLOAD_DELETE_REQUEST,
  UPLOAD_DELETE_SUCCESS,
  UPLOAD_IMAGE_FAIL,
  UPLOAD_IMAGE_REQUEST,
  UPLOAD_IMAGE_RESET,
  UPLOAD_IMAGE_SUCCESS,
} from "../Constants/UploadConstants";
import axios from "axios";
import { logout } from "./UserActions";

// Upload image
export const uploadImage = (formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPLOAD_IMAGE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { 
        Authorization: `Bearer ${userInfo.token}`,
        'Content-Type': 'multipart/form-data'
      },
    };

    const { data } = await axios.post(
      `/api/upload`,
      formData,
      config
    );

    if (!data || !data.url) {
      throw new Error('Upload failed: No image URL received');
    }

    dispatch({ type: UPLOAD_IMAGE_SUCCESS, payload: data });
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: UPLOAD_IMAGE_FAIL,
      payload: message
    });
    throw error;
  }
};

// Delete product
export const deleteUploadImage = (image) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPLOAD_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { 
        Authorization: `Bearer ${userInfo.token}`,
        'Content-Type': 'application/json'
      },
    };

    const { data } = await axios.post(
      `/api/upload/destroy`,
      { public_id: image.public_id },
      config
    );

    dispatch({ type: UPLOAD_DELETE_SUCCESS, payload: data });
    dispatch({ type: UPLOAD_IMAGE_RESET });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: UPLOAD_DELETE_FAIL,
      payload: message
    });
  }
};

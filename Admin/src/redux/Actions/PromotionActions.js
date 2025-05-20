import axios from "axios";
import {
  PROMOTION_LIST_REQUEST,
  PROMOTION_LIST_SUCCESS,
  PROMOTION_LIST_FAIL,
  PROMOTION_DETAILS_REQUEST,
  PROMOTION_DETAILS_SUCCESS,
  PROMOTION_DETAILS_FAIL,
  PROMOTION_CREATE_REQUEST,
  PROMOTION_CREATE_SUCCESS,
  PROMOTION_CREATE_FAIL,
  PROMOTION_UPDATE_REQUEST,
  PROMOTION_UPDATE_SUCCESS,
  PROMOTION_UPDATE_FAIL,
  PROMOTION_DELETE_REQUEST,
  PROMOTION_DELETE_SUCCESS,
  PROMOTION_DELETE_FAIL,
} from "../Constants/PromotionConstants";
import { logout } from "./UserActions"; // For handling token expiry or auth errors

const API_URL = "/api/promotions";

// LIST ALL PROMOTIONS
export const listPromotions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: PROMOTION_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/`, config);
    dispatch({ type: PROMOTION_LIST_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({ type: PROMOTION_LIST_FAIL, payload: message });
  }
};

// GET PROMOTION DETAILS
export const getPromotionDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PROMOTION_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/${id}`, config);
    dispatch({ type: PROMOTION_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({ type: PROMOTION_DETAILS_FAIL, payload: message });
  }
};

// CREATE PROMOTION
export const createPromotion =
  (promotionData) => async (dispatch, getState) => {
    try {
      dispatch({ type: PROMOTION_CREATE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(`${API_URL}/`, promotionData, config);
      dispatch({ type: PROMOTION_CREATE_SUCCESS, payload: data });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") {
        dispatch(logout());
      }
      dispatch({ type: PROMOTION_CREATE_FAIL, payload: message });
    }
  };

// UPDATE PROMOTION
export const updatePromotion =
  (id, promotionData) => async (dispatch, getState) => {
    try {
      dispatch({ type: PROMOTION_UPDATE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `${API_URL}/${id}`,
        promotionData,
        config
      );
      dispatch({ type: PROMOTION_UPDATE_SUCCESS, payload: data });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") {
        dispatch(logout());
      }
      dispatch({ type: PROMOTION_UPDATE_FAIL, payload: message });
    }
  };

// DELETE PROMOTION
export const deletePromotion = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PROMOTION_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`${API_URL}/${id}`, config);
    dispatch({ type: PROMOTION_DELETE_SUCCESS });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({ type: PROMOTION_DELETE_FAIL, payload: message });
  }
};

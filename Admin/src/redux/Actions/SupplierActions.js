import axios from "axios";
import {
  SUPPLIER_LIST_REQUEST,
  SUPPLIER_LIST_SUCCESS,
  SUPPLIER_LIST_FAIL,
  SUPPLIER_CREATE_REQUEST,
  SUPPLIER_CREATE_SUCCESS,
  SUPPLIER_CREATE_FAIL,
  SUPPLIER_DETAILS_REQUEST,
  SUPPLIER_DETAILS_SUCCESS,
  SUPPLIER_DETAILS_FAIL,
  SUPPLIER_UPDATE_REQUEST,
  SUPPLIER_UPDATE_SUCCESS,
  SUPPLIER_UPDATE_FAIL,
  SUPPLIER_DELETE_REQUEST,
  SUPPLIER_DELETE_SUCCESS,
  SUPPLIER_DELETE_FAIL,
} from "../Constants/SupplierConstants";
import { logout } from "./UserActions"; // For handling token errors

const getTokenConfig = (getState) => {
  const {
    userLogin: { userInfo },
  } = getState();
  return {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };
};

// LIST SUPPLIERS
export const listSuppliers = () => async (dispatch, getState) => {
  try {
    dispatch({ type: SUPPLIER_LIST_REQUEST });
    const config = getTokenConfig(getState);
    const { data } = await axios.get(`/api/suppliers`, config);
    dispatch({ type: SUPPLIER_LIST_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: SUPPLIER_LIST_FAIL,
      payload: message,
    });
  }
};

// CREATE SUPPLIER
export const createSupplier = (supplierData) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUPPLIER_CREATE_REQUEST });
    const config = getTokenConfig(getState);
    const { data } = await axios.post(`/api/suppliers`, supplierData, config);
    dispatch({ type: SUPPLIER_CREATE_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: SUPPLIER_CREATE_FAIL,
      payload: message,
    });
  }
};

// GET SUPPLIER DETAILS
export const getSupplierDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUPPLIER_DETAILS_REQUEST });
    const config = getTokenConfig(getState);
    const { data } = await axios.get(`/api/suppliers/${id}`, config);
    dispatch({ type: SUPPLIER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: SUPPLIER_DETAILS_FAIL,
      payload: message,
    });
  }
};

// UPDATE SUPPLIER
export const updateSupplier = (supplierData) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUPPLIER_UPDATE_REQUEST });
    const config = getTokenConfig(getState);
    const { data } = await axios.put(
      `/api/suppliers/${supplierData._id}`,
      supplierData,
      config
    );
    dispatch({ type: SUPPLIER_UPDATE_SUCCESS, payload: data });
    dispatch({ type: SUPPLIER_DETAILS_SUCCESS, payload: data }); // Update details in store as well
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: SUPPLIER_UPDATE_FAIL,
      payload: message,
    });
  }
};

// DELETE SUPPLIER
export const deleteSupplier = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUPPLIER_DELETE_REQUEST });
    const config = getTokenConfig(getState);
    await axios.delete(`/api/suppliers/${id}`, config);
    dispatch({ type: SUPPLIER_DELETE_SUCCESS });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: SUPPLIER_DELETE_FAIL,
      payload: message,
    });
  }
};

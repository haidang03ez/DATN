import axios from "axios";
import {
  ORDER_DELIVERED_FAIL,
  ORDER_DELIVERED_REQUEST,
  ORDER_DELIVERED_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_PAYMENT_STATUS_UPDATE_REQUEST,
  ORDER_PAYMENT_STATUS_UPDATE_SUCCESS,
  ORDER_PAYMENT_STATUS_UPDATE_FAIL,
  ORDER_ADMIN_APPROVE_CANCEL_REQUEST,
  ORDER_ADMIN_APPROVE_CANCEL_SUCCESS,
  ORDER_ADMIN_APPROVE_CANCEL_FAIL,
  ORDER_ADMIN_REJECT_CANCEL_REQUEST,
  ORDER_ADMIN_REJECT_CANCEL_SUCCESS,
  ORDER_ADMIN_REJECT_CANCEL_FAIL,
  ORDER_ADMIN_APPROVE_RETURN_REQUEST,
  ORDER_ADMIN_APPROVE_RETURN_SUCCESS,
  ORDER_ADMIN_APPROVE_RETURN_FAIL,
  ORDER_ADMIN_REJECT_RETURN_REQUEST,
  ORDER_ADMIN_REJECT_RETURN_SUCCESS,
  ORDER_ADMIN_REJECT_RETURN_FAIL,
} from "../Constants/OrderConstants";
import { logout } from "./UserActions";
import { toast } from "react-toastify";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

// Order list
export const listOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };

    const { data } = await axios.get(`/api/orders/all`, config);

    dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: ORDER_LIST_FAIL,
      payload: message,
    });
  }
};

// Order details
export const getOrderDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/orders/${id}`, config);

    dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: ORDER_DETAILS_FAIL,
      payload: message,
    });
  }
};

// Order delivered
export const deliveredOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DELIVERED_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `/api/orders/${order._id}/delivery-status`,
      { status: order.status },
      config
    );

    dispatch({ type: ORDER_DELIVERED_SUCCESS, payload: data });
    toast.success("Cập nhật trạng thái giao hàng thành công!", ToastObjects);
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: ORDER_DELIVERED_FAIL,
      payload: message,
    });
    toast.error(message, ToastObjects);
  }
};

// Update payment status
export const updatePaymentStatus =
  (id, isPaid) => async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_PAYMENT_STATUS_UPDATE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${id}/payment-status`,
        { isPaid },
        config
      );

      dispatch({ type: ORDER_PAYMENT_STATUS_UPDATE_SUCCESS, payload: data });
      toast.success(
        isPaid
          ? "Đã cập nhật trạng thái thanh toán thành công!"
          : "Đã hủy trạng thái thanh toán!",
        ToastObjects
      );
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") {
        dispatch(logout());
      }
      dispatch({
        type: ORDER_PAYMENT_STATUS_UPDATE_FAIL,
        payload: message,
      });
      toast.error(message, ToastObjects);
    }
  };

// ADMIN: Approve Cancel Order
export const adminApproveCancelOrder =
  (orderId, adminNote = "") =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_ADMIN_APPROVE_CANCEL_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put(
        `/api/orders/${orderId}/admin/approve-cancel`,
        { adminNote },
        config
      );
      dispatch({ type: ORDER_ADMIN_APPROVE_CANCEL_SUCCESS, payload: data });
      toast.success("Đã duyệt hủy đơn hàng.", ToastObjects);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") dispatch(logout());
      dispatch({ type: ORDER_ADMIN_APPROVE_CANCEL_FAIL, payload: message });
      toast.error(message, ToastObjects);
    }
  };

// ADMIN: Reject Cancel Order
export const adminRejectCancelOrder =
  (orderId, adminNote) => async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_ADMIN_REJECT_CANCEL_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      if (!adminNote) {
        toast.error("Vui lòng cung cấp lý do từ chối hủy.", ToastObjects);
        dispatch({
          type: ORDER_ADMIN_REJECT_CANCEL_FAIL,
          payload: "Vui lòng cung cấp lý do từ chối hủy.",
        });
        return;
      }
      const { data } = await axios.put(
        `/api/orders/${orderId}/admin/reject-cancel`,
        { adminNote },
        config
      );
      dispatch({ type: ORDER_ADMIN_REJECT_CANCEL_SUCCESS, payload: data });
      toast.success("Đã từ chối yêu cầu hủy đơn hàng.", ToastObjects);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") dispatch(logout());
      dispatch({ type: ORDER_ADMIN_REJECT_CANCEL_FAIL, payload: message });
      toast.error(message, ToastObjects);
    }
  };

// ADMIN: Approve Return Order
export const adminApproveReturnOrder =
  (orderId, adminNote = "") =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_ADMIN_APPROVE_RETURN_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put(
        `/api/orders/${orderId}/admin/approve-return`,
        { adminNote },
        config
      );
      dispatch({ type: ORDER_ADMIN_APPROVE_RETURN_SUCCESS, payload: data });
      toast.success("Đã duyệt hoàn đơn hàng.", ToastObjects);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") dispatch(logout());
      dispatch({ type: ORDER_ADMIN_APPROVE_RETURN_FAIL, payload: message });
      toast.error(message, ToastObjects);
    }
  };

// ADMIN: Reject Return Order
export const adminRejectReturnOrder =
  (orderId, adminNote) => async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_ADMIN_REJECT_RETURN_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      if (!adminNote) {
        toast.error("Vui lòng cung cấp lý do từ chối hoàn hàng.", ToastObjects);
        dispatch({
          type: ORDER_ADMIN_REJECT_RETURN_FAIL,
          payload: "Vui lòng cung cấp lý do từ chối hoàn hàng.",
        });
        return;
      }
      const { data } = await axios.put(
        `/api/orders/${orderId}/admin/reject-return`,
        { adminNote },
        config
      );
      dispatch({ type: ORDER_ADMIN_REJECT_RETURN_SUCCESS, payload: data });
      toast.success("Đã từ chối yêu cầu hoàn đơn hàng.", ToastObjects);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") dispatch(logout());
      dispatch({ type: ORDER_ADMIN_REJECT_RETURN_FAIL, payload: message });
      toast.error(message, ToastObjects);
    }
  };

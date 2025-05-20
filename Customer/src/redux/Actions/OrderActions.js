import axios from "axios";
import { CART_CLEAR_ITEMS } from "../Constants/CartConstants";
import {
  ORDER_CREATE_FAIL,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_LIST_MY_FAIL,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_DELIVERED_REQUEST,
  ORDER_DELIVERED_SUCCESS,
  ORDER_DELIVERED_FAIL,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAIL,
  ORDER_RETURN_REQUEST,
  ORDER_RETURN_SUCCESS,
  ORDER_RETURN_FAIL,
  ORDER_CUSTOMER_REQUEST_CANCEL_REQUEST,
  ORDER_CUSTOMER_REQUEST_CANCEL_SUCCESS,
  ORDER_CUSTOMER_REQUEST_CANCEL_FAIL,
  ORDER_CUSTOMER_REQUEST_RETURN_REQUEST,
  ORDER_CUSTOMER_REQUEST_RETURN_SUCCESS,
  ORDER_CUSTOMER_REQUEST_RETURN_FAIL,
} from "../Constants/OrderConstants";
import { logout } from "./UserActions";
import { toast } from "react-toastify";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

// Create order
export const createOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`/api/orders`, order, config);
    dispatch({ type: ORDER_CREATE_SUCCESS, payload: data });
    dispatch({ type: CART_CLEAR_ITEMS, payload: data });

    localStorage.removeItem("cartItems");
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: ORDER_CREATE_FAIL,
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

    // Ensure deliveryStatus is properly set
    const orderData = {
      ...data,
      deliveryStatus: data.deliveryStatus || "Chưa giao hàng",
      isDelivered: data.deliveryStatus === "Đã giao hàng",
    };

    dispatch({ type: ORDER_DETAILS_SUCCESS, payload: orderData });
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

// Order pay
export const payOrder =
  (orderId, paymentResult) => async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_PAY_REQUEST });

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
        `/api/orders/${orderId}/pay`,
        paymentResult,
        config
      );
      dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") {
        dispatch(logout());
      }
      dispatch({
        type: ORDER_PAY_FAIL,
        payload: message,
      });
    }
  };

// user orders
export const ListMyOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_MY_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/orders/`, config);
    dispatch({ type: ORDER_LIST_MY_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: ORDER_LIST_MY_FAIL,
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
      { status: order.deliveryStatus },
      config
    );

    dispatch({ type: ORDER_DELIVERED_SUCCESS, payload: data });
    toast.success("Cập nhật trạng thái giao hàng thành công", ToastObjects);
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

// CUSTOMER: Request to cancel an order
export const customerRequestCancelOrder =
  (orderId, reason) => async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_CUSTOMER_REQUEST_CANCEL_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      if (!reason || reason.trim() === "") {
        toast.error("Vui lòng cung cấp lý do hủy đơn.", ToastObjects);
        dispatch({
          type: ORDER_CUSTOMER_REQUEST_CANCEL_FAIL,
          payload: "Lý do không được để trống",
        });
        return;
      }
      const { data } = await axios.put(
        `/api/orders/${orderId}/request-cancel`,
        { reason },
        config
      );
      dispatch({ type: ORDER_CUSTOMER_REQUEST_CANCEL_SUCCESS, payload: data });
      toast.success(
        data.message || "Yêu cầu hủy đơn đã được gửi đi. Chờ admin xác nhận.",
        ToastObjects
      );
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") dispatch(logout());
      dispatch({ type: ORDER_CUSTOMER_REQUEST_CANCEL_FAIL, payload: message });
      toast.error(message, ToastObjects);
    }
  };

// CUSTOMER: Request to return an order
export const customerRequestReturnOrder =
  (orderId, reason) => async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_CUSTOMER_REQUEST_RETURN_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      if (!reason || reason.trim() === "") {
        toast.error("Vui lòng cung cấp lý do hoàn hàng.", ToastObjects);
        dispatch({
          type: ORDER_CUSTOMER_REQUEST_RETURN_FAIL,
          payload: "Lý do không được để trống",
        });
        return;
      }
      const { data } = await axios.put(
        `/api/orders/${orderId}/request-return`,
        { reason },
        config
      );
      dispatch({ type: ORDER_CUSTOMER_REQUEST_RETURN_SUCCESS, payload: data });
      toast.success(
        data.message || "Yêu cầu hoàn hàng đã được gửi đi. Chờ admin xác nhận.",
        ToastObjects
      );
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") dispatch(logout());
      dispatch({ type: ORDER_CUSTOMER_REQUEST_RETURN_FAIL, payload: message });
      toast.error(message, ToastObjects);
    }
  };

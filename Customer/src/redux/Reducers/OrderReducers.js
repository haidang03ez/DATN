import {
  ORDER_CREATE_FAIL,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_RESET,
  ORDER_CREATE_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_RESET,
  ORDER_DETAILS_SUCCESS,
  ORDER_LIST_MY_FAIL,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_RESET,
  ORDER_LIST_MY_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_RESET,
  ORDER_PAY_SUCCESS,
  ORDER_DELIVERED_REQUEST,
  ORDER_DELIVERED_SUCCESS,
  ORDER_DELIVERED_FAIL,
  ORDER_DELIVERED_RESET,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAIL,
  ORDER_CANCEL_RESET,
  ORDER_RETURN_REQUEST,
  ORDER_RETURN_SUCCESS,
  ORDER_RETURN_FAIL,
  ORDER_RETURN_RESET,
  ORDER_CUSTOMER_REQUEST_CANCEL_REQUEST,
  ORDER_CUSTOMER_REQUEST_CANCEL_SUCCESS,
  ORDER_CUSTOMER_REQUEST_CANCEL_FAIL,
  ORDER_CUSTOMER_REQUEST_CANCEL_RESET,
  ORDER_CUSTOMER_REQUEST_RETURN_REQUEST,
  ORDER_CUSTOMER_REQUEST_RETURN_SUCCESS,
  ORDER_CUSTOMER_REQUEST_RETURN_FAIL,
  ORDER_CUSTOMER_REQUEST_RETURN_RESET,
} from "../Constants/OrderConstants";

// Create order
export const orderCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_CREATE_REQUEST:
      return { loading: true };

    case ORDER_CREATE_SUCCESS:
      return { loading: false, success: true, order: action.payload };

    case ORDER_CREATE_FAIL:
      return { loading: false, error: action.payload };

    case ORDER_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

// Order details
export const orderDetailsReducer = (
  state = { loading: true, orderItems: [], shippingAddress: {} },
  action
) => {
  switch (action.type) {
    case ORDER_DETAILS_REQUEST:
      return { ...state, loading: true };

    case ORDER_DETAILS_SUCCESS:
      return {
        loading: false,
        order: {
          ...action.payload,
          deliveryStatus: action.payload.deliveryStatus || "Chưa giao hàng",
          isDelivered: action.payload.deliveryStatus === "Đã giao hàng",
        },
      };

    case ORDER_DETAILS_FAIL:
      return { loading: false, error: action.payload };

    case ORDER_DETAILS_RESET:
      return { loading: true, orderItems: [], shippingAddress: {} };

    default:
      return state;
  }
};

// Order pay
export const orderPayReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_PAY_REQUEST:
      return { loading: true };

    case ORDER_PAY_SUCCESS:
      return { loading: false, success: true };

    case ORDER_PAY_FAIL:
      return { loading: false, error: action.payload };

    case ORDER_PAY_RESET:
      return {};

    default:
      return state;
  }
};

// User orders
export const orderListMyReducer = (state = { orders: [] }, action) => {
  switch (action.type) {
    case ORDER_LIST_MY_REQUEST:
      return { loading: true };

    case ORDER_LIST_MY_SUCCESS:
      return { loading: false, orders: action.payload };

    case ORDER_LIST_MY_FAIL:
      return { loading: false, error: action.payload };

    case ORDER_LIST_MY_RESET:
      return { orders: [] };

    default:
      return state;
  }
};

// Order delivered
export const orderDeliveredReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_DELIVERED_REQUEST:
      return { loading: true };
    case ORDER_DELIVERED_SUCCESS:
      return { loading: false, success: true };
    case ORDER_DELIVERED_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_DELIVERED_RESET:
      return {};
    default:
      return state;
  }
};

// Reducer for customer requesting cancellation
export const orderCustomerRequestCancelReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_CUSTOMER_REQUEST_CANCEL_REQUEST:
      return { loading: true };
    case ORDER_CUSTOMER_REQUEST_CANCEL_SUCCESS:
      // payload here might contain the updated order with status 'cancellation_requested'
      return { loading: false, success: true, order: action.payload };
    case ORDER_CUSTOMER_REQUEST_CANCEL_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_CUSTOMER_REQUEST_CANCEL_RESET:
      return {};
    default:
      return state;
  }
};

// Reducer for customer requesting return
export const orderCustomerRequestReturnReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_CUSTOMER_REQUEST_RETURN_REQUEST:
      return { loading: true };
    case ORDER_CUSTOMER_REQUEST_RETURN_SUCCESS:
      // payload here might contain the updated order with status 'return_requested'
      return { loading: false, success: true, order: action.payload };
    case ORDER_CUSTOMER_REQUEST_RETURN_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_CUSTOMER_REQUEST_RETURN_RESET:
      return {};
    default:
      return state;
  }
};

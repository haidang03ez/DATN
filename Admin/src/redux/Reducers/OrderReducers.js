import {
  ORDER_DELIVERED_FAIL,
  ORDER_DELIVERED_REQUEST,
  ORDER_DELIVERED_RESET,
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
  ORDER_PAYMENT_STATUS_UPDATE_RESET,
  ORDER_ADMIN_APPROVE_CANCEL_REQUEST,
  ORDER_ADMIN_APPROVE_CANCEL_SUCCESS,
  ORDER_ADMIN_APPROVE_CANCEL_FAIL,
  ORDER_ADMIN_APPROVE_CANCEL_RESET,
  ORDER_ADMIN_REJECT_CANCEL_REQUEST,
  ORDER_ADMIN_REJECT_CANCEL_SUCCESS,
  ORDER_ADMIN_REJECT_CANCEL_FAIL,
  ORDER_ADMIN_REJECT_CANCEL_RESET,
  ORDER_ADMIN_APPROVE_RETURN_REQUEST,
  ORDER_ADMIN_APPROVE_RETURN_SUCCESS,
  ORDER_ADMIN_APPROVE_RETURN_FAIL,
  ORDER_ADMIN_APPROVE_RETURN_RESET,
  ORDER_ADMIN_REJECT_RETURN_REQUEST,
  ORDER_ADMIN_REJECT_RETURN_SUCCESS,
  ORDER_ADMIN_REJECT_RETURN_FAIL,
  ORDER_ADMIN_REJECT_RETURN_RESET,
} from "../Constants/OrderConstants";

// Order list
export const orderListReducer = (state = { orders: [] }, action) => {
  switch (action.type) {
    case ORDER_LIST_REQUEST:
      return { loading: true };
    case ORDER_LIST_SUCCESS:
      return { loading: false, orders: action.payload };
    case ORDER_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// Order details
export const orderDetailsReducer = (
  state = { loading: true, orderItem: [], shippingAddess: {} },
  action
) => {
  switch (action.type) {
    case ORDER_DETAILS_REQUEST:
      return { ...state, loading: true };
    case ORDER_DETAILS_SUCCESS:
      return { loading: false, order: action.payload };
    case ORDER_DETAILS_FAIL:
      return { loading: false, error: action.payload };
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

// Update payment status
export const orderPaymentStatusUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_PAYMENT_STATUS_UPDATE_REQUEST:
      return { loading: true };
    case ORDER_PAYMENT_STATUS_UPDATE_SUCCESS:
      return { loading: false, success: true };
    case ORDER_PAYMENT_STATUS_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_PAYMENT_STATUS_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

// Cancel order
export const orderAdminApproveCancelReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_ADMIN_APPROVE_CANCEL_REQUEST:
      return { loading: true };
    case ORDER_ADMIN_APPROVE_CANCEL_SUCCESS:
      return { loading: false, success: true, order: action.payload };
    case ORDER_ADMIN_APPROVE_CANCEL_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_ADMIN_APPROVE_CANCEL_RESET:
      return {};
    default:
      return state;
  }
};

export const orderAdminRejectCancelReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_ADMIN_REJECT_CANCEL_REQUEST:
      return { loading: true };
    case ORDER_ADMIN_REJECT_CANCEL_SUCCESS:
      return { loading: false, success: true, order: action.payload };
    case ORDER_ADMIN_REJECT_CANCEL_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_ADMIN_REJECT_CANCEL_RESET:
      return {};
    default:
      return state;
  }
};

// Return order
export const orderAdminApproveReturnReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_ADMIN_APPROVE_RETURN_REQUEST:
      return { loading: true };
    case ORDER_ADMIN_APPROVE_RETURN_SUCCESS:
      return { loading: false, success: true, order: action.payload };
    case ORDER_ADMIN_APPROVE_RETURN_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_ADMIN_APPROVE_RETURN_RESET:
      return {};
    default:
      return state;
  }
};

export const orderAdminRejectReturnReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_ADMIN_REJECT_RETURN_REQUEST:
      return { loading: true };
    case ORDER_ADMIN_REJECT_RETURN_SUCCESS:
      return { loading: false, success: true, order: action.payload };
    case ORDER_ADMIN_REJECT_RETURN_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_ADMIN_REJECT_RETURN_RESET:
      return {};
    default:
      return state;
  }
};

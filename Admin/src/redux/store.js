import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import {
  categoryCreateReducer,
  categoryDeleteReducer,
  categoryEditReducer,
  categoryListReducer,
  categoryUpdateReducer,
} from "./Reducers/CategoryReducers";
import {
  orderDeliveredReducer,
  orderDetailsReducer,
  orderListReducer,
  orderPaymentStatusUpdateReducer,
  orderAdminApproveCancelReducer,
  orderAdminRejectCancelReducer,
  orderAdminApproveReturnReducer,
  orderAdminRejectReturnReducer,
} from "./Reducers/OrderReducers";
import {
  productCreateReducer,
  productDeleteReducer,
  productEditReducer,
  productListReducer,
  productUpdateReducer,
} from "./Reducers/ProductReducers";
import {
  imageDeleteReducer,
  imageUploadReducer,
} from "./Reducers/UploadReducers";
import {
  userListReducer,
  userLoginReducer,
  userDetailsReducer,
  userUpdateReducer,
} from "./Reducers/UserReducers";
import {
  promotionListReducer,
  promotionDetailsReducer,
  promotionCreateReducer,
  promotionUpdateReducer,
  promotionDeleteReducer,
} from "./Reducers/PromotionReducers";
import {
  supplierListReducer,
  supplierCreateReducer,
  supplierDetailsReducer,
  supplierUpdateReducer,
  supplierDeleteReducer,
} from "./Reducers/SupplierReducers";

const reducer = combineReducers({
  userLogin: userLoginReducer,
  userList: userListReducer,
  userDetails: userDetailsReducer,
  userUpdate: userUpdateReducer,
  productList: productListReducer,
  productDelete: productDeleteReducer,
  productCreate: productCreateReducer,
  productEdit: productEditReducer,
  productUpdate: productUpdateReducer,
  orderList: orderListReducer,
  orderDetails: orderDetailsReducer,
  orderDelivered: orderDeliveredReducer,
  orderPaymentStatusUpdate: orderPaymentStatusUpdateReducer,
  orderAdminApproveCancel: orderAdminApproveCancelReducer,
  orderAdminRejectCancel: orderAdminRejectCancelReducer,
  orderAdminApproveReturn: orderAdminApproveReturnReducer,
  orderAdminRejectReturn: orderAdminRejectReturnReducer,
  categoryList: categoryListReducer,
  categoryCreate: categoryCreateReducer,
  categoryDelete: categoryDeleteReducer,
  categoryEdit: categoryEditReducer,
  categoryUpdate: categoryUpdateReducer,
  imageUpload: imageUploadReducer,
  imageDelete: imageDeleteReducer,
  promotionList: promotionListReducer,
  promotionDetails: promotionDetailsReducer,
  promotionCreate: promotionCreateReducer,
  promotionUpdate: promotionUpdateReducer,
  promotionDelete: promotionDeleteReducer,
  supplierList: supplierListReducer,
  supplierCreate: supplierCreateReducer,
  supplierDetails: supplierDetailsReducer,
  supplierUpdate: supplierUpdateReducer,
  supplierDelete: supplierDeleteReducer,
});

// login
const userInfoFromLocalStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

// initState
const initialState = {
  userLogin: {
    userInfo: userInfoFromLocalStorage,
  },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

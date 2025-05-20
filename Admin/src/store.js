import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  userLoginReducer,
  userListReducer,
  userDeleteReducer,
  userEditReducer,
  userUpdateReducer,
} from "./Redux/Reducers/UserReducers";
import {
  productListReducer,
  productDeleteReducer,
  productCreateReducer,
  productEditReducer,
  productUpdateReducer,
} from "./Redux/Reducers/ProductReducers";
import {
  orderListReducer,
  orderDetailsReducer,
  orderDeliveredReducer,
  orderPaymentStatusUpdateReducer,
  orderAdminApproveCancelReducer,
  orderAdminRejectCancelReducer,
  orderAdminApproveReturnReducer,
  orderAdminRejectReturnReducer,
} from "./Redux/Reducers/OrderReducers";
import {
  categoryListReducer,
  categoryCreateReducer,
  categoryDeleteReducer,
  categoryEditReducer,
  categoryUpdateReducer,
} from "./Redux/Reducers/CategoryReducers";
import {
  promotionListReducer,
  promotionCreateReducer,
  promotionDeleteReducer,
  promotionEditReducer,
  promotionUpdateReducer,
  promotionDetailsReducer,
} from "./Redux/Reducers/PromotionReducers";
import { uploadReducer } from "./Redux/Reducers/UploadReducers";

const reducer = combineReducers({
  userLogin: userLoginReducer,
  userList: userListReducer,
  userDelete: userDeleteReducer,
  userEdit: userEditReducer,
  userUpdate: userUpdateReducer,
  productList: productListReducer,
  productDelete: productDeleteReducer,
  productCreate: productCreateReducer,
  productEdit: productEditReducer,
  productUpdate: productUpdateReducer,
  orderList: orderListReducer,
  orderDetails: orderDetailsReducer,
  orderDeliver: orderDeliveredReducer,
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
  promotionList: promotionListReducer,
  promotionDetails: promotionDetailsReducer,
  promotionCreate: promotionCreateReducer,
  promotionDelete: promotionDeleteReducer,
  promotionEdit: promotionEditReducer,
  promotionUpdate: promotionUpdateReducer,
  fileUpload: uploadReducer,
});

const userInfoFromLocalStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = {
  userLogin: { userInfo: userInfoFromLocalStorage },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

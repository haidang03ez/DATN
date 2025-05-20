import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { PayPalButton } from "react-paypal-button-v2";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getOrderDetails,
  payOrder,
  customerRequestCancelOrder,
  customerRequestReturnOrder,
} from "../redux/Actions/OrderActions";
import {
  ORDER_PAY_RESET,
  ORDER_DETAILS_RESET,
  ORDER_CUSTOMER_REQUEST_CANCEL_RESET,
  ORDER_CUSTOMER_REQUEST_RETURN_RESET,
} from "../redux/Constants/OrderConstants";
import Header from "./../components/Header";
import Message from "./../components/LoadingError/Error";
import Loading from "./../components/LoadingError/Loading";
import { toast } from "react-toastify";

const translateOrderStatus = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xử lý / COD";
    case "paid":
      return "Đã thanh toán (Chờ xử lý)";
    case "processing":
      return "Đang chuẩn bị hàng";
    case "shipping":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao hàng";
    case "cancellation_requested":
      return "Đã yêu cầu hủy - Chờ duyệt";
    case "cancelled":
      return "Đã hủy";
    case "return_requested":
      return "Đã yêu cầu hoàn - Chờ duyệt";
    case "returned":
      return "Đã hoàn";
    case "cancellation_rejected":
      return "Yêu cầu hủy bị từ chối";
    case "return_rejected":
      return "Yêu cầu hoàn bị từ chối";
    default:
      return status;
  }
};

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

const OrderScreen = ({ match, history }) => {
  window.scrollTo(0, 0);
  const [sdkReady, setSdkReady] = useState(false);

  const orderId = match.params.id;
  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderCustomerRequestCancel = useSelector(
    (state) => state.orderCustomerRequestCancel
  );
  const {
    loading: loadingRequestCancel,
    success: successRequestCancel,
    error: errorRequestCancel,
  } = orderCustomerRequestCancel;

  const orderCustomerRequestReturn = useSelector(
    (state) => state.orderCustomerRequestReturn
  );
  const {
    loading: loadingRequestReturn,
    success: successRequestReturn,
    error: errorRequestReturn,
  } = orderCustomerRequestReturn;

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");
  const [modalActionType, setModalActionType] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const itemsPrice =
    order?.orderItems?.reduce(
      (acc, item) => acc + (item.discountedPrice || item.price) * item.qty,
      0
    ) || 0;

  useEffect(() => {
    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get("/api/config/paypal");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    dispatch({ type: ORDER_PAY_RESET });
    dispatch({ type: ORDER_CUSTOMER_REQUEST_CANCEL_RESET });
    dispatch({ type: ORDER_CUSTOMER_REQUEST_RETURN_RESET });

    if (
      !order ||
      order._id !== orderId ||
      successPay ||
      successRequestCancel ||
      successRequestReturn
    ) {
      if (successRequestCancel || successRequestReturn) {
        toast.info("Đang cập nhật lại thông tin đơn hàng...", ToastObjects);
      }
      dispatch({ type: ORDER_DETAILS_RESET });
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid && order.paymentMethod === "Paypal") {
      if (!window.paypal) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }
    }
  }, [
    dispatch,
    orderId,
    successPay,
    order,
    successRequestCancel,
    successRequestReturn,
  ]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult));
  };

  const handleOpenReasonModal = (actionType) => {
    setModalActionType(actionType);
    setReason("");
    setModalTitle(
      actionType === "request_cancel"
        ? "Yêu Cầu Hủy Đơn Hàng"
        : "Yêu Cầu Hoàn Trả Đơn Hàng"
    );
    setShowReasonModal(true);
  };

  const handleSubmitReason = () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do.", ToastObjects);
      return;
    }
    if (modalActionType === "request_cancel") {
      dispatch(customerRequestCancelOrder(orderId, reason));
    } else if (modalActionType === "request_return") {
      dispatch(customerRequestReturnOrder(orderId, reason));
    }
    setShowReasonModal(false);
  };

  const ReasonModal = (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        zIndex: 1050,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "90%",
        maxWidth: "500px",
      }}
    >
      <h5>{modalTitle}</h5>
      <textarea
        className="form-control mb-3"
        rows="4"
        placeholder="Nhập lý do của bạn... (bắt buộc)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-secondary me-2"
          onClick={() => setShowReasonModal(false)}
        >
          Đóng
        </button>
        <button
          className={`btn btn-primary ${
            loadingRequestCancel || loadingRequestReturn ? "disabled" : ""
          }`}
          onClick={handleSubmitReason}
          disabled={loadingRequestCancel || loadingRequestReturn}
        >
          {(loadingRequestCancel && modalActionType === "request_cancel") ||
          (loadingRequestReturn && modalActionType === "request_return") ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>{" "}
              Đang gửi...
            </>
          ) : (
            "Gửi Yêu Cầu"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      {showReasonModal && ReasonModal}
      <div className="container">
        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : order ? (
          <>
            <div className="row order-detail">
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Khách hàng</strong>
                    </h5>
                    <p>{order.user?.name}</p>
                    <p>
                      <a href={`mailto:${order.user?.email}`}>
                        {order.user?.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              {/* 2 */}
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-truck-moving"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Thông tin đơn hàng</strong>
                    </h5>
                    <p>Mã ĐH: {order._id}</p>
                    <p>Thanh toán: {order.paymentMethod}</p>
                    <div
                      className={`p-2 col-12 mb-2 ${
                        order.isPaid ? "bg-success" : "bg-danger"
                      }`}
                    >
                      <p className="text-white text-center text-sm-start">
                        {order.isPaid
                          ? `Đã thanh toán ${moment(order.paidAt).format(
                              "DD/MM/YYYY HH:mm"
                            )}`
                          : "Chưa thanh toán"}
                      </p>
                    </div>
                    <div
                      className={`p-2 col-12 ${
                        order.status === "delivered"
                          ? "bg-success"
                          : order.status === "cancelled" ||
                            order.status === "returned"
                          ? "bg-secondary"
                          : "bg-warning"
                      }`}
                    >
                      <p className="text-white text-center text-sm-start">
                        Trạng thái: {translateOrderStatus(order.status)}
                        {order.status === "delivered" &&
                          ` lúc ${moment(order.deliveredAt).format(
                            "DD/MM/YYYY HH:mm"
                          )}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* 3 */}
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Gửi tới địa chỉ</strong>
                    </h5>
                    <p>
                      Address: {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.address},{" "}
                      {order.shippingAddress?.postalCode}
                    </p>
                    <p>Số điện thoại: {order.shippingAddress?.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row order-products justify-content-between">
              <div className="col-lg-8">
                {order.orderItems?.length === 0 ? (
                  <Message variant="alert-info mt-5">
                    Bạn chưa có đơn hàng nào!
                  </Message>
                ) : (
                  <>
                    {order.orderItems?.map((item, index) => (
                      <div className="order-product row" key={index}>
                        <div className="col-md-3 col-6">
                          <img
                            src={
                              item.image?.url || "/images/default-product.png"
                            }
                            alt={item.name}
                          />
                        </div>
                        <div className="col-md-5 col-6 d-flex align-items-center">
                          <Link to={`/products/${item.product}`}>
                            <h6>{item.name}</h6>
                          </Link>
                        </div>
                        <div className="mt-3 mt-md-0 col-md-2 col-6  d-flex align-items-center flex-column justify-content-center ">
                          <h4>SỐ LƯỢNG</h4>
                          <h6>{item.qty}</h6>
                        </div>
                        <div className="mt-3 mt-md-0 col-md-2 col-6 align-items-end d-flex flex-column justify-content-center ">
                          <h4>GIÁ MỖI SP</h4>
                          <h6>
                            {(
                              item.discountedPrice || item.price
                            )?.toLocaleString("vi-VN")}{" "}
                            VND
                          </h6>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {(order.cancellationReason ||
                  order.returnReasonCustomer ||
                  order.adminCancellationNote ||
                  order.adminReturnNote ||
                  order.status === "cancellation_requested" ||
                  order.status === "return_requested" ||
                  order.status === "cancellation_rejected" ||
                  order.status === "return_rejected") && (
                  <div className="mt-4 p-3 bg-light border rounded">
                    <h5>Thông tin Hủy/Hoàn:</h5>
                    {order.status === "cancellation_requested" &&
                      order.cancellationReason && (
                        <p>
                          <strong>Lý do yêu cầu hủy của bạn:</strong>{" "}
                          {order.cancellationReason}
                        </p>
                      )}
                    {order.status === "return_requested" &&
                      order.returnReasonCustomer && (
                        <p>
                          <strong>Lý do yêu cầu hoàn của bạn:</strong>{" "}
                          {order.returnReasonCustomer}
                        </p>
                      )}

                    {order.status === "cancelled" &&
                      order.cancellationReason && (
                        <p>
                          <strong>Lý do hủy đã được duyệt:</strong>{" "}
                          {order.cancellationReason}
                        </p>
                      )}
                    {order.status === "cancelled" &&
                      order.adminCancellationNote && (
                        <p>
                          <strong>Ghi chú từ cửa hàng (Hủy):</strong>{" "}
                          {order.adminCancellationNote}
                        </p>
                      )}

                    {order.status === "returned" &&
                      order.returnReasonCustomer && (
                        <p>
                          <strong>Lý do hoàn đã được duyệt:</strong>{" "}
                          {order.returnReasonCustomer}
                        </p>
                      )}
                    {order.status === "returned" && order.adminReturnNote && (
                      <p>
                        <strong>Ghi chú từ cửa hàng (Hoàn):</strong>{" "}
                        {order.adminReturnNote}
                      </p>
                    )}

                    {order.status === "cancellation_rejected" &&
                      order.adminCancellationNote && (
                        <p>
                          <strong>Lý do từ chối hủy từ cửa hàng:</strong>{" "}
                          {order.adminCancellationNote}
                        </p>
                      )}
                    {order.status === "return_rejected" &&
                      order.adminReturnNote && (
                        <p>
                          <strong>Lý do từ chối hoàn từ cửa hàng:</strong>{" "}
                          {order.adminReturnNote}
                        </p>
                      )}
                  </div>
                )}

                <div className="mt-4">
                  {["pending", "paid", "processing"].includes(order.status) && (
                    <button
                      className={`btn btn-warning me-2 ${
                        loadingRequestCancel || loadingRequestReturn
                          ? "disabled"
                          : ""
                      }`}
                      onClick={() => handleOpenReasonModal("request_cancel")}
                      disabled={
                        loadingRequestCancel ||
                        loadingRequestReturn ||
                        order.status === "cancellation_requested"
                      }
                    >
                      {loadingRequestCancel ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>{" "}
                          Đang gửi...
                        </>
                      ) : order.status === "cancellation_requested" ? (
                        "Đã Y/C Hủy"
                      ) : (
                        "Yêu Cầu Hủy Đơn"
                      )}
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <button
                      className={`btn btn-info ${
                        loadingRequestCancel || loadingRequestReturn
                          ? "disabled"
                          : ""
                      }`}
                      onClick={() => handleOpenReasonModal("request_return")}
                      disabled={
                        loadingRequestCancel ||
                        loadingRequestReturn ||
                        order.status === "return_requested"
                      }
                    >
                      {loadingRequestReturn ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>{" "}
                          Đang gửi...
                        </>
                      ) : order.status === "return_requested" ? (
                        "Đã Y/C Hoàn"
                      ) : (
                        "Yêu Cầu Hoàn Hàng"
                      )}
                    </button>
                  )}
                </div>
              </div>
              {/* total */}
              <div className="col-lg-3 d-flex align-items-end flex-column mt-5 subtotal-order">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Sản phẩm</strong>
                      </td>
                      <td>{itemsPrice?.toLocaleString("vi-VN")} VND</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Phí vận chuyển</strong>
                      </td>
                      <td>
                        {order.shippingPrice?.toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Thuế</strong>
                      </td>
                      <td>{order.taxPrice?.toLocaleString("vi-VN")} VND</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Tổng cộng</strong>
                      </td>
                      <td>{order.totalPrice?.toLocaleString("vi-VN")} VND</td>
                    </tr>
                  </tbody>
                </table>
                {!order.isPaid && order.paymentMethod !== "COD" && (
                  <div className="col-12">
                    {loadingPay && <Loading />}
                    {order.paymentMethod === "Paypal" && !sdkReady && (
                      <Loading />
                    )}
                    {order.paymentMethod === "Paypal" && sdkReady && (
                      <PayPalButton
                        amount={order.totalPrice}
                        onSuccess={successPaymentHandler}
                      />
                    )}
                  </div>
                )}
                {order.paymentMethod === "COD" && !order.isPaid && (
                  <div className="alert alert-info mt-2">
                    <p>Bạn đã chọn thanh toán khi nhận hàng (COD).</p>
                    <p>
                      Vui lòng chuẩn bị số tiền:{" "}
                      {order.totalPrice?.toLocaleString("vi-VN")} VND khi nhận
                      hàng.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <Message variant="alert-info">
            Đang tải thông tin đơn hàng hoặc đơn hàng không tồn tại.
          </Message>
        )}
      </div>
    </>
  );
};

export default OrderScreen;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  deliveredOrder,
  getOrderDetails,
  updatePaymentStatus,
  adminApproveCancelOrder,
  adminRejectCancelOrder,
  adminApproveReturnOrder,
  adminRejectReturnOrder,
} from "../../redux/Actions/OrderActions";
import {
  ORDER_PAYMENT_STATUS_UPDATE_RESET,
  ORDER_ADMIN_APPROVE_CANCEL_RESET,
  ORDER_ADMIN_REJECT_CANCEL_RESET,
  ORDER_ADMIN_APPROVE_RETURN_RESET,
  ORDER_ADMIN_REJECT_RETURN_RESET,
  ORDER_DELIVERED_RESET,
} from "../../redux/Constants/OrderConstants";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import OrderDetailInfo from "./OrderDetailInfo";
import OrderDetailProducts from "./OrderDetailProducts";
import ExportOrderDetail from "./ExportOrderDetail";
import moment from "moment";
import Toast from "../LoadingError/Toast";
import { toast } from "react-toastify";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

// Helper to translate status to Vietnamese
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
      return "Khách yêu cầu hủy - Chờ duyệt";
    case "cancelled":
      return "Đã hủy";
    case "return_requested":
      return "Khách yêu cầu hoàn - Chờ duyệt";
    case "returned":
      return "Đã hoàn (Chờ duyệt hoàn tiền nếu có)";
    case "cancellation_rejected":
      return "Admin từ chối hủy";
    case "return_rejected":
      return "Admin từ chối hoàn";
    default:
      return status;
  }
};

const OrderDetailmain = (props) => {
  const { orderId } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, error, order } = orderDetails;

  const orderAdminApproveCancel = useSelector(
    (state) => state.orderAdminApproveCancel
  );
  const {
    loading: loadingApproveCancel,
    success: successApproveCancel,
    error: errorApproveCancel,
  } = orderAdminApproveCancel;

  const orderAdminRejectCancel = useSelector(
    (state) => state.orderAdminRejectCancel
  );
  const {
    loading: loadingRejectCancel,
    success: successRejectCancel,
    error: errorRejectCancel,
  } = orderAdminRejectCancel;

  const orderAdminApproveReturn = useSelector(
    (state) => state.orderAdminApproveReturn
  );
  const {
    loading: loadingApproveReturn,
    success: successApproveReturn,
    error: errorApproveReturn,
  } = orderAdminApproveReturn;

  const orderAdminRejectReturn = useSelector(
    (state) => state.orderAdminRejectReturn
  );
  const {
    loading: loadingRejectReturn,
    success: successRejectReturn,
    error: errorRejectReturn,
  } = orderAdminRejectReturn;

  const orderDeliveryUpdate = useSelector((state) => state.orderDelivered);
  const {
    loading: loadingDeliveryUpdate,
    success: successDeliveryUpdate,
    error: errorDeliveryUpdate,
  } = orderDeliveryUpdate;

  const orderPaymentStatusUpdate = useSelector(
    (state) => state.orderPaymentStatusUpdate
  );
  const {
    loading: loadingPaymentUpdate,
    success: successPaymentUpdate,
    error: errorPaymentUpdate,
  } = orderPaymentStatusUpdate;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [selectedUIPaymentStatus, setSelectedUIPaymentStatus] =
    useState("Chưa thanh toán");
  const [selectedUIDeliveryStatus, setSelectedUIDeliveryStatus] = useState("");

  const [showAdminNoteModal, setShowAdminNoteModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [currentActionTypeForModal, setCurrentActionTypeForModal] =
    useState(null);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    dispatch({ type: ORDER_ADMIN_APPROVE_CANCEL_RESET });
    dispatch({ type: ORDER_ADMIN_REJECT_CANCEL_RESET });
    dispatch({ type: ORDER_ADMIN_APPROVE_RETURN_RESET });
    dispatch({ type: ORDER_ADMIN_REJECT_RETURN_RESET });
    dispatch({ type: ORDER_PAYMENT_STATUS_UPDATE_RESET });
    dispatch({ type: ORDER_DELIVERED_RESET });

    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (
      successApproveCancel ||
      successRejectCancel ||
      successApproveReturn ||
      successRejectReturn ||
      successDeliveryUpdate ||
      successPaymentUpdate
    ) {
      dispatch({ type: ORDER_ADMIN_APPROVE_CANCEL_RESET });
      dispatch({ type: ORDER_ADMIN_REJECT_CANCEL_RESET });
      dispatch({ type: ORDER_ADMIN_APPROVE_RETURN_RESET });
      dispatch({ type: ORDER_ADMIN_REJECT_RETURN_RESET });
      dispatch({ type: ORDER_PAYMENT_STATUS_UPDATE_RESET });
      dispatch({ type: ORDER_DELIVERED_RESET });
      dispatch(getOrderDetails(orderId));
    }
  }, [
    dispatch,
    orderId,
    successApproveCancel,
    successRejectCancel,
    successApproveReturn,
    successRejectReturn,
    successDeliveryUpdate,
    successPaymentUpdate,
  ]);

  useEffect(() => {
    if (order) {
      setSelectedUIPaymentStatus(
        order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"
      );
      if (
        order.isPaid &&
        ["paid", "processing", "shipping"].includes(order.status)
      ) {
        setSelectedUIDeliveryStatus(order.status);
      }
    }
  }, [order]);

  const handleAdminNoteModalOpen = (actionType, title) => {
    setCurrentActionTypeForModal(actionType);
    setModalTitle(title);
    setAdminNote("");
    setShowAdminNoteModal(true);
  };

  const handleAdminSubmitWithNote = () => {
    if (!currentActionTypeForModal) return;

    if (
      (currentActionTypeForModal.includes("reject") ||
        currentActionTypeForModal.includes("cancel")) &&
      !adminNote.trim()
    ) {
      if (currentActionTypeForModal.includes("reject")) {
        toast.error("Vui lòng nhập lý do từ chối.", ToastObjects);
      return;
    }
    }

    switch (currentActionTypeForModal) {
      case "approve_cancel":
        dispatch(adminApproveCancelOrder(orderId, adminNote));
        break;
      case "reject_cancel":
        dispatch(adminRejectCancelOrder(orderId, adminNote));
        break;
      case "approve_return":
        dispatch(adminApproveReturnOrder(orderId, adminNote));
        break;
      case "reject_return":
        dispatch(adminRejectReturnOrder(orderId, adminNote));
        break;
      default:
        break;
    }
    setShowAdminNoteModal(false);
  };

  const handlePaymentStatusUpdate = (newPaymentStatusString) => {
    const newIsPaid = newPaymentStatusString === "Đã thanh toán";
    if (order.isPaid && !newIsPaid) {
      toast.error(
        "Không thể chuyển từ 'Đã thanh toán' sang 'Chưa thanh toán'.",
        ToastObjects
      );
      setSelectedUIPaymentStatus("Đã thanh toán");
      return;
    }
    if (!order.isPaid && newIsPaid) {
      if (
        window.confirm(
          "Lưu ý: Đơn hàng sau khi chuyển sang 'Đã thanh toán' sẽ không thể hoàn về trạng thái 'Chưa thanh toán'. Bạn có chắc chắn muốn tiếp tục?"
        )
      ) {
        dispatch(updatePaymentStatus(orderId, newIsPaid));
      } else {
        setSelectedUIPaymentStatus("Chưa thanh toán");
      }
      return;
    }
  };

  const handleDeliveryStatusUpdate = (newDeliveryStatus) => {
    if (!order || !order.isPaid) {
      toast.error("Đơn hàng phải được thanh toán trước.", ToastObjects);
      setSelectedUIDeliveryStatus(order?.status || "");
      return;
    }
    if (
      [
        "cancelled",
        "returned",
        "cancellation_requested",
        "return_requested",
        "cancellation_rejected",
        "return_rejected",
      ].includes(order.status)
    ) {
      toast.error(
        `Không thể cập nhật trạng thái giao hàng cho đơn hàng ${translateOrderStatus(
          order.status
        )}.`,
        ToastObjects
      );
      setSelectedUIDeliveryStatus(order.status);
      return;
    }
    if (newDeliveryStatus === order.status) return;

    dispatch(deliveredOrder({ _id: orderId, status: newDeliveryStatus }));
  };

  const AdminActionModal = (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        zIndex: 1000,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h5>{modalTitle}</h5>
      <textarea
        className="form-control mb-2"
        rows="3"
        placeholder={
          currentActionTypeForModal &&
          currentActionTypeForModal.includes("reject")
            ? "Nhập lý do (bắt buộc khi từ chối)"
            : "Nhập ghi chú (nếu có)"
        }
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
      />
      <button
        className="btn btn-primary me-2"
        onClick={handleAdminSubmitWithNote}
      >
        Xác nhận
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => setShowAdminNoteModal(false)}
      >
        Hủy
      </button>
    </div>
  );

  return (
    <>
      <Toast />
      {showAdminNoteModal && AdminActionModal}
      <section className="content-main">
        <div className="content-header">
          <Link to="/orders" className="btn btn-dark text-white">
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : order ? (
          <div className="card">
            <header className="card-header p-3 Header-green">
              <div className="row align-items-center ">
                <div className="col-lg-6 col-md-6">
                  <span>
                    <i className="far fa-calendar-alt mx-2"></i>
                    <b className="text-white">
                      {moment(order.createdAt).format("llll")}
                    </b>
                  </span>
                  <br />
                  <small className="text-white mx-3 ">
                    MÃ ĐƠN HÀNG: {order._id}
                  </small>
                  <br />
                  <strong className="text-white mx-3">
                    TRẠNG THÁI: {translateOrderStatus(order.status)}
                  </strong>
                </div>
                <div className="col-lg-6 col-md-6 ms-auto d-flex justify-content-end align-items-center">
                    <select
                      className="form-select d-inline-block me-2"
                      style={{ maxWidth: "200px" }}
                    value={selectedUIPaymentStatus}
                    onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                    disabled={
                      loadingPaymentUpdate ||
                      order.isPaid ||
                      !["pending"].includes(order.status)
                    }
                    >
                      <option value="Chưa thanh toán">Chưa thanh toán</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                    </select>
                  {order.isPaid &&
                    ["paid", "processing", "shipping"].includes(
                      order.status
                    ) && (
                    <select
                      className="form-select d-inline-block me-2"
                      style={{ maxWidth: "200px" }}
                        value={selectedUIDeliveryStatus || order.status}
                        onChange={(e) =>
                          handleDeliveryStatusUpdate(e.target.value)
                        }
                        disabled={loadingDeliveryUpdate}
                      >
                        {order.status === "paid" && (
                          <option value="processing">Chuẩn bị hàng</option>
                        )}
                        {(order.status === "paid" ||
                          order.status === "processing") && (
                          <option value="shipping">Giao hàng</option>
                        )}
                        {(order.status === "paid" ||
                          order.status === "processing" ||
                          order.status === "shipping") && (
                          <option value="delivered">Đã giao</option>
                        )}
                        {["processing", "shipping", "delivered"].includes(
                          order.status
                        ) && (
                          <option value={order.status} disabled>
                            {translateOrderStatus(order.status)} (Hiện tại)
                          </option>
                        )}
                    </select>
                  )}
                  <ExportOrderDetail order={order} />
                </div>
              </div>
            </header>
            <div className="card-body">
              <OrderDetailInfo order={order} />

              <div className="row">
                <div className="col-lg-9">
                  <div className="table-responsive">
                    <OrderDetailProducts order={order} loading={loading} />
                  </div>
                  <div className="mt-3">
                    {order.status === "cancellation_requested" && (
                      <>
                        <button
                          className="btn btn-success me-2"
                          onClick={() =>
                            handleAdminNoteModalOpen(
                              "approve_cancel",
                              "Duyệt Yêu Cầu Hủy Đơn"
                            )
                          }
                          disabled={loadingApproveCancel || loadingRejectCancel}
                        >
                          {loadingApproveCancel ? <Loading /> : "Duyệt Hủy Đơn"}
                        </button>
                            <button
                          className="btn btn-danger"
                          onClick={() =>
                            handleAdminNoteModalOpen(
                              "reject_cancel",
                              "Từ Chối Yêu Cầu Hủy Đơn"
                            )
                          }
                          disabled={loadingApproveCancel || loadingRejectCancel}
                            >
                          {loadingRejectCancel ? (
                            <Loading />
                          ) : (
                            "Từ Chối Hủy Đơn"
                          )}
                            </button>
                      </>
                        )}
                    {order.status === "return_requested" && (
                      <>
                          <button
                          className="btn btn-success me-2"
                          onClick={() =>
                            handleAdminNoteModalOpen(
                              "approve_return",
                              "Duyệt Yêu Cầu Hoàn Hàng"
                            )
                          }
                          disabled={loadingApproveReturn || loadingRejectReturn}
                          >
                          {loadingApproveReturn ? (
                            <Loading />
                          ) : (
                            "Duyệt Hoàn Hàng"
                          )}
                          </button>
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            handleAdminNoteModalOpen(
                              "reject_return",
                              "Từ Chối Yêu Cầu Hoàn Hàng"
                            )
                          }
                          disabled={loadingApproveReturn || loadingRejectReturn}
                        >
                          {loadingRejectReturn ? (
                            <Loading />
                          ) : (
                            "Từ Chối Hoàn Hàng"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                  {(order.cancellationReason ||
                    order.returnReasonCustomer ||
                    order.adminCancellationNote ||
                    order.adminReturnNote) && (
                    <div className="mt-4 p-3 bg-light border rounded">
                      <h5>Thông tin Hủy/Hoàn hàng:</h5>
                      {order.cancellationReason && (
                        <p>
                          <strong>Lý do hủy của khách:</strong>{" "}
                          {order.cancellationReason}
                        </p>
                      )}
                      {order.returnReasonCustomer && (
                        <p>
                          <strong>Lý do hoàn của khách:</strong>{" "}
                          {order.returnReasonCustomer}
                        </p>
                      )}
                      {order.adminCancellationNote && (
                        <p>
                          <strong>Ghi chú của Admin (Hủy):</strong>{" "}
                          {order.adminCancellationNote}
                        </p>
                      )}
                      {order.adminReturnNote && (
                        <p>
                          <strong>Ghi chú của Admin (Hoàn):</strong>{" "}
                          {order.adminReturnNote}
                        </p>
                      )}
                    </div>
                  )}
                  {order.orderStatusHistory &&
                    order.orderStatusHistory.length > 0 && (
                      <div className="mt-4">
                        <h5>Lịch sử trạng thái đơn hàng:</h5>
                        <ul className="list-group">
                          {order.orderStatusHistory
                            .slice()
                            .reverse()
                            .map((historyItem, index) => (
                              <li key={index} className="list-group-item">
                                <p className="mb-1">
                                  <strong>
                                    {translateOrderStatus(historyItem.status)}
                                  </strong>{" "}
                                  -{" "}
                                  <small>
                                    {moment(historyItem.updatedAt).format(
                                      "llll"
                                    )}
                                  </small>
                                </p>
                                {historyItem.notes && (
                                  <p className="mb-0">
                                    <small>
                                      <i>Ghi chú: {historyItem.notes}</i>
                                    </small>
                                  </p>
                                )}
                                {historyItem.updatedBy && (
                                  <p className="mb-0">
                                    <small>
                                      <i>
                                        Cập nhật bởi:{" "}
                                        {historyItem.updatedBy.name ||
                                          historyItem.updatedBy}
                                      </i>
                                    </small>
                                  </p>
                                )}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
                <div className="col-lg-3">
                  <div className="box shadow-sm bg-light">
                    <h6 className="mb-0">Tổng tiền</h6>
                    <h3>
                      {order.totalPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Message variant="alert-info">
            Không tìm thấy thông tin đơn hàng.
          </Message>
        )}
      </section>
    </>
  );
};

export default OrderDetailmain;

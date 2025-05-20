import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";

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
      return "Đã yêu cầu hủy";
    case "cancelled":
      return "Đã hủy";
    case "return_requested":
      return "Đã yêu cầu hoàn";
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

const Orders = (props) => {
  const { loading, error, orders } = props;

  const getStatusDisplay = (status) => {
    return translateOrderStatus(status);
  };

  const getPaymentStatusDisplay = (order) => {
    if (order.isPaid) {
      return <span className="badge bg-success">Đã thanh toán</span>;
    } else {
      return <span className="badge bg-warning">Chưa thanh toán</span>;
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      {loading ? (
        <Loading />
      ) : error ? (
        <Message variant="alert-danger">{error}</Message>
      ) : (
        <>
          {orders && orders.length === 0 ? (
            <div className="col-12 alert alert-info text-center mt-3">
              Chưa có đơn hàng nào
              <Link
                className="btn btn-success mx-2 px-3 py-2"
                to="/"
                style={{
                  fontSize: "12px",
                }}
              >
                Bắt đầu mua hàng
              </Link>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Ngày Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Thanh Toán</th>
                    <th>Trạng Thái Đơn Hàng</th>
                    <th></th> {/* For View Details button */}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/order/${order._id}`} className="link">
                          {order._id}
                        </Link>
                      </td>
                      <td>
                        {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td>{order.totalPrice?.toLocaleString("vi-VN")} VND</td>
                      <td>{getPaymentStatusDisplay(order)}</td>
                      <td>{getStatusDisplay(order.status)}</td>{" "}
                      {/* Use new status field */}
                      <td>
                        <Link
                          to={`/order/${order._id}`}
                          className="btn btn-sm btn-primary"
                        >
                          Xem Chi Tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="col-12 alert alert-info text-center mt-3">
              Đang tải đơn hàng...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;

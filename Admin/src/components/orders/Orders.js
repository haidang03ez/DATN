import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

const Orders = (props) => {
  const { ordersToRender, translateOrderStatus } = props;

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge alert-secondary">
            {translateOrderStatus(status)}
          </span>
        );
      case "paid":
      case "processing":
        return (
          <span className="badge alert-info">
            {translateOrderStatus(status)}
          </span>
        );
      case "shipping":
        return (
          <span className="badge alert-primary">
            {translateOrderStatus(status)}
          </span>
        );
      case "delivered":
        return (
          <span className="badge alert-success">
            {translateOrderStatus(status)}
          </span>
        );
      case "cancellation_requested":
      case "return_requested":
        return (
          <span className="badge alert-warning">
            {translateOrderStatus(status)}
          </span>
        );
      case "cancelled":
      case "cancellation_rejected":
        return (
          <span className="badge alert-danger">
            {translateOrderStatus(status)}
          </span>
        );
      case "returned":
      case "return_rejected":
        return (
          <span className="badge alert-dark">
            {translateOrderStatus(status)}
          </span>
        );
      default:
        return (
          <span className="badge bg-light text-dark">
            {translateOrderStatus(status)}
          </span>
        );
    }
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Tên</th>
          <th scope="col">Email</th>
          <th scope="col">Tổng trả (VNĐ)</th>
          <th scope="col">Thanh toán</th>
          <th scope="col">Ngày đặt</th>
          <th>Trạng thái đơn</th>
          <th scope="col" className="text-end">
            Xem đơn
          </th>
        </tr>
      </thead>
      <tbody>
        {ordersToRender && ordersToRender.length > 0 ? (
          ordersToRender.map((order) => (
            <tr key={order._id}>
              <td>
                <b>{order.user?.name || "N/A"}</b>
              </td>
              <td>{order.user?.email || "N/A"}</td>
              <td>{order.totalPrice?.toLocaleString("vi-VN")}</td>
              <td>
                {order.isPaid ? (
                  <span className="badge rounded-pill alert-success">
                    Đã thanh toán{" "}
                    {order.paidAt
                      ? `lúc ${moment(order.paidAt).format("DD/MM/YY HH:mm")}`
                      : ""}
                  </span>
                ) : (
                  <span className="badge rounded-pill alert-warning">
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận (COD)"
                      : "Chưa thanh toán"}
                  </span>
                )}
              </td>
              <td>{moment(order.createdAt).format("DD/MM/YY HH:mm")}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td className="d-flex justify-content-end align-item-center">
                <Link to={`/order/${order._id}`} className="text-success">
                  <i className="fas fa-eye"></i>
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7}>
              <div className="d-flex justify-content-center col-12">
                <div className="alert alert-warning text-center">
                  Không có đơn hàng nào.
                </div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Orders;

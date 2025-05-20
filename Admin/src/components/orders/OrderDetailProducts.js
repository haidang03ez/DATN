import React from "react";
import { Link } from "react-router-dom";

const OrderDetailProducts = (props) => {
  const { loading, order } = props;

  if (!loading) {
    // Calculate Price
    const addDecimal = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
    };

    order.itemsPrice = addDecimal(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  return (
    <table className="table border table-lg">
      <thead>
        <tr>
          <th style={{ width: "40%" }}>Sản phẩm</th>
          <th style={{ width: "20%" }}>Giá sản phẩm</th>
          <th style={{ width: "20%" }}>Số lượng</th>
          <th style={{ width: "20%" }} className="text-end">
            Tạm tính
          </th>
        </tr>
      </thead>
      <tbody>
        {order.orderItems.map((item, index) => (
          <tr key={index}>
            <td>
              <Link className="itemside" to="#">
                <div className="left">
                  <img
                    src={item.image.url}
                    alt={item.name}
                    style={{ width: "40px", height: "40px" }}
                    className="img-xs"
                  />
                </div>
                <div className="info">{item.name}</div>
              </Link>
            </td>
            <td>{item.price} VND</td>
            <td>{item.qty}</td>
            <td className="text-end"> {item.price * item.qty} VND</td>
          </tr>
        ))}

        <tr>
          <td colSpan="4">
            <article className="float-end">
              <dl className="dlist">
                <dt>Tạm tính:</dt> <dd>{order.itemsPrice} VND</dd>
              </dl>
              <dl className="dlist">
                <dt>Phí vận chuyển:</dt> <dd>{order.shippingPrice} VND</dd>
              </dl>
              <dl className="dlist">
                <dt>Tổng tiền:</dt>
                <dd>
                  <b className="h5">{order.totalPrice} VND</b>
                </dd>
              </dl>
              <dl className="dlist">
                <dt className="text-muted">Trạng thái:</dt>
                <dd>
                  {order.isPaid ? (
                    <span className="badge rounded-pill alert alert-success text-success">
                      Đã thanh toán
                    </span>
                  ) : order.paymentMethod === "Paypal" ? (
                    <span className="badge rounded-pill alert alert-warning text-warning">
                      Chờ thanh toán
                    </span>
                  ) : (
                    <span className="badge rounded-pill alert alert-info text-info">
                      Thanh toán khi nhận hàng
                    </span>
                  )}
                </dd>
              </dl>
            </article>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default OrderDetailProducts;

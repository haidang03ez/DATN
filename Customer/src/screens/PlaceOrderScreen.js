import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createOrder } from "../redux/Actions/OrderActions";
import { ORDER_CREATE_RESET } from "../redux/Constants/OrderConstants";
import Header from "./../components/Header";
import Message from "./../components/LoadingError/Error";
import Loading from "./../components/LoadingError/Loading";
import { toast } from "react-toastify";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 2000,
};

const PlaceOrderScreen = ({ history }) => {
  window.scrollTo(0, 0);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Redirect if not logged in
  useEffect(() => {
    if (!userInfo) {
      history.push('/login?redirect=shipping');
    }
  }, [history, userInfo]);

  // Calculate Price
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => {
      const price = item.discount > 0 ? item.price * (1 - item.discount/100) : item.price;
      return acc + price * item.qty;
    }, 0)
  );

  cart.shippingPrice = cart.shippingAddress.shippingPrice || 25000;
  cart.totalPrice = (Number(cart.itemsPrice) + Number(cart.shippingPrice)).toFixed(2);

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error, loading } = orderCreate;

  useEffect(() => {
    if (success) {
      toast.success("Đặt hàng thành công!", ToastObjects);
      setTimeout(() => {
        history.push(`/order/${order._id}`);
        dispatch({ type: ORDER_CREATE_RESET });
      }, 2000);
    }
  }, [history, dispatch, success, order]);

  const placeOrderHandler = (e) => {
    e.preventDefault();
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
      })
    );
  };

  if (!userInfo) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="row  order-detail">
          <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
            <div className="row ">
              <div className="col-md-4 center">
                <div className="alert-success order-box">
                  <i className="fas fa-user"></i>
                </div>
              </div>
              <div className="col-md-8 center">
                <h5>
                  <strong>Khách hàng</strong>
                </h5>
                <p>{userInfo?.name}</p>
                <p>{userInfo?.email}</p>
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
                <p>Shipping: {cart.shippingAddress.country}</p>
                <p>Pay method: {cart.paymentMethod}</p>
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
                  Address: {cart.shippingAddress.city},{" "}
                  {cart.shippingAddress.address},{" "}
                  {cart.shippingAddress.postalCode}
                </p>
                <p>
                  Số điện thoại: {cart.shippingAddress.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row order-products justify-content-between">
          <div className="col-lg-8">
            {cart.cartItems.length === 0 ? (
              <Message variant="alert-info mt-5">Đặt hàng thành công!</Message>
            ) : (
              <>
                {cart.cartItems.map((item, index) => (
                  <div className="order-product row" key={index}>
                    <div className="col-md-3 col-6">
                      <img src={item.image.url} alt={item.name} />
                    </div>
                    <div className="col-md-5 col-6 d-flex align-items-center">
                      <Link to={`/products/${item.product}`}>
                        <h6>{item.name}</h6>
                      </Link>
                    </div>
                    <div className="mt-3 mt-md-0 col-md-2 col-6  d-flex align-items-center flex-column justify-content-center ">
                      <h4>Số lượng</h4>
                      <h6>{item.qty}</h6>
                    </div>
                    <div className="mt-3 mt-md-0 col-md-2 col-6 align-items-end  d-flex flex-column justify-content-center ">
                      <h4>Tổng trả</h4>
                      {item.discount > 0 ? (
                        <div>
                          <h6 style={{ color: '#dc3545' }}>
                            {Math.round(item.price * (1 - item.discount/100) * item.qty).toLocaleString()} VND
                          </h6>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h6 style={{ textDecoration: 'line-through', color: '#6c757d', fontSize: '14px' }}>
                              {(item.price * item.qty).toLocaleString()} VND
                            </h6>
                            <span style={{ 
                              backgroundColor: '#dc3545', 
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              -{item.discount}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <h6>{(item.qty * item.price).toLocaleString()} VND</h6>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {/* total */}
          <div className="col-lg-3 col-md-6 col-12 col">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>
                    <strong>Giá sản phẩm</strong>
                  </td>
                  <td>{cart.itemsPrice} VND</td>
                </tr>
                <tr>
                  <td>
                    <strong>Phí vận chuyển</strong>
                  </td>
                  <td>{cart.shippingPrice} VND</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tổng trả</strong>
                  </td>
                  <td>{cart.totalPrice} VND</td>
                </tr>
              </tbody>
            </table>
            {cart.cartItems.length === 0 ? null : (
              <button 
                type="submit" 
                onClick={placeOrderHandler}
                disabled={loading}
              >
                {loading ? <Loading /> : "ĐẶT HÀNG"}
              </button>
            )}
            {error && (
              <div className="my-3 col-12">
                <Message variant="alert-danger">{error}</Message>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderScreen;

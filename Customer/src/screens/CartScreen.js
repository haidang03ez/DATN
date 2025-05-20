import React, { useEffect } from "react";
import Header from "./../components/Header";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "./../redux/Actions/CartActions";

const CartScreen = ({ match, location, history }) => {
  window.scrollTo(0, 0);
  const dispatch = useDispatch();
  const productId = match.params.id;
  const qty = location.search ? Number(location.search.split("=")[1]) : 1;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const total = cartItems.reduce((a, i) => a + i.qty * i.price, 0).toFixed(2);

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty]);

  const checkOutHandler = () => {
    history.push("/login?redirect=checkout");
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };
  return (
    <>
      <Header />
      {/* Cart */}
      <div className="container">
        {cartItems.length === 0 ? (
          <div className=" alert alert-info text-center mt-3">
            Giỏ hàng của bạn đang trống? Mua hang ngay thôi nào!
            <Link
              className="btn btn-success mx-5 px-5 py-3"
              to="/"
              style={{
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              MUA HÀNG NGAY
            </Link>
          </div>
        ) : (
          <>
            <div className=" alert alert-info text-center mt-3">
              Tất cả sản phẩm trong giỏ
              <Link className="text-success mx-2" to="/cart">
                ({cartItems.length})
              </Link>
            </div>
            {/* cartiterm */}
            {cartItems.map((item, index) => (
              <div className="cart-iterm row" key={index}>
                <div
                  onClick={() => removeFromCartHandler(item.product)}
                  className="remove-button d-flex justify-content-center align-items-center"
                >
                  <i className="fas fa-times"></i>
                </div>
                <div className="cart-image col-md-3">
                  <img src={item.image.url} alt={item.name} />
                </div>
                <div className="cart-text col-md-5 d-flex align-items-center">
                  <Link to={`/products/${item.product}`}>
                    <h4>{item.name}</h4>
                  </Link>
                </div>
                <div className="cart-qty col-md-2 col-sm-5 mt-md-5 mt-3 mt-md-0 d-flex flex-column justify-content-center">
                  <h6>Số lượng</h6>
                  <select
                    value={item.qty}
                    onChange={(e) =>
                      dispatch(addToCart(item.product, Number(e.target.value)))
                    }
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cart-price mt-3 mt-md-0 col-md-2 align-items-sm-end align-items-start  d-flex flex-column justify-content-center col-sm-7">
                  <h6>Giá sản phẩm</h6>
                  {item.appliedPromotion && item.price < item.originalPrice ? (
                    <div>
                      <h4 style={{ color: "#dc3545" }}>
                        {item.price.toLocaleString()} VND
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <h6
                          style={{
                            textDecoration: "line-through",
                            color: "#6c757d",
                          }}
                        >
                          {item.originalPrice.toLocaleString()} VND
                        </h6>
                        <span
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          -{item.appliedPromotion.discountPercentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <h4>{item.price.toLocaleString()} VND</h4>
                  )}
                </div>
              </div>
            ))}

            {/* End of cart iterms */}
            <div className="total">
              <span className="sub">Tổng trả:</span>
              <span className="total-price">{total} VND</span>
            </div>
            <hr />
            <div className="cart-buttons d-flex align-items-center row">
              <Link to="/" className="col-md-6 ">
                <button
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    backgroundColor: "white",
                    color: "green",
                    border: "1px solid green"
                  }}
                >
                  Tiếp tục mua hàng
                </button>
              </Link>
              {total > 0 && (
                <div className="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
                  <button
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      backgroundColor: "green"
                    }}
                    onClick={checkOutHandler}
                  >
                    Thanh toán
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartScreen;

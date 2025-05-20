import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../redux/Actions/CartActions";
import { getProvinces, getDistricts, getWards } from "vietnam-provinces";
import { Link } from "react-router-dom";

const CheckoutScreen = ({ history }) => {
  window.scrollTo(0, 0);

  const cart = useSelector((state) => state.cart);
  const { shippingAddress, cartItems } = cart;

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [allDistricts, setAllDistricts] = useState([]);
  const [allWards, setAllWards] = useState([]);

  const [note, setNote] = useState(shippingAddress?.note || "");
  const [phoneNumber, setPhoneNumber] = useState(
    shippingAddress?.phoneNumber || ""
  );
  const [shippingPrice, setShippingPrice] = useState(25000);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const dispatch = useDispatch();

  useEffect(() => {
    setProvinces(getProvinces());
    setAllDistricts(getDistricts());
    setAllWards(getWards());
  }, []);

  useEffect(() => {
    if (provinceCode) {
      const filtered = allDistricts.filter(
        (d) => d.province_code === provinceCode
      );
      setDistricts(filtered);
      setDistrictCode("");
      setWardCode("");
      setWards([]);
    }
  }, [provinceCode, allDistricts]);

  useEffect(() => {
    if (districtCode) {
      const filtered = allWards.filter((w) => w.district_code === districtCode);
      setWards(filtered);
      setWardCode("");
    }
  }, [districtCode, allWards]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!provinceCode || !districtCode || !wardCode) {
      alert("Vui lòng chọn đầy đủ Tỉnh, Huyện, Xã");
      return;
    }
    if (!phoneNumber) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    const provinceName = provinces.find((p) => p.code === provinceCode)?.name;
    const districtName = districts.find((d) => d.code === districtCode)?.name;
    const wardName = wards.find((w) => w.code === wardCode)?.name;

    const fullAddress = `${wardName}, ${districtName}, ${provinceName}`;

    dispatch(
      saveShippingAddress({
        address: fullAddress,
        note,
        phoneNumber,
        shippingPrice,
      })
    );
    dispatch(savePaymentMethod(paymentMethod));
    history.push("/placeorder");
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8">
            <form
              onSubmit={submitHandler}
              className="checkout-form bg-white p-4 rounded shadow-sm"
            >
              <div className="shipping-section mb-5">
                <div className="section-header d-flex align-items-center mb-4">
                  <div className="section-icon">
                    <i className="fas fa-map-marker-alt text-success fs-4"></i>
                  </div>
                  <h5 className="section-title mb-0 ms-3">Địa chỉ giao hàng</h5>
                </div>

                {/* Dropdown địa chỉ */}
                <div className="form-floating mb-3">
                  <select
                    className="form-select"
                    id="province"
                    value={provinceCode}
                    onChange={(e) => setProvinceCode(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="province">Tỉnh / Thành phố</label>
                </div>

                <div className="form-floating mb-3">
                  <select
                    className="form-select"
                    id="district"
                    value={districtCode}
                    onChange={(e) => setDistrictCode(e.target.value)}
                    required
                    disabled={!provinceCode}
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="district">Quận / Huyện</label>
                </div>

                <div className="form-floating mb-3">
                  <select
                    className="form-select"
                    id="ward"
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value)}
                    required
                    disabled={!districtCode}
                  >
                    <option value="">-- Chọn xã/phường --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="ward">Xã / Phường</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    placeholder="Số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                </div>

                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="note"
                    placeholder="Ghi chú giao hàng"
                    style={{ height: "100px" }}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <label htmlFor="note">
                    Ghi chú giao hàng (số nhà, tòa nhà...)
                  </label>
                </div>
              </div>

              {/* Payment Section */}
              <div className="payment-section mb-4">
                <div className="section-header d-flex align-items-center mb-4">
                  <div className="section-icon">
                    <i className="fas fa-credit-card text-success fs-4"></i>
                  </div>
                  <h5 className="section-title mb-0 ms-3">
                    Phương thức thanh toán
                  </h5>
                </div>

                <div className="payment-methods">
                  <div className="payment-method mb-3">
                    <input
                      type="radio"
                      className="btn-check"
                      name="paymentMethod"
                      id="cod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label
                      className="btn btn-outline-success w-100 text-start p-3"
                      htmlFor="cod"
                    >
                      <i className="fas fa-money-bill-wave me-2"></i>
                      Thanh toán khi nhận hàng (COD)
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      className="btn-check"
                      name="paymentMethod"
                      id="paypal"
                      value="Paypal"
                      checked={paymentMethod === "Paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label
                      className="btn btn-outline-success w-100 text-start p-3"
                      htmlFor="paypal"
                    >
                      <i className="fab fa-paypal me-2"></i>
                      PayPal / Thẻ tín dụng
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Column */}
          <div className="col-lg-4">
            <div className="order-summary bg-white p-4 rounded shadow-sm">
              <h5 className="summary-title mb-4">Tóm tắt đơn hàng</h5>

              <div className="cart-items mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product}
                    className="cart-item d-flex align-items-center mb-3"
                  >
                    <img
                      src={item.image?.url}
                      alt={item.name}
                      className="cart-item-image rounded"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="cart-item-details ms-3 flex-grow-1">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-quantity text-muted">
                        SL: {item.qty}
                      </div>
                    </div>
                    <div className="cart-item-price text-end">
                      {(item.price * item.qty).toLocaleString()} VND
                    </div>
                  </div>
                ))}
              </div>
              <hr />

              <div className="order-totals">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString()} VND</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingPrice.toLocaleString()} VND</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-0">
                  <strong>Tổng cộng:</strong>
                  <strong className="text-success fs-5">
                    {(subtotal + shippingPrice).toLocaleString()} VND
                  </strong>
                </div>
              </div>

              <div className="shipping-info mt-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-store text-success me-2"></i>
                  <small>Địa điểm: 298 Cầu Diễn, Bắc Từ Liêm, Hà Nội</small>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-truck text-success me-2"></i>
                  <small>Phí ship toàn quốc: 25.000 VND</small>
                </div>
              </div>

              <button
                onClick={submitHandler}
                type="submit"
                className="btn btn-success w-100 py-3 mt-4"
              >
                Tiếp tục đặt hàng
              </button>
              <Link to="/cart">
                <button
                  style={{ backgroundColor: "#e92424", border: "none" }}
                  className="btn btn-success w-100 py-3 mt-4"
                >
                  Quay lại giỏ hàng
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutScreen;

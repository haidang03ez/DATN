import axios from "axios";
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_PAYMENT_METHOD,
  CART_SAVE_SHIPPING_ADDRESS,
} from "../Constants/CartConstants";

// Add to cart
export const addToCart = (id, qty) => async (dispatch, getState) => {
  const { data: product } = await axios.get(`/api/products/${id}`);
  // Không cần gọi API categories và tự tính discount nữa
  // product object từ API đã có originalPrice, discountedPrice, appliedPromotion

  // Sử dụng discountedPrice nếu có, ngược lại dùng price gốc
  const priceForCart = product.discountedPrice
    ? product.discountedPrice
    : product.price;

  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      product: product._id,
      name: product.name,
      image: product.image,
      price: priceForCart, // Đây là giá sẽ được sử dụng trong giỏ hàng và tính tổng
      originalPrice: product.originalPrice || product.price, // Lưu giá gốc để hiển thị nếu cần
      appliedPromotion: product.appliedPromotion || null, // Lưu thông tin KM đã áp dụng
      countInStock: product.countInStock,
      qty,
    },
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

// Remove from cart
export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

// Save shipping address
export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  localStorage.setItem("shippingAddress", JSON.stringify(data));
};

// Save payment method
export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  localStorage.setItem("paymentMethod", JSON.stringify(data));
};

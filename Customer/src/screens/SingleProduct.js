import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Rating from "../components/homeComponents/Rating";
import Loading from "../components/LoadingError/Loading";
import {
  createProductReview,
  listProductDetails,
} from "../redux/Actions/ProductActions";
import { PRODUCT_CREATE_REVIEW_RESET } from "../redux/Constants/ProductConstants";
import Header from "../components/Header";
import Message from "../components/LoadingError/Error";
import Toast from "../components/LoadingError/Toast";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

const SingleProduct = ({ history, match }) => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const productId = match.params.id;
  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const {
    loading: loadingCreateReview,
    error: errorCreateReview,
    success: successCreateReview,
  } = productReviewCreate;

  const categories = useSelector((state) => state.categoryList.categories);

  useEffect(() => {
    if (successCreateReview) {
      toast.success("Đánh giá thành công", ToastObjects);
      setRating(0);
      setComment("");
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(productId));
  }, [dispatch, productId, successCreateReview]);

  const AddToCartHandle = (e) => {
    e.preventDefault();
    history.push(`/cart/${productId}?qty=${qty}`);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview(productId, {
        rating,
        comment,
      })
    );
  };

  console.log(product.reviews);

  return (
    <>
      <Toast />
      <Header />
      <div className="container single-product">
        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="single-image" style={{ width: "100%" }}>
                  <img src={product.image?.url} alt={product.name} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="product-dtl">
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div
                      className="product-author"
                      style={{ marginBottom: "20px", color: "#666" }}
                    >
                      <strong>Tác giả:</strong> {product.author || "Chưa có"}
                    </div>
                  </div>
                  <p
                    style={{
                      textAlign: "justify",
                      textJustify: "inter-word",
                    }}
                  >
                    {product.description}
                  </p>

                  <div className="product-count col-lg-7 ">
                    <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6>Giá</h6>
                      {product.appliedPromotion &&
                      product.discountedPrice < product.originalPrice ? (
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              color: "#dc3545",
                              fontWeight: "bold",
                              fontSize: "18px",
                            }}
                          >
                            {product.discountedPrice.toLocaleString()} VND
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              justifyContent: "flex-end",
                            }}
                          >
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#6c757d",
                              }}
                            >
                              {product.originalPrice.toLocaleString()} VND
                            </span>
                            <span
                              style={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "14px",
                              }}
                            >
                              -{product.appliedPromotion.discountPercentage}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span>{(product.price || 0).toLocaleString()} VND</span>
                      )}
                    </div>
                    <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6>Trạng thái</h6>
                      {product.countInStock > 0 ? (
                        <span>Còn hàng</span>
                      ) : (
                        <span>Hết hàng</span>
                      )}
                    </div>
                    <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6>Đánh giá</h6>
                      <Rating
                        value={product.rating}
                        text={`${product.numReviews} đánh giá`}
                      />
                    </div>
                    {product.countInStock > 0 ? (
                      <>
                        <div className="flex-box d-flex justify-content-between align-items-center">
                          <h6>Số lượng mua</h6>
                          <select
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                          >
                            {[...Array(product.countInStock).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <button
                          onClick={AddToCartHandle}
                          className="round-black-btn"
                        >
                          + Thêm vào giỏ hàng
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* RATING */}
            <div className="row my-5">
              <div className="col-md-6">
                <h6 className="mb-3">Nhận xét của khách hàng</h6>
                {product.reviews.length === 0 && (
                  <Message variant={"alert-info mt-3"}>
                    Chưa có nhận xét nào
                  </Message>
                )}
                {product.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="mb-5 mb-md-3 bg-light p-3 shadow-sm rounded"
                  >
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <span>{moment(review.creareAt).calendar()}</span>
                    <div className="alert alert-info mt-3">
                      {review.comment}
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <h6>Viết đánh giá</h6>
                <div className="my-4">
                  {loadingCreateReview && <Loading />}
                  {errorCreateReview && (
                    <Message variant="alert-danger">
                      {errorCreateReview}
                    </Message>
                  )}
                </div>
                {userInfo ? (
                  <form onSubmit={submitHandler}>
                    <div className="my-4">
                      <strong>Lựa chọn đánh giá</strong>
                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="col-12 bg-light p-3 mt-2 border-0 rounded"
                      >
                        <option value="">Nhấn để chọn...</option>
                        <option value="1">1 sao - Không đáng mua</option>
                        <option value="2">2 sao - Bình thường</option>
                        <option value="3">3 sao - Tốt</option>
                        <option value="4">4 sao - Rất tốt</option>
                        <option value="5">5 sao - Đáng mua</option>
                      </select>
                    </div>
                    <div className="my-4">
                      <strong>Hãy viết đánh giá của bạn</strong>
                      <textarea
                        row="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="col-12 bg-light p-3 mt-2 border-0 rounded"
                      ></textarea>
                    </div>
                    <div className="my-3">
                      <button
                        disabled={loadingCreateReview}
                        className="col-12 bg-black border-0 p-3 rounded text-white"
                      >
                        XÁC NHẬN
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="my-3">
                    <Message variant={"alert-warning"}>
                      Hãy{" "}
                      <Link to="/login">
                        " <strong>Đăng nhập</strong> "
                      </Link>{" "}
                      để viết đánh giá{" "}
                    </Message>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SingleProduct;

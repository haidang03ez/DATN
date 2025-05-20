import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  PROMOTION_UPDATE_RESET,
  PROMOTION_DETAILS_RESET,
} from "../../redux/Constants/PromotionConstants";
import {
  getPromotionDetails,
  updatePromotion,
} from "../../redux/Actions/PromotionActions";
import { lisProducts } from "../../redux/Actions/ProductActions";
import { lisCategories } from "../../redux/Actions/CategoryActions";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 2000,
};

const EditPromotionMain = ({ promotionId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [targetType, setTargetType] = useState("All");
  const [targetCategories, setTargetCategories] = useState([]);
  const [targetProducts, setTargetProducts] = useState([]);

  const dispatch = useDispatch();

  const promotionDetails = useSelector((state) => state.promotionDetails);
  const { loading, error, promotion } = promotionDetails;

  const promotionUpdate = useSelector((state) => state.promotionUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = promotionUpdate;

  const productList = useSelector((state) => state.productList);
  const { products } = productList;

  const categoryList = useSelector((state) => state.categoryList);
  const { categories } = categoryList;

  useEffect(() => {
    dispatch(lisProducts());
    dispatch(lisCategories());

    if (successUpdate) {
      toast.success("Khuyến mãi đã được cập nhật!", ToastObjects);
      dispatch({ type: PROMOTION_UPDATE_RESET });
      dispatch({ type: PROMOTION_DETAILS_RESET }); // Reset để load lại dữ liệu mới nếu cần
      dispatch(getPromotionDetails(promotionId)); // Tải lại chi tiết KM
    } else {
      if (!promotion || promotion._id !== promotionId) {
        dispatch(getPromotionDetails(promotionId));
      } else {
        setName(promotion.name || "");
        setDescription(promotion.description || "");
        setDiscountPercentage(promotion.discountPercentage || 0);
        setStartDate(
          promotion.startDate
            ? new Date(promotion.startDate).toISOString().split("T")[0]
            : ""
        );
        setEndDate(
          promotion.endDate
            ? new Date(promotion.endDate).toISOString().split("T")[0]
            : ""
        );
        setIsActive(
          promotion.isActive === undefined ? true : promotion.isActive
        );
        setTargetType(promotion.targetType || "All");
        setTargetCategories(
          promotion.targetCategories
            ? promotion.targetCategories.map((cat) =>
                typeof cat === "object" ? cat._id : cat
              )
            : []
        );
        setTargetProducts(
          promotion.targetProducts
            ? promotion.targetProducts.map((prod) =>
                typeof prod === "object" ? prod._id : prod
              )
            : []
        );
      }
    }

    if (errorUpdate) {
      toast.error(errorUpdate, ToastObjects);
      // Không reset PROMOTION_UPDATE_RESET ở đây để user biết lỗi và không mất dữ liệu đang nhập
    }
  }, [dispatch, promotionId, promotion, successUpdate, errorUpdate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.", ToastObjects);
      return;
    }
    dispatch(
      updatePromotion(promotionId, {
        name,
        description,
        discountPercentage,
        startDate,
        endDate,
        isActive,
        targetType,
        targetCategories: targetType === "Category" ? targetCategories : [],
        targetProducts: targetType === "Product" ? targetProducts : [],
      })
    );
  };

  const handleCategorySelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setTargetCategories(selectedOptions);
  };

  const handleProductSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setTargetProducts(selectedOptions);
  };

  return (
    <>
      <Toast />
      <section className="content-main" style={{ maxWidth: "1200px" }}>
        <form onSubmit={submitHandler}>
          <div className="content-header">
            <Link to="/promotions" className="btn btn-danger text-white">
              Quay lại Danh sách
            </Link>
            <h2 className="content-title">Sửa Khuyến Mãi</h2>
            <div>
              <button type="submit" className="btn btn-primary">
                Cập nhật
              </button>
            </div>
          </div>

          {loadingUpdate && <Loading />}
          {/* {errorUpdate && <Message variant="alert-danger">{errorUpdate}</Message>} */}

          {loading ? (
            <Loading />
          ) : error ? (
            <Message variant="alert-danger">{error}</Message>
          ) : (
            <div className="row mb-4">
              <div className="col-xl-12 col-lg-12">
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <div className="mb-4">
                      <label htmlFor="promotion_name" className="form-label">
                        Tên khuyến mãi
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên khuyến mãi"
                        className="form-control"
                        id="promotion_name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="promotion_description"
                        className="form-label"
                      >
                        Mô tả
                      </label>
                      <textarea
                        placeholder="Nhập mô tả"
                        className="form-control"
                        id="promotion_description"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label
                          htmlFor="promotion_discount"
                          className="form-label"
                        >
                          Phần trăm giảm giá
                        </label>
                        <input
                          type="number"
                          placeholder="VD: 10 cho 10%"
                          className="form-control"
                          id="promotion_discount"
                          required
                          min="0"
                          max="100"
                          value={discountPercentage}
                          onChange={(e) =>
                            setDiscountPercentage(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label">Trạng thái</label>
                        <select
                          className="form-select"
                          value={isActive}
                          onChange={(e) =>
                            setIsActive(e.target.value === "true")
                          }
                        >
                          <option value={true}>Hoạt động</option>
                          <option value={false}>Không hoạt động</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label
                          htmlFor="promotion_start_date"
                          className="form-label"
                        >
                          Ngày bắt đầu
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="promotion_start_date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label
                          htmlFor="promotion_end_date"
                          className="form-label"
                        >
                          Ngày kết thúc
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="promotion_end_date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Đối tượng áp dụng</label>
                      <select
                        className="form-select"
                        value={targetType}
                        onChange={(e) => {
                          setTargetType(e.target.value);
                          // Không reset targetCategories/targetProducts ngay lập tức
                          // User có thể muốn thay đổi type và giữ lại lựa chọn cũ nếu phù hợp
                        }}
                      >
                        <option value="All">Tất cả sản phẩm</option>
                        <option value="Category">Danh mục cụ thể</option>
                        <option value="Product">Sản phẩm cụ thể</option>
                      </select>
                    </div>

                    {targetType === "Category" && categories && (
                      <div className="mb-4">
                        <label className="form-label">Chọn Danh mục</label>
                        <select
                          multiple
                          className="form-select"
                          style={{ height: "150px" }}
                          value={targetCategories}
                          onChange={handleCategorySelection}
                        >
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <small>
                          Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều.
                        </small>
                      </div>
                    )}

                    {targetType === "Product" && products && (
                      <div className="mb-4">
                        <label className="form-label">Chọn Sản phẩm</label>
                        <select
                          multiple
                          className="form-select"
                          style={{ height: "200px" }}
                          value={targetProducts}
                          onChange={handleProductSelection}
                        >
                          {products.map((prod) => (
                            <option key={prod._id} value={prod._id}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                        <small>
                          Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều.
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </section>
    </>
  );
};

export default EditPromotionMain;

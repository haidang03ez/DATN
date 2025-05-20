import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  PROMOTION_CREATE_RESET,
  PROMOTION_DETAILS_RESET,
} from "../../redux/Constants/PromotionConstants";
import { createPromotion } from "../../redux/Actions/PromotionActions";
import { lisProducts } from "../../redux/Actions/ProductActions"; // Để chọn sản phẩm
import { lisCategories } from "../../redux/Actions/CategoryActions"; // Để chọn category
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 2000,
};

const AddPromotionMain = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [targetType, setTargetType] = useState("All"); // All, Category, Product
  const [targetCategories, setTargetCategories] = useState([]);
  const [targetProducts, setTargetProducts] = useState([]);

  const dispatch = useDispatch();

  const promotionCreate = useSelector((state) => state.promotionCreate);
  const { loading, error, success, promotion } = promotionCreate;

  const productList = useSelector((state) => state.productList);
  const { products } = productList; // Lấy danh sách sản phẩm

  const categoryList = useSelector((state) => state.categoryList);
  const { categories } = categoryList; // Lấy danh sách category

  useEffect(() => {
    dispatch({ type: PROMOTION_DETAILS_RESET });
    dispatch(lisProducts()); // Load sản phẩm khi component mount
    dispatch(lisCategories()); // Load category khi component mount

    if (success) {
      toast.success("Khuyến mãi đã được tạo!", ToastObjects);
      dispatch({ type: PROMOTION_CREATE_RESET });
      // Reset form fields
      setName("");
      setDescription("");
      setDiscountPercentage(0);
      setStartDate("");
      setEndDate("");
      setIsActive(true);
      setTargetType("All");
      setTargetCategories([]);
      setTargetProducts([]);
    }
    if (error) {
      toast.error(error, ToastObjects);
      dispatch({ type: PROMOTION_CREATE_RESET }); // Để có thể thử lại
    }
  }, [dispatch, success, error]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.", ToastObjects);
      return;
    }
    dispatch(
      createPromotion({
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
            <h2 className="content-title">Thêm Khuyến Mãi</h2>
            <div>
              <button type="submit" className="btn btn-primary">
                Tạo mới
              </button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-xl-12 col-lg-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  {loading && <Loading />}
                  {/* {error && <Message variant="alert-danger">{error}</Message>} */}

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
                        onChange={(e) => setIsActive(e.target.value === "true")}
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
                        setTargetCategories([]); // Reset khi thay đổi loại
                        setTargetProducts([]); // Reset khi thay đổi loại
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
                      <small>Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều.</small>
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
                      <small>Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều.</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default AddPromotionMain;

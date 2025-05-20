import React, { useEffect, useRef, useState } from "react";
import { Img } from "react-image";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { lisCategories } from "../../redux/Actions/CategoryActions";
import { createProduct } from "../../redux/Actions/ProductActions";
import {
  deleteUploadImage,
  uploadImage,
} from "../../redux/Actions/UploadActions";
import { PRODUCT_CREATE_RESET } from "../../redux/Constants/ProductConstants";
import { UPLOAD_IMAGE_RESET } from "../../redux/Constants/UploadConstants";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

const AddProductMain = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const productCreate = useSelector((state) => state.productCreate);
  const { loading, error, product } = productCreate;

  const categoryList = useSelector((state) => state.categoryList);
  const { loading: loadingList, error: errorList, categories } = categoryList;

  const imageUpload = useSelector((state) => state.imageUpload);
  const {
    loading: loadingImage,
    error: errorImage,
    image: uploadedImage,
  } = imageUpload;

  const imageDelete = useSelector((state) => state.imageDelete);
  const { success: successDelete } = imageDelete;

  useEffect(() => {
    dispatch(lisCategories());
    if (product) {
      toast.success("Thêm sản phẩm thành công", ToastObjects);
      dispatch({ type: PRODUCT_CREATE_RESET });
      dispatch({ type: UPLOAD_IMAGE_RESET });
      resetFileInput();
      setName("");
      setPrice(0);
      setDescription("");
      setCategory("");
      setImage("");
      setAuthor("");
    }
  }, [product, dispatch, successDelete]);

  useEffect(() => {
    if (uploadedImage) {
      setImage(uploadedImage);
    }
  }, [uploadedImage]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProduct(
        name,
        Number(price),
        description,
        category,
        0,
        image,
        author
      )
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      if (!file) {
        return alert("File không tồn tại");
      }
      if (file.size > 1024 * 1024) {
        return alert("Kích cỡ không phù hợp");
      }
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        return alert("Định dạng tập tin không đúng");
      }
      let formData = new FormData();
      formData.append("file", file);
      dispatch(uploadImage(formData));
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteUpload = async () => {
    try {
      dispatch(deleteUploadImage(image));
      resetFileInput();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetFileInput = () => {
    inputRef.current.value = null;
  };

  return (
    <>
      <Toast />
      <section className="content-main" style={{ maxWidth: "1200px" }}>
        <form onSubmit={submitHandler} className="add-product-form">
          <div className="add-product-header">
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/products" className="btn btn-danger text-white">
                Quay lại
              </Link>
              <h2 className="content-title">Tạo sản phẩm mới</h2>
              <div>
                <button type="submit" className="btn btn-primary">
                  Tạo sản phẩm
                </button>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-xl-8 col-lg-8">
              <div className="add-product-card">
                <div className="card-body">
                  {error && <Message variant="alert-danger">{error}</Message>}
                  {loading && <div className="loading-spinner"></div>}
                  <div className="form-group">
                    <label htmlFor="product_name" className="form-label">
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tại đây"
                      className="form-control"
                      id="product_name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product_author" className="form-label">
                      Tác giả
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tại đây"
                      className="form-control"
                      id="product_author"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product_price" className="form-label">
                      Giá sản phẩm
                    </label>
                    <input
                      type="number"
                      placeholder="Nhập tại đây"
                      className="form-control"
                      id="product_price"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product_description" className="form-label">
                      Mô tả
                    </label>
                    <textarea
                      placeholder="Nhập tại đây"
                      className="form-control"
                      id="product_description"
                      rows="7"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Danh mục</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories?.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hình ảnh</label>
                    <input
                      className="form-control"
                      type="file"
                      ref={inputRef}
                      onChange={handleUpload}
                    />
                    {image && (
                      <div className="image-actions">
                        <img
                          src={image}
                          alt=""
                          className="image-preview"
                          style={{ width: "200px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={deleteUpload}
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default AddProductMain;

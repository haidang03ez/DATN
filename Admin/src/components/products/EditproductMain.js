import React, { useEffect, useRef, useState } from "react";
import { Img } from "react-image";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { lisCategories } from "../../redux/Actions/CategoryActions";
import { editProduct, updateProduct } from "../../redux/Actions/ProductActions";
import {
  deleteUploadImage,
  uploadImage,
} from "../../redux/Actions/UploadActions";
import { PRODUCT_UPDATE_RESET } from "../../redux/Constants/ProductConstants";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 3000,
};

const EditProductMain = (props) => {
  const { productId } = props;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState({});
  const [author, setAuthor] = useState("");

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const productEdit = useSelector((state) => state.productEdit);
  const { error, product } = productEdit;

  const productUpdate = useSelector((state) => state.productUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successProduct,
  } = productUpdate;

  const categoryList = useSelector((state) => state.categoryList);
  const { loading: loadingList, error: errorList, categories } = categoryList;

  const imageUpload = useSelector((state) => state.imageUpload);
  const { loading: loadingImage, error: errorImage, image } = imageUpload;

  const imageDelete = useSelector((state) => state.imageDelete);
  const { success: successDelete, error: errorDelete } = imageDelete;

  useEffect(() => {
    dispatch(lisCategories());
    if (successProduct) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      toast.success("Cập nhật sản phẩm thành công", ToastObjects);
    } else {
      if (!product.name || product._id !== productId) {
        dispatch(editProduct(productId));
      } else {
        setName(product.name);
        setPrice(product.price);
        setCountInStock(product.countInStock);
        setDescription(product.description);
        setCategory(product.category);
        setImages(product.image || {});
        setAuthor(product.author || "");
      }
    }
  }, [product, dispatch, productId, successProduct, successDelete]);

  useEffect(() => {
    if (image) {
      setImages(image);
    }
  }, [image]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      updateProduct({
        _id: productId,
        name,
        price: Number(price),
        countInStock: Number(countInStock),
        description,
        category,
        image: images,
        author,
      })
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      if (!file) {
        return alert("Tệp không tồn tại");
      }
      if (file.size > 1024 * 1024) {
        return alert("Kích thước không phù hợp");
      }
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        return alert("Tệp không đúng định dạng");
      }
      let formData = new FormData();
      formData.append("file", file);
      await dispatch(uploadImage(formData));
      resetFileInput();
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteUpload = async () => {
    try {
      if (images && images.public_id) {
        await dispatch(deleteUploadImage(images));
        setImages({});
        resetFileInput();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const resetFileInput = () => {
    inputRef.current.value = null;
  };

  console.log(images);

  return (
    <>
      <Toast />
      <section className="content-main" style={{ maxWidth: "1200px" }}>
        <form onSubmit={submitHandler}>
          <div className="content-header">
            <Link to="/products" className="btn btn-danger text-white">
              Quay lại
            </Link>
            <h2 className="content-title">Cập nhật sản phẩm</h2>
            <div>
              <button type="submit" className="btn btn-primary">
                Cập nhật
              </button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-xl-8 col-lg-8">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  {errorUpdate && (
                    <Message variant="alert-danger">{errorUpdate}</Message>
                  )}
                  {loadingUpdate ? (
                    <Loading />
                  ) : error ? (
                    <Message variant="alert-danger">{error}</Message>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label htmlFor="product_title" className="form-label">
                          Tên sản phẩm
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập tại đây"
                          className="form-control"
                          id="product_title"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
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
                      <div className="mb-4">
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
                      {/* <div className="mb-4">
                        <label htmlFor="product_price" className="form-label">
                          Số lượng
                        </label>
                        <input
                          type="number"
                          placeholder="Nhập tại đây"
                          className="form-control"
                          id="product_price"
                          required
                          value={countInStock}
                          onChange={(e) => setCountInStock(e.target.value)}
                        />
                      </div> */}
                      <div className="mb-4">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          placeholder="Nhập tại đây"
                          className="form-control"
                          rows="7"
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="mb-4">
                        <label className="form-label">Thể loại</label>
                        {loadingList ? (
                          <Loading />
                        ) : errorList ? (
                          <Message variant="alert-danger">{errorList}</Message>
                        ) : (
                          <select
                            name="category"
                            className="form-select"
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            <option value="">Chọn thể loại</option>
                            {categories.map((category) => (
                              <option value={category._id} key={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <div className="mb-4">
                    <label className="form-label">Hình ảnh</label>
                    <input
                      id="previewImg"
                      className="form-control"
                      type="file"
                      ref={inputRef}
                      onChange={handleUpload}
                      hidden
                    />
                  </div>
                  <div className="mb-4">
                    {loadingImage ? (
                      <Loading />
                    ) : errorImage ? (
                      <>
                        <div className="d-grid gap-2">
                          <label
                            className="mb-4 btn btn-outline-success"
                            htmlFor="previewImg"
                          >
                            Tải ảnh lên <i className="fas fa-upload"></i>
                          </label>
                        </div>
                        <Message variant="alert-danger">{errorImage}</Message>
                      </>
                    ) : images && images.url ? (
                      <>
                        <div
                          className="mb-4 btn btn-danger"
                          onClick={deleteUpload}
                        >
                          Xóa hình ảnh
                        </div>
                        <Img
                          style={{
                            width: "100%",
                            height: "250px",
                            background: "center center no-repeat",
                            cursor: "pointer",
                          }}
                          src={images.url}
                        />
                        {errorDelete ? (
                          <Message variant="alert-danger">
                            {errorDelete}
                          </Message>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <div className="d-grid gap-2">
                          <label
                            className="mb-4 btn btn-outline-success"
                            htmlFor="previewImg"
                          >
                            Tải ảnh lên <i className="fas fa-upload"></i>
                          </label>
                        </div>
                        <Message variant="alert-info">
                          Chưa có ảnh, vui lòng tải lên.
                        </Message>
                      </>
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

export default EditProductMain;

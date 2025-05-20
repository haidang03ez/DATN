import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createCategory } from "../../redux/Actions/CategoryActions";
import { CATEGORY_CREATE_RESET } from "../../redux/Constants/CategoryConstants";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";

const ToastObject = {
  pauseOnFocusLoss: false,
  draggble: false,
  pauseOnHover: false,
  autoClose: 3000,
};

const CreateCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch();

  const categoryCreate = useSelector((state) => state.categoryCreate);
  const { loading, error, success } = categoryCreate;

  useEffect(() => {
    if (success) {
      toast.success("Thêm thể loại thành công", ToastObject);
      dispatch({ type: CATEGORY_CREATE_RESET });
      setName("");
      setDescription("");
    }
  }, [success, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(createCategory(name, description));
  };

  return (
    <>
      <Toast />
      <div className="col-md-12 col-lg-4">
        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : (
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label htmlFor="product_name" className="form-label">
                Tên
              </label>
              <input
                type="text"
                placeholder="Nhập tên thể loại"
                className="form-control py-3"
                id="product_name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Mô tả</label>
              <textarea
                placeholder="Nhập mô tả"
                className="form-control"
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary py-3">
                Thêm thể loại
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default CreateCategory;

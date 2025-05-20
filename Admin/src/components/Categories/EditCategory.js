import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  editCategory,
  lisCategories,
  updateCategory,
} from "../../redux/Actions/CategoryActions";
import { CATEGORY_UPDATE_RESET } from "../../redux/Constants/CategoryConstants";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";
import CategoriesTable from "./CategoriesTable";

const ToastObject = {
  pauseOnFocusLoss: false,
  draggble: false,
  pauseOnHover: false,
  autoClose: 3000,
};

const EditCategory = (props) => {
  const { categoryId } = props;
  const history = useHistory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const dispatch = useDispatch();

  const categoryList = useSelector((state) => state.categoryList);
  const { loading: loadingList, error: errorList, categories } = categoryList;

  const categoryEdit = useSelector((state) => state.categoryEdit);
  const { loading: loadingEdit, error: errorEdit, category } = categoryEdit;

  const categoryUpdate = useSelector((state) => state.categoryUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = categoryUpdate;

  useEffect(() => {
    if (successUpdate) {
      toast.success("Cập nhật thể loại thành công", ToastObject);
      dispatch({ type: CATEGORY_UPDATE_RESET });
      history.push("/category");
    } else {
      if (!category.name || category._id !== categoryId) {
        dispatch(editCategory(categoryId));
      } else {
        setName(category.name);
        setDescription(category.description);
      }
    }
  }, [category, dispatch, categoryId, successUpdate, history]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateCategory({ _id: categoryId, name, description }));
  };

  return (
    <section className="content-main">
      <Toast />
      <div className="content-header">
        <h2 className="content-title">Chỉnh sửa thể loại</h2>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <form onSubmit={submitHandler}>
                {errorUpdate && (
                  <Message variant="alert-danger">{errorUpdate}</Message>
                )}
                {loadingUpdate && <Loading />}
                {loadingEdit ? (
                  <Loading />
                ) : errorEdit ? (
                  <Message variant="alert-danger">{errorEdit}</Message>
                ) : (
                  <>
                    <div className="mb-4">
                      <label htmlFor="category_name" className="form-label">
                        Tên thể loại
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên thể loại"
                        className="form-control"
                        id="category_name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="category_description"
                        className="form-label"
                      >
                        Mô tả
                      </label>
                      <textarea
                        placeholder="Nhập mô tả"
                        className="form-control"
                        id="category_description"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="d-flex justify-content-between">
                      <Link to="/category" className="btn btn-danger">
                        Quay lại
                      </Link>
                      <button type="submit" className="btn btn-primary">
                        Cập nhật
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .content-main {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
        }

        .content-header {
          margin-bottom: 24px;
        }

        .content-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          background: white;
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-body {
          padding: 24px;
        }

        .form-label {
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .form-control {
          border-radius: 8px;
          border: 1px solid #d9d9d9;
          padding: 8px 12px;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
          transform: translateY(-1px);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
          border: none;
          color: white;
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
          transform: translateY(-1px);
        }

        .mb-4 {
          margin-bottom: 24px;
        }

        .d-flex {
          display: flex;
          gap: 16px;
        }

        .justify-content-between {
          justify-content: space-between;
        }
      `}</style>
    </section>
  );
};

export default EditCategory;

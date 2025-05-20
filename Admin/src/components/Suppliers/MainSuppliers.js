import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";
import {
  listSuppliers,
  createSupplier,
  deleteSupplier,
} from "../../redux/Actions/SupplierActions";
import { SUPPLIER_CREATE_RESET } from "../../redux/Constants/SupplierConstants";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 2000,
};

const MainSuppliers = () => {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const supplierList = useSelector((state) => state.supplierList);
  const { loading, error, suppliers } = supplierList;

  const supplierCreate = useSelector((state) => state.supplierCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = supplierCreate;

  const supplierDelete = useSelector((state) => state.supplierDelete);
  const { error: errorDelete, success: successDelete } = supplierDelete;

  useEffect(() => {
    dispatch({ type: SUPPLIER_CREATE_RESET });
    if (successCreate) {
      toast.success("Nhà cung cấp được thêm thành công", ToastObjects);
      setName("");
      setAddress("");
      setPhoneNumber("");
      setEmail("");
      setDescription("");
    }
    if (successDelete) {
      toast.success("Nhà cung cấp được xoá thành công", ToastObjects);
    }
    dispatch(listSuppliers());
  }, [dispatch, successCreate, successDelete]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên nhà cung cấp là bắt buộc", ToastObjects);
      return;
    }
    dispatch(
      createSupplier({ name, address, phoneNumber, email, description })
    );
  };

  const deletehandler = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá nhà cung cấp này?")) {
      dispatch(deleteSupplier(id));
    }
  };

  return (
    <>
      <Toast />
      <section className="content-main">
        <div className="content-header">
          <h2 className="content-title">Quản lý Nhà Cung Cấp</h2>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row">
              {/* Create Supplier */}
              <div className="col-md-12 col-lg-4">
                <form onSubmit={submitHandler}>
                  <div className="mb-4">
                    <label htmlFor="supplier_name" className="form-label">
                      Tên NCC
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên NCC"
                      className="form-control py-3"
                      id="supplier_name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="supplier_email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Nhập email"
                      className="form-control py-3"
                      id="supplier_email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="supplier_phone" className="form-label">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập SĐT"
                      className="form-control py-3"
                      id="supplier_phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="supplier_address" className="form-label">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ"
                      className="form-control py-3"
                      id="supplier_address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      placeholder="Nhập mô tả"
                      className="form-control"
                      rows="4"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary py-3">
                      {loadingCreate ? <Loading /> : "Thêm Nhà Cung Cấp"}
                    </button>
                  </div>
                  {errorCreate && (
                    <Message variant="alert-danger">{errorCreate}</Message>
                  )}
                </form>
              </div>

              {/* Suppliers Table */}
              <div className="col-md-12 col-lg-8">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên NCC</th>
                      <th>Email</th>
                      <th>SĐT</th>
                      <th>Địa chỉ</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {error && <Message variant="alert-danger">{error}</Message>}
                    {loading ? (
                      <Loading />
                    ) : (
                      suppliers.map((supplier) => (
                        <tr key={supplier._id}>
                          <td>
                            <b>{supplier.name}</b>
                          </td>
                          <td>{supplier.email}</td>
                          <td>{supplier.phoneNumber}</td>
                          <td>{supplier.address}</td>
                          <td className="text-end">
                            <Link
                              to={`/admin/supplier/${supplier._id}/edit`}
                              className="btn btn-sm btn-outline-success p-2 pb-3 col-md-6"
                            >
                              <i className="fas fa-pen"></i>
                            </Link>
                            <button
                              onClick={() => deletehandler(supplier._id)}
                              className="btn btn-sm btn-outline-danger p-2 pb-3 col-md-6"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {errorDelete && (
                  <Message variant="alert-danger">{errorDelete}</Message>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainSuppliers;

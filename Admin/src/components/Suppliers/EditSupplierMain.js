import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Toast from "../LoadingError/Toast";
import {
  getSupplierDetails,
  updateSupplier,
} from "../../redux/Actions/SupplierActions";
import {
  SUPPLIER_UPDATE_RESET,
  SUPPLIER_DETAILS_RESET,
} from "../../redux/Constants/SupplierConstants";
import { Link } from "react-router-dom";
import axios from "axios";
import { Table, Tag, Spin } from "antd";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 2000,
};

const EditSupplierMain = ({ supplierId }) => {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [importHistory, setImportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const supplierDetails = useSelector((state) => state.supplierDetails);
  const { loading, error, supplier } = supplierDetails;

  const supplierUpdate = useSelector((state) => state.supplierUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = supplierUpdate;

  const { userInfo } = useSelector((state) => state.userLogin);

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: SUPPLIER_UPDATE_RESET });
      dispatch({ type: SUPPLIER_DETAILS_RESET });
      toast.success("Thông tin nhà cung cấp được cập nhật", ToastObjects);
    }

    if (!supplier || supplier._id !== supplierId || successUpdate) {
      dispatch(getSupplierDetails(supplierId));
    } else {
      setName(supplier.name || "");
      setAddress(supplier.address || "");
      setPhoneNumber(supplier.phoneNumber || "");
      setEmail(supplier.email || "");
      setDescription(supplier.description || "");
      if (!successUpdate) {
        fetchImportHistory(supplierId);
      }
    }
  }, [dispatch, supplierId, supplier, successUpdate, userInfo]);

  useEffect(() => {
    if (supplier && supplier._id === supplierId && userInfo) {
      fetchImportHistory(supplierId);
    }
    return () => {
      setImportHistory([]);
      setLoadingHistory(false);
    };
  }, [supplier, supplierId, userInfo]);

  const fetchImportHistory = async (id) => {
    if (!userInfo || !id) return;
    setLoadingHistory(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/suppliers/${id}/import-history`,
        config
      );
      setImportHistory(data);
    } catch (error) {
      toast.error("Lỗi khi tải lịch sử nhập hàng", ToastObjects);
      setImportHistory([]);
    }
    setLoadingHistory(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên nhà cung cấp là bắt buộc", ToastObjects);
      return;
    }
    dispatch(
      updateSupplier({
        _id: supplierId,
        name,
        address,
        phoneNumber,
        email,
        description,
      })
    );
  };

  return (
    <>
      <Toast />
      <section className="content-main" style={{ maxWidth: "1200px" }}>
        <form onSubmit={submitHandler}>
          <div className="content-header">
            <Link to="/admin/suppliers" className="btn btn-danger text-white">
              Quay lại Danh Sách NCC
            </Link>
            <h2 className="content-title">Chỉnh Sửa Nhà Cung Cấp</h2>
            <div>
              <button type="submit" className="btn btn-primary">
                {loadingUpdate ? <Loading /> : "Cập Nhật"}
              </button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-xl-8 col-lg-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  {errorUpdate && (
                    <Message variant="alert-danger">{errorUpdate}</Message>
                  )}
                  {error && <Message variant="alert-danger">{error}</Message>}
                  {loading && <Loading />}

                  <div className="mb-4">
                    <label htmlFor="supplier_name" className="form-label">
                      Tên NCC
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên NCC"
                      className="form-control"
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
                      className="form-control"
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
                      className="form-control"
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
                      className="form-control"
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
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Import History Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">
              Lịch sử nhập hàng từ nhà cung cấp này
            </h5>
            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
              </div>
            ) : importHistory.length > 0 ? (
              <Table
                dataSource={importHistory}
                rowKey="_id"
                columns={[
                  {
                    title: "Tên sản phẩm",
                    dataIndex: ["product", "name"],
                    key: "productName",
                    render: (text, record) =>
                      record.product?.name || "Sản phẩm không tồn tại",
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    render: (qty) => <Tag color="blue">{qty}</Tag>,
                  },
                  {
                    title: "Giá nhập / đơn vị",
                    dataIndex: "importPrice",
                    key: "importPrice",
                    render: (price) => `${price.toLocaleString()} VND`,
                  },
                  {
                    title: "Tổng tiền",
                    key: "totalCost",
                    render: (text, record) =>
                      `${(
                        record.quantity * record.importPrice
                      ).toLocaleString()} VND`,
                  },
                  {
                    title: "Ngày nhập",
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (date) => new Date(date).toLocaleDateString(),
                  },
                  {
                    title: "Người nhập",
                    dataIndex: ["user", "name"],
                    key: "userName",
                    render: (text, record) => record.user?.name || "N/A",
                  },
                ]}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <p>Không có lịch sử nhập hàng nào từ nhà cung cấp này.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default EditSupplierMain;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  listUser,
  toggleUserActive,
  updateUserByAdmin,
  deleteUser,
} from "../../redux/Actions/UserActions";
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";
import { toast } from "react-toastify";

const UserComponent = () => {
  const dispatch = useDispatch();
  const userList = useSelector((state) => state.userList);
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const { loading, error, users } = userList;

  useEffect(() => {
    dispatch(listUser());
  }, [dispatch]);

  const handleToggleActive = async (userId, currentIsActive) => {
    if (userInfo.role !== "admin") {
      toast.error("Bạn không có quyền thực hiện hành động này.");
      return;
    }
    if (userId === userInfo._id) {
      toast.error("Bạn không thể tự khóa/mở khóa tài khoản của mình.");
      return;
    }
    try {
      await dispatch(updateUserByAdmin(userId, { isActive: !currentIsActive }));
      toast.success("Cập nhật trạng thái tài khoản thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái tài khoản");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userInfo.role !== "admin") {
      toast.error("Bạn không có quyền thay đổi vai trò người dùng.");
      return;
    }
    if (
      userId === userInfo._id &&
      userInfo.role === "admin" &&
      newRole !== "admin"
    ) {
      if (
        !window.confirm(
          "Bạn đang thay đổi vai trò của chính mình và có thể mất quyền admin. Bạn có chắc chắn muốn tiếp tục?"
        )
      ) {
        dispatch(listUser());
        return;
      }
    }

    try {
      await dispatch(updateUserByAdmin(userId, { role: newRole }));
    } catch (error) {
      toast.error(error.message || "Lỗi khi thay đổi vai trò.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userInfo.role !== "admin") {
      toast.error("Bạn không có quyền xóa người dùng.");
      return;
    }
    if (userId === userInfo._id) {
      toast.error("Bạn không thể tự xóa tài khoản của mình.");
      return;
    }
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản này? Thao tác này không thể hoàn tác."
      )
    ) {
      try {
        await dispatch(deleteUser(userId));
        toast.success("Xóa tài khoản thành công");
        dispatch(listUser());
      } catch (error) {
        toast.error(error.message || "Có lỗi xảy ra khi xóa tài khoản");
      }
    }
  };

  const canEditUsers = userInfo && userInfo.role === "admin";

  return (
    <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">
          <i className="fas fa-users me-2"></i>
          Quản lý tài khoản
        </h2>
      </div>

      <div className="card mb-4">
        <header className="card-header bg-white">
          <div className="row gx-3">
            <div className="col-lg-4 col-md-6 me-auto">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="form-control"
              />
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <select className="form-select">
                <option>Xem 20</option>
                <option>Xem 30</option>
                <option>Xem 40</option>
                <option>Xem tất cả</option>
              </select>
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <select className="form-select">
                <option>Tất cả</option>
                <option>Đang hoạt động</option>
                <option>Đã khóa</option>
              </select>
            </div>
          </div>
        </header>

        <div className="card-body">
          {loading ? (
            <Loading />
          ) : error ? (
            <Message variant="alert-danger">{error}</Message>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
              {users.map((user) => (
                <div className="col" key={user._id}>
                  <div className="card card-user shadow-sm">
                    <div className="card-header bg-primary text-white text-center py-3">
                      <img
                        className="img-md img-avatar"
                        src="images/favicon.png"
                        alt="User pic"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          border: "3px solid white",
                        }}
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mt-3 text-center">
                        {user.name}
                      </h5>
                      <div className="card-text text-muted">
                        <div className="mb-3">
                          <select
                            className="form-select form-select-sm"
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            disabled={
                              !canEditUsers ||
                              user.email === "admin@example.com"
                            }
                            style={{
                              backgroundColor:
                                user.role === "admin"
                                  ? "#e3f2fd"
                                  : user.role === "inventoryManager"
                                  ? "#e8f5e9"
                                  : "#f5f5f5",
                              color:
                                user.role === "admin"
                                  ? "#1976d2"
                                  : user.role === "inventoryManager"
                                  ? "#2e7d32"
                                  : "#666",
                            }}
                          >
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="inventoryManager">Kiểm Kho</option>
                          </select>
                        </div>

                        <p className="text-center mb-3">
                          <a
                            href={`mailto:${user.email}`}
                            className="text-decoration-none"
                          >
                            <i className="fas fa-envelope me-2"></i>
                            {user.email}
                          </a>
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span
                            className={`badge ${
                              user.isActive ? "bg-success" : "bg-danger"
                            } px-3 py-2`}
                          >
                            <i
                              className={`fas fa-${
                                user.isActive ? "check-circle" : "times-circle"
                              } me-1`}
                            ></i>
                            {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                          </span>
                          <div className="btn-group">
                            {canEditUsers &&
                              user.email !== "admin@example.com" &&
                              user._id !== userInfo._id && (
                                <button
                                  className={`btn btn-sm ${
                                    user.isActive
                                      ? "btn-outline-danger"
                                      : "btn-outline-success"
                                  }`}
                                  onClick={() =>
                                    handleToggleActive(user._id, user.isActive)
                                  }
                                  title={
                                    user.isActive
                                      ? "Khóa tài khoản"
                                      : "Mở khóa tài khoản"
                                  }
                                >
                                  <i
                                    className={`fas fa-${
                                      user.isActive ? "lock" : "unlock"
                                    }`}
                                  ></i>
                                </button>
                              )}
                            {canEditUsers &&
                              user.email !== "admin@example.com" &&
                              user._id !== userInfo._id && (
                                <>
                                  <button
                                    className="btn btn-sm btn-danger ms-2"
                                    onClick={() => handleDeleteUser(user._id)}
                                    title="Xóa tài khoản"
                                    disabled={
                                      user.email === "admin@example.com" ||
                                      user._id === userInfo._id
                                    }
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                  <Link
                                    to={`/user/${user._id}/edit`}
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    title="Sửa chi tiết người dùng"
                                    disabled={
                                      user.email === "admin@example.com"
                                    }
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Link>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <nav className="float-end mt-4" aria-label="Page navigation">
            <ul className="pagination">
              <li className="page-item disabled">
                <Link className="page-link" to="#">
                  <i className="fas fa-chevron-left"></i>
                </Link>
              </li>
              <li className="page-item active">
                <Link className="page-link" to="#">
                  1
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  <i className="fas fa-chevron-right"></i>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default UserComponent;

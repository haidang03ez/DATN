import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useHistory } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/sidebar";
import Loading from "../components/LoadingError/Loading";
import Message from "../components/LoadingError/Error";
import { toast } from "react-toastify";
import {
  getUserDetails,
  updateUserByAdmin,
} from "../redux/Actions/UserActions";
import {
  USER_UPDATE_RESET,
  USER_DETAILS_RESET,
} from "../redux/Constants/UserConstants";

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userUpdate = useSelector((state) => state.userUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = userUpdate;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET });
      dispatch({ type: USER_DETAILS_RESET }); // Reset details to refetch or use updated data
      toast.success("Người dùng đã được cập nhật thành công!");
      history.push("/users");
    } else {
      if (!user || user._id !== userId) {
        dispatch(getUserDetails(userId));
      } else {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setIsActive(user.isActive);
        setPassword(""); // Reset password fields on user load
        setConfirmPassword("");
      }
    }
  }, [user, userId, successUpdate, dispatch, history]);

  // Clear errors on unmount or when userId changes
  useEffect(() => {
    return () => {
      dispatch({ type: USER_DETAILS_RESET });
      dispatch({ type: USER_UPDATE_RESET });
    };
  }, [dispatch, userId]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (
      user &&
      user.email === "admin@example.com" &&
      userInfo._id !== user._id
    ) {
      toast.error(
        "Không thể chỉnh sửa tài khoản admin chính từ tài khoản admin khác."
      );
      return;
    }
    // Cannot change role of current admin if it is the main admin account and trying to demote
    if (user && user.email === "admin@example.com" && role !== "admin") {
      toast.error("Không thể thay đổi vai trò của tài khoản admin chính.");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    const updateData = { name, email, role, isActive };
    if (password) {
      updateData.password = password;
    }

    dispatch(updateUserByAdmin(userId, updateData));
  };

  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <section
          className="content-main"
          style={{ maxWidth: "600px", margin: "auto" }}
        >
          <div className="content-header">
            <Link to="/users" className="btn btn-secondary text-white" style={{ marginRight: "10px", backgroundColor: "red" }}>
              <i className="fas fa-arrow-left"></i> Quay lại danh sách
            </Link>
            <h2 className="content-title" style={{ textAlign: "center", width: "100%" }}>
              <i className="fas fa-user-edit me-2"></i>
              Chỉnh sửa tài khoản
            </h2>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              {loadingUpdate && <Loading />}
              {errorUpdate && (
                <Message variant="alert-danger">{errorUpdate}</Message>
              )}

              {loading ? (
                <Loading />
              ) : error ? (
                <Message variant="alert-danger">{error}</Message>
              ) : (
                <form onSubmit={submitHandler}>
                  <div className="mb-3">
                    <label htmlFor="user_name" className="form-label">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên người dùng"
                      className="form-control"
                      id="user_name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={
                        user &&
                        user.email === "admin@example.com" &&
                        userInfo._id !== user._id
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="user_email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Nhập email"
                      className="form-control"
                      id="user_email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={user && user.email === "admin@example.com"}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="user_role" className="form-label">
                      Vai trò
                    </label>
                    <select
                      className="form-select"
                      id="user_role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={user && user.email === "admin@example.com"}
                    >
                      <option value="user">Người dùng (User)</option>
                      <option value="inventoryManager">
                        Kiểm kho (Inventory Manager)
                      </option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  {!(
                    user &&
                    user.email === "admin@example.com" &&
                    userInfo._id !== user._id
                  ) && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="user_password" className="form-label">
                          Mật khẩu mới (để trống nếu không đổi)
                        </label>
                        <input
                          type="password"
                          placeholder="Nhập mật khẩu mới"
                          className="form-control"
                          id="user_password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={
                            user &&
                            user.email === "admin@example.com" &&
                            userInfo._id !== user._id
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="user_confirm_password"
                          className="form-label"
                        >
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="Xác nhận mật khẩu mới"
                          className="form-control"
                          id="user_confirm_password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={
                            user &&
                            user.email === "admin@example.com" &&
                            userInfo._id !== user._id
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="user_active"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={
                        user &&
                        user.email === "admin@example.com" &&
                        userInfo._id !== user._id &&
                        user.isActive === false &&
                        userInfo.role !== "admin"
                      }
                    />
                    <label className="form-check-label" htmlFor="user_active">
                      Kích hoạt tài khoản
                    </label>
                    {user && user.email === "admin@example.com" && (
                      <small className="d-block text-muted">
                        Tài khoản admin chính luôn được kích hoạt.
                      </small>
                    )}
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      Cập nhật tài khoản
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default UserEditScreen;

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/Actions/UserActions";

const Header = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    $("[data-trigger]").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var offcanvas_id = $(this).attr("data-trigger");
      $(offcanvas_id).toggleClass("show");
    });

    $(".btn-aside-minimize").on("click", function () {
      if (window.innerWidth < 768) {
        $("body").removeClass("aside-mini");
        $(".navbar-aside").removeClass("show");
      } else {
        // minimize sidebar on desktop
        $("body").toggleClass("aside-mini");
      }
    });
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header className="main-header navbar">
      <div className="col-search"></div>
      <div className="col-nav">
        <button
          className="btn btn-icon btn-mobile me-auto"
          data-trigger="#offcanvas_aside"
        >
          <i className="md-28 fas fa-bars"></i>
        </button>
        <ul className="nav">
          <li className="nav-item">
            <Link className={`nav-link btn-icon `} title="Dark mode" to="#">
              <i className="fas fa-moon"></i>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link btn-icon" to="#">
              <i className="fas fa-bell"></i>
            </Link>
          </li>
          {userInfo ? (
            <>
              <li className="nav-item">
                <Link className="nav-link fw-bold text-dark" to="#">
                  Xin chào, {userInfo.name}
                </Link>
              </li>
              <li className="dropdown nav-item">
                <Link className="dropdown-toggle" data-bs-toggle="dropdown" to="#">
                  <img
                    className="img-xs rounded-circle"
                    src="/images/favicon.png"
                    alt="User"
                  />
                </Link>
                <div className="dropdown-menu dropdown-menu-end">
                  <Link className="dropdown-item" to="/">
                    Thông tin của tôi
                  </Link>
                  <Link className="dropdown-item" to="#">
                    Cài đặt
                  </Link>
                  <Link
                    onClick={logoutHandler}
                    className="dropdown-item text-danger"
                    to="#"
                  >
                    Đăng xuất
                  </Link>
                </div>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Đăng nhập
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;

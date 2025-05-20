import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const isAdmin = userInfo && userInfo.role === "admin";
  const isInventoryManager = userInfo && userInfo.role === "inventoryManager";

  return (
    <div>
      <aside className="navbar-aside" id="offcanvas_aside">
        <div className="aside-top">
          <Link to="/" className="brand-wrap">
            <img
              src="/images/logo.png"
              style={{ height: "46" }}
              className="logo"
              alt="Ecommerce dashboard template"
            />
          </Link>
          <div>
            <button className="btn btn-icon btn-aside-minimize">
              <i className="text-muted fas fa-stream"></i>
            </button>
          </div>
        </div>

        <nav>
          <ul className="menu-aside">
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/"
                  exact={true}
                >
                  <i className="icon fas fa-home"></i>
                  <span className="text">Trang chủ</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/products"
                >
                  <i className="icon fas fa-shopping-bag"></i>
                  <span className="text">Sản phẩm</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/category"
                >
                  <i className="icon fas fa-list"></i>
                  <span className="text">Thể loại</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/promotions"
                >
                  <i className="icon fas fa-tags"></i>
                  <span className="text">Khuyến mại</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/orders"
                >
                  <i className="icon fas fa-bags-shopping"></i>
                  <span className="text">Đơn hàng</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/users"
                >
                  <i className="icon fas fa-user"></i>
                  <span className="text">Tài khoản</span>
                </NavLink>
              </li>
            )}
            {(isAdmin || isInventoryManager) && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/admin/inventory"
                >
                  <i className="icon fas fa-warehouse"></i>
                  <span className="text">Kho hàng</span>
                </NavLink>
              </li>
            )}
            {(isAdmin || isInventoryManager) && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/admin/suppliers"
                >
                  <i className="icon fas fa-truck-loading"></i>
                  <span className="text">Nhà cung cấp</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/admin/videos"
                >
                  <i className="icon fab fa-youtube"></i>
                  <span className="text">Video</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/admin/blogs"
                >
                  <i className="icon fas fa-blog"></i>
                  <span className="text">Blog</span>
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="menu-item">
                <NavLink
                  activeClassName="active"
                  className="menu-link"
                  to="/admin/statistics"
                >
                  <i className="icon fas fa-chart-bar"></i>
                  <span className="text">Thống kê</span>
                </NavLink>
              </li>
            )}
          </ul>
          <br />
          <br />
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;

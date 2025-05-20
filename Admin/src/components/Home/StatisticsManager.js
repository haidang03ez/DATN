import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaBox,
  FaImage,
  FaTag,
  FaChartBar,
  FaCalendarAlt,
  FaSearch,
  FaClipboardList,
  FaTasks,
  FaCheckCircle,
  FaShippingFast,
  FaUndo,
  FaTimesCircle,
  FaQuestionCircle,
} from "react-icons/fa";

const StatisticsManager = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    try {
      const res = await axios.get("/api/statistics", { params });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const formatCurrency = (value) => {
    return value != null ? value.toLocaleString("vi-VN") : "0";
  };

  // Helper để dịch tên trạng thái (có thể đưa ra ngoài nếu dùng ở nhiều nơi)
  const translateOrderStatus = (statusKey) => {
    const statuses = {
      pending: "Chờ xử lý / COD",
      paid: "Đã thanh toán (Chờ xử lý)",
      processing: "Đang chuẩn bị hàng",
      shipping: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancellation_requested: "Khách yêu cầu hủy",
      cancelled: "Đã hủy",
      return_requested: "Khách yêu cầu hoàn",
      returned: "Đã hoàn",
      cancellation_rejected: "Admin từ chối hủy",
      return_rejected: "Admin từ chối hoàn",
      totalOrders: "Tổng số đơn hàng",
    };
    return statuses[statusKey] || statusKey;
  };

  // Icon cho từng trạng thái
  const statusIcons = {
    pending: <FaQuestionCircle className="me-2 text-secondary" />,
    paid: <FaMoneyBillWave className="me-2 text-info" />,
    processing: <FaTasks className="me-2 text-primary" />,
    shipping: <FaShippingFast className="me-2 text-primary" />,
    delivered: <FaCheckCircle className="me-2 text-success" />,
    cancellation_requested: <FaQuestionCircle className="me-2 text-warning" />,
    cancelled: <FaTimesCircle className="me-2 text-danger" />,
    return_requested: <FaQuestionCircle className="me-2 text-warning" />,
    returned: <FaUndo className="me-2 text-dark" />,
    cancellation_rejected: <FaTimesCircle className="me-2 text-danger" />,
    return_rejected: <FaTimesCircle className="me-2 text-dark" />,
    totalOrders: <FaClipboardList className="me-2 text-info" />,
  };

  return (
    <div className="statistics-card">
      <div className="card-body">
        <form
          className="date-filter-form row g-3 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            fetchStats();
          }}
        >
          <div className="col-md-4">
            <label>
              <FaCalendarAlt className="me-2" />
              Từ ngày
            </label>
            <input
              type="date"
              className="form-control"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label>
              <FaCalendarAlt className="me-2" />
              Đến ngày
            </label>
            <input
              type="date"
              className="form-control"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <FaSearch className="me-2" />
              )}
              Xem thống kê
            </button>
          </div>
        </form>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : stats && stats.summary && stats.orderStatusCounts ? (
          <>
            <div className="statistics-summary row g-3">
              <div className="col-md-4">
                <div className="statistics-item h-100">
                  <i>
                    <FaShoppingCart />
                  </i>
                  <b>Tổng sản phẩm bán ra</b>
                  <span>
                    {stats.summary.totalSoldUnits != null
                      ? stats.summary.totalSoldUnits
                      : 0}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="statistics-item h-100">
                  <i>
                    <FaMoneyBillWave />
                  </i>
                  <b>Tổng doanh thu</b>
                  <span>{formatCurrency(stats.summary.totalRevenue)} VND</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="statistics-item h-100">
                  <i>
                    <FaChartLine />
                  </i>
                  <b>Tổng lợi nhuận</b>
                  <span
                    className={
                      stats.summary.totalProfit >= 0
                        ? "profit-positive"
                        : "profit-negative"
                    }
                  >
                    {formatCurrency(stats.summary.totalProfit)} VND
                  </span>
                </div>
              </div>
            </div>

            <h5 className="mt-4 mb-3">
              <FaClipboardList className="me-2" />
              Thống kê trạng thái đơn hàng
            </h5>
            <div className="row g-3">
              {stats.orderStatusCounts &&
                Object.entries(stats.orderStatusCounts).map(
                  ([statusKey, count]) => (
                    
                    <div className="col-md-3 col-sm-6" key={statusKey}>
                      <div className="statistics-item status-count-item h-100">
                        <i>
                          {statusIcons[statusKey] || (
                            <FaQuestionCircle className="me-2" />
                          )}
                        </i>
                        <b>{translateOrderStatus(statusKey)}</b>
                        <span>{count != null ? count : 0}</span>
                      </div>
                    </div>
                  )
                )}
              <div className="col-md-3 col-sm-6">
                <div className="statistics-item status-count-item h-100 bg-light-blue">
                  <i>
                    {statusIcons.totalOrders || (
                      <FaClipboardList className="me-2" />
                    )}
                  </i>
                  <b>{translateOrderStatus("totalOrders")}</b>
                  <span>
                    {stats.summary.totalOrders != null
                      ? stats.summary.totalOrders
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {stats.detailedProductStats &&
              stats.detailedProductStats.length > 0 && (
                <>
                  <h5 className="mt-4">
                    <FaBox className="me-2" />
                    Bảng sản phẩm đã bán
                  </h5>
                  <div className="table-responsive mb-4">
                    <table className="table table-hover statistics-table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>
                            <FaImage className="me-2" />
                            Ảnh
                          </th>
                          <th>
                            <FaTag className="me-2" />
                            Tên sản phẩm
                          </th>
                          <th>
                            <FaMoneyBillWave className="me-2" />
                            Giá nhập
                          </th>
                          <th>
                            <FaMoneyBillWave className="me-2" />
                            Giá bán
                          </th>
                          <th>
                            <FaShoppingCart className="me-2" />
                            SL bán
                          </th>
                          <th>
                            <FaChartLine className="me-2" />
                            Lợi nhuận
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.detailedProductStats.map((p) => (
                          <tr key={p.product || p.name}>
                            <td>
                              <img
                                src={
                                  p.image?.url ||
                                  p.image ||
                                  "./images/default-product.png"
                                }
                                alt={p.name}
                                style={{
                                  width: 60,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            </td>
                            <td>{p.name || "N/A"}</td>
                            <td>{formatCurrency(p.purchasePrice)} VND</td>
                            <td>{formatCurrency(p.sellingPrice)} VND</td>
                            <td>{p.sold || 0}</td>
                            <td
                              className={
                                (p.sellingPrice - p.purchasePrice) * p.sold >= 0
                                  ? "profit-positive"
                                  : "profit-negative"
                              }
                            >
                              {formatCurrency(
                                (p.sellingPrice - p.purchasePrice) * p.sold
                              )}{" "}
                              VND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            {stats.top5SoldProducts && stats.top5SoldProducts.length > 0 && (
              <>
                <h5 className="mt-4">
                  <FaChartBar className="me-2" />
                  Top 5 sản phẩm bán chạy nhất
                </h5>
                <ol className="list-group list-group-numbered top-products-list">
                  {stats.top5SoldProducts.map((p) => (
                    <li
                      key={p.product || p.name}
                      className="list-group-item d-flex justify-content-between align-items-start"
                    >
                      <img
                        src={
                          p.image?.url ||
                          p.image ||
                          "./images/default-product.png"
                        }
                        alt={p.name}
                        style={{
                          width: 50,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "10px",
                        }}
                      />
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{p.name || "N/A"}</div>
                        <small>
                          Giá nhập: {formatCurrency(p.purchasePrice)} | Giá bán:{" "}
                          {formatCurrency(p.sellingPrice)} | Lợi nhuận:{" "}
                          <span
                            className={
                              (p.sellingPrice - p.purchasePrice) * p.sold >= 0
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {formatCurrency(
                              (p.sellingPrice - p.purchasePrice) * p.sold
                            )}
                          </span>
                        </small>
                      </div>
                      <span className="badge bg-primary rounded-pill">
                        {p.sold || 0}
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </>
        ) : (
          !loading && (
            <div className="alert alert-info mt-4">
              Không có dữ liệu thống kê.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StatisticsManager;

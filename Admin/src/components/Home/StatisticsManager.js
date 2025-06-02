import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Charts from "./Charts";
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
  FaFileExcel,
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
      cancellationRequested: "Khách yêu cầu hủy",
      cancelled: "Đã hủy",
      returnRequested: "Khách yêu cầu hoàn",
      returned: "Đã hoàn",
      cancellationRejected: "Admin từ chối hủy",
      returnRejected: "Admin từ chối hoàn",
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
    cancellationRequested: <FaQuestionCircle className="me-2 text-warning" />,
    cancelled: <FaTimesCircle className="me-2 text-danger" />,
    returnRequested: <FaQuestionCircle className="me-2 text-warning" />,
    returned: <FaUndo className="me-2 text-dark" />,
    cancellationRejected: <FaTimesCircle className="me-2 text-danger" />,
    returnRejected: <FaTimesCircle className="me-2 text-dark" />,
    totalOrders: <FaClipboardList className="me-2 text-info" />,
  };

  // Hàm xuất Excel
  const exportToExcel = () => {
    if (!stats) return;

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();

    // 1. Sheet Tổng quan
    const summaryData = [
      ["THỐNG KÊ DOANH THU VÀ ĐƠN HÀNG"],
      [
        "Thời gian:",
        from ? `Từ ${from}` : "Tất cả thời gian",
        to ? `Đến ${to}` : "",
      ],
      [""],
      ["Tổng sản phẩm bán ra:", stats.summary.totalSoldUnits || 0],
      ["Tổng doanh thu:", `${formatCurrency(stats.summary.totalRevenue)} VND`],
      ["Tổng lợi nhuận:", `${formatCurrency(stats.summary.totalProfit)} VND`],
      ["Tổng số đơn hàng:", stats.summary.totalOrders || 0],
      [""],
      ["THỐNG KÊ TRẠNG THÁI ĐƠN HÀNG"],
    ];

    // Thêm thống kê trạng thái đơn hàng
    Object.entries(stats.orderStatusCounts || {}).forEach(([status, count]) => {
      summaryData.push([translateOrderStatus(status), count]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");

    // 2. Sheet Chi tiết sản phẩm
    if (stats.detailedProductStats && stats.detailedProductStats.length > 0) {
      const productsData = [
        ["CHI TIẾT SẢN PHẨM ĐÃ BÁN"],
        [""],
        ["Tên sản phẩm", "Giá nhập", "Giá bán", "Số lượng bán", "Lợi nhuận"],
      ];

      stats.detailedProductStats.forEach((product) => {
        productsData.push([
          product.name || "N/A",
          `${formatCurrency(product.purchasePrice)} VND`,
          `${formatCurrency(product.sellingPrice)} VND`,
          product.sold || 0,
          `${formatCurrency(
            (product.sellingPrice - product.purchasePrice) * product.sold
          )} VND`,
        ]);
      });

      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(
        workbook,
        productsSheet,
        "Chi tiết sản phẩm"
      );
    }

    // 3. Sheet Top sản phẩm
    if (stats.top5SoldProducts && stats.top5SoldProducts.length > 0) {
      const topProductsData = [
        ["TOP 5 SẢN PHẨM BÁN CHẠY NHẤT"],
        [""],
        ["Tên sản phẩm", "Giá nhập", "Giá bán", "Số lượng bán", "Lợi nhuận"],
      ];

      stats.top5SoldProducts.forEach((product) => {
        topProductsData.push([
          product.name || "N/A",
          `${formatCurrency(product.purchasePrice)} VND`,
          `${formatCurrency(product.sellingPrice)} VND`,
          product.sold || 0,
          `${formatCurrency(
            (product.sellingPrice - product.purchasePrice) * product.sold
          )} VND`,
        ]);
      });

      const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);
      XLSX.utils.book_append_sheet(workbook, topProductsSheet, "Top sản phẩm");
    }

    // Tự động điều chỉnh độ rộng cột cho tất cả các sheet
    const sheets = ["Tổng quan", "Chi tiết sản phẩm", "Top sản phẩm"];
    sheets.forEach((sheet) => {
      const ws = workbook.Sheets[sheet];
      if (ws) {
        const range = XLSX.utils.decode_range(ws["!ref"]);
        const cols = [];
        for (let i = range.s.c; i <= range.e.c; i++) {
          let maxWidth = 10;
          for (let j = range.s.r; j <= range.e.r; j++) {
            const cell = ws[XLSX.utils.encode_cell({ r: j, c: i })];
            if (cell && cell.v) {
              const width = (cell.v.toString().length + 2) * 1.2;
              maxWidth = Math.max(maxWidth, width);
            }
          }
          cols.push({ wch: maxWidth });
        }
        ws["!cols"] = cols;
      }
    });

    // Xuất file
    const date = new Date();
    const fileName = `thong_ke_${date.getDate()}_${
      date.getMonth() + 1
    }_${date.getFullYear()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
          <div className="col-md-4 d-flex align-items-end gap-2">
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center"
              type="submit"
              disabled={loading}
              style={{ flex: 1, minHeight: "38px" }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <FaSearch className="me-2" />
              )}
              <span>Xem thống kê</span>
            </button>
            <button
              className="btn btn-success d-flex align-items-center justify-content-center"
              type="button"
              onClick={exportToExcel}
              disabled={loading || !stats}
              style={{ flex: 1, minHeight: "38px", height: "42px", backgroundColor: "#28a745" }}
            >
              <FaFileExcel className="me-2" />
              <span>Xuất biên bản</span>
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

            <Charts stats={stats} />

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

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Orders from "./Orders";
import ExportOrders from "./ExportOrders";
import { listOrders } from "../../redux/Actions/OrderActions";

// Helper to translate status to Vietnamese for display and filter values
const translateOrderStatus = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xử lý / COD";
    case "paid":
      return "Đã thanh toán (Chờ xử lý)";
    case "processing":
      return "Đang chuẩn bị hàng";
    case "shipping":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao hàng";
    case "cancellation_requested":
      return "Khách yêu cầu hủy - Chờ duyệt";
    case "cancelled":
      return "Đã hủy";
    case "return_requested":
      return "Khách yêu cầu hoàn - Chờ duyệt";
    case "returned":
      return "Đã hoàn";
    case "cancellation_rejected":
      return "Admin từ chối hủy";
    case "return_rejected":
      return "Admin từ chối hoàn";
    default:
      return status;
  }
};

const OrderMain = () => {
  const dispatch = useDispatch();
  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const [searchOrder, setSearchOrder] = useState("");

  // Updated statusList with new keys (actual status values) and translated values for display
  const statusFilterOptions = [
    { key: "all", value: "Tất cả trạng thái" },
    { key: "pending", value: translateOrderStatus("pending") },
    { key: "paid", value: translateOrderStatus("paid") },
    { key: "processing", value: translateOrderStatus("processing") },
    { key: "shipping", value: translateOrderStatus("shipping") },
    { key: "delivered", value: translateOrderStatus("delivered") },
    {
      key: "cancellation_requested",
      value: translateOrderStatus("cancellation_requested"),
    },
    { key: "cancelled", value: translateOrderStatus("cancelled") },
    {
      key: "return_requested",
      value: translateOrderStatus("return_requested"),
    },
    { key: "returned", value: translateOrderStatus("returned") },
    {
      key: "cancellation_rejected",
      value: translateOrderStatus("cancellation_rejected"),
    },
    { key: "return_rejected", value: translateOrderStatus("return_rejected") },
  ];
  const [selectedStatusKey, setSelectedStatusKey] = useState("all"); // Default to 'all'

  const [sortList] = useState([
    "Tổng: thấp -> cao",
    "Tổng: cao -> thấp",
    "Ngày: mới nhất",
    "Ngày: cũ nhất",
  ]);
  const [selectedSort, setSelectedSort] = useState("Ngày: mới nhất"); // Default sort

  useEffect(() => {
    dispatch(listOrders()); // Fetch orders on component mount
  }, [dispatch]);

  // Search orders (no change, but ensure it works with potentially undefined orders initially)
  const searchedOrders = useMemo(() => {
    if (!orders) return [];
    if (searchOrder === "") {
      return orders;
    }
    return orders.filter(
      (order) =>
        order.user?.name?.toLowerCase().includes(searchOrder.toLowerCase()) || // Check for user and name
        order._id?.toLowerCase().includes(searchOrder.toLowerCase()) // Allow searching by order ID
    );
  }, [orders, searchOrder]);

  // filter by Status
  const handleOrderStatusChange = (e) => {
    setSelectedStatusKey(e.target.value);
  };

  const getFilteredByStatusOrders = () => {
    if (!searchedOrders) return [];
    if (selectedStatusKey === "all" || !selectedStatusKey) {
      return searchedOrders;
    }
    return searchedOrders.filter((order) => order.status === selectedStatusKey);
  };

  const filteredByStatusOrders = useMemo(getFilteredByStatusOrders, [
    selectedStatusKey,
    searchedOrders,
  ]);

  // Sort (applied to filteredByStatusOrders)
  const handleOrderSortChange = (e) => {
    setSelectedSort(e.target.value);
  };

  const getSortedOrders = () => {
    if (!filteredByStatusOrders) return [];
    let sorted = [...filteredByStatusOrders]; // Create a new array to sort
    if (selectedSort === "Tổng: thấp -> cao") {
      return sorted.sort(
        (a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice)
      );
    } else if (selectedSort === "Tổng: cao -> thấp") {
      return sorted.sort(
        (a, b) => parseFloat(b.totalPrice) - parseFloat(a.totalPrice)
      );
    } else if (selectedSort === "Ngày: mới nhất") {
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (selectedSort === "Ngày: cũ nhất") {
      return sorted.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return sorted; // Return sorted or original if no sort matched
  };

  const finalOrdersToDisplay = useMemo(getSortedOrders, [
    selectedSort,
    filteredByStatusOrders,
  ]);

  return (
    <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">
          <i className="fas fa-shopping-cart me-2"></i>
          Đơn hàng
        </h2>
      </div>

      <div className="card mb-4 shadow-sm">
        <header className="card-header bg-white">
          <div className="row gx-3 py-3">
            <div className="col-lg-4 col-md-6 me-auto">
              <input
                type="text"
                placeholder="Tìm theo tên khách hoặc Mã ĐH..."
                className="form-control"
                value={searchOrder} // Controlled component
                onChange={(e) => setSearchOrder(e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <select
                className="form-select"
                value={selectedStatusKey}
                onChange={handleOrderStatusChange}
              >
                {statusFilterOptions.map((statusOpt) => (
                  <option value={statusOpt.key} key={statusOpt.key}>
                    {statusOpt.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <select
                className="form-select"
                value={selectedSort}
                onChange={handleOrderSortChange}
              >
                {/* <option value="">Sắp xếp</option> // Removed to use default sort */}
                {sortList.map((sort) => (
                  <option value={sort} key={sort}>
                    {sort}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <ExportOrders orders={finalOrdersToDisplay} />{" "}
              {/* Pass final orders to export component */}
            </div>
          </div>
        </header>
        <div className="card-body">
          <div className="table-responsive">
            {loading ? (
              <Loading />
            ) : error ? (
              <Message variant="alert-danger">{error}</Message>
            ) : (
              <Orders
                ordersToRender={finalOrdersToDisplay}
                translateOrderStatus={translateOrderStatus}
              /> // Pass orders and translator
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderMain;

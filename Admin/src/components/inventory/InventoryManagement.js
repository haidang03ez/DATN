import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Card,
  DatePicker,
  Statistic,
  Tag,
  Space,
  Tooltip,
  Input,
  Select,
  message,
  InputNumber,
} from "antd";
import {
  ShoppingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { listSuppliers } from "../../redux/Actions/SupplierActions";

const { RangePicker } = DatePicker;
const { Option } = Select;

const InventoryManagement = () => {
  const [stats, setStats] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [importForm] = Form.useForm();
  const [dateRange, setDateRange] = useState(null);
  const [report, setReport] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const isMounted = useRef(true);

  const { userInfo } = useSelector((state) => state.userLogin);
  const supplierList = useSelector((state) => state.supplierList);
  const {
    loading: loadingSuppliers,
    error: errorSuppliers,
    suppliers: reduxSuppliers,
  } = supplierList;

  const dispatch = useDispatch();

  useEffect(() => {
    isMounted.current = true;
    fetchStats();
    fetchProducts();
    dispatch(listSuppliers());

    return () => {
      isMounted.current = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (reduxSuppliers) {
      setSuppliers(reduxSuppliers);
    }
  }, [reduxSuppliers]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else if (searchText === "") {
      setFilteredProducts([]);
    }
  }, [searchText, products]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/products/inventory/stats", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      console.log("Fetched stats:", data);
      if (isMounted.current) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (isMounted.current) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchReport = async (startDate, endDate) => {
    try {
      const { data } = await axios.get(
        `/api/products/inventory/report?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      if (isMounted.current) {
        setReport(data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  const handleImport = async (values) => {
    try {
      const quantity = parseInt(values.quantity);
      const importPrice = parseInt(values.importPrice);
      const supplierId = values.supplierId;

      if (!supplierId) {
        message.error("Vui lòng chọn nhà cung cấp");
        return;
      }

      if (isNaN(quantity) || quantity <= 0) {
        message.error("Số lượng phải là số nguyên dương");
        return;
      }

      if (isNaN(importPrice) || importPrice < 1000) {
        message.error("Giá nhập phải là số nguyên và lớn hơn hoặc bằng 1000");
        return;
      }

      const response = await axios.post(
        `/api/products/${selectedProduct._id}/import`,
        {
          quantity,
          importPrice,
          supplierId,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (response.data) {
        message.success("Nhập hàng thành công");
        if (isMounted.current) {
          setImportModalVisible(false);
        }
        importForm.resetFields();
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const exportToExcel = () => {
    if (!report) return;

    const ws = XLSX.utils.json_to_sheet(
      report.records.map((record) => ({
        "Tên sản phẩm": record.product.name,
        "Số lượng": record.quantity,
        "Giá nhập": record.importPrice,
        "Ngày nhập": new Date(record.createdAt).toLocaleDateString(),
        "Người nhập": record.user.name,
        "Nhà cung cấp": record.supplier?.name || "N/A",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo nhập hàng");
    XLSX.writeFile(wb, "bao-cao-nhap-hang.xlsx");
    message.success("Đã xuất báo cáo thành công");
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Số lượng trong kho",
      dataIndex: "countInStock",
      key: "countInStock",
      sorter: (a, b) => a.countInStock - b.countInStock,
      render: (countInStock) => (
        <Tag
          color={
            countInStock > 10
              ? "success"
              : countInStock > 0
              ? "warning"
              : "error"
          }
        >
          {countInStock}
        </Tag>
      ),
    },
    {
      title: "Giá nêm yết",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Giá Nhập TB",
      dataIndex: "averageImportPrice",
      key: "averageImportPrice",
      render: (price) => (price ? `${price.toLocaleString()} VND` : "N/A"),
      sorter: (a, b) =>
        (a.averageImportPrice || 0) - (b.averageImportPrice || 0),
    },
    {
      title: "Giá Khuyến Mãi",
      key: "discountedPriceInfo",
      render: (_, record) => {
        if (record.appliedPromotion) {
          return (
            <Space direction="vertical" size="small">
              <span style={{ color: "red", fontWeight: "bold" }}>
                {record.discountedPrice.toLocaleString()} VND
              </span>
              {record.originalPrice &&
                record.originalPrice !== record.discountedPrice && (
                  <span
                    style={{
                      textDecoration: "line-through",
                      fontSize: "0.9em",
                    }}
                  >
                    {record.originalPrice.toLocaleString()} VND
                  </span>
                )}
              <Tooltip
                title={`${record.appliedPromotion.name} (-${record.appliedPromotion.discountPercentage}%)`}
              >
                <Tag color="volcano">KM: {record.appliedPromotion.name}</Tag>
              </Tooltip>
            </Space>
          );
        }
        return `${record.price.toLocaleString()} VND`; // Hiển thị giá gốc nếu không có KM
      },
      sorter: (a, b) =>
        (a.discountedPrice || a.price) - (b.discountedPrice || b.price),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Nhập hàng">
            <Button
              type="primary"
              icon={<PlusOutlined style={{ fontSize: "16px" }} />}
              onClick={() => {
                setSelectedProduct(record);
                setImportModalVisible(true);
              }}
            >
              Nhập hàng
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="inventory-container">
      <div className="content-header">
        <h2 className="content-title">
          <i className="fa-solid fa-boxes-packing"></i>
          Quản lý kho
        </h2>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card total-products">
            <Statistic
              title={<span className="stat-title">Tổng số sản phẩm</span>}
              value={stats?.totalProducts || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "white", fontWeight: "bold" }}
              suffix={<span className="stat-suffix"> sản phẩm</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card total-items">
            <Statistic
              title={<span className="stat-title">Tổng số hàng</span>}
              value={stats?.totalItems || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "white", fontWeight: "bold" }}
              suffix={<span className="stat-suffix"> quyển</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card low-stock">
            <Statistic
              title={<span className="stat-title">Sản phẩm sắp hết</span>}
              value={stats?.lowStock || 0}
              valueStyle={{ color: "white", fontWeight: "bold" }}
              prefix={<WarningOutlined />}
              suffix={<span className="stat-suffix"> sản phẩm</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card out-of-stock">
            <Statistic
              title={<span className="stat-title">Hết hàng</span>}
              value={stats?.outOfStock || 0}
              valueStyle={{ color: "white", fontWeight: "bold" }}
              prefix={<CloseCircleOutlined />}
              suffix={<span className="stat-suffix"> sản phẩm</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng sản phẩm */}
      <Card className="products-table-card">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          rowClassName={(record) => {
            if (record.countInStock === 0) return "out-of-stock-row";
            if (record.countInStock > 0 && record.countInStock < 10)
              return "low-stock-row";
            return "";
          }}
        />
      </Card>

      {/* Modal nhập hàng */}
      <Modal
        title={`Nhập hàng cho: ${selectedProduct?.name}`}
        visible={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          importForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={importForm} onFinish={handleImport} layout="vertical">
          <Form.Item
            name="supplierId"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp!" }]}
          >
            <Select
              showSearch
              placeholder="Chọn nhà cung cấp"
              loading={loadingSuppliers}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {suppliers.map((supplier) => (
                <Option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              step={1}
              placeholder="Nhập số lượng"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Giá nhập"
            name="importPrice"
            rules={[
              { required: true, message: "Vui lòng nhập giá nhập" },
              {
                type: "number",
                min: 1000,
                message: "Giá nhập phải lớn hơn hoặc bằng 1000",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1000}
              step={1000}
              placeholder="Nhập giá nhập"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Xác nhận nhập hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Báo cáo nhập hàng */}
      <Card className="report-card">
        <div className="report-header">
          <h3 className="report-title">Báo cáo nhập hàng</h3>
          <Space>
            <RangePicker
              onChange={(dates) => {
                setDateRange(dates);
                if (dates) {
                  fetchReport(dates[0].toISOString(), dates[1].toISOString());
                }
              }}
              className="date-picker"
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
              disabled={!report}
              className="export-btn"
            >
              Xuất Excel
            </Button>
          </Space>
        </div>

        {report && (
          <Table
            columns={[
              {
                title: "Tên sản phẩm",
                dataIndex: ["product", "name"],
                key: "productName",
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
                render: (quantity) => <Tag color="blue">{quantity}</Tag>,
              },
              {
                title: "Giá nhập",
                dataIndex: "importPrice",
                key: "importPrice",
                render: (price) => `${price.toLocaleString()} VND`,
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
              },
              {
                title: "Nhà cung cấp",
                dataIndex: ["supplier", "name"],
                key: "supplierName",
                render: (name) => name || "N/A",
              },
            ]}
            dataSource={report.records}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            className="report-table"
          />
        )}
      </Card>

      <style jsx>{`
        .inventory-container {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .content-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .search-input {
          width: 300px;
          border-radius: 8px;
        }

        .stats-row {
          margin-bottom: 24px;
        }

        .stat-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-title {
          color: white !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }

        .stat-suffix {
          color: white !important;
          font-weight: 600 !important;
          margin-left: 4px;
        }

        .total-products {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
        }

        .total-items {
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
        }

        .low-stock {
          background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
        }

        .out-of-stock {
          background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
        }

        .products-table-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .out-of-stock-row {
          background-color: #fff1f0;
        }

        .low-stock-row {
          background-color: #fff7e6;
        }

        .ant-table-row.out-of-stock-row td {
          color: #ff4d4f;
          font-weight: 500;
        }

        .ant-table-row.low-stock-row td {
          color: #faad14;
        }

        .import-modal .ant-modal-content {
          border-radius: 12px;
        }

        .import-modal .ant-modal-header {
          border-radius: 12px 12px 0 0;
        }

        .ant-btn-primary {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border: none;
          height: 40px;
          font-size: 16px;
          border-radius: 8px;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
          transform: translateY(-1px);
        }

        .ant-input-number {
          border-radius: 8px;
        }

        .ant-tag {
          border-radius: 4px;
          padding: 4px 8px;
        }

        .report-card {
          margin-top: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .report-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .date-picker {
          border-radius: 8px;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .report-table {
          margin-top: 16px;
        }

        .report-table .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
        }

        .report-table .ant-table-tbody > tr:hover > td {
          background: #f5f5f5;
        }

        .ant-picker {
          border-radius: 8px;
        }

        .ant-picker:hover {
          border-color: #40a9ff;
        }

        .ant-picker-focused {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default InventoryManagement;

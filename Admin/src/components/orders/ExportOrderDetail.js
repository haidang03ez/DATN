import React from 'react';
import * as XLSX from 'xlsx';
import moment from 'moment';
import 'moment/locale/vi';

const ExportOrderDetail = ({ order }) => {
  const exportToExcel = () => {
    // Chuẩn bị dữ liệu cho Excel
    const orderInfo = {
      'Thông tin đơn hàng': [
        { 'Mã đơn hàng': order._id },
        { 'Ngày đặt': moment(order.createdAt).locale('vi').format('DD/MM/YYYY HH:mm') },
        { 'Trạng thái thanh toán': order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán' },
        { 'Trạng thái giao hàng': order.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng' },
        { 'Phương thức thanh toán': order.paymentMethod },
        { 'Ghi chú': order.note || 'Không có' }
      ],
      'Thông tin khách hàng': [
        { 'Tên khách hàng': order.user.name },
        { 'Email': order.user.email },
        { 'Số điện thoại': order.shippingAddress.phone },
        { 'Địa chỉ': order.shippingAddress.address }
      ],
      'Chi tiết sản phẩm': order.orderItems.map(item => ({
        'Tên sản phẩm': item.name,
        'Số lượng': item.qty,
        'Đơn giá': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price),
        'Thành tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.qty)
      })),
      'Tổng thanh toán': [
        { 'Tổng tiền hàng': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.itemsPrice) },
        { 'Phí vận chuyển': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shippingPrice) },
        { 'Tổng cộng': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice) }
      ]
    };

    // Tạo workbook
    const wb = XLSX.utils.book_new();

    // Tạo worksheet cho thông tin đơn hàng
    const wsOrderInfo = XLSX.utils.json_to_sheet(orderInfo['Thông tin đơn hàng']);
    XLSX.utils.book_append_sheet(wb, wsOrderInfo, 'Thông tin đơn hàng');

    // Tạo worksheet cho thông tin khách hàng
    const wsCustomerInfo = XLSX.utils.json_to_sheet(orderInfo['Thông tin khách hàng']);
    XLSX.utils.book_append_sheet(wb, wsCustomerInfo, 'Thông tin khách hàng');

    // Tạo worksheet cho chi tiết sản phẩm
    const wsProducts = XLSX.utils.json_to_sheet(orderInfo['Chi tiết sản phẩm']);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Chi tiết sản phẩm');

    // Tạo worksheet cho tổng thanh toán
    const wsTotal = XLSX.utils.json_to_sheet(orderInfo['Tổng thanh toán']);
    XLSX.utils.book_append_sheet(wb, wsTotal, 'Tổng thanh toán');

    // Tự động điều chỉnh độ rộng cột cho mỗi worksheet
    const wscols = [
      { wch: 20 }, // Cột 1
      { wch: 40 }, // Cột 2
    ];

    wsOrderInfo['!cols'] = wscols;
    wsCustomerInfo['!cols'] = wscols;
    wsProducts['!cols'] = [
      { wch: 40 }, // Tên sản phẩm
      { wch: 15 }, // Số lượng
      { wch: 20 }, // Đơn giá
      { wch: 20 }, // Thành tiền
    ];
    wsTotal['!cols'] = wscols;

    // Xuất file Excel
    XLSX.writeFile(wb, `Chi_tiet_don_hang_${order._id}_${moment().locale('vi').format('DD-MM-YYYY')}.xlsx`);
  };

  return (
    <button
      className="btn btn-success"
      onClick={exportToExcel}
      title="Xuất chi tiết đơn hàng"
    >
      <i className="fas fa-file-excel me-2"></i>
      Xuất Excel
    </button>
  );
};

export default ExportOrderDetail; 
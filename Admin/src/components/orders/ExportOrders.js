import React from 'react';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import moment from 'moment';
import 'moment/locale/vi';

const ExportOrders = () => {
  const orderList = useSelector((state) => state.orderList);
  const { orders } = orderList;

  const exportToExcel = () => {
    // Chuẩn bị dữ liệu cho Excel
    const excelData = orders.map(order => ({
      'Mã đơn hàng': order._id,
      'Ngày đặt': moment(order.createdAt).locale('vi').format('DD/MM/YYYY HH:mm'),
      'Khách hàng': order.user.name,
      'Email': order.user.email,
      'Số điện thoại': order.shippingAddress.phone,
      'Địa chỉ': order.shippingAddress.address,
      'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice),
      'Trạng thái': order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      'Phương thức thanh toán': order.paymentMethod,
      'Ghi chú': order.note || 'Không có'
    }));

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết đơn hàng');

    // Tự động điều chỉnh độ rộng cột
    const wscols = [
      { wch: 20 }, // Mã đơn hàng
      { wch: 20 }, // Ngày đặt
      { wch: 25 }, // Khách hàng
      { wch: 30 }, // Email
      { wch: 15 }, // Số điện thoại
      { wch: 40 }, // Địa chỉ
      { wch: 20 }, // Tổng tiền
      { wch: 15 }, // Trạng thái
      { wch: 20 }, // Phương thức thanh toán
      { wch: 30 }, // Ghi chú
    ];
    ws['!cols'] = wscols;

    // Xuất file Excel
    XLSX.writeFile(wb, `Chi_tiet_don_hang_${moment().locale('vi').format('DD-MM-YYYY')}.xlsx`);
  };

  return (
    <button
      className="btn btn-success"
      onClick={exportToExcel}
      title="Xuất file Excel"
    >
      <i className="fas fa-file-excel me-2"></i>
      Xuất Excel
    </button>
  );
};

export default ExportOrders; 
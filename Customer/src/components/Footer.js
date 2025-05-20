import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitter,
} from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          {/* Cột 1: Logo và mô tả */}
          <div className="col-md-3">
            <div
              className="footer-logo"
              style={{ borderRight: "1px solid #ccc", paddingRight: "20px" }}
            >
              <img src="/images/khaitruong.png" alt="Fahasa Logo" />
              <p>
                Công Ty Cổ Phần Sách Hải Đăng
                <br />
                298, Đường Cầu Diễn, Quận Bắc Từ Liêm, Hà Nội
              </p>
              <div className="social-icons">
                <FaFacebookF />
                <FaInstagram />
                <FaYoutube />
                <FaTiktok />
                <FaTwitter />
              </div>
            </div>
          </div>

          {/* Cột 2: Dịch vụ */}
          <div className="col-md-3">
            <h3>DỊCH VỤ</h3>
            <ul>
              <li>Điều khoản sử dụng</li>
              <li>Chính sách bảo mật thông tin cá nhân</li>
              <li>Chính sách bảo mật thanh toán</li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="col-md-3">
            <h3>HỖ TRỢ</h3>
            <ul>
              <Link to="/policy">
                <li>Chính sách đổi - trả - hoàn tiền</li>
              </Link>
              <Link to="/policy">
                <li>Chính sách bảo hành - bồi hoàn</li>
              </Link>
              <Link to="/policy">
                <li>Chính sách vận chuyển</li>
              </Link>
            </ul>
          </div>

          {/* Cột 4: Tài khoản */}
          <div className="col-md-3">
            <h3>TÀI KHOẢN CỦA TÔI</h3>
            <ul>
              <Link to="/login">
                <li>Đăng nhập/Tạo mới tài khoản</li>
              </Link>
              <Link to="/profile">
                <li>Chi tiết tài khoản</li>
              </Link>
              <Link to="/profile">
                <li>Lịch sử mua hàng</li>
              </Link>
            </ul>
          </div>
        </div>

        {/* Liên hệ + thanh toán */}
        <div className="contact">
          <p>LIÊN HỆ</p>
          <p>
            <MdLocationOn /> 298, Đường Cầu Diễn, Quận Bắc Từ Liêm, Hà Nội
          </p>
          <p>
            <MdEmail /> bookshophd@gmail.com
          </p>
          <p>
            <MdPhone /> 0982723221
          </p>
        </div>

        <div className="payment-logos">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png"
            alt="MasterCard"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
            alt="Visa"
          />
          <img
            src="https://rgb.vn/wp-content/uploads/2014/05/rgb_vn_new_branding_paypal_2014_logo_detail.png"
            alt="paypal"
          />
          <img
            src="https://icons.iconarchive.com/icons/designbolts/credit-card-payment/256/American-Express-icon.png"
            alt="credit"
          />
        </div>

        <div className="copyright">
          Giấy chứng nhận Đăng ký Kinh doanh số 1234567890 do Sở KHĐT TP.Hà Nội
          cấp ngày 20/12/XXXX, đăng ký thay đổi lần thứ X, ngày 20/05/XXXX.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

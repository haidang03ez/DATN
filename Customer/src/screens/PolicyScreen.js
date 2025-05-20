import React from "react";
import { Link } from "react-router-dom";
import Header from "./../components/Header";
import Footer from "./../components/Footer";

const PolicyScreen = () => {
  return (
    <>
      <Header />
      <div class="container my-5">
        <h2 class="mb-4">Chính sách của chúng tôi</h2>

        <div class="accordion" id="policyAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                Chính sách Đổi - Trả - Hoàn Tiền
              </button>
            </h2>
            <div
              id="collapseOne"
              class="accordion-collapse collapse show"
              aria-labelledby="headingOne"
              data-bs-parent="#policyAccordion"
            >
              <div class="accordion-body">
                <ul>
                  <li>
                    Áp dụng trong vòng <strong>7 ngày</strong> kể từ ngày nhận
                    hàng.
                  </li>
                  <li>
                    Chấp nhận đổi trả với sách lỗi, sai nội dung, thiếu trang,
                    hư hỏng do vận chuyển.
                  </li>
                  <li>Hoàn tiền 100% nếu không có sản phẩm thay thế.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                Chính sách Bảo Hành - Bồi Hoàn
              </button>
            </h2>
            <div
              id="collapseTwo"
              class="accordion-collapse collapse"
              aria-labelledby="headingTwo"
              data-bs-parent="#policyAccordion"
            >
              <div class="accordion-body">
                <p>
                  Sách không áp dụng bảo hành, tuy nhiên sẽ được đổi nếu có lỗi
                  in ấn. Website cam kết bồi hoàn nếu sản phẩm hư hỏng hoặc mất
                  trong quá trình vận chuyển.
                </p>
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree"
              >
                Chính sách Vận Chuyển
              </button>
            </h2>
            <div
              id="collapseThree"
              class="accordion-collapse collapse"
              aria-labelledby="headingThree"
              data-bs-parent="#policyAccordion"
            >
              <div class="accordion-body">
                <ul>
                  <li>Giao hàng toàn quốc từ 1–7 ngày làm việc.</li>
                  <li>Cung cấp mã theo dõi đơn hàng sau khi xác nhận.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PolicyScreen;

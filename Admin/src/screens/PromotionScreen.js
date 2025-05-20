import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import MainPromotions from "../components/promotions/MainPromotions"; // Sẽ tạo component này sau

const PromotionScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <section className="content-main">
          
          {/* Component hiển thị danh sách và quản lý khuyến mãi */}
          <MainPromotions />
        </section>
      </main>
    </>
  );
};

export default PromotionScreen;

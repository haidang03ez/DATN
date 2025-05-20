import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import AddPromotionMain from "../components/promotions/AddPromotionMain"; // Sẽ tạo component này

const AddPromotion = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <AddPromotionMain />
      </main>
    </>
  );
};

export default AddPromotion;

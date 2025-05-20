import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import EditPromotionMain from "../components/promotions/EditPromotionMain"; // Sẽ tạo component này

const PromotionEditScreen = ({ match }) => {
  const promotionId = match.params.id;
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <EditPromotionMain promotionId={promotionId} />
      </main>
    </>
  );
};

export default PromotionEditScreen;

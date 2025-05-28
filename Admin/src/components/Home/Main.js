import React from "react";
import LatestOrder from "./LatestOrder";
import { useSelector } from "react-redux";

const Main = () => {
  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  return (
    <>
      <section className="content-main">
        <div className="content-header">
          <h2 className="content-title"> Trang chủ </h2>
        </div>
        

        {/* LATEST ORDER */}
        <div className="card mb-4 shadow-sm">
          <LatestOrder orders={orders} loading={loading} error={error} />
        </div>
      </section>
    </>
  );
};

export default Main;

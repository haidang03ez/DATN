import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import StatisticsManager from "../components/Home/StatisticsManager";

const StatisticsScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <section className="content-main">
          <div className="content-header">
            <h2 className="content-title">Thống kê bán hàng</h2>
          </div>
          <StatisticsManager />
        </section>
      </main>
    </>
  );
};

export default StatisticsScreen; 
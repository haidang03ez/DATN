import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import InventoryManagement from "../components/inventory/InventoryManagement";

const InventoryScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <InventoryManagement />
      </main>
    </>
  );
};

export default InventoryScreen; 
import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import MainSuppliers from "../components/Suppliers/MainSuppliers";

const SupplierScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <MainSuppliers />
      </main>
    </>
  );
};

export default SupplierScreen;

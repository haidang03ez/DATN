import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import BlogManager from "../components/Home/BlogManager";

const BlogScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <section className="content-main">
          <div className="content-header">
            <h2 className="content-title">Quản lý Blog</h2>
          </div>
          <BlogManager />
        </section>
      </main>
    </>
  );
};

export default BlogScreen; 
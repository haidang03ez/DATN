import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import VideoManager from "../components/Home/VideoManager";

const VideoScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <section className="content-main">
          <div className="content-header">
            <h2 className="content-title">Quản lý Video YouTube</h2>
          </div>
          <VideoManager />
        </section>
      </main>
    </>
  );
};

export default VideoScreen; 
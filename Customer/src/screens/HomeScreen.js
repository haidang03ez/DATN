import React from "react";
import Header from "./../components/Header";
import ShopSection from "./../components/homeComponents/ShopSection";
import CalltoActionSection from "./../components/homeComponents/CalltoActionSection";
import Footer from "./../components/Footer";
import SlideShow from "../components/homeComponents/SlideShow";

const HomeScreen = () => {
  window.scrollTo(0, 0);
  return (
    <div>
      <Header />
      <SlideShow />
      <ShopSection />
      <CalltoActionSection />
      <Footer />
    </div>
  );
};

export default HomeScreen;

import React, { useEffect, useState } from "react";
import "../../App.css";

const images = [
  "https://images.nxbhanoi.com.vn/Picture/2023/10/3/image-20231003173206818.jpg",
  "https://images.nxbhanoi.com.vn/Picture/2023/6/7/image-20230607094419171.jpg",
  "https://images.nxbhanoi.com.vn/Picture/2023/9/26/image-20230926090737363.jpg"
];

const SlideShow = () => {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, 3000);
    return () => clearInterval(timer);
  }, [length]);

  const nextSlide = () => setCurrent((current + 1) % length);
  const prevSlide = () => setCurrent((current - 1 + length) % length);

  return (
    <div className="slideshow-container">
      {images.map((img, idx) => (
        <div
          className={"slide" + (idx === current ? " active" : "")}
          key={idx}
        >
          {idx === current && <img src={img} alt="slide" className="slide-img" />}
        </div>
      ))}
      <button className="prev" onClick={prevSlide}>&#10094;</button>
      <button className="next" onClick={nextSlide}>&#10095;</button>
      <div className="dots">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={"dot" + (idx === current ? " active" : "")}
            onClick={() => setCurrent(idx)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default SlideShow; 
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Header";
import Footer from "../Footer";
import BlogSection from "./BlogSection";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/blogs/${id}`).then((res) => {
      setBlog(res.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    axios.get("/api/blogs").then((res) => {
      setBlogs(res.data);
    });
  }, []);

  const [blogs, setBlogs] = useState([]);
  const blogsPerPage = 3;
  const [blogPage, setBlogPage] = useState(1);

  if (loading) return <div style={{ padding: 40 }}>Đang tải...</div>;
  if (!blog) return <div style={{ padding: 40 }}>Không tìm thấy blog!</div>;

  return (
    <>
      <Header />
      <div
        className="container"
        style={{ maxWidth: 800, marginTop: 40, marginBottom: 40 }}
      >
        <div className="blog-detail">
          <img
            src={blog.image}
            alt={blog.title}
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
          <h2 style={{ marginTop: 24 }}>{blog.title}</h2>
          <div style={{ marginTop: 18, fontSize: 18, lineHeight: 1.7 }}>
            {blog.content}
          </div>
        </div>
      </div>
      <BlogSection
        style={{ borderRadius: "none" }}
        blogs={blogs}
        blogPage={blogPage}
        setBlogPage={setBlogPage}
        blogsPerPage={blogsPerPage}
      />
      <Footer />
    </>
  );
};

export default BlogDetail;

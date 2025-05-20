import React from "react";
import { useHistory } from "react-router-dom";

const BlogSection = ({ blogs, blogPage, setBlogPage, blogsPerPage }) => {
  const history = useHistory();

  const totalBlogPages = Math.ceil(blogs.length / blogsPerPage);
  const currentBlogs = blogs.slice(
    (blogPage - 1) * blogsPerPage,
    blogPage * blogsPerPage
  );

  return (
    <div className="blog-section" style={{ margin: "30px 0" }}>
      <h3 style={{ marginBottom: "16px" }}>BLOG MỚI NHẤT</h3>
      <div className="blog-row">
        {currentBlogs.map((blog) => (
          <div
            className="blog-col"
            key={blog._id}
            onClick={() => history.push(`/blogs/${blog._id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="blog-img-wrap">
              <img src={blog.image} alt={blog.title} className="blog-img" />
            </div>
            <div className="blog-title">{blog.title}</div>
          </div>
        ))}
      </div>

      {totalBlogPages > 1 && (
        <div className="video-pagination">
          <button
            className="btn btn-outline-primary mx-1"
            onClick={() => setBlogPage(blogPage - 1)}
            disabled={blogPage === 1}
          >
            Trước
          </button>
          {[...Array(totalBlogPages).keys()].map((num) => (
            <button
              key={num + 1}
              onClick={() => setBlogPage(num + 1)}
              className={`btn ${
                blogPage === num + 1 ? "btn-primary" : "btn-outline-primary"
              } mx-1`}
            >
              {num + 1}
            </button>
          ))}
          <button
            className="btn btn-outline-primary mx-1"
            onClick={() => setBlogPage(blogPage + 1)}
            disabled={blogPage === totalBlogPages}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogSection;

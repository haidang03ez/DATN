import React, { useEffect, useState } from "react";
import axios from "axios";

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTokenConfig = () => {
    const userInfoString = localStorage.getItem("userInfo");
    let token = null;
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        token = userInfo.token; // Assuming the token is stored as userInfo.token
      } catch (e) {
        console.error("Error parsing userInfo from localStorage:", e);
      }
    }
    console.log("[BlogManager] Token from userInfo:", token);
    return {
      headers: {
        // Ensure token is not null or undefined before setting the header
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };
  };

  const fetchBlogs = async () => {
    setLoading(true);
    const config = getTokenConfig();
    const res = await axios.get("/api/blogs", config);
    setBlogs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (!title || !image || !content) return;
    const config = getTokenConfig();
    if (editId) {
      await axios.put(
        `/api/blogs/${editId}`,
        { title, image, content },
        config
      );
    } else {
      await axios.post("/api/blogs", { title, image, content }, config);
    }
    setTitle("");
    setImage("");
    setContent("");
    setEditId(null);
    fetchBlogs();
  };

  const handleEdit = (blog) => {
    setTitle(blog.title);
    setImage(blog.image);
    setContent(blog.content);
    setEditId(blog._id);
  };

  const handleDelete = async (id) => {
    const config = getTokenConfig();
    await axios.delete(`/api/blogs/${id}`, config);
    fetchBlogs();
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <form className="row g-3 mb-4" onSubmit={handleAddOrEdit}>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tiêu đề blog"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Link ảnh (URL)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Nội dung ngắn hoặc mô tả"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" type="submit">
              {editId ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Ảnh</th>
                <th>Nội dung</th>
                <th>Người tạo</th>
                <th>Người sửa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>
                    <img
                      src={blog.image}
                      alt={blog.title}
                      style={{ width: 80, height: 50, objectFit: "cover" }}
                    />
                  </td>
                  <td
                    style={{
                      maxWidth: 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {blog.content}
                  </td>
                  <td>
                    {blog.createdBy
                      ? blog.createdBy.name || blog.createdBy.email
                      : "N/A"}
                  </td>
                  <td>
                    {blog.updatedBy
                      ? blog.updatedBy.name || blog.updatedBy.email
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEdit(blog)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(blog._id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BlogManager;

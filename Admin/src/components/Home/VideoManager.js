import React, { useEffect, useState } from "react";
import axios from "axios";

const VideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
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
    console.log("[VideoManager] Token from userInfo:", token);
    return {
      headers: {
        // Ensure token is not null or undefined before setting the header
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };
  };

  const extractYouTubeID = (urlOrId) => {
    if (!urlOrId) return "";
    // Check if it's already an ID (heuristic: no slashes, 11 chars)
    if (!urlOrId.includes("/") && urlOrId.length === 11) {
      return urlOrId;
    }
    try {
      const url = new URL(urlOrId);
      if (url.hostname === "youtu.be") {
        return url.pathname.slice(1);
      }
      if (
        url.hostname === "www.youtube.com" ||
        url.hostname === "youtube.com"
      ) {
        if (url.pathname === "/watch") {
          return url.searchParams.get("v");
        }
        if (url.pathname.startsWith("/embed/")) {
          return url.pathname.split("/")[2];
        }
      }
    } catch (error) {
      // Not a valid URL, or other error, assume it might be an ID or invalid
      console.warn(
        "Could not parse YouTube URL, assuming it might be an ID or invalid input: ",
        urlOrId
      );
    }
    // Return the original input if parsing fails, or it's already an ID-like string without slashes
    return urlOrId.includes("/") ? "" : urlOrId; // Return empty if it had slashes but wasn't parsed
  };

  const fetchVideos = async () => {
    setLoading(true);
    const res = await axios.get("/api/videos", getTokenConfig());
    setVideos(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    const extractedId = extractYouTubeID(youtubeId);
    if (!title || !extractedId) {
      alert("Vui lòng nhập tiêu đề và YouTube ID hoặc URL hợp lệ.");
      return;
    }
    const config = getTokenConfig();
    const payload = { title, youtubeId: extractedId };

    if (editId) {
      await axios.put(`/api/videos/${editId}`, payload, config);
    } else {
      await axios.post("/api/videos", payload, config);
    }
    setTitle("");
    setYoutubeId("");
    setEditId(null);
    fetchVideos();
  };

  const handleEdit = (video) => {
    setTitle(video.title);
    setYoutubeId(video.youtubeId);
    setEditId(video._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/videos/${id}`, getTokenConfig());
    fetchVideos();
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <form className="row g-3 mb-4" onSubmit={handleAddOrEdit}>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tiêu đề video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="YouTube ID (vd: dQw4w9WgXcQ)"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" type="submit">
              {editId ? "Cập nhật" : "Thêm"}
            </button>
          </div>
          {editId && (
            <div className="col-md-2">
              <button
                className="btn btn-warning w-100"
                type="button"
                onClick={() => {
                  setEditId(null);
                  setTitle("");
                  setYoutubeId("");
                }}
              >
                Hủy
              </button>
            </div>
          )}
        </form>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>YouTube ID</th>
                <th>Preview</th>
                <th>Người tạo</th>
                <th>Người sửa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video._id}>
                  <td>{video.title}</td>
                  <td>{video.youtubeId}</td>
                  <td>
                    <iframe
                      width="180"
                      height="100"
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </td>
                  <td>
                    {video.createdBy
                      ? video.createdBy.name || video.createdBy.email
                      : "N/A"}
                  </td>
                  <td>
                    {video.updatedBy
                      ? video.updatedBy.name || video.updatedBy.email
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEdit(video)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(video._id)}
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

export default VideoManager;

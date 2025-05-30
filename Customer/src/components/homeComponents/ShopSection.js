import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { lisCategories } from "../../redux/Actions/CategoryActions";
import { listProduct } from "../../redux/Actions/ProductActions";
import { addToCart } from "../../redux/Actions/CartActions";
import { ORDER_DETAILS_RESET } from "../../redux/Constants/OrderConstants";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Pagination from "./pagination";
import Rating from "./Rating";
import axios from "axios";

const ShopSection = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const categoryList = useSelector((state) => state.categoryList);
  const { loading: loadingList, error: errorList, categories } = categoryList;

  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedAuthor, setSelectedAuthor] = useState();
  const [sortName] = useState([
    "Mới nhất",
    "Cũ nhất",
    "Giá: thấp -> cao",
    "Giá: cao -> thấp",
  ]);
  const [selectedSort, setSelectedSort] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const [videos, setVideos] = useState([]);
  const [videoPage, setVideoPage] = useState(1);
  const videosPerPage = 3;

  const [blogs, setBlogs] = useState([]);
  const blogsPerPage = 3;
  const [blogPage, setBlogPage] = useState(1);

  const [top5, setTop5] = useState([]);

  // Get unique authors from products
  const authors = useMemo(() => {
    if (!products) return [];
    const authorList = products
      .filter((product) => product.author) // Lọc ra các sản phẩm có author
      .map((product) => product.author);
    return [...new Set(authorList)].sort(); // Sắp xếp danh sách tác giả
  }, [products]);

  useEffect(() => {
    dispatch(listProduct());
    dispatch(lisCategories());
    dispatch({ type: ORDER_DETAILS_RESET });
    axios.get("/api/videos").then((res) => setVideos(res.data));
    axios.get("/api/blogs").then((res) => setBlogs(res.data));
    axios
      .get("/api/statistics")
      .then((res) => setTop5(res.data.top5SoldProducts || []));
  }, [dispatch]);

  // Search product
  const searchProducts = products?.filter((product) => {
    if (searchProduct === "") {
      return product;
    } else if (
      (product.name &&
        product.name.toLowerCase().includes(searchProduct.toLowerCase())) ||
      (product.author &&
        product.author.toLowerCase().includes(searchProduct.toLowerCase()))
    ) {
      return product;
    }
    return false;
  });

  // Filter by category and author
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleAuthorChange = (e) => {
    setSelectedAuthor(e.target.value);
  };

  const getFilterList = () => {
    let filtered = searchProducts || [];
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category?._id === selectedCategory ||
          product.category === selectedCategory
      );
    }
    if (selectedAuthor) {
      filtered = filtered.filter(
        (product) => product.author === selectedAuthor
      );
    }
    return filtered;
  };

  const filterList = useMemo(getFilterList, [
    selectedCategory,
    selectedAuthor,
    searchProducts,
  ]);

  // Sort
  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
  };

  const getSortList = () => {
    if (!selectedSort) {
      return filterList;
    } else if (selectedSort === "Mới nhất") {
      return filterList.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (selectedSort === "Cũ nhất") {
      return filterList.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (selectedSort === "Giá: thấp -> cao") {
      return filterList?.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else if (selectedSort === "Giá: cao -> thấp") {
      return filterList?.sort((a, b) => (a.price > b.price ? -1 : 1));
    }
  };

  const sortList = useMemo(getSortList, [selectedSort, filterList]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortList
    ? sortList.slice(indexOfFirstProduct, indexOfLastProduct)
    : [];

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalVideoPages = Math.ceil(videos.length / videosPerPage);
  const currentVideos = videos.slice(
    (videoPage - 1) * videosPerPage,
    videoPage * videosPerPage
  );

  const totalBlogPages = Math.ceil(blogs.length / blogsPerPage);
  const currentBlogs = blogs.slice(
    (blogPage - 1) * blogsPerPage,
    blogPage * blogsPerPage
  );

  const handleAddToCart = (productId) => {
    dispatch(addToCart(productId, 1));
    history.push("/cart");
  };

  return (
    <>
      <div className="container">
        <div className="section">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="card mb-4 shadow-sm mx-3">
                <header className="card-header gradient">
                  <div className="row gx-3 py-2">
                    <div className="col-lg-3 col-md-6 me-auto py-1">
                      <input
                        type="search"
                        placeholder="Tìm kiếm theo tên hoặc tác giả..."
                        className="form-control"
                        onChange={(e) => setSearchProduct(e.target.value)}
                      />
                    </div>
                    <div className="col-lg-2 col-md-3 py-1">
                      {loadingList ? (
                        <Loading />
                      ) : errorList ? (
                        <Message variant="alert-danger">{errorList}</Message>
                      ) : (
                        <select
                          name="category"
                          className="form-select"
                          onChange={handleCategoryChange}
                        >
                          <option value="">Tất cả thể loại</option>
                          {categories.map((category) => (
                            <option value={category._id} key={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-lg-2 col-md-3 py-1">
                      <select
                        name="author"
                        className="form-select"
                        onChange={handleAuthorChange}
                      >
                        <option value="">Tất cả tác giả</option>
                        {authors.map((author) => (
                          <option value={author} key={author}>
                            {author}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-2 col-md-3 py-1">
                      <select
                        name="sort"
                        className="form-select"
                        onChange={handleSortChange}
                      >
                        <option value="">Sắp xếp</option>
                        {sortName.map((name) => (
                          <option value={name} key={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </header>
              </div>
            </div>

            {/* TOP 5 SẢN PHẨM BÁN CHẠY - Chỉ hiện khi không có tìm kiếm hoặc lọc */}
            {top5 &&
              top5.length > 0 &&
              !searchProduct &&
              !selectedCategory &&
              !selectedAuthor && (
                <div
                  className="col-lg-12 col-md-12 article"
                  style={{ marginTop: "20px", marginBottom: "30px" }}
                >
                  {" "}
                  <div className="section-title2">
                    <h3
                      className="title"
                      style={{
                        textAlign: "center",
                        color: "#e94560",
                        position: "relative",
                        paddingBottom: "10px",
                        marginBottom: "20px",
                        animation:
                          "titleGlow 1.5s ease-in-out infinite alternate",
                      }}
                    >
                      ⭐ SẢN PHẨM BÁN CHẠY ⭐
                    </h3>
                    <style>
                      {`
                      @keyframes titleGlow {
                        from {
                          text-shadow: 0 0 5px rgba(233, 69, 96, 0.2),
                                     0 0 10px rgba(233, 69, 96, 0.2);
                        }
                        to {
                          text-shadow: 0 0 10px rgba(233, 69, 96, 0.5),
                                     0 0 20px rgba(233, 69, 96, 0.3);
                        }
                      }
                    `}
                    </style>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      overflowX: "auto",
                      justifyContent: "space-around",
                      gap: "15px",
                      padding: "10px 0",
                      background:
                        "linear-gradient(to right, #fff 0%, rgba(233, 69, 96, 0.05) 50%, #fff 100%)",
                      borderRadius: "8px",
                    }}
                  >
                    {top5.map((product) => (
                      <div
                        style={{
                          flex: "0 0 auto",
                          width: "200px",
                        }}
                        key={product.product || product.name}
                      >
                        <div
                          className="border-product shadow-sm"
                          style={{
                            background: "#fff",
                            borderRadius: "8px",
                            transition:
                              "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                            border: "1px solid rgba(233, 69, 96, 0.2)",
                            animation: "pulse 2s infinite",
                            position: "relative",
                            overflow: "hidden",
                            ":hover": {
                              transform: "translateY(-5px)",
                              boxShadow: "0 5px 15px rgba(233, 69, 96, 0.1)",
                            },
                            "@keyframes pulse": {
                              "0%": {
                                boxShadow: "0 0 0 0 rgba(233, 69, 96, 0.4)",
                              },
                              "70%": {
                                boxShadow: "0 0 0 10px rgba(233, 69, 96, 0)",
                              },
                              "100%": {
                                boxShadow: "0 0 0 0 rgba(233, 69, 96, 0)",
                              },
                            },
                          }}
                        >
                          <Link
                            to={`/products/${product.product || product.id}`}
                          >
                            <div
                              className="shopBack"
                              style={{
                                width: "100%",
                                height: "150px",
                                background: "#fff",
                                borderRadius: "8px 8px 0 0",
                              }}
                            >
                              <img
                                src={
                                  product.image?.url ||
                                  product.image ||
                                  "./images/default-product.png"
                                }
                                alt={product.name}
                                style={{
                                  height: "140px",
                                  objectFit: "contain",
                                  padding: "5px",
                                }}
                              />
                            </div>
                          </Link>

                          <div className="shoptext" style={{ padding: "8px" }}>
                            <p
                              style={{
                                textAlign: "center",
                                fontSize: "0.9rem",
                                margin: "0 0 5px 0",
                                height: "60px",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              <Link
                                to={`/products/${
                                  product.product || product.id
                                }`}
                              >
                                {product.name || "N/A"}
                              </Link>
                            </p>
                            <div
                              style={{
                                textAlign: "center",
                                fontSize: "0.85rem",
                                color: "#fff",
                                fontWeight: "600",
                                background: "#e94560",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                display: "inline-block",
                                margin: "0 auto",
                              }}
                            >
                              ⭐ Đã bán: {product.sold || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="col-lg-12 col-md-12 article">
              <h3 className="title" style={{ textAlign: "center" }}>
                SẢN PHẨM ĐANG BÁN
              </h3>
              <div className="shopcontainer">
                {loading ? (
                  <div className="mb-5">
                    <Loading />
                  </div>
                ) : error ? (
                  <Message variant="alert-danger">{error}</Message>
                ) : (
                  <>
                    {currentProducts.map((product) => (
                      <div className="shop" key={product._id}>
                        <div className="border-product shadow-sm">
                          <Link to={`/products/${product._id}`}>
                            <div
                              className="shopBack"
                              style={{
                                width: "100%",
                              }}
                            >
                              <img
                                src={product.image?.url}
                                alt={product.name}
                              />
                            </div>
                          </Link>

                          <div className="shoptext">
                            <p>
                              <Link to={`/products/${product._id}`}>
                                {product.name}
                              </Link>
                            </p>
                            <p className="author-text">
                              <small>
                                Tác giả: {product.author || "Chưa có"}
                              </small>
                            </p>
                            <Rating
                              value={product.rating}
                              text={`${product.numReviews} reviews`}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "10px",
                              }}
                            >
                              {product.appliedPromotion &&
                              product.discountedPrice <
                                product.originalPrice ? (
                                <div>
                                  <h3 style={{ color: "#dc3545", margin: 0 }}>
                                    {product.discountedPrice.toLocaleString()}{" "}
                                    VND
                                  </h3>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <h5
                                      style={{
                                        fontSize: "0.9rem",
                                        textDecoration: "line-through",
                                        color: "#6c757d",
                                        margin: 0,
                                      }}
                                    >
                                      {product.originalPrice.toLocaleString()}{" "}
                                      VND
                                    </h5>
                                    <span
                                      style={{
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                      }}
                                    >
                                      -
                                      {
                                        product.appliedPromotion
                                          .discountPercentage
                                      }
                                      %
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <h3 style={{ margin: 0 }}>
                                  {(product.price || 0).toLocaleString()} VND
                                </h3>
                              )}

                              {product.countInStock > 0 && (
                                <button
                                  onClick={() => handleAddToCart(product._id)}
                                  style={{
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition:
                                      "transform 0.2s, background-color 0.3s",
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.backgroundColor = "#218838";
                                    e.target.style.transform = "scale(1.1)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.backgroundColor = "#28a745";
                                    e.target.style.transform = "scale(1)";
                                  }}
                                  title="Thêm vào giỏ hàng"
                                >
                                  <i
                                    className="fas fa-shopping-cart"
                                    style={{ fontSize: "16px" }}
                                  ></i>
                                </button>
                              )}
                            </div>
                            {product.countInStock === 0 ? (
                              <div className="out-of-stock-badge">Hết hàng</div>
                            ) : product.countInStock < 10 ? (
                              <div className="low-stock-badge">
                                Sắp hết hàng
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {/* Pagination */}
              <div
                className="pagination-container"
                style={{ marginTop: "30px" }}
              >
                <Pagination
                  productsPerPage={productsPerPage}
                  totalProducts={sortList ? sortList.length : 0}
                  currentPage={currentPage}
                  paginate={paginate}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Video Section */}
        <div className="video-section" style={{ margin: "30px 0" }}>
          <h3 style={{ marginBottom: "16px" }}>VIDEO NỔI BẬT</h3>
          <div className="video-row">
            {currentVideos.map((video) => (
              <div className="video-col" key={video._id}>
                <div className="video-wrapper">
                  <iframe
                    width="100%"
                    height="220"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div
                  className="video-title"
                  style={{ textAlign: "center", marginTop: 8, fontWeight: 500 }}
                >
                  {video.title}
                </div>
              </div>
            ))}
          </div>
          {totalVideoPages > 1 && (
            <div className="video-pagination">
              <button
                onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                disabled={videoPage === 1}
              >
                Trước
              </button>
              <span style={{ margin: "0 10px" }}>
                Trang {videoPage}/{totalVideoPages}
              </span>
              <button
                onClick={() =>
                  setVideoPage((p) => Math.min(totalVideoPages, p + 1))
                }
                disabled={videoPage === totalVideoPages}
              >
                Sau
              </button>
            </div>
          )}
        </div>
        {/* Blog Section */}
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
      </div>
    </>
  );
};

export default ShopSection;

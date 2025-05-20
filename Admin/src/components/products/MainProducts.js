import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { lisCategories } from "../../redux/Actions/CategoryActions";
import { lisProducts } from "../../redux/Actions/ProductActions";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import Product from "./Product";

const MainProducts = () => {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const productDelete = useSelector((state) => state.productDelete);
  const { error: errorDelete, success: successDelete } = productDelete;

  const imageDelete = useSelector((state) => state.imageDelete);
  const { error: errorDeleteImage, success: successDeleteImage } = imageDelete;

  const categoryList = useSelector((state) => state.categoryList);
  const { loading: loadingList, error: errorList, categories } = categoryList;

  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState();
  const [sortChoose] = useState([
    "Mới nhất được thêm vào", 
    "Cũ nhất được thêm vào", 
    "Giá: thấp -> cao", 
    "Giá: cao -> thấp",
  ]);
  const [selectedSort, setSelectedSort] = useState();

  useEffect(() => {
    dispatch(lisProducts());
    dispatch(lisCategories());
  }, [dispatch, successDelete, successDeleteImage]);

  // Search product
  const searchProducts = products?.filter((product) => {
    if (searchProduct === "") {
      return product;
    } else if (
      product.name.toLowerCase().includes(searchProduct.toLowerCase())
    ) {
      return product;
    }
  });

  // Filter by category

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const getFilterList = () => {
    if (!selectedCategory) {
      return searchProducts;
    }
    return searchProducts?.filter(
      (product) => product.category === selectedCategory
    );
  };

  const filterList = useMemo(getFilterList, [selectedCategory, searchProducts]);

  // Sort
  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
  };

  const getSortList = () => {
    if (!selectedSort) {
      return filterList;
    } else if (selectedSort === "Mới nhất được thêm vào") {
      return filterList?.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (selectedSort === "Cũ nhất được thêm vào") {
      return filterList?.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (selectedSort === "Giá: thấp -> cao") {
      return filterList?.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else if (selectedSort === "Giá: cao -> thấp") {
      return filterList?.sort((a, b) => (a.price > b.price ? -1 : 1));
    }
  };

  const sortList = useMemo(getSortList, [selectedSort, filterList]);

  return (
    <section className="content-main">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h2 className="content-title">Danh sách sản phẩm</h2>
          <Link to="/addproduct" className="btn btn-primary">
            Tạo sản phẩm
          </Link>
        </div>
      </div>

      <div className="products-card">
        <div className="products-filter">
          <div className="row gx-3">
            <div className="col-lg-4 col-md-6 me-auto">
              <input
                type="search"
                placeholder="Tìm kiếm..."
                className="form-control"
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              {loadingList ? (
                <div className="products-loading"></div>
              ) : errorList ? (
                <Message variant="alert-danger">{errorList}</Message>
              ) : (
                <select
                  name="category"
                  className="form-select"
                  onChange={handleCategoryChange}
                >
                  <option value="">Thể loại</option>
                  {categories.map((category) => (
                    <option value={category._id} key={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <select
                name="category"
                className="form-select"
                onChange={handleSortChange}
              >
                <option value="">Sắp xếp</option>
                {sortChoose.map((sort) => (
                  <option value={sort} key={sort}>
                    {sort}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-body">
          {errorDelete && (
            <Message variant="alert-danger">{errorDelete}</Message>
          )}
          {errorDeleteImage && (
            <Message variant="alert-danger">{errorDeleteImage}</Message>
          )}
          {loading ? (
            <div className="products-loading"></div>
          ) : error ? (
            <Message variant="alert-danger">{error}</Message>
          ) : (
            <div className="products-grid">
              {sortList.length ? (
                sortList.map((product) => (
                  <Product product={product} key={product._id} />
                ))
              ) : (
                <div className="no-products">
                    Không có sản phẩm nào, tạo ngay!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MainProducts;

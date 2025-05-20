import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { deleteProduct } from "../../redux/Actions/ProductActions";
import { deleteUploadImage } from "../../redux/Actions/UploadActions";
import { FaEdit, FaTrash } from "react-icons/fa";

const Product = (props) => {
  const { product } = props;
  const dispatch = useDispatch();

  const deleteHandler = (id, image) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      dispatch(deleteProduct(id));
      dispatch(deleteUploadImage(image));
    }
  };

  const formatCurrency = (value) => {
    return value ? value.toLocaleString() : '0';
  };

  const getStockStatus = (count) => {
    if (count === 0) return 'out-of-stock';
    if (count <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getStockText = (count) => {
    if (count === 0) return 'Hết hàng';
    if (count <= 5) return 'Sắp hết hàng';
    return 'Còn hàng';
  };

  return (
    <div className="product-card">
      <img src={product.image?.url} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-author">
          <small>Tác giả: {product.author || "Chưa có"}</small>
        </div>
        <div className="product-price">
          {product.discount > 0 ? (
            <>
              <span className="product-discount">{formatCurrency(product.price)} VND</span>
              {formatCurrency(product.price * (1 - product.discount / 100))} VND
            </>
          ) : (
            `${formatCurrency(product.price)} VND`
          )}
        </div>
        <div className={`product-stock ${getStockStatus(product.countInStock)}`}>
          {getStockText(product.countInStock)}
        </div>
      </div>
      <div className="product-actions">
        <Link
          to={`/product/${product._id}/edit`}
          className="btn btn-primary"
        >
          <FaEdit className="me-2" />Sửa
        </Link>
        <button
          onClick={() => deleteHandler(product._id, product.image)}
          className="btn btn-danger"
        >
          <FaTrash className="me-2" />Xóa
        </button>
      </div>
    </div>
  );
};

export default Product;

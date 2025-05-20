import React, { useEffect } from "react"; // Bỏ useState và useMemo tạm thời
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  listPromotions,
  deletePromotion,
} from "../../redux/Actions/PromotionActions"; // Sử dụng actions thật
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";

const MainPromotions = () => {
  const dispatch = useDispatch();

  const promotionList = useSelector((state) => state.promotionList);
  const { loading, error, promotions } = promotionList;

  const promotionDelete = useSelector((state) => state.promotionDelete);
  const { error: errorDelete, success: successDelete } = promotionDelete;

  useEffect(() => {
    dispatch(listPromotions()); // Dispatch action thật
  }, [dispatch, successDelete]);

  const deletehandler = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      dispatch(deletePromotion(id)); // Dispatch action thật
    }
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">Quản lý khuyến mại</h2>
        <div>
          <Link to="/addpromotion" className="btn btn-primary">
            <i className="material-icons md-plus"></i> Tạo mới
          </Link>
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <header className="card-header bg-white ">
          <div className="row gx-3 py-3">
            <div className="col-lg-4 col-md-6 me-auto ">
              <input
                type="search"
                placeholder="Tìm kiếm khuyến mãi..."
                className="form-control p-2"
                // onChange={(e) => setSearchTerm(e.target.value)} // Sẽ thêm sau
              />
            </div>
            {/* Các bộ lọc khác có thể thêm ở đây (ví dụ: theo trạng thái, theo loại) */}
          </div>
        </header>

        <div className="card-body">
          {errorDelete && (
            <Message variant="alert-danger">{errorDelete}</Message>
          )}
          {loading ? (
            <Loading />
          ) : error ? (
            <Message variant="alert-danger">{error}</Message>
          ) : promotions && promotions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Tên Khuyến mại</th>
                    <th>Mô tả</th>
                    <th>% Giảm</th>
                    <th>Ngày Bắt đầu</th>
                    <th>Ngày Kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Loại KM</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo._id}>
                      <td>
                        <b>{promo.name}</b>
                      </td>
                      <td>{promo.description}</td>
                      <td>{promo.discountPercentage}%</td>
                      <td>{formatDate(promo.startDate)}</td>
                      <td>{formatDate(promo.endDate)}</td>
                      <td>
                        {promo.isActive ? (
                          <span className="badge rounded-pill alert-success">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="badge rounded-pill alert-danger">
                            Không hoạt động
                          </span>
                        )}
                      </td>
                      <td>{promo.targetType}</td>
                      <td className="text-end">
                        <Link
                          to={`/promotion/${promo._id}/edit`}
                          className="btn btn-sm font-sm rounded btn-brand"
                        >
                          <i className="material-icons md-edit"></i> Sửa
                        </Link>
                        <button
                          onClick={() => deletehandler(promo._id)}
                          className="btn btn-sm font-sm btn-danger rounded ms-2"
                        >
                          <i className="material-icons md-delete_forever"></i>{" "}
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>Không có khuyến mãi nào.</div>
          )}

          {/* Pagination sẽ thêm sau */}
        </div>
      </div>
    </section>
  );
};

export default MainPromotions;

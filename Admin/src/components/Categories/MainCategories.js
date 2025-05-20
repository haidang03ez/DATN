import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { lisCategories } from "../../redux/Actions/CategoryActions";
import CategoriesTable from "./CategoriesTable";
import CreateCategory from "./CreateCategory";

const MainCategories = () => {
  const dispatch = useDispatch();

  const categoryList = useSelector((state) => state.categoryList);
  const { loading, error, categories } = categoryList;

  const categoryDelete = useSelector((state) => state.categoryDelete);
  const { error: errorDelete, success: successDelete } = categoryDelete;

  useEffect(() => {
    dispatch(lisCategories());
  }, [dispatch, successDelete]);

  return (
    <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">Quản lý thể loại</h2>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row">
            {/* Create category */}
            <CreateCategory />
            {/* Categories table */}
            <CategoriesTable
              categories={categories}
              loading={loading}
              error={error}
              errorDelete={errorDelete}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .content-main {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
        }

        .content-header {
          margin-bottom: 24px;
        }

        .content-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background: white;
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .card-body {
          padding: 24px;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin: -12px;
        }

        .row > * {
          padding: 12px;
        }
      `}</style>
    </section>
  );
};

export default MainCategories;

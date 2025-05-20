import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/antd.css";
import "./App.css";
import PrivateRouter from "./PrivateRouter";
import { listOrders } from "./redux/Actions/OrderActions";
import { lisProducts } from "./redux/Actions/ProductActions";
import "./responsive.css";
import AddProduct from "./screens/AddProduct";
import CategoryEditScreen from "./screens/CategoriesEditScreen";
import CategoriesScreen from "./screens/CategoriesScreen";
import HomeScreen from "./screens/HomeScreen";
import Login from "./screens/LoginScreen";
import NotFound from "./screens/NotFound";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import OrderScreen from "./screens/OrderScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import ProductScreen from "./screens/productScreen";
import UsersScreen from "./screens/UsersScreen";
import UserEditScreen from "./screens/UserEditScreen";
import InventoryScreen from "./screens/InventoryScreen";
import VideoScreen from "./screens/VideoScreen";
import BlogScreen from "./screens/BlogScreen";
import StatisticsScreen from "./screens/StatisticsScreen";
import PromotionScreen from "./screens/PromotionScreen";
import AddPromotion from "./screens/AddPromotion";
import PromotionEditScreen from "./screens/PromotionEditScreen";
import SupplierScreen from "./screens/SupplierScreen";
import SupplierEditScreen from "./screens/SupplierEditScreen";

function App() {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
      dispatch(lisProducts());
    }
  }, [dispatch, userInfo]);

  return (
    <Router>
      <Switch>
        <Route path="/" component={HomeScreen} exact />
        <Route path="/login" component={Login} />
        <Route path="/products" component={ProductScreen} />
        <Route path="/addproduct" component={AddProduct} />
        <Route path="/product/:id/edit" component={ProductEditScreen} />
        <Route path="/category" component={CategoriesScreen} />
        <PrivateRouter path="/categories/:id" component={CategoryEditScreen} />
        <Route path="/orders" component={OrderScreen} />
        <Route path="/order/:id" component={OrderDetailScreen} />
        <Route path="/users" component={UsersScreen} />
        <PrivateRouter path="/user/:id/edit" component={UserEditScreen} />
        <Route path="/admin/inventory" component={InventoryScreen} />
        <Route path="/admin/videos" component={VideoScreen} />
        <Route path="/admin/blogs" component={BlogScreen} />
        <Route path="/admin/statistics" component={StatisticsScreen} />
        <PrivateRouter path="/promotions" component={PromotionScreen} exact />
        <PrivateRouter path="/addpromotion" component={AddPromotion} exact />
        <PrivateRouter
          path="/promotion/:id/edit"
          component={PromotionEditScreen}
          exact
        />
        <PrivateRouter
          path="/admin/suppliers"
          component={SupplierScreen}
          exact
        />
        <PrivateRouter
          path="/admin/supplier/:id/edit"
          component={SupplierEditScreen}
          exact
        />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;

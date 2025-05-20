import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import PrivateRouter from "./PrivateRouter";
import "./responsive.css";
import CartScreen from "./screens/CartScreen";
import HomeScreen from "./screens/HomeScreen";
import Login from "./screens/Login";
import NotFound from "./screens/NotFound";
import OrderScreen from "./screens/OrderScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Register from "./screens/Register";
import SingleProduct from "./screens/SingleProduct";
import BlogDetail from "./components/homeComponents/BlogDetail";
import PolicyScreen from "./screens/PolicyScreen";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomeScreen} exact />
        <Route path="/products/:id" component={SingleProduct} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <PrivateRouter path="/profile" component={ProfileScreen} />
        <Route path="/cart/:id?" component={CartScreen} />
        <PrivateRouter path="/checkout" component={CheckoutScreen} />
        <PrivateRouter path="/placeorder" component={PlaceOrderScreen} />
        <PrivateRouter path="/order/:id" component={OrderScreen} />
        <Route path="/blogs/:id" component={BlogDetail} />
        <Route path="/policy" component={PolicyScreen} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;

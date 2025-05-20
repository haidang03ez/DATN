import axios from "axios";
import {
  USER_LIST_FAIL,
  USER_LIST_REQUEST,
  USER_LIST_RESET,
  USER_LIST_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
} from "../Constants/UserConstants";
import { toast } from "react-toastify";

// Login
export const login = (email, password) => async (dispatch) => {
  const ToastObjects = {
    pauseOnFocusLoss: false,
    draggable: false,
    pauseOnHover: false,
    autoClose: 3000,
  };

  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      `/api/users/login`,
      { email, password },
      config
    );

    if (data.role === "admin" || data.role === "inventoryManager") {
      dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
    } else {
      toast.error(
        "Bạn không có quyền truy cập vào trang quản trị.",
        ToastObjects
      );
      dispatch({
        type: USER_LOGIN_FAIL,
        payload: "Không có quyền truy cập.",
      });
      localStorage.removeItem("userInfo");
      return;
    }
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Logout
export const logout = () => (dispatch) => {
  localStorage.removeItem("userInfo");
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_LIST_RESET });
  // Optional
  document.location.href = "/login";
};

// All user
export const listUser = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };

    const { data } = await axios.get(`/api/users`, config);

    dispatch({ type: USER_LIST_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: USER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Toggle user active status
export const toggleUserActive = (userId) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };

    const { data } = await axios.put(
      `/api/users/${userId}/toggle-active`,
      {},
      config
    );
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// GET USER DETAILS (for Admin edit screen)
export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/users/${id}`, config);
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: USER_DETAILS_FAIL,
      payload: message,
    });
  }
};

// UPDATE USER BY ADMIN (was updateUserAdminDetails, now refined)
export const updateUserByAdmin = (userId, userData) => async (dispatch, getState) => {
  const ToastObjects = {
    pauseOnFocusLoss: false,
    draggable: false,
    pauseOnHover: false,
    autoClose: 3000,
  };
  try {
    dispatch({ type: USER_UPDATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `/api/users/${userId}`,
      userData, // Contains fields like name, email, role, isActive
      config
    );

    dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
    // Also update the userDetails state if this user's details are being viewed
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data }); 

    // Logic to handle if admin updates their own info (role, name, email)
    if (userId === userInfo._id) {
      const newRole = userData.role !== undefined ? userData.role : userInfo.role;
      const newName = userData.name || userInfo.name;
      const newEmail = userData.email || userInfo.email;

      const roleChanged = newRole !== userInfo.role;
      const nameChanged = newName !== userInfo.name;
      const emailChanged = newEmail !== userInfo.email;

      const oldIsAdminOrInventoryManager =
        userInfo.role === "admin" || userInfo.role === "inventoryManager";
      const newIsAdminOrInventoryManager =
        newRole === "admin" || newRole === "inventoryManager";

      if (oldIsAdminOrInventoryManager && !newIsAdminOrInventoryManager) {
        // If admin revokes their own admin/inventoryManager access, log them out
        dispatch(logout());
        toast.warn("Bạn đã tự thay đổi vai trò của mình và không còn quyền truy cập. Đang đăng xuất...", ToastObjects);
        return; // Important to return here to stop further execution
      } else if (roleChanged || nameChanged || emailChanged) {
        // If own role, name, or email changed, update localStorage and userInfo state
        const updatedUserInfo = {
          ...userInfo,
          name: data.name, // use data from response as it's confirmed by server
          email: data.email,
          role: data.role,
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        dispatch({ type: USER_LOGIN_SUCCESS, payload: updatedUserInfo });
      }
    }
    
    toast.success("Thông tin người dùng được cập nhật thành công!", ToastObjects);
    dispatch(listUser()); // Refresh user list

  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
      dispatch(logout());
    }
    dispatch({
      type: USER_UPDATE_FAIL,
      payload: message,
    });
    toast.error(message, ToastObjects);
    // No longer throwing error here, action creator should handle errors via dispatch
  }
};

// Delete user
export const deleteUser = (userId) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };

    // const { data } = await axios.delete(`/api/users/${userId}`, config); // Original, but data not typically used
    await axios.delete(`/api/users/${userId}`, config);
    toast.success("Người dùng đã được xóa thành công.");
    dispatch(listUser()); // Refresh user list after delete
    // return data; // Not typically needed for a delete operation if just confirming success
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === "Not authorized, token failed") {
        dispatch(logout());
    }
    toast.error(message);
    // throw new Error(message); // Let UI handle error via state
    dispatch({
        type: USER_LIST_FAIL, // Or a specific USER_DELETE_FAIL if you add it
        payload: message,
    });
  }
};

/* 
// This old action is no longer needed as PUT /api/users/:id/details was removed from backend
export const updateUserDetails =
  (userId, userData) => async (dispatch, getState) => {
    try {
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const { data } = await axios.put(
        `/api/users/${userId}/details`,
        userData,
        config
      );
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      throw new Error(message);
    }
  };
*/

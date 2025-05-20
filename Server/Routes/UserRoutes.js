import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import User from "../Models/UserModel.js";
import generateToken from "../utils/generateToken.js";

const userRouter = express.Router();

// Login
userRouter.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isActive) {
                res.status(401);
                throw new Error(
                    "Tài khoản đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ."
                );
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                createdAt: user.createdAt,
            });
        } else {
            res.status(401);
            throw new Error("Email hoặc mật khẩu không chính xác");
        }
    })
);

// Register
userRouter.post(
    "/",
    asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error("Invalid User Data");
        }
    })
);

// Profile
userRouter.get(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    })
);

// Update profile
userRouter.put(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updateUser = await user.save();
            res.json({
                _id: updateUser._id,
                name: updateUser.name,
                email: updateUser.email,
                role: updateUser.role,
                createdAt: updateUser.createdAt,
                token: generateToken(updateUser._id),
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    })
);

// Get all user admin
userRouter.get(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const users = await User.find({});
        res.json(users);
    })
);

// GET USER BY ID (ADMIN)
userRouter.get(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id).select("-password");
        if (user) {
            // Prevent showing details of the main admin account to other admins if needed
            // For now, allowing admin to see other admin details except password
            res.json(user);
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    })
);

// Update user by admin
userRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);

        if (user) {
            const isUpdatingSelf = req.user._id.equals(user._id);
            const isMainAdminAccount = user.email === "admin@example.com";

            // Prevent other admins from modifying the main admin account's details (name, email, role, password)
            if (
                isMainAdminAccount &&
                !isUpdatingSelf &&
                (req.body.name ||
                    req.body.email ||
                    req.body.role ||
                    req.body.password)
            ) {
                res.status(403);
                throw new Error(
                    "Chỉ có thể thay đổi trạng thái hoạt động của tài khoản admin chính."
                );
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            if (req.body.password) {
                if (req.body.password.trim().length < 6) {
                    res.status(400);
                    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
                }
                // Prevent changing password of main admin account by another admin
                if (isMainAdminAccount && !isUpdatingSelf) {
                    res.status(403);
                    throw new Error(
                        "Không thể thay đổi mật khẩu của tài khoản admin chính từ tài khoản admin khác."
                    );
                }
                user.password = req.body.password; // UserModel pre-save hook should hash this
            }

            // isActive can be updated for any user by an admin
            // However, the main admin account cannot be deactivated
            if (req.body.isActive !== undefined) {
                if (isMainAdminAccount && req.body.isActive === false) {
                    res.status(400);
                    throw new Error(
                        "Không thể vô hiệu hóa tài khoản admin chính."
                    );
                }
                user.isActive = req.body.isActive;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt,
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    })
);

// Toggle user active status
userRouter.put(
    "/:id/toggle-active",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isActive = !user.isActive;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt,
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    })
);

// Delete user
userRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);

        if (user) {
            // Prevent deleting the main admin account
            if (user.email === "admin@example.com") {
                res.status(400);
                throw new Error("Cannot delete the main admin account");
            }
            await user.remove();
            res.json({ message: "User removed" });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    })
);

export default userRouter;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(statusCode, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken
    }, message));
};

export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await findUserByEmail(email);
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await createUser(name, email, hashedPassword, role || 'student');
    
    sendTokenResponse({ id: userId, name, email, role: role || 'student' }, 201, res, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    
    if (user && (await bcrypt.compare(password, user.password))) {
      sendTokenResponse(user, 200, res, "Login successful");
    } else {
      throw new ApiError(401, 'Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    
    if (!token) {
      throw new ApiError(401, 'Not authorized, no refresh token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await findUserById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    sendTokenResponse(user, 200, res, 'Token refreshed');
  } catch (error) {
    next(new ApiError(401, 'Not authorized, refresh token failed'));
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (user) {
      res.json(new ApiResponse(200, user, "Profile fetched successfully"));
    } else {
      throw new ApiError(404, 'User not found');
    }
  } catch (error) {
    next(error);
  }
};

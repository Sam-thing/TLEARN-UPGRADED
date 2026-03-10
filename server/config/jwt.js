// config/jwt.js
import jwt from 'jsonwebtoken';

export const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

export const sendToken = (user, statusCode, res) => {
  // CREATE TOKEN with user name included
  const token = jwt.sign(
    { 
      id: user._id,
      name: user.name,  // ← ADD THIS!
      email: user.email  // ← ADD THIS TOO (optional but useful)
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        institution: user.institution,
        level: user.level
      }
    });
};

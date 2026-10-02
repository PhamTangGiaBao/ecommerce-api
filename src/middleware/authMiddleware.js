
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  // 1. Kiểm tra Authorization header
  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      message: 'Thiếu hoặc sai định dạng token'
    });
  }

  // 2. Lấy token sau tiền tố Bearer
  const token = authorization.slice(7);

  try {
    // 3. Xác minh chữ ký và thời hạn của token
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 4. Kiểm tra thông tin người dùng trong token
    if (!payload.uid) {
      return res.status(401).json({
        message: 'Token không hợp lệ'
      });
    }

    // 5. Gắn thông tin xác thực vào request
    req.user = {
      uid: payload.uid,
      role: payload.role
    };

    // 6. Cho phép request đi tiếp
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
}

module.exports = authMiddleware;
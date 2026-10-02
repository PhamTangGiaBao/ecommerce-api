
const authService = require('../services/authService');

async function register(req, res) {
  try {
    const user = await authService.register(req.body || {});

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user
    });
  } catch (error) {
    console.error('Register error:', error.message);

    if (
      error.message.includes('phải từ') ||
      error.message.includes('phải có ít nhất') ||
      error.message.includes('Vui lòng') ||
      error.message.includes('đã tồn tại')
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (
      error.message.includes('Chưa cấu hình')
    ) {
      return res.status(500).json({
        message: error.message
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    return res.status(500).json({
      message: 'Lỗi khi đăng ký tài khoản'
    });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body || {});

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error.message);

    if (
      error.message.includes('Vui lòng nhập') ||
      error.message.includes('không đúng')
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        message: 'Máy chủ chưa được cấu hình xác thực'
      });
    }

    return res.status(500).json({
      message: 'Lỗi khi đăng nhập'
    });
  }
}

module.exports = {
  register,
  login
};
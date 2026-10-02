
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function register({ username, fullname, password }) {
  if (
    typeof username !== 'string' ||
    username.trim().length < 3 ||
    username.trim().length > 50
  ) {
    throw new Error('Tên đăng nhập phải từ 3 đến 50 ký tự');
  }

  if (
    typeof fullname !== 'string' ||
    fullname.trim().length < 1 ||
    fullname.trim().length > 100
  ) {
    throw new Error('Họ tên phải từ 1 đến 100 ký tự');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: username.trim() }
  });

  if (existingUser) {
    throw new Error('Tên đăng nhập đã tồn tại');
  }

  const role = await prisma.role.findFirst({
    where: { rolename: 'normal' }
  });

  if (!role) {
    throw new Error('Chưa cấu hình role normal trong database');
  }

  const membership = await prisma.membership.findFirst({
    where: { score: 10 }
  });

  if (!membership) {
    throw new Error('Chưa cấu hình membership có score = 10');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: username.trim(),
      fullname: fullname.trim(),
      password: hashedPassword,
      roleid: role.roleid,
      mid: membership.mid
    },
    select: {
      uid: true,
      username: true,
      fullname: true,
      role: {
        select: {
          rolename: true
        }
      },
      membership: {
        select: {
          mname: true,
          score: true
        }
      }
    }
  });

  return user;
}

async function login({ username, password }) {
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password
  ) {
    throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu');
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
    include: {
      role: true
    }
  });

  if (!user) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Chưa cấu hình JWT_SECRET');
  }

  const token = jwt.sign(
    {
      uid: user.uid,
      role: user.role.rolename
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );

  return {
    token,
    user: {
      uid: user.uid,
      username: user.username,
      fullname: user.fullname,
      role: user.role.rolename
    }
  };
}

module.exports = {
  register,
  login
};
const express = require('express');
const { register, login, getUsers, updateUserRole, verifyUser } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/validate', authenticate, (req, res) => {
  res.json({ user: req.user });
});
router.get('/verify/:userId', verifyUser);

// Admin routes
router.get('/admin/users', authenticate, authorize(['admin']), getUsers);
router.put('/admin/users/:userId/role', authenticate, authorize(['admin']), updateUserRole);

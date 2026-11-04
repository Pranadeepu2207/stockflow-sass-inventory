const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');
const {
  findUserByEmail,
  createUser,
  createOrg,
  findOrgById,
} = require('../services/dataStore');

const router = express.Router();

// creates a 7-day jwt token holding the user and org ids
const signToken = (userId, organizationId) => {
  return jwt.sign(
    { userId: userId.toString(), organizationId: organizationId.toString() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// handle new user and store registration
router.post('/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword, organizationName } = req.body;

    // basic presence checks
    if (!email || !password || !organizationName) {
      return res.status(400).json({
        message: 'Email, password, and organization name are required.',
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // enforce minimum password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      });
    }

    // confirm password check if passed from form
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!organizationName.trim()) {
      return res.status(400).json({ message: 'Organization name cannot be empty.' });
    }

    // prevent duplicate email accounts
    const existingUser = await findUserByEmail(emailTrimmed);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // create the organization first
    const organization = await createOrg({
      name: organizationName.trim(),
      defaultLowStockThreshold: 5,
    });

    // hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // save user tied to the newly created store
    const user = await createUser({
      email: emailTrimmed,
      passwordHash,
      organizationId: organization._id,
    });

    // issue jwt so the user is immediately logged in
    const token = signToken(user._id, organization._id);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        organizationId: organization._id,
        organizationName: organization.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account. Please try again.' });
  }
});

// login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // look up user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // compare entered password against stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // grab the user's organization name
    const organization = await findOrgById(user.organizationId);
    const orgName = organization ? organization.name : 'Unknown Organization';
    const token = signToken(user._id, user.organizationId);

    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: orgName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// return current authenticated user data
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

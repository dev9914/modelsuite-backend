import ModelUser from '../models/model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerModel = async (req, res) => {
  try {
    const { fullName, dob, email, username, password, confirmPassword } = req.body;

    if (!fullName || !dob || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must be 8+ chars with letters & numbers' });
    }

    const emailExists = await ModelUser.findOne({ email });
    const usernameExists = await ModelUser.findOne({ username });

    if (emailExists || usernameExists) {
      return res.status(409).json({ error: 'Email or Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newModel = new ModelUser({
      ...req.body,
      password: hashedPassword,
    });

    await newModel.save();

    // 🔐 Generate token
    const token = jwt.sign(
      { id: newModel._id, role: newModel.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🧼 Safe user data
    const user = {
      _id: newModel._id,
      fullName: newModel.fullName,
      email: newModel.email,
      username: newModel.username,
      role: newModel.role,
    };

    res.status(201).json({
      message: 'Model registered successfully',
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const loginModel = async (req, res) => {
  try {

    // Either email or username
    const { identifier, password } = req.body; // identifier = email or username

    if (!identifier || !password)
      return res.status(400).json({ error: 'Username/Email and password are required' });

    const user = await ModelUser.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    res.status(200).json({ message: 'Login successful', user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};



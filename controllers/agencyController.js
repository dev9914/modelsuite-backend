import Agency from '../models/agency.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerAgency = async (req, res) => {
  try {
    const {
      agencyName,
      agencyEmail,
      phone,
      website,
      country,
      city,
      username,
      password,
      confirmPassword,
      category,
      companySize,
      agencyType,
      certificate,
      socialLink
    } = req.body;

    if (!agencyName || !agencyEmail || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must be 8+ chars with letters & numbers' });
    }

    const emailExists = await Agency.findOne({ agencyEmail });
    const usernameExists = await Agency.findOne({ username });

    if (emailExists || usernameExists) {
      return res.status(409).json({ error: 'Email or Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgency = new Agency({
      agencyName,
      agencyEmail,
      phone,
      website,
      country,
      city,
      username,
      password: hashedPassword,
      category,
      companySize,
      agencyType,
      certificate,
      socialLink,
    });

    await newAgency.save();

    const token = jwt.sign(
      { id: newAgency._id, role: newAgency.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      _id: newAgency._id,
      agencyName,
      username,
      agencyEmail,
      role: newAgency.role,
    };

    res.status(201).json({
      message: 'Agency registered successfully',
      user: safeUser,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const loginAgency = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const agency = await Agency.findOne({
      $or: [{ username: identifier }, { agencyEmail: identifier }],
    });

    if (!agency) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, agency.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: agency._id, role: agency.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      _id: agency._id,
      agencyName: agency.agencyName,
      username: agency.username,
      agencyEmail: agency.agencyEmail,
      role: agency.role,
    };

    res.status(200).json({
      message: 'Login successful',
      user: safeUser,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

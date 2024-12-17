const express = require('express');
const Role = require('../models/Role');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    if (!roles) return res.status(404).json({ status: 'fail', message: 'Roles not found' });
    res.status(200).json({ status: 'success', message: 'Roles found successfully', data: roles });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error occurred' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, slug, permissions } = req.body;
    if (!name || !slug || !permissions) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Name, slug, and permissions are required' });
    }
    const role = { name, slug, permissions };
    const data = await Role.create(role);
    res.status(200).json({ status: 'success', message: 'Roles create successfully', data });
  } catch (error) {
    console.error('Error creating role:', error.message);
    res.status(500).json({
      status: 'fail',
      message: 'Server error occurred',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

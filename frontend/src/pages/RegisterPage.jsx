import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '', password: '', password_confirm: '',
    username: '', first_name: '', last_name: '', role: 'employee'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/vacancies');
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">TempWork</h1>
        <p className="text-gray-500 text-center mb-8">Create your account</p>
        
        {error && (
          <div style={{background: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="employer">Employer</option>
              <option value="hr_manager">HR Manager</option>
            </select>
          </div>
          
          <button type="submit">Register</button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
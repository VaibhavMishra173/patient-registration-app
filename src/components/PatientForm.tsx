import React, { useState } from 'react';
import type { PatientFormData } from '../types';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => Promise<void>;
}

// Define validation schema using Zod
const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().refine(value => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date < new Date();
  }, "Invalid date of birth"),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  address: z.string().min(5, "Address must be at least 5 characters")
});

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    email: '',
    phone: '',
    address: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      patientSchema.parse(formData);
      setErrors({});
      
      setIsSubmitting(true);
      await onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        email: '',
        phone: '',
        address: ''
      });
      
      toast.success('Patient registered successfully!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to register patient');
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Register New Patient</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
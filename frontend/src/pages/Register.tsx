import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be more than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid')
});

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: { 
    name: string; 
    email: string; 
    password: string; 
    confirmPassword: string;
    phoneNumber?: string;
  }, { setSubmitting }: any) => {
    try {
      setServerError(null);
      // Remove confirmPassword as it's not needed for the API call
      const { confirmPassword, ...registerData } = values;
      await register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.phoneNumber
      );
      navigate('/'); // Redirect to main app after registration
    } catch (error: any) {
      console.error('Registration error:', error);
      setServerError(error.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Terrasapp</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
        </div>

        {serverError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" role="alert">
            <span className="block sm:inline">{serverError}</span>
          </div>
        )}

        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '',
            phoneNumber: ''
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <Field name="name">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="text"
                      label="Full Name"
                      error={touched.name && errors.name ? errors.name : ''}
                      autoComplete="name"
                    />
                  )}
                </Field>
              </div>

              <div>
                <Field name="email">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="email"
                      label="Email Address"
                      error={touched.email && errors.email ? errors.email : ''}
                      autoComplete="email"
                    />
                  )}
                </Field>
              </div>

              <div>
                <Field name="password">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="password"
                      label="Password"
                      error={touched.password && errors.password ? errors.password : ''}
                      autoComplete="new-password"
                    />
                  )}
                </Field>
              </div>

              <div>
                <Field name="confirmPassword">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="password"
                      label="Confirm Password"
                      error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''}
                      autoComplete="new-password"
                    />
                  )}
                </Field>
              </div>

              <div>
                <Field name="phoneNumber">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="tel"
                      label="Phone Number (optional)"
                      placeholder="+123456789"
                      error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : ''}
                      autoComplete="tel"
                    />
                  )}
                </Field>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                className="mt-6"
              >
                Sign Up
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Sign in
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;

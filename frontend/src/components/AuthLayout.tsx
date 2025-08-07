import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  image = '/placeholder.svg',
  imageAlt = 'Authentication illustration'
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">FundRaise</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={image}
          alt={imageAlt}
        />
        <div className="absolute inset-0 bg-blue-600 bg-opacity-20" />
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Join thousands of changemakers
            </h3>
            <p className="text-lg opacity-90">
              Create meaningful campaigns, raise funds for causes you care about, 
              and make a real difference in the world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

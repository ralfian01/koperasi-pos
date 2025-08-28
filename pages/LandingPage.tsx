
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="text-center p-8">
        <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">
          Sistem POS
        </h1>
        <p className="text-xl mb-8 text-indigo-200">
          Solusi Point of Sale modern untuk bisnis Anda.
        </p>
        <Link
          to="/login"
          className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-xl hover:bg-indigo-100 transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;

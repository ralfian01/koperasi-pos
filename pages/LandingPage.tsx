import React from 'react';
import { Link } from 'react-router-dom';
import { logoBase64 } from '../assets/logo.ts';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white">
      <div className="text-center p-8 flex flex-col items-center">
        <img src={logoBase64} alt="Koperasi Yudha Dharma Utama Logo" className="w-48 h-48 mb-6" />
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          Sistem POS Koperasi
        </h1>
        <p className="text-xl mb-8 text-red-100">
          Solusi Point of Sale modern untuk bisnis Anda.
        </p>
        <Link
          to="/login"
          className="bg-secondary text-text-primary font-bold py-3 px-8 rounded-full shadow-xl hover:bg-secondary-dark transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
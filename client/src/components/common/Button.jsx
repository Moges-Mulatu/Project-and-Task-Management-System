import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
  const baseStyles = "px-6 py-3 rounded-lg font-bold transition duration-300 w-full shadow-md active:scale-95";
  
  const variants = {
    primary: "bg-brand-green text-white hover:bg-opacity-90",
    secondary: "bg-brand-blue text-white hover:bg-opacity-90",
    outline: "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
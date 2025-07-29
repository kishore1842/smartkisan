import React from 'react';
import { Leaf, Droplets, Sun } from 'lucide-react';

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      {/* Floating Leaves */}
      <div className="absolute top-20 left-10 floating-element" style={{ animationDelay: '0s' }}>
        <Leaf className="text-green-400 opacity-30" size={24} />
      </div>
      <div className="absolute top-40 right-20 floating-element" style={{ animationDelay: '2s' }}>
        <Leaf className="text-green-500 opacity-20" size={20} />
      </div>
      <div className="absolute top-60 left-1/4 floating-element" style={{ animationDelay: '4s' }}>
        <Leaf className="text-green-300 opacity-25" size={28} />
      </div>
      
      {/* Floating Droplets */}
      <div className="absolute top-32 right-1/3 floating-element" style={{ animationDelay: '1s' }}>
        <Droplets className="text-blue-400 opacity-20" size={16} />
      </div>
      <div className="absolute top-80 left-1/3 floating-element" style={{ animationDelay: '3s' }}>
        <Droplets className="text-blue-300 opacity-15" size={20} />
      </div>
      
      {/* Floating Sun */}
      <div className="absolute top-16 right-10 floating-element" style={{ animationDelay: '5s' }}>
        <Sun className="text-yellow-400 opacity-15" size={32} />
      </div>
      
      {/* More floating elements */}
      <div className="absolute bottom-40 left-20 floating-element" style={{ animationDelay: '1.5s' }}>
        <Leaf className="text-green-400 opacity-20" size={22} />
      </div>
      <div className="absolute bottom-60 right-1/4 floating-element" style={{ animationDelay: '3.5s' }}>
        <Droplets className="text-blue-500 opacity-25" size={18} />
      </div>
      <div className="absolute bottom-20 right-1/3 floating-element" style={{ animationDelay: '2.5s' }}>
        <Sun className="text-yellow-300 opacity-10" size={26} />
      </div>
    </div>
  );
};

export default FloatingElements; 
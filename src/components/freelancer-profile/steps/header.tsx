import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="text-center mb-4">
      {/* Podrías añadir aquí un logo o icono si es necesario */}
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {/* Barra de progreso opcional */}
      {/* <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '30%' }}></div> // Ejemplo: 30% progreso
      </div> */}
    </div>
  );
};

export default Header; 
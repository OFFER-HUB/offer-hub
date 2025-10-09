import React from 'react'

interface Dropdown {
    options: string[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    label: string;
}

const Dropdown: React.FC<Dropdown> = ({options, onChange, label}) => {
  return (
    <div>
      <label htmlFor='dropdown'>{label}</label>
        <select 
        className='rounded-lg border bg-white p-4 text-center text-slate-500 w-full'
        onChange={onChange}
        required>
        {options.map((option, index) => (
            <>
            <option key={index}>
            {option}
            </option>
            </>
        ))}
      </select>
    </div>
  )
}

export default Dropdown

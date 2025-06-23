import React from "react";

const Slider = ({ id, min, max, step, defaultValue, onValueChange, className }) => {
  const [value, setValue] = React.useState(defaultValue[0]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 thumb:h-4 thumb:w-4 thumb:rounded-full thumb:bg-blue-500 thumb:shadow-lg"
        style={{
            // Custom styling for the thumb (Webkit & Moz)
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min) / (max - min)) * 100}%, #4B5563 ${((value - min) / (max - min)) * 100}%, #4B5563 100%)`,
        }}
      />
    </div>
  );
};

export { Slider };
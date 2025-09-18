// Design System - Create this file: frontend/src/components/ui/Button.tsx

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  onClick,
  href,
  type = 'button'
}: ButtonProps) {
  const baseClasses = "font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#FF9E3D] text-black hover:bg-[#FF8C1A] focus:ring-[#FF9E3D] active:bg-[#E6862F] shadow-sm hover:shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200",
    danger: "bg-[#EF233C] text-white hover:bg-[#D91E36] focus:ring-[#EF233C] active:bg-[#C01E33]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }
  
  return (
    <button 
      type={type}
      className={classes} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Icon Button Component
interface IconButtonProps {
  children: React.ReactNode;
  variant?: 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function IconButton({ 
  children, 
  variant = 'ghost', 
  size = 'md', 
  disabled = false,
  onClick,
  className = ''
}: IconButtonProps) {
  const baseClasses = "rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    ghost: "text-gray-500 hover:text-[#FF9E3D] hover:bg-gray-100 focus:ring-gray-500",
    primary: "text-[#FF9E3D] hover:text-[#FF8C1A] hover:bg-orange-50 focus:ring-[#FF9E3D]",
    danger: "text-[#EF233C] hover:text-[#D91E36] hover:bg-red-50 focus:ring-[#EF233C]"
  };
  
  const sizes = {
    sm: "p-1",
    md: "p-2"
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// Input Component
interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
  id,
  name,
  required = false
}: InputProps) {
  const baseClasses = "w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-[#EF233C] focus:border-[#EF233C] focus:ring-[#EF233C]" : "border-gray-300 hover:border-gray-400 focus:border-[#FF9E3D] focus:ring-[#FF9E3D]";
  
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={classes}
    />
  );
}

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const baseClasses = "bg-white rounded-lg border border-gray-200";
  const hoverClasses = hover ? "hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer" : "";
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  
  return (
    <svg 
      className={`animate-spin ${sizes[size]} text-[#FF9E3D]`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
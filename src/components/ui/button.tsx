import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-none font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none';
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  } as const;
  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-800',
    secondary: 'bg-neutral-100 text-black hover:bg-neutral-200',
    ghost: 'bg-transparent hover:bg-neutral-100',
  } as const;
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  return <button ref={ref} className={cls} {...props} />;
});
Button.displayName = 'Button';



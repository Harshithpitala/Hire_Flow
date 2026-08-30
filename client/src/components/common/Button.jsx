import './Button.css';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | danger | text
  size = 'md',        // sm | md | lg
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner-wrapper">
          <span className="btn-spinner"></span>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
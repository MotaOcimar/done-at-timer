interface ProgressBarProps {
  progress: number; // 0 to 1
  isActive?: boolean;
}

const ProgressBar = ({ progress, isActive = false }: ProgressBarProps) => {
  const percentage = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div 
      className="w-full bg-gray-100 rounded-full h-3 mb-1 overflow-hidden" 
      role="progressbar" 
      aria-valuenow={percentage} 
      aria-valuemin={0} 
      aria-valuemax={100}
    >
      <div 
        className={`bg-blue-500 h-full rounded-full transition-all duration-1000 ease-linear ${isActive ? 'animate-pulse' : ''}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;

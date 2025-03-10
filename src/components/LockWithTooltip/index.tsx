import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const LockWithTooltip = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative inline-block group cursor-pointer" onClick={() => navigate('/payment-packages')}>
      <Lock className="w-4 h-4 text-gray-400" />
      <div className="fixed invisible group-hover:visible bg-gray-800 text-white text-xs py-1 px-2 rounded 
                    transform -translate-y-full -translate-x-1/2 -mt-2 z-[9999]">
        Subscribe to unlock content
        <div className="absolute border-4 border-transparent border-t-gray-800 -bottom-2 left-1/2 transform -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default LockWithTooltip;
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import profileLogo from '../../assets/profile.png';
import logoNoText from '../../assets/logo-no-text.png';
interface HeaderProps {
  onNavigate?: (screen: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
const avatarRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && avatarRef.current && 
          !dropdownRef.current.contains(event.target as Node) && 
          !avatarRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      setShowMenu(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateTo = (screen: string) => {
    setShowMenu(false);
    if (onNavigate) {
      onNavigate(screen);
    } else {
      navigate(`/${screen.toLowerCase()}`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src={logoNoText}
              alt="DentaFlex Logo" 
              className="w-10 h-10"
            />
            <div>
              <div className="text-2xl font-bold text-[#033F6A]">
                DENTA<span className="font-normal">FLEX</span>
              </div>
              <div className="text-xs text-[#033F6A] mt-0.5">
                STUDY PREP AND MOCKS
              </div>
            </div>
          </div>

          {/* Exam Info Section */}
          {(user?.fieldOfStudy || user?.selectedExam) && (
            <div className="bg-[#F8FAFC] rounded-lg px-5 py-3 flex items-center space-x-3">
              {user?.fieldOfStudy && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Field of Study</span>
                  <span className="text-sm font-medium text-gray-700">{user.fieldOfStudy}</span>
                </div>
              )}
              {user?.selectedExam && (
                <>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Selected Exam</span>
                    <span className="text-sm font-medium text-[#033F6A]">{user.selectedExam}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative w-10 h-10" ref={avatarRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-full h-full rounded-full overflow-hidden bg-gray-100"
            aria-label="Toggle user menu"
            type="button"
          >
            <img
              src={ profileLogo}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
              width={40}
              height={40}
            />
          </button>
          
          {showMenu && (
            <div
              ref={dropdownRef}
              className="absolute top-12 right-0 bg-white rounded-lg p-2 min-w-[200px] shadow-lg z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div className="p-3 border-b border-gray-200 mb-2">
                <div className="text-base font-semibold text-[#033F6A] mb-1">
                  {user?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {user?.email}
                </div>
              </div>
              
              <button
                onClick={() => navigateTo('profile')}
                className="w-full text-left p-3 rounded hover:bg-gray-50 text-base text-[#033F6A]"
                role="menuitem"
              >
                Profile
              </button>
              
              <div className="h-px bg-gray-200 my-1" />
              
              <button
                onClick={() => navigateTo('support')}
                className="w-full text-left p-3 rounded hover:bg-gray-50 text-base text-[#033F6A]"
                role="menuitem"
              >
                Support
              </button>
              
              <div className="h-px bg-gray-200 my-1" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 rounded hover:bg-gray-50 text-base text-[#FF3B30]"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
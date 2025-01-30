import React, { useState, useEffect } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MenuItem {
  title: string;
  path: string;
  items?: {
    title: string;
    path: string;
  }[];
}

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard' },
    { 
      title: 'Manage Public Content', 
      path: '/admins',
      items: [
        { title: 'Admins', path: '/admins/admins' },
        { title: 'Field Of Study', path: '/admins/field-of-study' },
        { title: 'Exam', path: '/admins/exam' },
        { title: 'Subjects', path: '/admins/subjects' },
        { title: 'Topics', path: '/admins/topics' },
        { title: 'Sub Topics', path: '/admins/subtopics' },


      ]
    },
    { 
      title: 'Study Content',
      path: '/study-content',
      items: [
        { title: 'View / Edit content', path: '/study-content/view' },
        { title: 'Add content', path: '/study-content/add' },
        { title: 'Add content with AI', path: '/study-content/add-ai' }
      ]
    },
    {
      title: 'Exam Content',
      path: '/exam-content',
      items: [
        { title: 'View / Edit Tests', path: '/exam-content/view' },
        { title: 'Add Tests', path: '/exam-content/add' },
        { title: 'Add Tests with AI', path: '/exam-content/add-ai' }
      ]
    }
  ];

  // Auto expand parent menu based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    menuItems.forEach(item => {
      if (item.items?.some(subItem => currentPath.startsWith(subItem.path))) {
        setExpandedItems(prev => ({
          ...prev,
          [item.title]: true
        }));
      }
    });
  }, [location.pathname]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleNavigate = (path: string) => {
    if (path && path !== '#') {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item: MenuItem) => {
    if (!item.items) return false;
    return item.items.some(subItem => location.pathname.startsWith(subItem.path));
  };

  return (
    <div className="w-64 h-screen flex flex-col bg-[#001e3d] font-inter text-sm">
      {/* Fixed Header */}
      <div className="flex items-center gap-3">
            {/* <img 
              src={logoNoText}
              alt="DentaFlex Logo" 
              className="w-10 h-10"
            /> */}
            <div>
              <div className="text-2xl font-bold text-[#033F6A]">
                DENTA<span className="font-normal">FLEX</span>
              </div>
              <div className="text-xs text-[#033F6A] mt-0.5">
                STUDY PREP AND MOCKS
              </div>
            </div>
          </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="py-2 space-y-0.5">
          {menuItems.map((item) => (
            <div key={item.title}>
              <button
                onClick={() => {
                  if (item.items) {
                    toggleExpand(item.title);
                  } else {
                    handleNavigate(item.path);
                  }
                }}
                className={`w-full text-left py-1.5 px-4 transition-colors
                  ${isActive(item.path) || isParentActive(item) ? 'bg-[#0F4868]' : ''}
                  ${item.items ? 'flex justify-between items-center' : ''}
                  text-white hover:bg-[#0F4868] text-sm font-medium`}
              >
                {item.title}
                {item.items && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform
                      ${expandedItems[item.title] ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              
              {item.items && expandedItems[item.title] && (
                <div className="space-y-0.5 mt-0.5">
                  {item.items.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={() => handleNavigate(subItem.path)}
                      className={`w-full text-left py-1.5 px-8
                        text-xs ${isActive(subItem.path) ? 'bg-[#0F4868] text-white' : 'text-gray-300'}
                        hover:bg-[#0F4868] hover:text-white
                        transition-colors font-medium`}
                    >
                      {subItem.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Fixed Footer */}
      <div className="flex-none p-3 border-t border-blue-800">
        <div className="flex items-center gap-3 text-white">
          <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
          <span className="text-sm font-medium">Krunal Patel</span>
          <button className="ml-auto">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
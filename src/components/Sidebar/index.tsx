import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  ShoppingCart, 
  FileSpreadsheet, 
  Building2, 
  FileText, 
  Receipt, 
  ClipboardList, 
  CreditCard, 
  Settings, 
  Shield,
  ChevronRight,
  Warehouse,
  CircleDollarSign
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

interface MenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  roles?: string[];
  isNew?: boolean;
  items?: {
    title: string;
    path: string;
    roles?: string[];
    isNew?: boolean;
  }[];
}

const Sidebar = () => {
  const { logout , user} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
      setUserName(userData.fullName);
    }
  }, []);

  useEffect(() => {
    const checkScrollHeight = () => {
      if (navRef.current) {
        setShowScrollButton(navRef.current.scrollHeight > navRef.current.clientHeight);
      }
    };

    checkScrollHeight();
    window.addEventListener('resize', checkScrollHeight);
    return () => window.removeEventListener('resize', checkScrollHeight);
  }, []);

  const menuItems = [
    {
      category: 'GENERAL',
      items: [
        { 
          title: 'Dashboard', 
          path: '/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          roles: ['SuperAdmin', 'Admin', 'Principal', 'Teacher', 'Office', 'Staff']
        },
        // { 
        //   title: 'Parties', 
        //   path: '/parties',
        //   icon: <Users className="w-5 h-5" />,
        //   roles: ['SuperAdmin', 'Admin', 'Staff']
        // },
        { 
          title: 'Inventory', 
          path: '/inventory',
          icon: <Package className="w-5 h-5" />,
          roles: ['SuperAdmin', 'Admin', 'Staff'],
          items: [
            { title: 'Raw Materials', path: '/inventory/rawmaterials', roles: ['SuperAdmin', 'Admin', 'Staff'] },
            
            { title: 'Stock', path: '/inventory/stock', roles: ['SuperAdmin', 'Admin', 'Staff'] }
          ]
        },
        // { 
        //   title: 'Sales', 
        //   path: '/sales',
        //   icon: <ShoppingBag className="w-5 h-5" />,
        //   roles: ['SuperAdmin', 'Admin', 'Staff'],
        //   items: [
        //     { title: 'Invoices', path: '/sales/invoices', roles: ['SuperAdmin', 'Admin', 'Staff'] },
        //     { title: 'Customers', path: '/sales/customers', roles: ['SuperAdmin', 'Admin', 'Staff'] }
        //   ]
        // },
        { 
          title: 'Purchases', 
          path: '/purchases',
          icon: <ShoppingCart className="w-5 h-5" />,
          roles: ['SuperAdmin', 'Admin', 'Staff'],
          items: [
            { title: 'Suppliers', path: '/inventory/suppliers', roles: ['SuperAdmin', 'Admin', 'Staff'] },
            { title: 'Orders', path: '/inventory/orders', roles: ['SuperAdmin', 'Admin', 'Staff'] },
            // { title: 'Vendors', path: '/purchases/vendors', roles: ['SuperAdmin', 'Admin', 'Staff'] }
          ]
        },
        { 
          title: 'Production', 
          path: '/sales',
          icon: <ShoppingCart className="w-5 h-5" />,
          roles: ['SuperAdmin', 'Admin', 'Staff'],
          items: [
            { title: 'Products', path: '/sales/products', roles: ['SuperAdmin', 'Admin', 'Staff'] },
            { title: 'Production', path: '/sales/production', roles: ['SuperAdmin', 'Admin', 'Staff'] },

            // { title: 'Orders', path: '/inventory/orders', roles: ['SuperAdmin', 'Admin', 'Staff'] },
            // { title: 'Vendors', path: '/purchases/vendors', roles: ['SuperAdmin', 'Admin', 'Staff'] }
          ]
        },
        // { 
        //   title: 'Reports', 
        //   path: '/reports',
        //   icon: <FileSpreadsheet className="w-5 h-5" />,
        //   roles: ['SuperAdmin', 'Admin', 'Principal']
        // }
      ]
    },
    // {
    //   category: 'ACCOUNTING SOLUTIONS',
    //   items: [
    //     { 
    //       title: 'Cash & Bank', 
    //       path: '/cash-bank',
    //       icon: <Building2 className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Office']
    //     },
    //     { 
    //       title: 'E-Invoicing', 
    //       path: '/e-invoicing',
    //       icon: <FileText className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Office']
    //     },
    //     { 
    //       title: 'Automated Bills', 
    //       path: '/automated-bills',
    //       icon: <Receipt className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Office']
    //     },
    //     { 
    //       title: 'Expenses', 
    //       path: '/expenses',
    //       icon: <ClipboardList className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Office', 'Staff']
    //     },
    //     { 
    //       title: 'POS Billing', 
    //       path: '/pos-billing',
    //       icon: <CreditCard className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Staff'],
    //       isNew: true
    //     }
    //   ]
    // },
    // {
    //   category: 'BUSINESS TOOLS',
    //   items: [
    //     { 
    //       title: 'Staff Attendance & Payroll', 
    //       path: '/attendance',
    //       icon: <Users className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Principal', 'Teacher']
    //     },
    //     { 
    //       title: 'Manage Users', 
    //       path: '/manage/users',
    //       icon: <Users className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Principal']
    //     },
    //     { 
    //       title: 'Godown', 
    //       path: '/warehouse',
    //       icon: <Warehouse className="w-5 h-5" />,
    //       roles: ['SuperAdmin', 'Admin', 'Staff']
    //     }
    //   ]
    // }
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    menuItems.forEach(category => {
      category.items.forEach(item => {
        if (item.items?.some(subItem => currentPath.startsWith(subItem.path))) {
          setExpandedItems(prev => ({
            ...prev,
            [item.title]: true
          }));
        }
      });
    });
  }, [location.pathname]);

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(userRole);
  };

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

  const scrollToBottom = () => {
    if (navRef.current) {
      navRef.current.scrollTo({
        top: navRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 h-screen flex flex-col bg-[#131622] font-inter text-sm
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Company Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-semibold">
              P
            </div>
            <div>
              <div className="text-lg font-bold text-white">{user?.username}</div>
              <div className="text-xs text-gray-400">9106593670</div>
            </div>
          </div>
          
          {/* Create Invoice Button */}
          {/* <div className="relative">
            <button className="w-full py-2.5 px-4 bg-[#e9e7ff] text-[#5045cd] rounded-md flex items-center justify-between group transition-all hover:bg-[#dcd9ff]">
              <div className="flex items-center gap-2">
                <span className="text-lg">+</span>
                <span>Create Sales Invoice</span>
              </div>
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
          </div> */}
          
          {/* Premium Plan */}
          {/* <div className="bg-gradient-to-r from-[#e2b558] to-[#cc9b3a] text-white py-2.5 px-4 rounded-md flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="text-lg">👑</div>
              <span className="font-medium">Buy Premium Plan</span>
            </div>
            <span className="bg-[#c94b4b] text-white text-xs py-1 px-3 rounded-full font-medium">13 Days Left</span>
          </div> */}
        </div>

        {/* Menu Items */}
        <nav ref={navRef} className="flex-1 overflow-y-auto text-white px-2">
          {menuItems.map((category, index) => {
            const accessibleItems = category.items.filter(item => {
              const hasItemAccess = hasAccess(item.roles);
              if (item.items) {
                const accessibleSubItems = item.items.filter(subItem => hasAccess(subItem.roles));
                return hasItemAccess && accessibleSubItems.length > 0;
              }
              return hasItemAccess;
            });

            if (accessibleItems.length === 0) return null;

            return (
              <div key={index} className="mb-3">
                <div className="px-4 py-2 text-xs font-medium text-gray-400 mt-1">
                  {category.category}
                </div>
                <div className="space-y-0.5">
                  {accessibleItems.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <button
                        onClick={() => {
                          if (item.items && item.items.length > 0) {
                            toggleExpand(item.title);
                          } else {
                            handleNavigate(item.path);
                            setIsOpen(false);
                          }
                        }}
                        className={`w-full px-4 py-2.5 flex items-center justify-between rounded-md
                          ${isActive(item.path) || isParentActive(item) 
                            ? 'bg-[#272e48] text-blue-100' 
                            : 'hover:bg-[#272e48] text-gray-200 hover:text-white'} 
                          transition-colors group`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`${isActive(item.path) || isParentActive(item) ? 'text-blue-300' : 'text-gray-400 group-hover:text-blue-300'}`}>
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.isNew && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#c94b4b] text-white">New</span>
                          )}
                          {item.items && item.items.length > 0 && (
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedItems[item.title] ? 'rotate-90' : ''}`} />
                          )}
                        </div>
                      </button>
                      
                      {item.items && expandedItems[item.title] && (
                        <div className="pl-11 py-1 space-y-1 ml-2 border-l border-gray-700">
                          {item.items
                            .filter(subItem => hasAccess(subItem.roles))
                            .map((subItem, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => {
                                  handleNavigate(subItem.path);
                                  setIsOpen(false);
                                }}
                                className={`w-full py-1.5 px-3 text-left text-sm rounded-md
                                  ${isActive(subItem.path) 
                                    ? 'text-blue-300 font-medium' 
                                    : 'text-gray-400 hover:text-white'}
                                  transition-colors flex items-center justify-between`}
                              >
                                <span>{subItem.title}</span>
                                {subItem.isNew && (
                                  <span className="text-xs px-2 rounded-full bg-[#c94b4b] text-white">New</span>
                                )}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Scroll Button */}
        {showScrollButton && (
          <div className="px-4 py-2">
            <button
              onClick={scrollToBottom}
              className="w-full py-2 px-4 bg-[#272e48] text-center text-sm text-gray-300 rounded-md flex items-center justify-center hover:bg-[#323b5a] transition-colors"
            >
              <span>Scroll for more options</span>
              <ChevronDown className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}

        {/* Settings */}
        <div className="p-3 mx-2 border-t border-gray-700/50 mt-2">
          <button
            onClick={() => handleNavigate('/settings')}
            className="w-full px-4 py-2.5 flex items-center space-x-3 text-white hover:bg-[#272e48] rounded-md transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="font-medium">Settings</span>
          </button>
        </div>

        {/* Security Info & Logout */}
        <div className="px-4 py-3 flex flex-col space-y-1">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            <span>100% Secure</span>
            <div className="mx-2 text-gray-600">•</div>
            <span className="flex items-center"><span className="opacity-70 mr-1">ISO</span> ISO Certified</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
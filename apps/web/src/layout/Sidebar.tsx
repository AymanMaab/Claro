import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';

const EXPANDED = 212;
const COLLAPSED = 64;

interface SubMenuItem {
  id: string;
  label: string;
  tabId: string;
  icon: LucideIcon;
  badge?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  isAccessible: boolean;
  children?: SubMenuItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard',    isAccessible: true },
  { id: 'accounts',     label: 'Accounts',     icon: CreditCard,      path: '/accounts',     isAccessible: true,
    children: [
      { id: 'accounts-overview', label: 'Overview', tabId: 'dashboard', icon: LayoutDashboard },
      { id: 'accounts-cards',    label: 'Cards',    tabId: 'cards',     icon: CreditCard },
    ],
  },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight,  path: '/transactions', isAccessible: true },
  { id: 'budgets',      label: 'Budgets',      icon: Wallet,          path: '/budgets',      isAccessible: true },
  { id: 'analytics',    label: 'Analytics',    icon: BarChart2,       path: '/analytics',    isAccessible: true },
  { id: 'settings',     label: 'Settings',     icon: Settings,        path: '/settings',     isAccessible: true },
];

const pathMatches = (path: string, pathname: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const getActiveId = (pathname: string) =>
  MENU_ITEMS
    .filter((item) => pathMatches(item.path, pathname))
    .sort((a, b) => b.path.length - a.path.length)[0]?.id ?? null;

const isChildActive = (parentPath: string, tabId: string, pathname: string, search: string) => {
  if (pathname !== parentPath) return false;
  const tab = new URLSearchParams(search).get('tab');
  return tabId === 'dashboard' ? !tab || tab === 'dashboard' : tab === tabId;
};

const capBadge = (n: number) => (n > 99 ? '99+' : String(n));

const Sidebar = ({ isOpen, onToggle, isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const activeId = getActiveId(location.pathname);
  const isExpanded = isMobile ? (isOpen ?? false) : !collapsed;
  const width = isExpanded ? EXPANDED : COLLAPSED;

  useEffect(() => {
    const active = MENU_ITEMS.find((m) => m.id === activeId);
    if (active?.children) {
      setExpandedMenus((prev) => new Set([...prev, activeId!]));
    }
  }, [activeId]);

  const toggleMenu = (id: string) =>
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleItemClick = (item: MenuItem) => {
    if (item.children?.length) toggleMenu(item.id);
    else navigate(item.path);
  };

  const handleCollapseToggle = () => {
    if (isMobile) onToggle?.();
    else setCollapsed((c) => !c);
  };

  return (
    <Box
      component="nav"
      sx={{
        width,
        minWidth: width,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'primary.dark',
        borderRight: 'none',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: isMobile ? 1200 : 'auto',
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-10%)') : 'none',
        boxShadow: isMobile && isOpen ? 8 : 2,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          borderBottom: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: isExpanded ? 44 : 36,
            width: isExpanded ? 160 : 36,
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            flexShrink: 0,
          }}
        >
          <svg
            viewBox={isExpanded ? '0 0 300 100' : '0 0 90 100'}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: '100%', width: 'auto' }}
          >
            <defs>
              <linearGradient id="cGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#0098f1" />
              </linearGradient>
            </defs>
            {/* C arc */}
            <path d="M 55 8 C 28 8, 8 28, 8 50 C 8 72, 28 92, 55 92 C 68 92, 79 87, 87 79" stroke="url(#cGradientSidebar)" strokeWidth="10" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="50" r="18" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />
            {/* l */}
            <path d="M 95 32 L 95 72" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
            {/* a */}
            <circle cx="118" cy="60" r="11" stroke="#ffffff" strokeWidth="5.5" fill="none" />
            <path d="M 129 60 L 129 72" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
            {/* r */}
            <path d="M 145 50 L 145 72" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 145 52 C 145 50, 148 48, 152 48 C 156 48, 158 50, 158 52" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            {/* o */}
            <circle cx="176" cy="60" r="11" stroke="#ffffff" strokeWidth="5.5" fill="none" />
          </svg>
        </Box>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }} disablePadding>
        {MENU_ITEMS.filter((item) => item.isAccessible).map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const isMenuExpanded = expandedMenus.has(item.id);

          return (
            <Box key={item.id}>
              <Tooltip title={!isExpanded ? item.label : ''} placement="right" arrow>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleItemClick(item)}
                    sx={{
                      minHeight: 44,
                      px: isExpanded ? 2 : 0,
                      justifyContent: 'center',
                      borderLeft: '4px solid',
                      borderColor: isActive ? 'primary.light' : 'transparent',
                      bgcolor: isActive ? 'rgba(0,152,241,0.15)' : 'transparent',
                      borderRadius: '0 8px 8px 0',
                      mr: 1,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isExpanded ? 1.5 : 0,
                        justifyContent: 'center',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                        position: 'relative',
                      }}
                    >
                      <Icon size={20} />
                      {!isExpanded && item.badge ? (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                          }}
                        />
                      ) : null}
                    </ListItemIcon>

                    {isExpanded && (
                      <>
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: {
                              noWrap: true,
                              sx: {
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                              },
                            },
                          }}
                        />
                        {item.badge ? (
                          <Box
                            sx={{
                              bgcolor: 'error.main',
                              color: 'error.contrastText',
                              fontSize: 10,
                              fontWeight: 700,
                              px: 0.75,
                              borderRadius: 10,
                              ml: 0.5,
                              minWidth: 20,
                              textAlign: 'center',
                            }}
                          >
                            {capBadge(item.badge)}
                          </Box>
                        ) : null}
                        {item.children?.length ? (
                          isMenuExpanded
                            ? <ChevronUp size={14} color={isActive ? '#fff' : 'rgba(255,255,255,0.7)'} />
                            : <ChevronDown size={14} color={isActive ? '#fff' : 'rgba(255,255,255,0.7)'} />
                        ) : null}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>

              {item.children?.length && isExpanded ? (
                <Collapse in={isMenuExpanded} timeout={200} unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isChildActive(
                        item.path, child.tabId, location.pathname, location.search,
                      );
                      return (
                        <ListItem key={child.id} disablePadding>
                          <ListItemButton
                            onClick={() => navigate(`${item.path}?tab=${child.tabId}`)}
                            sx={{
                              pl: 4.5,
                              pr: 2,
                              minHeight: 38,
                              borderLeft: '4px solid',
                              borderColor: childActive ? 'primary.light' : 'transparent',
                              bgcolor: childActive ? 'rgba(0,152,241,0.12)' : 'transparent',
                              borderRadius: '0 8px 8px 0',
                              mr: 1,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: 1.5,
                                color: childActive ? '#fff' : 'rgba(255,255,255,0.6)',
                              }}
                            >
                              <ChildIcon size={16} />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              slotProps={{
                                primary: {
                                  noWrap: true,
                                  sx: {
                                    fontSize: 13,
                                    fontWeight: childActive ? 600 : 400,
                                    color: childActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                  },
                                },
                              }}
                            />
                            {child.badge ? (
                              <Box
                                sx={{
                                  bgcolor: 'error.main',
                                  color: 'error.contrastText',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  px: 0.75,
                                  borderRadius: 10,
                                  ml: 0.5,
                                  minWidth: 20,
                                  textAlign: 'center',
                                }}
                              >
                                {capBadge(child.badge)}
                              </Box>
                            ) : null}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              ) : null}
            </Box>
          );
        })}
      </List>

      {/* Footer — collapse toggle */}
      <Box
        onClick={handleCollapseToggle}
        sx={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)',
          flexShrink: 0,
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
        }}
      >
        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </Box>
    </Box>
  );
};

export default Sidebar;

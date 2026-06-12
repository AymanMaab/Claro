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
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  PiggyBank,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';

const SIDEBAR_EXPANDED = 212;
const SIDEBAR_COLLAPSED = 64;

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

const buildMenuItems = (): MenuItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    isAccessible: true,
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: CreditCard,
    path: '/accounts',
    isAccessible: true,
    children: [
      { id: 'accounts-overview', label: 'Overview', tabId: 'dashboard', icon: LayoutDashboard },
      { id: 'accounts-cards', label: 'Cards', tabId: 'cards', icon: CreditCard },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
    path: '/transactions',
    isAccessible: true,
  },
  {
    id: 'savings',
    label: 'Savings',
    icon: PiggyBank,
    path: '/savings',
    isAccessible: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart2,
    path: '/analytics',
    isAccessible: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    isAccessible: true,
  },
];

const pathMatches = (path: string, pathname: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const getActiveMenuId = (items: MenuItem[], pathname: string) =>
  items
    .filter((item) => pathMatches(item.path, pathname))
    .sort((a, b) => b.path.length - a.path.length)[0]?.id ?? null;

const isSubMenuActive = (
  parentPath: string,
  tabId: string,
  pathname: string,
  search: string,
): boolean => {
  if (pathname !== parentPath) return false;
  const tab = new URLSearchParams(search).get('tab');
  return tabId === 'dashboard' ? !tab || tab === 'dashboard' : tab === tabId;
};

const capBadge = (n: number) => (n > 99 ? '99+' : String(n));

const Sidebar = ({ isOpen, onToggle, isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const menuItems = buildMenuItems();
  const activeId = getActiveMenuId(menuItems, location.pathname);

  const isExpanded = isMobile ? (isOpen ?? false) : !collapsed;
  const width = isExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  useEffect(() => {
    const activeItem = menuItems.find((m) => m.id === activeId);
    if (activeItem?.children) {
      setExpandedMenus((prev) => new Set([...prev, activeId!]));
    }
  }, [activeId]);

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children?.length) {
      toggleMenu(item.id);
    } else {
      navigate(item.path);
    }
  };

  const handleSubItemClick = (parentPath: string, tabId: string) => {
    navigate(`${parentPath}?tab=${tabId}`);
  };

  const handleCollapseToggle = () => {
    if (isMobile) {
      onToggle?.();
    } else {
      setCollapsed((c) => !c);
    }
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
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: isMobile ? 1200 : 'auto',
        transform: isMobile
          ? isOpen
            ? 'translateX(0)'
            : 'translateX(-10%)'
          : 'none',
        boxShadow: isMobile && isOpen ? 4 : 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          px: isExpanded ? 2 : 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {isExpanded ? (
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: -0.5 }}
          >
            Claro
          </Typography>
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
              C
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <List
        sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}
        disablePadding
      >
        {menuItems
          .filter((item) => item.isAccessible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            const isMenuExpanded = expandedMenus.has(item.id);

            return (
              <Box key={item.id}>
                <Tooltip
                  title={!isExpanded ? item.label : ''}
                  placement="right"
                  arrow
                >
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      onClick={() => handleItemClick(item)}
                      sx={{
                        minHeight: 44,
                        px: isExpanded ? 2 : 1.5,
                        justifyContent: isExpanded ? 'flex-start' : 'center',
                        borderLeft: isActive ? '5px solid' : '5px solid transparent',
                        borderColor: isActive ? 'primary.main' : 'transparent',
                        bgcolor: isActive ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: '0 8px 8px 0',
                        mr: 1,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isExpanded ? 1.5 : 0,
                          justifyContent: 'center',
                          color: isActive ? 'primary.main' : 'text.secondary',
                          position: 'relative',
                        }}
                      >
                        <Icon size={20} />
                        {/* Collapsed badge dot */}
                        {!isExpanded && item.badge && item.badge > 0 ? (
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
                                  color: isActive ? 'text.primary' : 'text.secondary',
                                },
                              },
                            }}
                          />
                          {item.badge && item.badge > 0 ? (
                            <Box
                              sx={{
                                bgcolor: 'error.main',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                                px: 0.75,
                                py: 0.1,
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
                            isMenuExpanded ? (
                              <ChevronUp size={14} color="var(--mui-palette-text-secondary)" />
                            ) : (
                              <ChevronDown size={14} color="var(--mui-palette-text-secondary)" />
                            )
                          ) : null}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                {/* Submenu */}
                {item.children?.length && isExpanded ? (
                  <Collapse in={isMenuExpanded} timeout={200} unmountOnExit>
                    <List disablePadding>
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isSubMenuActive(
                          item.path,
                          child.tabId,
                          location.pathname,
                          location.search,
                        );

                        return (
                          <ListItem key={child.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleSubItemClick(item.path, child.tabId)}
                              sx={{
                                pl: 4.5,
                                pr: 2,
                                minHeight: 38,
                                borderLeft: childActive ? '5px solid' : '5px solid transparent',
                                borderColor: childActive ? 'primary.light' : 'transparent',
                                bgcolor: childActive ? 'action.selected' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' },
                                borderRadius: '0 8px 8px 0',
                                mr: 1,
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: 1.5,
                                  color: childActive ? 'primary.light' : 'text.secondary',
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
                                      color: childActive ? 'text.primary' : 'text.secondary',
                                    },
                                  },
                                }}
                              />
                              {child.badge && child.badge > 0 ? (
                                <Box
                                  sx={{
                                    bgcolor: 'error.main',
                                    color: '#fff',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    px: 0.75,
                                    py: 0.1,
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

      {/* Footer */}
      <Box
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          px: isExpanded ? 2 : 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {isExpanded && user && (
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
            {user.firstName} {user.lastName}
          </Typography>
        )}
        <IconButton size="small" onClick={handleCollapseToggle} sx={{ color: 'text.secondary' }}>
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;

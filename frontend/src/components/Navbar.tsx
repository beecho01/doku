import React, { useEffect, useState } from 'react'
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react'
import { useLocation } from 'react-router-dom'
import { Container, HardDrive, Image, Archive, FolderOpen, FileText, Link as LinkIcon, Play, ChevronDown, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HardDrive },
  { name: 'Images', href: '/images', icon: Image },
  { name: 'Containers', href: '/containers', icon: Container },
  { name: 'Volumes', href: '/volumes', icon: Archive },
  { name: 'Build Cache', href: '/build-cache', icon: FolderOpen },
  { name: 'Overlay2', href: '/overlay2', icon: HardDrive },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Bind Mounts', href: '/bind-mounts', icon: LinkIcon },
]

export default function Navbar() {
  const location = useLocation()
  const { theme, setTheme, effectiveTheme } = useTheme()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('')

  const getCurrentThemeIcon = () => {
    return effectiveTheme === 'dark' ? Moon : Sun
  }

  // Breakpoint tracking
  useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) return 'xs' // < sm
      if (width < 768) return 'sm' // sm to md
      if (width < 1024) return 'md' // md to lg
      if (width < 1280) return 'lg' // lg to xl
      if (width < 1536) return 'xl' // xl to 2xl
      return '2xl' // >= 2xl
    }

    const getNavbarState = () => {
      const width = window.innerWidth
      if (width < 768) return 'mobile' // < md (shows mobile footer)
      return 'desktop' // >= md (shows desktop navbar)
    }

    const logNavbarState = () => {
      const breakpoint = getBreakpoint()
      const navbarState = getNavbarState()
      const width = window.innerWidth

      if (breakpoint !== currentBreakpoint) {
        // Determine which UI elements are visible
        const uiElements = {
          mobileFooter: width < 768, // md:hidden
          desktopNavigation: width >= 768, // hidden md:flex
          mobileThemeToggle: width < 768, // md:hidden
          desktopThemeToggle: width >= 768, // hidden md:flex
          scanButton: width >= 768, // hidden md:flex
          navigationLabels: width >= 1280, // hidden xl:inline
          moreDropdown: width >= 768, // part of desktop nav
          footerMoreDropdown: width < 768, // part of mobile footer
        }

        console.log(`📱 Navbar Breakpoint Changed:`, {
          breakpoint,
          navbarState,
          width: `${width}px`,
          visibleElements: Object.entries(uiElements)
            .filter(([_, visible]) => visible)
            .map(([element]) => element),
          hiddenElements: Object.entries(uiElements)
            .filter(([_, visible]) => !visible)
            .map(([element]) => element),
          layout: {
            showMobileFooter: navbarState === 'mobile',
            showDesktopNav: navbarState === 'desktop',
            themeToggleLocation: navbarState === 'mobile' ? 'top-right' : 'desktop-right'
          }
        })
        setCurrentBreakpoint(breakpoint)
      }
    }

    // Log initial state
    setTimeout(() => {
      logNavbarState()
    }, 100)

    // Add resize listener
    const handleResize = () => {
      logNavbarState()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [currentBreakpoint])

  return (
    <>
      <HeroNavbar
        className=" bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700"
        maxWidth="full"
      >
        <NavbarContent justify="start">
          <NavbarBrand className="flex-grow-0 mr-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Container className="w-5 h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Doku
                </p>
                <p className="text-xs text-gray-500 leading-none">Docker Monitor</p>
              </div>
              <div className="block xs:hidden">
                <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Doku
                </p>
              </div>
            </div>
          </NavbarBrand>

          {/* Desktop Navigation - inline with brand */}
          <div className="hidden md:flex gap-2">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <NavbarItem key={item.name} isActive={isActive}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Link>
                </NavbarItem>
              )
            })}

            {/* More dropdown for remaining items */}
            {navigationItems.length > 5 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="flex items-center gap-1 px-2"
                    endContent={<ChevronDown size={14} />}
                    size="sm"
                  >
                    <span className="hidden xl:inline">More</span>
                    <span className="xl:hidden">+</span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  {navigationItems.slice(5).map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownItem
                        key={item.name}
                        startContent={<Icon size={16} />}
                        href={item.href}
                      >
                        {item.name}
                      </DropdownItem>
                    )
                  })}
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </NavbarContent>

        {/* Theme toggle for mobile */}
        <NavbarContent className="md:hidden" justify="end">
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  aria-label="Toggle theme"
                  className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {React.createElement(getCurrentThemeIcon(), { size: 18 })}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Theme selection"
                selectedKeys={[theme]}
                onAction={(key) => setTheme(key as typeof theme)}
              >
                <DropdownItem
                  key="light"
                  startContent={<Sun size={16} />}
                >
                  Light
                </DropdownItem>
                <DropdownItem
                  key="dark"
                  startContent={<Moon size={16} />}
                >
                  Dark
                </DropdownItem>
                <DropdownItem
                  key="system"
                  startContent={<Monitor size={16} />}
                >
                  System
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>

        {/* Desktop Actions */}
        <NavbarContent className="hidden md:flex" justify="end">
          <NavbarItem>
            <Button
              color="primary"
              variant="flat"
              startContent={<Play size={16} />}
              size="sm"
              className="px-3"
            >
              <span className="hidden md:inline">Scan Now</span>
              <span className="md:hidden">Scan</span>
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  aria-label="Toggle theme"
                  className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {React.createElement(getCurrentThemeIcon(), { size: 18 })}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Theme selection"
                selectedKeys={[theme]}
                onAction={(key) => setTheme(key as typeof theme)}
              >
                <DropdownItem
                  key="light"
                  startContent={<Sun size={16} />}
                >
                  Light
                </DropdownItem>
                <DropdownItem
                  key="dark"
                  startContent={<Moon size={16} />}
                >
                  Dark
                </DropdownItem>
                <DropdownItem
                  key="system"
                  startContent={<Monitor size={16} />}
                >
                  System
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </HeroNavbar>

      {/* Mobile Footer Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700">
        <div className="grid grid-cols-6 gap-1 px-2 py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all text-xs ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} className="mb-1" />
                <span className="leading-none font-medium text-[9px] text-center">
                  {item.name === 'Build Cache' ? 'Cache' : item.name}
                </span>
              </Link>
            )
          })}

          {/* More dropdown for remaining items */}
          {navigationItems.length > 5 && (
            <Dropdown placement="top">
              <DropdownTrigger>
                <button className="flex flex-col items-center justify-center p-2 rounded-lg transition-all text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronDown size={18} className="mb-1 rotate-180" />
                  <span className="leading-none font-medium text-[9px] text-center">
                    More
                  </span>
                </button>
              </DropdownTrigger>
              <DropdownMenu>
                {navigationItems.slice(5).map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <DropdownItem
                      key={item.name}
                      startContent={<Icon size={16} />}
                      href={item.href}
                      className={isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                    >
                      {item.name}
                    </DropdownItem>
                  )
                })}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
    </>
  )
}

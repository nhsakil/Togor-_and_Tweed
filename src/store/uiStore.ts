'use client'

import { create } from 'zustand'

interface UIState {
  cartOpen: boolean
  mobileMenuOpen: boolean
  filterDrawerOpen: boolean
  searchOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
  openFilterDrawer: () => void
  closeFilterDrawer: () => void
  openSearch: () => void
  closeSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  filterDrawerOpen: false,
  searchOpen: false,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),

  openFilterDrawer: () => set({ filterDrawerOpen: true }),
  closeFilterDrawer: () => set({ filterDrawerOpen: false }),

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}))

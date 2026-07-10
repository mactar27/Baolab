"use client"

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react"
import type { Product } from "@/lib/products"

export type CartItem = {
  product: Product
  quantity: number
  rentalDuration?: number
  rentalUnit?: "jours" | "semaines" | "mois"
}

type CartState = {
  items: CartItem[]
}

type Action =
  | { type: "add"; product: Product }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; quantity: number }
  | { type: "setRentalDuration"; id: string; duration: number; unit: "jours" | "semaines" | "mois" }
  | { type: "clear" }

export function getItemSubtotal(i: CartItem): number {
  if (i.product.category === "location" && i.rentalDuration && i.rentalUnit) {
    const factor = i.rentalUnit === "mois" ? 30 : i.rentalUnit === "semaines" ? 7 : 1
    return i.product.price * i.quantity * i.rentalDuration * factor
  }
  return i.product.price * i.quantity
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: 1,
            rentalDuration: action.product.category === "location" ? 1 : undefined,
            rentalUnit: action.product.category === "location" ? "jours" : undefined,
          },
        ],
      }
    }
    case "remove":
      return { items: state.items.filter((i) => i.product.id !== action.id) }
    case "setQty":
      return {
        items: state.items
          .map((i) =>
            i.product.id === action.id
              ? { ...i, quantity: Math.max(0, action.quantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      }
    case "setRentalDuration":
      return {
        items: state.items.map((i) =>
          i.product.id === action.id
            ? { ...i, rentalDuration: Math.max(1, action.duration), rentalUnit: action.unit }
            : i
        ),
      }
    case "clear":
      return { items: [] }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  isOpen: boolean
  setOpen: (open: boolean) => void
  add: (product: Product) => void
  remove: (id: string) => void
  setQty: (id: string, quantity: number) => void
  setRentalDuration: (id: string, duration: number, unit: "jours" | "semaines" | "mois") => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const [isOpen, setOpen] = useState(false)

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((n, i) => n + i.quantity, 0)
    const total = state.items.reduce((sum, i) => sum + getItemSubtotal(i), 0)
    return {
      items: state.items,
      count,
      total,
      isOpen,
      setOpen,
      add: (product) => {
        dispatch({ type: "add", product })
        setOpen(true)
      },
      remove: (id) => dispatch({ type: "remove", id }),
      setQty: (id, quantity) => dispatch({ type: "setQty", id, quantity }),
      setRentalDuration: (id, duration, unit) =>
        dispatch({ type: "setRentalDuration", id, duration, unit }),
      clear: () => dispatch({ type: "clear" }),
    }
  }, [state.items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Package,
  Plus,
  Edit,
  Trash2,
  Printer,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, type Product, type CategoryId, type Platform } from "@/lib/products"
import { type Order, type OrderItem } from "@/lib/db"

const AVAILABLE_IMAGES = [
  { path: "/products/iphone-pro.png", label: "iPhone" },
  { path: "/products/android-phone.png", label: "Android" },
  { path: "/products/macbook.png", label: "MacBook" },
  { path: "/products/windows-laptop.png", label: "PC Portable" },
  { path: "/products/tablet.png", label: "Tablette" },
  { path: "/products/earbuds.png", label: "Écouteurs" },
  { path: "/products/headphones.png", label: "Casque" },
  { path: "/products/smartwatch.png", label: "Montre" },
  { path: "/products/keyboard.png", label: "Clavier" },
  { path: "/products/mouse.png", label: "Souris" },
  { path: "/products/charger.png", label: "Chargeur" },
  { path: "/products/hero-devices.png", label: "Appareils" },
]

export function AdminDashboard({
  initialProducts,
  initialOrders,
}: {
  initialProducts: Product[]
  initialOrders: Order[]
}) {
  // Access control states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false)
  const [passcodeError, setPasscodeError] = useState("")

  // File upload states
  const [isUploading, setIsUploading] = useState(false)
  const [customImages, setCustomImages] = useState<{ path: string; label: string }[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin_authenticated")
      if (auth === "true") {
        setIsAuthenticated(true)
      }
    }
  }, [])

  async function handleVerifyPasscode(e: React.FormEvent) {
    e.preventDefault()
    if (!passcode) return

    setIsVerifyingPasscode(true)
    setPasscodeError("")

    try {
      const res = await fetch("/api/admin/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Code d'accès incorrect.")
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_authenticated", "true")
      }
      setIsAuthenticated(true)
    } catch (err: any) {
      setPasscodeError(err.message || "Erreur de connexion.")
    } finally {
      setIsVerifyingPasscode(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur de téléchargement.")

      // Add to custom list and select it
      setCustomImages((prev) => [...prev, { path: data.path, label: data.name }])
      setPImage(data.path)
    } catch (err: any) {
      alert(err.message || "Impossible de télécharger l'image.")
    } finally {
      setIsUploading(false)
      // Reset input value to allow uploading same file again if needed
      e.target.value = ""
    }
  }

  // Hero Image Settings State & Helpers
  const [heroImage, setHeroImage] = useState("/products/hero-devices.png")

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.settings?.hero_image) {
            setHeroImage(data.settings.hero_image)
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
      }
    }
    loadSettings()
  }, [])

  async function handleUpdateHeroImage(path: string) {
    setHeroImage(path)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hero_image", value: path }),
      })
      if (!res.ok) throw new Error("Erreur de sauvegarde.")
    } catch (err: any) {
      alert("Impossible de sauvegarder le paramètre : " + err.message)
    }
  }

  async function handleHeroImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur de téléchargement.")

      await handleUpdateHeroImage(data.path)
    } catch (err: any) {
      alert(err.message || "Impossible de charger l'image.")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const [activeTab, setActiveTab] = useState<"stats" | "products" | "orders" | "settings">("stats")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isDeletingOrders, setIsDeletingOrders] = useState(false)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "primary"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  // Play a door-chime (ding-dong) when a new client order arrives
  function playChimeSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const audioCtx = new AudioContextClass()
      
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        osc.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        
        osc.type = "sine"
        osc.frequency.setValueAtTime(frequency, startTime)
        
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
        
        osc.start(startTime)
        osc.stop(startTime + duration)
      }
      
      // First note (ding) - E5
      playNote(659.25, audioCtx.currentTime, 0.4)
      // Second note (dong) - C5
      playNote(523.25, audioCtx.currentTime + 0.18, 0.6)
    } catch (e) {
      console.error("Audio playback error:", e)
    }
  }

  // Real-time polling for new orders (every 10 seconds when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true

    async function pollOrders() {
      try {
        const res = await fetch("/api/admin/orders")
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.orders && isMounted) {
          setOrders((prevOrders) => {
            // Check if there is any new order that wasn't in state
            const hasNewOrder = data.orders.some(
              (newOrder: any) => !prevOrders.some((oldOrder) => oldOrder.id === newOrder.id)
            )

            if (hasNewOrder && prevOrders.length > 0) {
              playChimeSound()
            }
            return data.orders
          })
        }
      } catch (err) {
        console.error("Error polling orders:", err)
      }
    }

    const interval = setInterval(pollOrders, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isAuthenticated])

  // Search & Filter states
  const [productSearch, setProductSearch] = useState("")
  const [orderSearch, setOrderSearch] = useState("")

  // Modal / Form states for Product Add/Edit
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null) // null means adding
  const [pId, setPId] = useState("")
  const [pName, setPName] = useState("")
  const [pBrand, setPBrand] = useState("")
  const [pCategory, setPCategory] = useState<CategoryId>("smartphones")
  const [pPlatform, setPPlatform] = useState<Platform>("universel")
  const [pPrice, setPPrice] = useState("")
  const [pOldPrice, setPOldPrice] = useState("")
  const [pImage, setPImage] = useState("")
  const [pBadge, setPBadge] = useState("")
  const [pSpecs, setPSpecs] = useState("")
  
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)
  const [formError, setFormError] = useState("")

  // --- STATS CALCULATION ---
  const deliveredOrders = orders.filter((o) => o.status === "Livré")
  const totalRevenue = deliveredOrders.reduce((acc, curr) => acc + curr.total_price, 0)
  const pendingOrdersCount = orders.filter((o) => o.status === "En attente" || o.status === "En cours de livraison").length
  const totalProductsCount = products.length

  // --- PRODUCT ACTIONS ---
  function openAddModal() {
    setEditingProduct(null)
    setPId("")
    setPName("")
    setPBrand("")
    setPCategory("smartphones")
    setPPlatform("universel")
    setPPrice("")
    setPOldPrice("")
    setPImage("/products/iphone-pro.png")
    setPBadge("")
    setPSpecs("")
    setFormError("")
    setIsProductModalOpen(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setPId(product.id)
    setPName(product.name)
    setPBrand(product.brand)
    setPCategory(product.category)
    setPPlatform(product.platform)
    setPPrice(product.price.toString())
    setPOldPrice(product.oldPrice ? product.oldPrice.toString() : "")
    setPImage(product.image)
    setPBadge(product.badge || "")
    setPSpecs(product.specs.join("\n"))
    setFormError("")
    setIsProductModalOpen(true)
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pName || !pBrand || !pPrice) {
      setFormError("Veuillez remplir les champs obligatoires.")
      return
    }

    setIsSubmittingProduct(true)
    setFormError("")

    // 1. Auto-generate Slug ID if adding a new product
    const generatedId = editingProduct
      ? editingProduct.id
      : pName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `prod-${Math.floor(1000 + Math.random() * 9000)}`

    // 2. Auto-infer Platform
    const inferredPlatform: Platform = (() => {
      if (editingProduct) return editingProduct.platform

      const b = pBrand.toLowerCase()
      if (b.includes("apple") || b.includes("iphone") || b.includes("ipad") || b.includes("mac")) return "apple"
      if (b.includes("samsung") || b.includes("google") || b.includes("xiaomi")) return "android"
      if (b.includes("microsoft") || b.includes("dell") || b.includes("hp") || b.includes("lenovo") || b.includes("windows")) return "windows"
      
      if (pCategory === "smartphones" || pCategory === "tablettes") return "android"
      if (pCategory === "ordinateurs") return "windows"
      return "universel"
    })()

    // 3. Auto-infer Image
    const inferredImage = (() => {
      if (editingProduct) return editingProduct.image

      const nameLower = pName.toLowerCase()
      if (pCategory === "smartphones") {
        return pBrand.toLowerCase().includes("apple")
          ? "/products/iphone-pro.png"
          : "/products/android-phone.png"
      }
      if (pCategory === "ordinateurs" || pCategory === "location") {
        return pBrand.toLowerCase().includes("apple")
          ? "/products/macbook.png"
          : "/products/windows-laptop.png"
      }
      if (pCategory === "tablettes") {
        return "/products/tablet.png"
      }
      if (pCategory === "accessoires") {
        if (nameLower.includes("casque") || nameLower.includes("headphone") || nameLower.includes("son")) return "/products/headphones.png"
        if (nameLower.includes("clavier") || nameLower.includes("keyboard")) return "/products/keyboard.png"
        if (nameLower.includes("souris") || nameLower.includes("mouse")) return "/products/mouse.png"
        if (nameLower.includes("montre") || nameLower.includes("watch")) return "/products/smartwatch.png"
        if (nameLower.includes("charge")) return "/products/charger.png"
        return "/products/earbuds.png"
      }
      return "/products/placeholder.png"
    })()

    // 4. Auto-generate specs
    const defaultSpecs = (() => {
      if (editingProduct) return editingProduct.specs

      if (pCategory === "smartphones") {
        return ["Écran Haute Résolution", "Appareil photo de qualité", "Garantie BAOLAB INFO"]
      }
      if (pCategory === "ordinateurs") {
        return ["Performances optimales", "Stockage SSD rapide", "Garantie BAOLAB INFO"]
      }
      if (pCategory === "tablettes") {
        return ["Écran tactile fluide", "Idéal divertissement & travail", "Garantie BAOLAB INFO"]
      }
      if (pCategory === "location") {
        return ["Idéal séminaires & formations", "Matériel révisé et prêt", "Garantie de bon fonctionnement"]
      }
      return ["Matériau durable", "Performance certifiée", "Garantie BAOLAB INFO"]
    })()

    const productPayload = {
      id: generatedId,
      name: pName.trim(),
      brand: pBrand.trim(),
      category: pCategory,
      platform: inferredPlatform,
      price: Number(pPrice),
      oldPrice: editingProduct?.oldPrice || undefined,
      image: pImage || inferredImage,
      badge: pBadge.trim() || undefined,
      specs: defaultSpecs,
    }

    try {
      const isEdit = !!editingProduct
      const url = isEdit ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.")

      if (isEdit) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)))
      } else {
        setProducts((prev) => [...prev, data.product])
      }

      setIsProductModalOpen(false)
    } catch (err: any) {
      setFormError(err.message || "Erreur de communication avec le serveur.")
    } finally {
      setIsSubmittingProduct(false)
    }
  }

  function handleDeleteProduct(id: string) {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer le produit",
      message: "Voulez-vous vraiment supprimer ce produit du catalogue ? Cette action est irréversible.",
      variant: "destructive",
      confirmText: "Supprimer",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: "DELETE",
          })

          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || "Erreur lors de la suppression.")
          }

          setProducts((prev) => prev.filter((p) => p.id !== id))
        } catch (err: any) {
          alert(err.message || "Erreur lors de la suppression.")
        }
      }
    })
  }

  // --- ORDER ACTIONS ---
  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur de mise à jour du statut.")
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err: any) {
      alert(err.message || "Impossible de mettre à jour le statut.")
    }
  }

  function handleDeleteAllOrders() {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer toutes les commandes",
      message: "Voulez-vous vraiment supprimer TOUTES les commandes ? Cette action effacera définitivement l'historique de votre boutique et est irréversible.",
      variant: "destructive",
      confirmText: "Tout supprimer",
      onConfirm: async () => {
        setIsDeletingOrders(true)
        try {
          const res = await fetch("/api/admin/orders", {
            method: "DELETE",
          })

          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || "Erreur de suppression des commandes.")
          }

          setOrders([])
        } catch (err: any) {
          alert(err.message || "Impossible de supprimer les commandes.")
        } finally {
          setIsDeletingOrders(false)
        }
      }
    })
  }

  // --- FILTERING ---
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_address.toLowerCase().includes(orderSearch.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
        <div className="w-full max-w-sm bg-background border border-border rounded-xl p-6 shadow-xl text-center">
          <div className="flex justify-center mb-4">
            <span className="p-3 bg-primary/10 rounded-full text-primary">
              <Package className="size-8" />
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Accès Administration</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            Cet espace est protégé. Entrez le code d'accès administrateur pour continuer.
          </p>

          <form onSubmit={handleVerifyPasscode} className="flex flex-col gap-4">
            {passcodeError && (
              <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive font-semibold">
                {passcodeError}
              </div>
            )}

            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="adminPasscode" className="text-xs font-semibold text-muted-foreground">
                Code d'accès <span className="text-destructive">*</span>
              </label>
              <input
                id="adminPasscode"
                type="password"
                required
                disabled={isVerifyingPasscode}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Entrez le code"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-center font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <Button type="submit" disabled={isVerifyingPasscode} className="w-full gap-2">
              {isVerifyingPasscode ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Accéder"
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/20 pb-16">
      {/* Admin Nav */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">
              BAOLAB INFO <span className="text-primary text-sm font-semibold">Administration</span>
            </span>
          </div>
          <a
            href="/"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Retourner au site
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-background rounded-t-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
              activeTab === "stats"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            Tableau de Bord
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
              activeTab === "products"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            Produits ({totalProductsCount})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
              activeTab === "orders"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            Paramètres
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-background p-6 rounded-b-xl border-x border-b border-border shadow-sm">
          {/* TAB 1: STATS */}
          {activeTab === "stats" && (
            <div className="flex flex-col gap-8">
              {/* Stats Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card */}
                <div className="rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Revenus</span>
                    <TrendingUp className="size-5 text-emerald-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Sur commandes livrées</p>
                </div>

                {/* Orders Card */}
                <div className="rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Commandes</span>
                    <ShoppingBag className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-foreground">{orders.length}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Commandes au total</p>
                </div>

                {/* Pending Card */}
                <div className="rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Livraisons</span>
                    <Clock className="size-5 text-amber-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-foreground">{pendingOrdersCount}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">En attente / En cours</p>
                </div>

                {/* Products Card */}
                <div className="rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Catalogue</span>
                    <Package className="size-5 text-blue-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-foreground">{totalProductsCount}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Produits enregistrés</p>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="border border-border rounded-xl p-5">
                <h3 className="text-base font-semibold mb-4 text-foreground">Commandes récentes</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune commande enregistrée pour le moment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground font-semibold uppercase">
                          <th className="pb-3">Réf</th>
                          <th className="pb-3">Client</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders.slice(0, 5).map((o, idx) => (
                          <tr key={`${o.id}-${idx}`} className="text-foreground">
                            <td className="py-3.5 font-medium">{o.id}</td>
                            <td className="py-3.5">{o.customer_name}</td>
                            <td className="py-3.5 text-xs text-muted-foreground">
                              {o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "-"}
                            </td>
                            <td className="py-3.5 font-semibold text-primary">{formatPrice(o.total_price)}</td>
                            <td className="py-3.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  o.status === "Livré"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : o.status === "En cours de livraison"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : o.status === "Annulé"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-secondary text-secondary-foreground"
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <div className="flex flex-col gap-6">
              {/* Product Actions & Search */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <Button onClick={openAddModal} className="w-full sm:w-auto gap-1.5">
                  <Plus className="size-4" />
                  Ajouter un produit
                </Button>
              </div>

              {/* Products Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/10 text-xs text-muted-foreground font-semibold uppercase">
                        <th className="p-4">Produit</th>
                        <th className="p-4">Catégorie</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Badge</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Aucun produit ne correspond à votre recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p, idx) => (
                          <tr key={`${p.id}-${idx}`} className="hover:bg-secondary/5 text-foreground">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="size-10 shrink-0 overflow-hidden rounded bg-secondary p-0.5">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="size-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg"
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate max-w-xs">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">{p.brand} • {p.platform}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 capitalize">{p.category}</td>
                            <td className="p-4 font-semibold text-primary">
                              {formatPrice(p.price)}
                              {p.category === "location" && <span className="text-xs font-normal text-muted-foreground"> / jour</span>}
                            </td>
                            <td className="p-4">
                              {p.badge && (
                                <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                                  {p.badge}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => openEditModal(p)}
                                  className="text-muted-foreground hover:text-primary"
                                  aria-label="Modifier"
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-6">
              {/* Order Search & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher par client, adresse, téléphone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                {orders.length > 0 && (
                  <Button
                    onClick={handleDeleteAllOrders}
                    variant="destructive"
                    className="gap-1.5 text-xs h-9 animate-fade-in"
                    size="sm"
                    disabled={isDeletingOrders}
                  >
                    <Trash2 className="size-4" />
                    Supprimer toutes les commandes
                  </Button>
                )}
              </div>

              {/* Orders Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/10 text-xs text-muted-foreground font-semibold uppercase">
                        <th className="p-4">Réf & Client</th>
                        <th className="p-4">Date & Total</th>
                        <th className="p-4">Adresse de livraison</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Aucune commande ne correspond à votre recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o, idx) => (
                          <tr key={`${o.id}-${idx}`} className="hover:bg-secondary/5 align-top text-foreground">
                            <td className="p-4">
                              <p className="font-bold">{o.id}</p>
                              <p className="font-medium text-sm mt-1">{o.customer_name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{o.customer_phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-muted-foreground">
                                {o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "-"}
                              </p>
                              <p className="font-bold text-primary text-base mt-1">{formatPrice(o.total_price)}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {o.items?.length} article{o.items && o.items.length > 1 ? "s" : ""}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm max-w-xs leading-relaxed text-balance">{o.customer_address}</p>
                              <div className="mt-2 text-xs bg-secondary/40 p-2 rounded max-w-xs">
                                <p className="font-semibold text-[10px] text-muted-foreground uppercase mb-1">Détails articles :</p>
                                <ul className="divide-y divide-border/40">
                                  {o.items?.map((item, idx) => (
                                    <li key={idx} className="py-1 flex justify-between text-xs">
                                      <span className="truncate max-w-[180px]">{item.product_name}</span>
                                      <span className="font-medium text-muted-foreground">x{item.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                            <td className="p-4">
                              <select
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                className={`rounded px-2.5 py-1 text-xs font-semibold outline-none border border-border cursor-pointer bg-background ${
                                  o.status === "Livré"
                                    ? "text-emerald-600 border-emerald-500/20"
                                    : o.status === "En cours de livraison"
                                    ? "text-amber-600 border-amber-500/20"
                                    : o.status === "Annulé"
                                    ? "text-destructive border-destructive/20"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <option value="En attente">En attente</option>
                                <option value="En cours de livraison">En cours</option>
                                <option value="Livré">Livré</option>
                                <option value="Annulé">Annulé</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex flex-col gap-1.5 w-28 ml-auto">
                                {/* WhatsApp button */}
                                <a
                                  href={`https://wa.me/${o.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                    `Bonjour ${o.customer_name} 👋,\n\nNous avons bien reçu votre commande *${o.id}* sur BAOLAB INFO.\n\nMontant total : *${formatPrice(o.total_price)}*\nAdresse de livraison : ${o.customer_address}\n\nNous vous contactons pour confirmer la livraison. Merci de votre confiance ! 🙏`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 transition-colors w-full"
                                >
                                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                  WhatsApp
                                </a>
                                {/* Phone call button */}
                                <a
                                  href={`tel:${o.customer_phone.replace(/\D/g, "")}`}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1.5 transition-colors w-full"
                                >
                                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                  </svg>
                                  Appeler
                                </a>
                                {/* Print receipt button */}
                                <Button
                                  onClick={() => window.open(`/admin/print/${o.id}`, "_blank")}
                                  className="gap-1.5 text-xs h-[30px] w-full"
                                  size="xs"
                                  variant="outline"
                                >
                                  <Printer className="size-3.5" />
                                  Facture PDF
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Paramètres du Site</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configurez et personnalisez les images et sections de la page d'accueil.
                </p>
              </div>

              <div className="border border-border rounded-lg p-6 bg-secondary/15 flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-foreground">Bannière principale (Hero Image)</h4>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez une image d'appareil prédéfinie ou téléversez une image personnalisée pour remplacer la bannière de la page d'accueil.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {AVAILABLE_IMAGES.map((img) => (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => handleUpdateHeroImage(img.path)}
                        className={`rounded px-3 py-1 text-xs font-medium border transition-colors ${
                          heroImage === img.path
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="relative">
                      <input
                        id="heroImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="heroImageUpload"
                        className={`inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:bg-primary/90 cursor-pointer transition-colors ${
                          isUploading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        <Upload className="size-3.5" />
                        Téléverser une image personnalisée
                      </label>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 aspect-[4/3] rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center relative shadow-inner shrink-0">
                  <img
                    src={heroImage}
                    alt="Aperçu Hero Image"
                    className="size-full object-cover p-1"
                  />
                  <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur rounded px-2 py-0.5 text-[10px] font-semibold">
                    Aperçu
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="relative w-full max-w-xl bg-background rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold text-foreground">
                {editingProduct ? `Modifier le produit : ${editingProduct.name}` : "Ajouter un produit"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {formError && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pName" className="text-xs font-semibold text-foreground">
                    Nom du produit <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="pName"
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="ex: iPhone 15 Pro 256 Go"
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pBrand" className="text-xs font-semibold text-foreground">
                    Marque <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="pBrand"
                    type="text"
                    required
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    placeholder="ex: Apple"
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pCategory" className="text-xs font-semibold text-foreground">
                    Catégorie <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="pCategory"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as CategoryId)}
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="smartphones">Smartphones</option>
                    <option value="ordinateurs">Ordinateurs</option>
                    <option value="tablettes">Tablettes</option>
                    <option value="accessoires">Accessoires</option>
                    <option value="location">Location d'ordinateurs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pPrice" className="text-xs font-semibold text-foreground">
                    Prix (FCFA) <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="pPrice"
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="ex: 749000"
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  {pCategory === "location" && (
                    <span className="text-[10px] text-primary font-medium">
                      ℹ️ Affiché comme prix / jour pour la location
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="pBadge" className="text-xs font-semibold text-foreground">
                    Badge de vente (ex: Promo, Nouveau, optionnel)
                  </label>
                  <input
                    id="pBadge"
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    placeholder="ex: Promo"
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground">
                  Image du produit <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 max-h-48 overflow-y-auto border border-border rounded-lg p-2 bg-secondary/10">
                  {[...AVAILABLE_IMAGES, ...customImages].map((img) => {
                    const isSelected = pImage === img.path
                    return (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => setPImage(img.path)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 bg-background transition-all hover:bg-secondary/20 ${
                          isSelected
                            ? "border-primary ring-1 ring-primary"
                            : "border-transparent"
                        }`}
                      >
                        <div className="size-10 overflow-hidden flex items-center justify-center mb-1">
                          <img
                            src={img.path}
                            alt={img.label}
                            className="size-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground truncate w-full text-center">
                          {img.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground">
                  Ou téléchargez une image depuis votre appareil (ordi ou tel)
                </label>
                <div className="flex items-center gap-3">
                  <label className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-4 px-3 text-xs font-semibold cursor-pointer bg-secondary/5 hover:bg-secondary/15 transition-all text-center ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                    {isUploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-primary" />
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 text-muted-foreground" />
                        Choisir un fichier (photo ou image)
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {pImage && (
                    <div className="size-14 border border-border rounded-lg bg-secondary/15 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                      <img src={pImage} alt="Aperçu" className="size-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSubmittingProduct}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmittingProduct} className="gap-1.5">
                  {isSubmittingProduct ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-card border border-border p-6 shadow-2xl transition-all">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full shrink-0 ${
                confirmModal.variant === "destructive" 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-primary/10 text-primary"
              }`}>
                {confirmModal.variant === "destructive" ? (
                  <Trash2 className="size-6" />
                ) : (
                  <AlertCircle className="size-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground leading-6">
                  {confirmModal.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              >
                {confirmModal.cancelText || "Annuler"}
              </Button>
              <Button
                type="button"
                variant={confirmModal.variant === "destructive" ? "destructive" : "default"}
                onClick={() => {
                  confirmModal.onConfirm()
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }}
              >
                {confirmModal.confirmText || "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

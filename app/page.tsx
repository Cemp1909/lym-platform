"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "./products";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { ThemeToggle } from "./theme-toggle";
import {
  sanitizeEmail,
  sanitizeLongText,
  sanitizePhone,
  sanitizeText,
} from "./security/sanitize";
import { createSupabaseBrowserClient } from "./supabase/browser";
import { whatsappMessages, whatsappUrl } from "./whatsapp";
import {
  ArrowLeft,
  BadgePercent,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Heart,
  KeyRound,
  Landmark,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PackageSearch,
  Scale,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Trash2,
  Truck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

const zones = [
  { name: "Recoger en punto", price: 0 },
  { name: "Villavicencio centro", price: 6000 },
  { name: "Villavicencio norte/sur", price: 9000 },
  { name: "Acacías / Restrepo", price: 18000 },
];
const paymentMethods = [
  {
    id: "pse",
    name: "PSE",
    helper: "Débito desde tu banco",
    icon: Landmark,
  },
  {
    id: "nequi",
    name: "Nequi",
    helper: "Pago con número celular",
    icon: Smartphone,
  },
  {
    id: "card",
    name: "Tarjeta",
    helper: "Crédito o débito",
    icon: CreditCard,
  },
];
const currentUserStorageKey = "lym-current-user";
const brandOptions = ["Todas", "LYM", "AquaClear", "PiscinaPro", "PoolTech"];

type CustomerSession = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  sessionToken: string;
  role?: string;
  authenticatedAt?: string;
};

type CustomerOrder = {
  id: string;
  status: string;
  eta?: string;
  address: string;
  total: string;
  items: number;
};

function money(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductPhoto({ product }: { product: Product }) {
  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_16%,rgba(0,180,216,.16),transparent_32%),linear-gradient(145deg,#ffffff_0%,#F1FAFC_100%)]" />
      <div className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-[#0A3D5C] shadow-sm">
        {product.category}
      </div>
      <Image
        src={product.image}
        alt={product.name}
        width={270}
        height={270}
        className="relative z-0 h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
      />
    </div>
  );
}

function productBrand(product: Product) {
  return brandOptions[(product.id % (brandOptions.length - 1)) + 1];
}

function availabilityLabel(stock: number) {
  if (stock <= 0) return ["Agotado temporalmente", "bg-[#FFF4EF] text-[#C2441A]"];
  if (stock <= 1) return ["Consultar disponibilidad", "bg-[#EAF8FC] text-[#0084A3]"];
  return ["Disponible para confirmar", "bg-[#EDFFF5] text-[#116A3C]"];
}

const featuredProductIds = [1, 2, 4, 8];

function sanitizeLoginIdentifier(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._%+\-@]/g, "")
    .slice(0, 120);
}

export default function Home() {
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorProblem, setAdvisorProblem] = useState("");
  const [category, setCategory] = useState("Todos");
  const [availabilityFilter, setAvailabilityFilter] = useState("Todos");
  const [priceFilter, setPriceFilter] = useState("Todos");
  const [brandFilter, setBrandFilter] = useState("Todas");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isClientPanelOpen, setIsClientPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(
    null,
  );
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [zone, setZone] = useState(zones[1].name);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    notes: "",
  });
  const [currentUser, setCurrentUser] = useState<CustomerSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authIntent, setAuthIntent] = useState<"account" | "checkout">(
    "account",
  );
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"cart" | "wompi" | "approved">(
    "cart",
  );
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const dynamicCategories = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(storeProducts.map((product) => product.category)),
      ).sort(),
    ],
    [storeProducts],
  );

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const matchesQuery = product.name
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesAvailability =
        availabilityFilter === "Todos" ||
        (availabilityFilter === "Disponibilidad por confirmar" && product.stock > 0) ||
        (availabilityFilter === "Favoritos" && favorites[product.id]);
      const matchesPrice =
        priceFilter === "Todos" ||
        (priceFilter === "Con precio" && product.price !== null) ||
        (priceFilter === "Por cotizar" && product.price === null);
      const matchesBrand =
        brandFilter === "Todas" || productBrand(product) === brandFilter;

      return (
        matchesCategory &&
        matchesQuery &&
        matchesAvailability &&
        matchesPrice &&
        matchesBrand
      );
    });
  }, [
    availabilityFilter,
    brandFilter,
    category,
    favorites,
    priceFilter,
    query,
    storeProducts,
  ]);
  const searchSuggestions = query.trim()
    ? storeProducts
        .filter((product) =>
          product.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 5)
    : storeProducts.slice(0, 5);

  const cartItems = storeProducts
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, quantity: cart[product.id] }));
  const hasPendingPrices = cartItems.some((item) => item.price === null);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price ?? 0) * item.quantity,
    0,
  );
  const shipping = zones.find((item) => item.name === zone)?.price ?? 0;
  const total = subtotal + shipping;
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const isPickup = zone === "Recoger en punto";
  const displayName =
    currentUser?.name || currentUser?.email.split("@")[0] || "Cliente";
  const favoriteProducts = storeProducts.filter((product) => favorites[product.id]);
  const trackedOrder =
    confirmedOrder ||
    customerOrders[0] || {
      id: trackingCode || "Sin pedidos",
      status: "Arma tu primer pedido",
      eta: "Pendiente",
      address: deliveryDetails.address || "Dirección pendiente por confirmar",
      total: "Por definir",
      items: 0,
    };
  const relatedProducts = selectedProduct
    ? storeProducts
        .filter(
          (product) =>
            product.category === selectedProduct.category &&
            product.id !== selectedProduct.id,
        )
        .slice(0, 3)
    : [];
  const compareProducts = storeProducts.filter((product) =>
    compareIds.includes(product.id),
  );
  const featuredProducts = featuredProductIds
    .map((id) => storeProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  const getAccessToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();

    return data.session?.access_token || "";
  }, []);

  const loadCurrentSupabaseUser = useCallback(async () => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      window.localStorage.removeItem(currentUserStorageKey);
      setCurrentUser(null);
      return;
    }

    const response = await fetch("/api/account/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) return;

    const payload = (await response.json()) as { user?: CustomerSession };
    if (!payload.user) return;

    const nextUser = {
      ...payload.user,
      sessionToken: payload.user.id,
      authenticatedAt: new Date().toISOString(),
    };

    setCurrentUser(nextUser);
    window.localStorage.setItem(currentUserStorageKey, JSON.stringify(nextUser));
  }, [getAccessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCurrentSupabaseUser().catch(() => setCurrentUser(null));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCurrentSupabaseUser]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) return;

      const payload = (await response.json()) as { products?: Product[] };
      if (!cancelled && payload.products?.length) {
        setStoreProducts(payload.products);
      }
    }

    loadProducts().catch(() => setStoreProducts([]));

    return () => {
      cancelled = true;
    };
  }, []);

  const loadCustomerOrders = useCallback(async (customerToken: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(
      accessToken
        ? "/api/orders"
        : `/api/orders?customerToken=${encodeURIComponent(customerToken)}`,
      {
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    );

    if (!response.ok) return;

    const payload = (await response.json()) as { orders?: CustomerOrder[] };
    setCustomerOrders(payload.orders || []);
  }, [getAccessToken]);

  useEffect(() => {
    if (!currentUser?.sessionToken) return;

    const timer = window.setTimeout(() => {
      loadCustomerOrders(currentUser.sessionToken).catch(() => {
        setCustomerOrders([]);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentUser?.sessionToken, loadCustomerOrders]);

  function openAuth(mode: "login" | "register" = "register") {
    setAuthMode(mode);
    setAuthIntent("account");
    setAuthError("");
    setIsAuthOpen(true);
  }

  async function submitAuth() {
    if (isAuthSubmitting) return;

    setIsAuthSubmitting(true);
    setAuthError("");

    const loginIdentifier = sanitizeLoginIdentifier(authForm.email);
    const email = sanitizeEmail(loginIdentifier);
    const supabase = createSupabaseBrowserClient();

    try {
      if (!email) {
        throw new Error("Ingresa un correo válido.");
      }

      if (authMode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authForm.name,
            email,
            phone: authForm.phone,
            password: authForm.password,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error || "No se pudo crear la cuenta.");
        }
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: authForm.password,
      });

      if (loginError) throw loginError;

      await loadCurrentSupabaseUser();
      setAuthForm((current) => ({ ...current, password: "" }));
      setIsAuthOpen(false);
      if (authIntent === "checkout") {
        setIsCartOpen(true);
        setPaymentStep("wompi");
      }
      setAuthIntent("account");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function addProduct(id: number) {
    updateQuantity(id, (cart[id] ?? 0) + 1);
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleCompare(id: number) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-3);
    });
  }

  function openCart() {
    setIsCartOpen(true);
  }

  function continueToPayment() {
    if (!cartItems.length) return;

    if (!currentUser) {
      setAuthMode("register");
      setAuthIntent("checkout");
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }

    if (!isPickup) {
      const missingDeliveryData =
        !deliveryDetails.name.trim() ||
        !deliveryDetails.phone.trim() ||
        !deliveryDetails.address.trim() ||
        !deliveryDetails.neighborhood.trim();

      if (missingDeliveryData) {
        window.alert(
          "Completa nombre, teléfono, dirección y barrio para continuar con domicilio.",
        );
        return;
      }
    }

    setPaymentStep("wompi");
  }

  async function createOrderFromCart() {
    if (!currentUser || !cartItems.length || isCreatingOrder) return;

    setIsCreatingOrder(true);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          customerToken: currentUser.sessionToken,
          customerName: currentUser.name || displayName,
          customerEmail: currentUser.email,
          customerPhone: deliveryDetails.phone || currentUser.phone || "",
          deliveryMethod: isPickup ? "pickup" : "delivery",
          deliveryAddress: isPickup
            ? "Punto físico Distribuciones LYM"
            : deliveryDetails.address,
          deliveryZone: zone,
          deliveryNotes: deliveryDetails.notes,
          deliveryCost: shipping,
          subtotal,
          total,
          paymentMethod,
          items: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });

      if (!response.ok) {
        window.alert("No se pudo guardar el pedido en la base de datos.");
        return;
      }

      const payload = (await response.json()) as { order: CustomerOrder };
      setConfirmedOrder(payload.order);
      setTrackingCode(payload.order.id);
      setCustomerOrders((current) => [payload.order, ...current]);
      setPaymentStep("approved");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  function updateQuantity(id: number, nextQuantity: number) {
    setPaymentStep("cart");
    setCart((current) => {
      const copy = { ...current };

      if (nextQuantity <= 0) {
        delete copy[id];
      } else {
        copy[id] = nextQuantity;
      }

      return copy;
    });
  }

  function productWhatsAppUrl(product: Product) {
    return whatsappUrl(whatsappMessages.product(product.name, product.category));
  }

  function cartWhatsAppUrl() {
    const lines = cartItems.length
      ? cartItems
          .map((item) => `- ${item.quantity} x ${item.name}`)
          .join("\n")
      : "Quiero recibir asesoría para comprar productos de piscina.";
    return whatsappUrl(whatsappMessages.cart(lines, zone));
  }

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <header className="sticky top-0 z-30 border-b border-[#0A3D5C]/10 bg-[#F8FAFB]/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white p-1">
              <Image
                src="/brand/logo.png"
                alt="Logo LYM"
                width={56}
                height={49}
                className="h-full w-full object-contain"
                priority
                unoptimized
              />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none">
                Distribuciones LYM
              </p>
              <p className="text-xs text-[#617789]">Tienda Piscinas</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] px-3 py-2 text-sm font-medium text-[#36586C] md:flex">
            <ShieldCheck className="size-4 text-[#2FBF71]" />
            Pagos protegidos con Wompi
          </div>

          <nav className="hidden items-center gap-1 text-sm font-bold text-[#36586C] lg:flex">
            {[
              ["Tienda", "/"],
              ["Ofertas", "/ofertas"],
              ["Estado", "/estado-pedido"],
              ["Nosotros", "/nosotros"],
              ["Servicios", "/servicios"],
              ["Domicilios", "/domicilios"],
              ["Guías", "/guias"],
              ["Contacto", "/contacto"],
              ["Políticas", "/politicas"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-lg px-3 py-2 transition hover:bg-white hover:text-[#0A3D5C]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 bg-white text-[#0A3D5C] lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            {currentUser ? (
              <div className="hidden items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 py-2 text-sm font-bold text-[#0A3D5C] sm:flex">
                <UserRound className="size-4" />
                <button onClick={() => setIsClientPanelOpen(true)}>
                  {displayName}
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    createSupabaseBrowserClient().auth.signOut();
                    window.localStorage.removeItem(currentUserStorageKey);
                    setIsCartOpen(false);
                    setCart({});
                    setCustomerOrders([]);
                    setConfirmedOrder(null);
                    setTrackingCode("");
                  }}
                  className="ml-1 flex size-6 items-center justify-center rounded-md text-[#617789] hover:bg-[#F8FAFB]"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="hidden h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C] sm:flex"
              >
                <UserRound className="size-4" />
                Ingresar
              </button>
            )}
            <button
              onClick={() => setIsClientPanelOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold text-[#0A3D5C] md:flex"
            >
              <Heart className="size-4" />
              {favoriteProducts.length}
            </button>
            <button
              onClick={openCart}
              className="relative flex h-10 items-center gap-2 rounded-lg bg-[#FF6B35] px-4 text-sm font-bold text-white shadow-sm shadow-orange-950/15"
            >
              <ShoppingCart className="size-4" />
              Carrito
              {cartCount ? (
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-[#0A3D5C] text-xs font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm lg:hidden">
          <div className="ml-auto max-w-sm rounded-lg bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-bold">Menú</p>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Tienda", "/"],
                ["Ofertas", "/ofertas"],
                ["Estado del pedido", "/estado-pedido"],
                ["Nosotros", "/nosotros"],
                ["Servicios", "/servicios"],
                ["Domicilios", "/domicilios"],
                ["Guías", "/guias"],
                ["Contacto", "/contacto"],
                ["Políticas", "/politicas"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] px-4 py-3 text-sm font-bold text-[#0A3D5C]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="pool-depth relative grid overflow-hidden rounded-lg text-white lg:grid-cols-[1fr_360px]">
            <div className="water-grid absolute inset-0" />
            <div className="relative p-5 sm:p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-xs font-semibold ring-1 ring-white/16">
                <Sparkles className="size-4 text-[#00B4D8]" />
                Compra online, recoge o recibe en Villavicencio
              </div>
              <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
                Productos de piscina listos para comprar.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-cyan-50/84">
                Químicos, equipos y repuestos con precios claros, domicilio por
                zona y pago seguro con Wompi.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#catalogo"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 text-sm font-bold text-white shadow-lg shadow-orange-950/25 transition hover:bg-[#F45F28]"
                >
                  Comprar productos
                  <ChevronRight className="size-4" />
                </a>
                <button
                  onClick={openCart}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/18 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16"
                >
                  Ver carrito
                  <ShoppingCart className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-cyan-50/82">
                {[
                  "154 productos",
                  "Domicilio local",
                  "Pago seguro",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-md border border-white/12 bg-white/10 px-3 py-2"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative hidden min-h-[250px] overflow-hidden border-l border-white/12 bg-white/8 p-5 lg:block">
              <div className="absolute inset-x-8 top-10 h-32 rounded-full bg-[#00B4D8]/24 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between rounded-lg bg-white p-4 shadow-xl">
                <div className="relative h-36">
                  <Image
                    src={storeProducts[0]?.image || "/brand/logo.png"}
                    alt={storeProducts[0]?.name || "Producto destacado LYM"}
                    fill
                    sizes="320px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[#00B4D8]">
                    Producto destacado
                  </p>
                  <p className="mt-1 line-clamp-2 font-display text-lg font-bold text-[#0A3D5C]">
                    {storeProducts[0]?.name || "Producto destacado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#0A3D5C]/10 bg-[#F8FAFB] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Productos destacados
              </p>
              <h2 className="font-display text-2xl font-bold">
                Referencias rápidas para empezar.
              </h2>
            </div>
            <a
              href="#catalogo"
              className="text-sm font-bold text-[#0A3D5C] hover:text-[#FF6B35]"
            >
              Ver catálogo completo
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-[#0A3D5C]/10 bg-white p-3 shadow-sm"
              >
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="relative aspect-square overflow-hidden rounded-lg bg-[#F8FAFB]"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="88px"
                    className="object-contain p-2"
                  />
                </button>
                <div className="min-w-0">
                  <p className="line-clamp-2 font-display text-base font-bold leading-5">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-[#617789]">
                    {product.category}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => addProduct(product.id)}
                      className="h-9 rounded-lg bg-[#FF6B35] px-3 text-xs font-bold text-white"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="h-9 rounded-lg border border-[#0A3D5C]/12 px-3 text-xs font-bold text-[#0A3D5C]"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
            {[
              [ShieldCheck, "Pago seguro", "Pedido guardado en base"],
              [Truck, "Domicilio local", "Tarifa por zona"],
              [MessageCircle, "Asesoría", "Compra por WhatsApp"],
              [ReceiptText, "Remisión", "Cotización imprimible"],
            ].map(([Icon, title, text]) => (
              <div
                key={title as string}
                className="flex items-center gap-3 rounded-lg border border-[#0A3D5C]/10 bg-white p-3"
              >
                <Icon className="size-5 text-[#00B4D8]" />
                <div>
                  <p className="font-bold text-[#0A3D5C]">{title as string}</p>
                  <p className="text-xs text-[#617789]">{text as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Catálogo
              </p>
              <h2 className="font-display text-2xl font-bold">
                Compra productos para tu piscina
              </h2>
              <p className="mt-1 text-sm text-[#617789]">
                {filteredProducts.length} productos visibles de {storeProducts.length}
              </p>
            </div>
            <label className="flex h-12 w-full items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-4 lg:max-w-xl">
              <Search className="size-5 shrink-0 text-[#617789]" />
              <input
                value={query}
                onChange={(event) =>
                  setQuery(sanitizeText(event.target.value, { maxLength: 80 }))
                }
                placeholder="Buscar por nombre, marca o tipo de producto"
                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-[#8A9AA6]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#617789] hover:bg-white hover:text-[#0A3D5C]"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#617789]">
              Sugerencias
            </span>
            {searchSuggestions.map((product) => (
              <button
                key={product.id}
                onClick={() => setQuery(product.name)}
                className="rounded-md border border-[#0A3D5C]/10 bg-[#F8FAFB] px-3 py-1.5 text-xs font-bold text-[#0A3D5C] hover:border-[#00B4D8]/40"
              >
                {product.name.length > 28
                  ? `${product.name.slice(0, 28)}...`
                  : product.name}
              </button>
            ))}
            <button
              onClick={() => setIsAdvisorOpen(true)}
              className="ml-auto flex items-center gap-2 rounded-md bg-[#0A3D5C] px-3 py-1.5 text-xs font-bold text-white"
            >
              <HelpCircle className="size-4" />
              Asesor virtual
            </button>
          </div>

          <div className="mt-4 border-t border-[#0A3D5C]/10 pt-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#617789]">
                <SlidersHorizontal className="size-4" />
                Filtros
              </div>
              <a
                href={cartWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center gap-2 rounded-lg bg-[#0A3D5C] px-3 text-sm font-bold text-white"
              >
                <Send className="size-4" />
                Cotizar por WhatsApp
              </a>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dynamicCategories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold transition ${
                    category === item
                      ? "border-[#0A3D5C] bg-[#0A3D5C] text-white shadow-sm"
                      : "border-[#0A3D5C]/10 bg-[#F8FAFB] text-[#36586C] hover:border-[#00B4D8]/40 hover:bg-[#EAF8FC]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[180px_180px_180px_1fr_auto_auto_auto]">
              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
                className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm font-bold text-[#0A3D5C] outline-none"
              >
                <option>Todos</option>
                <option>Disponibilidad por confirmar</option>
                <option>Favoritos</option>
              </select>
              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
                className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm font-bold text-[#0A3D5C] outline-none"
              >
                <option>Todos</option>
                <option>Con precio</option>
                <option>Por cotizar</option>
              </select>
              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm font-bold text-[#0A3D5C] outline-none"
              >
                {brandOptions.map((brand) => (
                  <option key={brand}>{brand}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("Todos");
                  setAvailabilityFilter("Todos");
                  setPriceFilter("Todos");
                  setBrandFilter("Todas");
                }}
                className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold text-[#0A3D5C]"
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => setIsCompareOpen(true)}
                disabled={!compareIds.length}
                className="h-10 rounded-lg bg-[#0A3D5C] px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#C6D0D6]"
              >
                Comparar {compareIds.length || ""}
              </button>
              <button
                onClick={() => setIsQuoteOpen(true)}
                className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold text-[#0A3D5C]"
              >
                Vista cotización
              </button>
              <Link
                href="/cotizacion/LYM-CATALOGO"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold text-[#0A3D5C]"
              >
                <FileText className="size-4" />
                Catálogo PDF
              </Link>
            </div>
          </div>
        </div>

        {filteredProducts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group rounded-lg border border-[#0A3D5C]/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <button
                onClick={() => setSelectedProduct(product)}
                className="block w-full text-left"
              >
                <ProductPhoto product={product} />
              </button>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-[#EAF8FC] px-2 py-1 text-xs font-bold text-[#0084A3]">
                    {product.tag}
                  </span>
                  <span className="ml-2 rounded-md bg-[#F8FAFB] px-2 py-1 text-xs font-bold text-[#617789]">
                    {productBrand(product)}
                  </span>
                  <h2 className="mt-3 min-h-12 font-display text-lg font-bold leading-6">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#617789]">
                    {product.unit}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold ${availabilityLabel(product.stock)[1]}`}
                  >
                    {availabilityLabel(product.stock)[0]}
                  </span>
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                    favorites[product.id]
                      ? "border-[#FF6B35] bg-[#FFF4EF] text-[#FF6B35]"
                      : "border-[#0A3D5C]/12 bg-[#F8FAFB] text-[#617789]"
                  }`}
                  aria-label={`Favorito ${product.name}`}
                >
                  <Heart
                    className="size-4"
                    fill={favorites[product.id] ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                    <p className="font-display text-2xl font-bold text-[#0A3D5C]">
                      {product.price === null
                        ? "Cotizar"
                        : money(product.price)}
                    </p>
                  </div>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] gap-2">
                <button
                  onClick={() => addProduct(product.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-3 text-sm font-bold text-white transition hover:bg-[#F45F28]"
                >
                  <Plus className="size-4" />
                  Agregar
                </button>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex size-11 items-center justify-center rounded-lg border border-[#0A3D5C]/12 bg-white text-[#0A3D5C]"
                  aria-label={`Ver detalle ${product.name}`}
                >
                  <PackageSearch className="size-4" />
                </button>
                <button
                  onClick={() => toggleCompare(product.id)}
                  className={`flex size-11 items-center justify-center rounded-lg border ${
                    compareIds.includes(product.id)
                      ? "border-[#00B4D8] bg-[#EAF8FC] text-[#0084A3]"
                      : "border-[#0A3D5C]/12 bg-white text-[#0A3D5C]"
                  }`}
                  aria-label={`Comparar ${product.name}`}
                >
                  <Scale className="size-4" />
                </button>
                <a
                  href={productWhatsAppUrl(product)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-11 items-center justify-center rounded-lg border border-[#0A3D5C]/12 bg-white text-[#0A3D5C]"
                  aria-label={`Consultar ${product.name} por WhatsApp`}
                >
                  <Smartphone className="size-4" />
                </a>
              </div>
              <button
                onClick={() => setSelectedProduct(product)}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] text-sm font-bold text-[#0A3D5C]"
              >
                <FileText className="size-4" />
                Ver ficha técnica
              </button>
            </article>
          ))}
        </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#0A3D5C]/18 bg-white p-8 text-center">
            <PackageSearch className="mx-auto size-10 text-[#00B4D8]" />
            <h3 className="mt-3 font-display text-2xl font-bold">
              No encontramos productos con esos filtros
            </h3>
            <p className="mt-2 text-sm text-[#617789]">
              Limpia los filtros o escríbenos por WhatsApp para ayudarte a ubicar la referencia.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("Todos");
                setAvailabilityFilter("Todos");
                setPriceFilter("Todos");
              }}
              className="mt-4 h-10 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </section>

      <section className="border-t border-[#0A3D5C]/10 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Preguntas frecuentes
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              Respuestas rápidas antes de comprar.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              [
                "¿Puedo comprar productos sin precio?",
                "Sí. Agrégalos al carrito y solicita cotización por WhatsApp para confirmar valor y disponibilidad.",
              ],
              [
                "¿Hacen domicilio?",
                "Sí, se calcula por zona y se confirma antes de finalizar el pedido.",
              ],
              [
                "¿Puedo recoger en punto?",
                "Sí. Puedes elegir recogida y coordinar la entrega con el equipo de Distribuciones LYM.",
              ],
              [
                "¿El pago Wompi ya cobra?",
                "La tienda guarda el pedido en la base de datos. La conexión de cobro real con Wompi se activa al pasar a producción.",
              ],
            ].map(([question, answer]) => (
              <div
                key={question}
                className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4"
              >
                <p className="font-display text-lg font-bold">{question}</p>
                <p className="mt-2 text-sm leading-6 text-[#617789]">
                  {answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#062A3E] text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-lg bg-white">
              <Image
                src="/brand/logo.png"
                alt="Logo Distribuciones LYM"
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="font-display text-lg font-bold">
                Distribuciones LYM
              </p>
              <p className="text-sm text-cyan-50/72">
                Soluciones para su piscina.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-cyan-50/82">
            <a href="#catalogo" className="rounded-lg px-3 py-2 hover:bg-white/10">
              Productos
            </a>
            <a href="/nosotros" className="rounded-lg px-3 py-2 hover:bg-white/10">
              Nosotros
            </a>
            <a href="/servicios" className="rounded-lg px-3 py-2 hover:bg-white/10">
              Servicios
            </a>
            <a href="/contacto" className="rounded-lg px-3 py-2 hover:bg-white/10">
              Contacto
            </a>
          </div>
        </div>
      </footer>
      <FloatingWhatsApp />

      {selectedProduct ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto grid max-h-[calc(100vh-2rem)] max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl lg:grid-cols-[0.86fr_1.14fr]">
            <div className="relative min-h-[340px] bg-[#F8FAFB] p-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 bg-white text-[#36586C]"
                aria-label="Cerrar detalle"
              >
                <X className="size-5" />
              </button>
              <div className="relative h-full min-h-[320px] overflow-hidden rounded-lg bg-white">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="420px"
                  className="object-contain p-8"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                {selectedProduct.category}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
                {selectedProduct.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#617789]">
                Producto para mantenimiento, operación o reposición de piscinas.
                Confirma presentación, compatibilidad y precio antes de pagar.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Uso", "Mantenimiento y operación de piscina"],
                  ["Presentación", selectedProduct.unit],
                  ["Importante", "Validar compatibilidad antes de instalar o aplicar"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg bg-[#F8FAFB] p-3">
                    <p className="text-xs font-bold uppercase text-[#617789]">
                      {title}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0A3D5C]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[#F8FAFB] p-3">
                  <p className="text-xs font-bold uppercase text-[#617789]">
                    Precio
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-[#0A3D5C]">
                    {selectedProduct.price === null
                      ? "Cotizar"
                      : money(selectedProduct.price)}
                  </p>
                </div>
                <div className="rounded-lg bg-[#F8FAFB] p-3">
                  <p className="text-xs font-bold uppercase text-[#617789]">
                    Disponibilidad
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-[#0A3D5C]">
                    {availabilityLabel(selectedProduct.stock)[0]}
                  </p>
                </div>
                <div className="rounded-lg bg-[#F8FAFB] p-3">
                  <p className="text-xs font-bold uppercase text-[#617789]">
                    Etiqueta
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-[#0A3D5C]">
                    {selectedProduct.tag}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <button
                  onClick={() => addProduct(selectedProduct.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                >
                  <Plus className="size-4" />
                  Agregar
                </button>
                <button
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
                >
                  <Heart
                    className="size-4"
                    fill={favorites[selectedProduct.id] ? "currentColor" : "none"}
                  />
                  Favorito
                </button>
                <a
                  href={productWhatsAppUrl(selectedProduct)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
                >
                  <Smartphone className="size-4" />
                  WhatsApp
                </a>
              </div>
              <div className="mt-4 rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4">
                <p className="font-display text-lg font-bold">Ficha técnica</p>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p><span className="font-bold">Categoría:</span> {selectedProduct.category}</p>
                  <p><span className="font-bold">Presentación:</span> {selectedProduct.unit}</p>
                  <p><span className="font-bold">Disponibilidad:</span> {availabilityLabel(selectedProduct.stock)[0]}</p>
                  <p><span className="font-bold">Uso:</span> Piscinas residenciales y comerciales</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
                >
                  <FileText className="size-4" />
                  Descargar ficha PDF
                </button>
              </div>

              {relatedProducts.length ? (
                <div className="mt-6">
                  <p className="text-sm font-bold text-[#0A3D5C]">
                    Productos relacionados
                  </p>
                  <div className="mt-3 grid gap-2">
                    {relatedProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-3 rounded-lg bg-[#F8FAFB] p-2 text-left"
                      >
                        <div className="relative size-12 overflow-hidden rounded-lg bg-white">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{product.name}</p>
                          <p className="text-xs text-[#617789]">
                            {product.category}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isAdvisorOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-2xl rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#00B4D8]">
                  Asesor virtual
                </p>
                <h2 className="font-display text-3xl font-bold">
                  ¿Qué necesita tu piscina?
                </h2>
              </div>
              <button
                onClick={() => setIsAdvisorOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Agua verde", "Alguicida, cloro y cepillo"],
                ["Agua turbia", "Clarificador y prueba de pH"],
                ["Mantenimiento semanal", "Kit químico + recogehojas"],
                ["Equipo no aspira", "Manguera, aspiradora o bomba"],
              ].map(([problem, recommendation]) => (
                <button
                  key={problem}
                  onClick={() => {
                    setQuery(recommendation);
                    setAdvisorProblem(problem);
                    setIsAdvisorOpen(false);
                  }}
                  className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4 text-left hover:border-[#00B4D8]/40"
                >
                  <p className="font-display text-lg font-bold">{problem}</p>
                  <p className="mt-2 text-sm text-[#617789]">
                    Recomendado: {recommendation}
                  </p>
                </button>
              ))}
            </div>
            <a
              href={whatsappUrl(whatsappMessages.advisor(advisorProblem))}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
            >
              <MessageCircle className="size-4" />
              Hablar con asesor
            </a>
          </div>
        </div>
      ) : null}

      {isClientPanelOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto rounded-lg bg-white p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#00B4D8]">
                  Panel cliente
                </p>
                <h2 className="font-display text-3xl font-bold">
                  {currentUser ? displayName : "Tu espacio LYM"}
                </h2>
              </div>
              <button
                onClick={() => setIsClientPanelOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12"
                aria-label="Cerrar panel cliente"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4">
                <p className="font-display text-xl font-bold">Favoritos</p>
                <div className="mt-3 grid gap-2">
                  {favoriteProducts.length ? (
                    favoriteProducts.slice(0, 5).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-3 rounded-lg bg-white p-2 text-left"
                      >
                        <div className="relative size-12 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{product.name}</p>
                          <p className="text-xs text-[#617789]">
                            {product.category}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-lg bg-white p-3 text-sm text-[#617789]">
                      Marca productos con el corazón para guardarlos aquí.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                <p className="font-display text-xl font-bold">Estado reciente</p>
                <div className="mt-3 rounded-lg bg-[#F8FAFB] p-3">
                  <p className="font-bold">{trackedOrder.id}</p>
                  <p className="mt-1 text-sm text-[#617789]">
                    {trackedOrder.status} · {trackedOrder.eta}
                  </p>
                  <p className="mt-1 text-sm text-[#36586C]">
                    {trackedOrder.address}
                  </p>
                </div>
                <div className="mt-3 grid gap-2">
                  <Link
                    href={`/estado-pedido?pedido=${encodeURIComponent(trackingCode)}`}
                    className="flex h-10 items-center justify-center rounded-lg bg-[#0A3D5C] text-sm font-bold text-white"
                  >
                    Ver seguimiento
                  </Link>
                  <a
                    href={cartWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
                  >
                    <Send className="size-4" />
                    Cotizar carrito
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                <p className="font-display text-lg font-bold">Mis direcciones</p>
                <p className="mt-2 text-sm leading-6 text-[#617789]">
                  {deliveryDetails.address
                    ? deliveryDetails.address
                    : "Agrega tu dirección al finalizar el carrito para calcular el domicilio."}
                </p>
                <p className="mt-3 rounded-lg bg-[#F8FAFB] p-3 text-xs font-bold uppercase text-[#0A3D5C]">
                  Zona: {zone}
                </p>
              </div>

              <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                <p className="font-display text-lg font-bold">Mis cotizaciones</p>
                <p className="mt-2 text-sm leading-6 text-[#617789]">
                  Consulta tus pedidos guardados con productos, cantidades y estado.
                </p>
                <Link
                  href={`/cotizacion/${trackedOrder.id}`}
                  className="mt-3 flex h-10 items-center justify-center rounded-lg bg-[#0A3D5C] text-sm font-bold text-white"
                >
                  Ver cotización
                </Link>
              </div>

              <div className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4">
                <p className="font-display text-lg font-bold">Compra rápida</p>
                <p className="mt-2 text-sm leading-6 text-[#617789]">
                  Repite un pedido frecuente y continúa con el carrito sin
                  volver a buscar cada referencia.
                </p>
                <button
                  onClick={() => {
                    storeProducts
                      .slice(0, 3)
                      .forEach((product) => addProduct(product.id));
                    setIsClientPanelOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                >
                  <ShoppingCart className="size-4" />
                  Repetir pedido
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase text-[#00B4D8]">
                    Historial
                  </p>
                  <h3 className="font-display text-xl font-bold">
                    Pedidos y cotizaciones recientes
                  </h3>
                </div>
                <Link
                  href={`/estado-pedido?pedido=${encodeURIComponent(trackedOrder.id)}`}
                  className="text-sm font-bold text-[#0A3D5C] hover:text-[#FF6B35]"
                >
                  Ver seguimiento
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {(customerOrders.length ? customerOrders : [trackedOrder]).map((order) => (
                  <Link
                    key={order.id}
                    href={`/estado-pedido?pedido=${encodeURIComponent(order.id)}`}
                    className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3 transition hover:border-[#00B4D8]/40"
                  >
                    <p className="font-display text-lg font-bold">{order.id}</p>
                    <p className="mt-1 text-sm text-[#617789]">{order.status}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-[#00B4D8]">
                      {order.items} productos
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCompareOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-5xl overflow-y-auto rounded-lg bg-white p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#00B4D8]">
                  Comparador
                </p>
                <h2 className="font-display text-3xl font-bold">
                  Comparar productos
                </h2>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12"
                aria-label="Cerrar comparador"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {compareProducts.length ? (
                compareProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="260px"
                        className="object-contain p-4"
                      />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold">
                      {product.name}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#617789]">Marca</span>
                        <span className="font-bold">{productBrand(product)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#617789]">Categoría</span>
                        <span className="font-bold">{product.category}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#617789]">Disponibilidad</span>
                        <span className="font-bold">{availabilityLabel(product.stock)[0]}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#617789]">Precio</span>
                        <span className="font-bold text-[#FF6B35]">
                          {product.price === null ? "Cotizar" : money(product.price)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => addProduct(product.id)}
                      className="mt-4 h-10 w-full rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                    >
                      Agregar
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-[#F8FAFB] p-6 text-sm text-[#617789] md:col-span-3">
                  Selecciona productos con el ícono de comparar.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isQuoteOpen ? (
        <div className="print-surface fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-[#0A3D5C]/10 bg-white/95 p-4 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase text-[#00B4D8]">
                  Cotización
                </p>
                <h2 className="font-display text-2xl font-bold">
                  Pedido para revisión
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
                >
                  <FileText className="size-4" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setIsQuoteOpen(false)}
                  className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12"
                  aria-label="Cerrar cotización"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="print-card rounded-lg border border-[#0A3D5C]/10 p-5">
                <div className="flex flex-col gap-4 border-b border-[#0A3D5C]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
                      <Image
                        src="/brand/logo.png"
                        alt="Logo Distribuciones LYM"
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold">
                        Distribuciones LYM
                      </p>
                      <p className="text-sm text-[#617789]">
                        Cotización generada en tienda LYM
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#F8FAFB] p-3 text-sm">
                    <p className="font-bold">Cliente: {displayName}</p>
                    <p className="text-[#617789]">Entrega: {zone}</p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-[#0A3D5C]/10">
                  {cartItems.length ? (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2 border-b border-[#0A3D5C]/10 p-3 last:border-b-0 sm:grid-cols-[1fr_90px_140px]"
                      >
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-[#617789]">
                            {item.category}
                          </p>
                        </div>
                        <p className="text-sm font-bold">Cant. {item.quantity}</p>
                        <p className="text-sm font-bold text-[#FF6B35] sm:text-right">
                          {item.price === null
                            ? "Cotizar"
                            : money(item.price * item.quantity)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-[#617789]">
                      Agrega productos al carrito para generar la cotización.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between rounded-lg bg-[#F8FAFB] p-4 font-display text-xl font-bold">
                  <span>Total</span>
                  <span>{hasPendingPrices ? "Cotizar" : money(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isAuthOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/72 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto grid max-h-[calc(100vh-2rem)] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl lg:grid-cols-[0.92fr_1.08fr]">
            <div className="pool-depth relative hidden overflow-hidden p-6 text-white lg:block">
              <div className="water-grid absolute inset-0" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex size-14 items-center justify-center rounded-lg bg-white text-[#0A3D5C]">
                    <LockKeyhole className="size-7" />
                  </div>
                  <p className="text-xs font-bold uppercase text-[#8BE7F7]">
                    Cuenta LYM
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-bold leading-tight">
                    Compra más rápido y guarda tus pedidos.
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-cyan-50/82">
                    Puedes armar tu carrito libremente. Para pagar te pediremos
                    una cuenta y conservaremos todo lo que ya agregaste.
                  </p>
                </div>

                <div className="grid gap-3">
                  {[
                    "Historial de compras",
                    "Direcciones guardadas",
                    "Repetir pedido mensual",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border border-white/14 bg-white/10 p-3 text-sm font-semibold"
                    >
                      <Check className="size-4 text-[#8BE7F7]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#00B4D8]">
                    Acceso seguro
                  </p>
                  <h2 className="font-display text-3xl font-bold">
                    {authMode === "register"
                      ? "Crea tu cuenta"
                      : "Ingresa a tu cuenta"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#617789]">
                  {authMode === "register"
                      ? authIntent === "checkout"
                        ? "Tu carrito queda guardado. Crea tu cuenta para continuar al pago."
                        : "Te tomará menos de un minuto y podrás comprar desde el catálogo."
                      : "Entra para continuar con tu carrito y tus datos guardados."}
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthOpen(false)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-[#36586C] hover:bg-[#F8FAFB]"
                  aria-label="Cerrar login"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 rounded-lg bg-[#F8FAFB] p-1">
                <button
                  onClick={() => setAuthMode("register")}
                  className={`h-10 rounded-md text-sm font-bold ${
                    authMode === "register"
                      ? "bg-white text-[#0A3D5C] shadow-sm"
                      : "text-[#617789]"
                  }`}
                >
                  Crear cuenta
                </button>
                <button
                  onClick={() => setAuthMode("login")}
                  className={`h-10 rounded-md text-sm font-bold ${
                    authMode === "login"
                      ? "bg-white text-[#0A3D5C] shadow-sm"
                      : "text-[#617789]"
                  }`}
                >
                  Ingresar
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {authMode === "register" ? (
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Nombre completo
                    </span>
                    <div className="flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
                      <UserRound className="size-5 text-[#617789]" />
                      <input
                        value={authForm.name}
                        onChange={(event) =>
                          setAuthForm((current) => ({
                            ...current,
                            name: sanitizeText(event.target.value, { maxLength: 80 }),
                          }))
                        }
                        placeholder="Ej. Camilo Mora"
                        className="h-full w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </label>
                ) : null}

                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-[#0A3D5C]">
                    Correo electrónico
                  </span>
                  <div className="flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
                    <Mail className="size-5 text-[#617789]" />
                    <input
                      value={authForm.email}
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          email: sanitizeLoginIdentifier(event.target.value),
                        }))
                      }
                      placeholder="correo@ejemplo.com"
                      autoComplete="username"
                      className="h-full w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>

                {authMode === "register" ? (
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      WhatsApp
                    </span>
                    <div className="flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
                      <Smartphone className="size-5 text-[#617789]" />
                      <input
                        value={authForm.phone}
                        onChange={(event) =>
                          setAuthForm((current) => ({
                            ...current,
                            phone: sanitizePhone(event.target.value),
                          }))
                        }
                        placeholder="300 000 0000"
                        className="h-full w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </label>
                ) : null}

                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-[#0A3D5C]">
                    Contraseña
                  </span>
                  <div className="flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
                    <KeyRound className="size-5 text-[#617789]" />
                    <input
                      value={authForm.password}
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      type="password"
                      placeholder="••••••••"
                      className="h-full w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
              </div>

              <button
                onClick={submitAuth}
                disabled={isAuthSubmitting || !authForm.email || !authForm.password}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white shadow-lg shadow-orange-950/15 transition enabled:hover:bg-[#F45F28] disabled:cursor-not-allowed disabled:bg-[#C6D0D6]"
              >
                {authMode === "register" ? (
                  <>
                    <UserPlus className="size-4" />
                    {isAuthSubmitting
                      ? "Creando cuenta..."
                      : authIntent === "checkout"
                      ? "Crear cuenta y pagar"
                      : "Crear cuenta y continuar"}
                  </>
                ) : (
                  <>
                    <LockKeyhole className="size-4" />
                    {isAuthSubmitting ? "Ingresando..." : "Ingresar y continuar"}
                  </>
                )}
              </button>

              {authError ? (
                <div className="mt-3 rounded-lg border border-[#FFD4C4] bg-[#FFF4EF] px-3 py-2 text-sm font-bold text-[#C2441A]">
                  {authError}
                </div>
              ) : null}

              <div className="mt-4 rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3 text-sm text-[#617789]">
                La cuenta se crea en Supabase Auth y el perfil queda asociado a
                la tabla de clientes para pedidos, domicilios e historial.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCartOpen ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#0A3D5C]/10 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-[#0A3D5C] text-white">
                  <ShoppingCart className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[#00B4D8]">
                    {paymentStep === "cart"
                      ? "Carrito"
                      : paymentStep === "wompi"
                        ? "Pasarela de pago"
                        : "Confirmación"}
                  </p>
                  <h2 className="font-display text-2xl font-bold">
                    {paymentStep === "cart"
                      ? "Tu pedido"
                      : paymentStep === "wompi"
                        ? "Checkout Wompi"
                        : "Pedido creado"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-[#36586C] hover:bg-[#F8FAFB]"
                aria-label="Cerrar carrito"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="mb-4 rounded-lg border border-[#00B4D8]/18 bg-[#EAF8FC] p-3 text-sm text-[#36586C]">
                <span className="font-bold text-[#0A3D5C]">Base de datos activa:</span>{" "}
                al aprobar se crea un pedido real para seguimiento administrativo.
              </div>
              <div className="mb-4 grid gap-2 sm:grid-cols-3">
                {[
                  ["Carrito", paymentStep === "cart"],
                  ["Entrega y pago", paymentStep === "wompi"],
                  ["Confirmación", paymentStep === "approved"],
                ].map(([label, active], index) => (
                  <div
                    key={label as string}
                    className={`rounded-lg border p-3 text-sm font-bold ${
                      active
                        ? "border-[#00B4D8] bg-[#EAF8FC] text-[#0A3D5C]"
                        : "border-[#0A3D5C]/10 bg-[#F8FAFB] text-[#617789]"
                    }`}
                  >
                    <span className="mr-2 inline-flex size-6 items-center justify-center rounded-md bg-white text-xs">
                      {index + 1}
                    </span>
                    {label as string}
                  </div>
                ))}
              </div>
              {paymentStep === "cart" ? (
                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-3">
                    {cartItems.length ? (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid gap-3 rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3 sm:grid-cols-[1fr_auto]"
                        >
                          <div>
                            <p className="font-display text-lg font-bold leading-6">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-[#617789]">
                              {item.price === null
                                ? "Precio a cotizar"
                                : money(item.price)}{" "}
                              · {item.unit}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="flex size-9 items-center justify-center rounded-md border border-[#0A3D5C]/12 bg-white"
                                aria-label={`Restar ${item.name}`}
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="w-9 text-center font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="flex size-9 items-center justify-center rounded-md border border-[#0A3D5C]/12 bg-white"
                                aria-label={`Sumar ${item.name}`}
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <p className="font-display text-xl font-bold text-[#0A3D5C]">
                              {item.price === null
                                ? "Cotizar"
                                : money(item.price * item.quantity)}
                            </p>
                            <button
                              onClick={() => updateQuantity(item.id, 0)}
                              className="flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[#8A3A2A] hover:bg-[#FFF0EA]"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              <Trash2 className="size-4" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#0A3D5C]/18 p-8 text-center text-sm text-[#617789]">
                        Agrega productos para preparar el pedido.
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
                    <h3 className="font-display text-xl font-bold">
                      Datos de compra
                    </h3>
                    <div className="mt-4 rounded-lg bg-[#F8FAFB] p-3">
                      <label className="text-sm font-bold text-[#0A3D5C]">
                        ¿Cómo quieres recibirlo?
                      </label>
                      <select
                        value={zone}
                        onChange={(event) => {
                          setPaymentStep("cart");
                          setZone(event.target.value);
                        }}
                        className="mt-2 h-11 w-full rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm outline-none"
                      >
                        {zones.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name} ·{" "}
                            {item.price === null
                              ? "Cotizar"
                              : money(item.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!isPickup ? (
                      <div className="mt-3 rounded-lg border border-[#0A3D5C]/10 bg-white p-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#0A3D5C]">
                          <Truck className="size-4 text-[#00B4D8]" />
                          Datos para el domicilio
                        </div>
                        <div className="mt-3 grid gap-3">
                          <input
                            value={deliveryDetails.name}
                            onChange={(event) =>
                              setDeliveryDetails((current) => ({
                                ...current,
                                name: sanitizeText(event.target.value, {
                                  maxLength: 80,
                                }),
                              }))
                            }
                            placeholder="Nombre de quien recibe"
                            className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                          />
                          <input
                            value={deliveryDetails.phone}
                            onChange={(event) =>
                              setDeliveryDetails((current) => ({
                                ...current,
                                phone: sanitizePhone(event.target.value),
                              }))
                            }
                            placeholder="Teléfono o WhatsApp"
                            className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                          />
                          <input
                            value={deliveryDetails.address}
                            onChange={(event) =>
                              setDeliveryDetails((current) => ({
                                ...current,
                                address: sanitizeText(event.target.value, {
                                  maxLength: 140,
                                }),
                              }))
                            }
                            placeholder="Dirección de entrega"
                            className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                          />
                          <input
                            value={deliveryDetails.neighborhood}
                            onChange={(event) =>
                              setDeliveryDetails((current) => ({
                                ...current,
                                neighborhood: sanitizeText(event.target.value, {
                                  maxLength: 80,
                                }),
                              }))
                            }
                            placeholder="Barrio / conjunto / vereda"
                            className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                          />
                          <textarea
                            value={deliveryDetails.notes}
                            onChange={(event) =>
                              setDeliveryDetails((current) => ({
                                ...current,
                                notes: sanitizeLongText(event.target.value, 300),
                              }))
                            }
                            placeholder="Indicaciones adicionales"
                            rows={3}
                            className="resize-none rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 py-3 text-sm outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3 text-sm text-[#617789]">
                        Recogida en punto: mostraremos la dirección del local en
                        la confirmación del pedido.
                      </div>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#617789]">Subtotal</span>
                        <span className="font-semibold">
                          {hasPendingPrices ? "Cotizar" : money(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#617789]">Domicilio</span>
                        <span className="font-semibold">
                          {hasPendingPrices ? "Se confirma al pagar" : money(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#0A3D5C]/10 pt-3 font-display text-2xl font-bold">
                        <span>Total</span>
                        <span>{hasPendingPrices ? "Cotizar" : money(total)}</span>
                      </div>
                    </div>

                    <button
                      disabled={!cartItems.length}
                      onClick={continueToPayment}
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white transition enabled:hover:bg-[#F45F28] disabled:cursor-not-allowed disabled:bg-[#C6D0D6]"
                    >
                      Continuar a Wompi
                      <ChevronRight className="size-4" />
                    </button>
                    <a
                      href={cartWhatsAppUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white text-sm font-bold text-[#0A3D5C]"
                    >
                      <Send className="size-4" />
                      Solicitar cotización por WhatsApp
                    </a>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#617789]">
                      <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFB] p-2">
                        <Truck className="size-4 text-[#00B4D8]" />
                        Domicilio por zona
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFB] p-2">
                        <BadgePercent className="size-4 text-[#FF6B35]" />
                        Ofertas aplicadas
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {paymentStep === "wompi" ? (
                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="pool-depth relative overflow-hidden rounded-lg p-5 text-white">
                    <div className="water-grid absolute inset-0" />
                    <div className="relative">
                      <button
                        onClick={() => setPaymentStep("cart")}
                        className="mb-6 flex h-10 items-center gap-2 rounded-lg bg-white/12 px-3 text-sm font-bold text-white ring-1 ring-white/16"
                      >
                        <ArrowLeft className="size-4" />
                        Volver al carrito
                      </button>
                      <p className="text-xs font-bold uppercase text-[#8BE7F7]">
                        Checkout seguro
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-bold">
                        Checkout listo para conectar Wompi.
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-cyan-50/82">
                        Este paso guarda el pedido con su referencia, productos y
                        entrega. La pasarela real de Wompi reemplazará este botón
                        cuando estén las llaves de producción.
                      </p>
                      <div className="mt-5 rounded-lg border border-white/14 bg-white/10 p-4">
                        <div className="flex items-center gap-2 font-bold">
                          <ReceiptText className="size-4 text-[#FF6B35]" />
                          {trackingCode || "Se generará al aprobar"}
                        </div>
                        <div className="mt-4 grid gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-cyan-50/72">Ambiente</span>
                            <span className="font-bold">Base conectada</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cyan-50/72">Entrega</span>
                            <span className="font-bold">{zone}</span>
                          </div>
                          <div className="grid gap-1 border-t border-white/14 pt-3">
                            <span className="text-cyan-50/72">
                              {isPickup ? "Recogida" : "Dirección"}
                            </span>
                            <span className="font-bold">
                              {isPickup
                                ? "Punto físico Distribuciones LYM"
                                : deliveryDetails.address ||
                                  "Dirección pendiente"}
                            </span>
                            {!isPickup ? (
                              <span className="text-cyan-50/72">
                                {deliveryDetails.neighborhood ||
                                  "Barrio pendiente"}{" "}
                                ·{" "}
                                {deliveryDetails.phone ||
                                  "Teléfono pendiente"}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex justify-between border-t border-white/14 pt-3 font-display text-2xl font-bold">
                            <span>Total</span>
                            <span>
                              {hasPendingPrices ? "Cotizar" : money(total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#00B4D8]">
                          Método de pago
                        </p>
                        <h3 className="font-display text-2xl font-bold">
                          Escoge una opción
                        </h3>
                      </div>
                      <div className="flex size-11 items-center justify-center rounded-lg bg-[#F8FAFB] text-[#0A3D5C]">
                        <ShieldCheck className="size-5" />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                            paymentMethod === method.id
                              ? "border-[#00B4D8] bg-[#F2FCFF] shadow-sm"
                              : "border-[#0A3D5C]/10 bg-white hover:bg-[#F8FAFB]"
                          }`}
                        >
                          <div
                            className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${
                              paymentMethod === method.id
                                ? "bg-[#0A3D5C] text-white"
                                : "bg-[#EAF8FC] text-[#0084A3]"
                            }`}
                          >
                            <method.icon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-lg font-bold">
                              {method.name}
                            </p>
                            <p className="text-sm text-[#617789]">
                              {method.helper}
                            </p>
                          </div>
                          {paymentMethod === method.id ? (
                            <Check className="size-5 text-[#2FBF71]" />
                          ) : null}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={createOrderFromCart}
                      disabled={isCreatingOrder}
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white transition enabled:hover:bg-[#F45F28] disabled:cursor-not-allowed disabled:bg-[#C6D0D6]"
                    >
                      {isCreatingOrder ? "Guardando pedido..." : "Aprobar y crear pedido"}
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {paymentStep === "approved" ? (
                <div className="mx-auto max-w-2xl rounded-lg border border-[#2FBF71]/30 bg-[#EDFFF5] p-6 text-center text-[#116A3C]">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#2FBF71] text-white">
                    <Check className="size-8" />
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-bold">
                    Pedido creado correctamente
                  </h3>
                  <p className="mt-2 text-sm leading-6">
                    El pedido quedó guardado en la base de datos y ya aparece en el administrador.
                  </p>
                  <div className="mt-5 grid gap-3 rounded-lg bg-white p-4 text-left text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-[#617789]">Pedido</p>
                      <p className="font-bold text-[#0A3D5C]">
                        {confirmedOrder?.id || trackingCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#617789]">Total</p>
                      <p className="font-bold text-[#0A3D5C]">
                        {hasPendingPrices ? "Cotizar" : money(total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#617789]">Estado</p>
                      <p className="font-bold text-[#0A3D5C]">
                        {confirmedOrder?.status || "Confirmado"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-white p-4 text-left text-sm">
                    <p className="text-[#617789]">Entrega</p>
                    <p className="mt-1 font-bold text-[#0A3D5C]">{zone}</p>
                    <p className="mt-1 text-[#36586C]">
                      {isPickup
                        ? "El cliente recoge en el punto de Distribuciones LYM."
                        : `${deliveryDetails.address || "Dirección pendiente"} · ${
                            deliveryDetails.neighborhood ||
                            "Barrio pendiente"
                          } · ${
                            deliveryDetails.phone || "Teléfono pendiente"
                          }`}
                    </p>
                    {!isPickup && deliveryDetails.notes ? (
                      <p className="mt-2 text-[#617789]">
                        Nota: {deliveryDetails.notes}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => {
                      setPaymentStep("cart");
                      setIsCartOpen(false);
                    }}
                    className="mt-5 h-11 rounded-lg bg-[#0A3D5C] px-5 text-sm font-bold text-white"
                  >
                    Volver a la tienda
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

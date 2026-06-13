"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  Home,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  PackageCheck,
  Plus,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Printer,
  Upload,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { products as seedProducts, type Product } from "../products";
import { ThemeToggle } from "../theme-toggle";

type AdminProduct = Product & {
  adminPrice: string;
  active: boolean;
  featured: boolean;
  commerceStatus: string;
};

type OrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  client: string;
  phone: string;
  delivery: string;
  address: string;
  status: string;
  items: number;
  total: string;
  courier?: string;
  deliveryCost?: string;
  deliveryWindow?: string;
  deliveryNotes?: string;
  lines?: OrderLine[];
};

type Offer = {
  id: number;
  title: string;
  target: string;
  discount: string;
  active: boolean;
};

type AuditItem = {
  id: number;
  action: string;
  detail: string;
  time: string;
};

const navItems = [
  [LayoutDashboard, "Resumen"],
  [Boxes, "Productos"],
  [ShoppingBag, "Pedidos"],
  [Truck, "Domicilios"],
  [BadgePercent, "Ofertas"],
  [Settings, "Ajustes"],
] as const;

const orderStatuses = [
  "Pago pendiente",
  "Pagado",
  "Preparando",
  "En domicilio",
  "Entregado",
  "Cancelado",
];

const productStatuses = [
  "Pendiente de precio",
  "Publicado",
  "Oculto",
  "Bajo pedido",
  "Oferta activa",
  "Depurar",
];

const initialOrders: Order[] = [
  {
    id: "LYM-1048",
    client: "Conjunto Reserva del Llano",
    phone: "310 555 1948",
    delivery: "Villavicencio norte/sur",
    address: "Cra 22 # 18-40, Torre 3",
    status: "Pago pendiente",
    items: 5,
    total: "Por definir",
    lines: [
      { name: "Cloro granulado al 70%", quantity: 2, unitPrice: 68000 },
      { name: "Clarificador para piscina", quantity: 1, unitPrice: 28000 },
      { name: "Test kit pH y cloro", quantity: 1, unitPrice: 45000 },
      { name: "Cepillo curvo piscina", quantity: 1, unitPrice: 36000 },
    ],
  },
  {
    id: "LYM-1047",
    client: "Hotel Campestre Azul",
    phone: "318 400 2201",
    delivery: "Recoger en punto",
    address: "Punto físico Distribuciones LYM",
    status: "Preparando",
    items: 12,
    total: "Por definir",
    lines: [
      { name: "Tabletas de cloro", quantity: 6, unitPrice: 72000 },
      { name: "Alguicida mantenimiento", quantity: 3, unitPrice: 31000 },
      { name: "Red recogehojas", quantity: 2, unitPrice: 42000 },
      { name: "Boquilla de retorno", quantity: 1, unitPrice: 24000 },
    ],
  },
  {
    id: "LYM-1046",
    client: "Casa Quinta Apiay",
    phone: "301 760 8891",
    delivery: "Villavicencio centro",
    address: "Barrio Barzal, casa 18",
    status: "En domicilio",
    items: 3,
    total: "Por definir",
    lines: [
      { name: "Bomba para piscina", quantity: 1, unitPrice: 390000 },
      { name: "Arena sílica filtrante", quantity: 2, unitPrice: 52000 },
    ],
  },
  {
    id: "LYM-1045",
    client: "Piscina Familiar El Barzal",
    phone: "312 222 9088",
    delivery: "Villavicencio centro",
    address: "Calle 34 # 29-11",
    status: "Entregado",
    items: 2,
    total: "Por definir",
    lines: [
      { name: "Manguera flotante", quantity: 1, unitPrice: 98000 },
      { name: "Aspiradora manual", quantity: 1, unitPrice: 86000 },
    ],
  },
];

const initialZones = [
  { name: "Recoger en punto", price: "$0", state: "Disponible" },
  { name: "Villavicencio centro", price: "$6.000", state: "Activo" },
  { name: "Villavicencio norte/sur", price: "$9.000", state: "Activo" },
  { name: "Acacías / Restrepo", price: "$18.000", state: "Consultar cobertura" },
];

const initialOffers: Offer[] = [
  {
    id: 1,
    title: "Domicilio gratis",
    target: "Pedidos locales desde $200.000",
    discount: "100% domicilio",
    active: true,
  },
  {
    id: 2,
    title: "Kit mantenimiento",
    target: "Químicos + accesorios",
    discount: "10%",
    active: false,
  },
];

const adminStorageKeys = {
  products: "lym-admin-products",
  orders: "lym-admin-orders",
  zones: "lym-admin-zones",
  offers: "lym-admin-offers",
};

function moneyFromInput(value: string) {
  const clean = value.replace(/[^\d]/g, "");
  if (!clean) return "Por definir";

  return moneyFromNumber(Number(clean));
}

function moneyFromNumber(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function numberFromMoney(value?: string) {
  return Number(value?.replace(/[^\d]/g, "") || 0);
}

function isGenericProductName(name: string) {
  const normalized = name.trim().toLowerCase();

  return (
    normalized === "titulo" ||
    normalized === "reflector" ||
    normalized === "válvulas" ||
    normalized === "valvulas" ||
    normalized.startsWith("prueba")
  );
}

function isMissingProductImage(image: string) {
  return !image || image.includes("/brand/logo") || image.startsWith("blob:");
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function ProductThumb({ src, name }: { src: string; name: string }) {
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
      <Image src={src} alt={name} fill sizes="48px" className="object-contain p-1" />
    </div>
  );
}

export default function AdminPage() {
  const [section, setSection] = useState("Resumen");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [presentationMode, setPresentationMode] = useState(false);
  const [query, setQuery] = useState("");
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>(
    seedProducts.map((product) => ({
      ...product,
      adminPrice: "",
      active: true,
      featured: product.id <= 8,
      commerceStatus: isGenericProductName(product.name)
        ? "Depurar"
        : "Pendiente de precio",
    })),
  );
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [zones, setZones] = useState(initialZones);
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [deliveryOrder, setDeliveryOrder] = useState<Order | null>(null);
  const [remissionOrder, setRemissionOrder] = useState<Order | null>(null);
  const [deliveryDraft, setDeliveryDraft] = useState({
    zone: "",
    address: "",
    cost: "",
    courier: "",
    window: "",
    notes: "",
  });
  const [lastDeliveryId, setLastDeliveryId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [offerDraft, setOfferDraft] = useState({
    title: "",
    target: "",
    discount: "",
  });
  const [offerTargetFocused, setOfferTargetFocused] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditItem[]>([
    {
      id: 1,
      action: "Sistema iniciado",
      detail: "Panel demo listo para operar",
      time: "Hoy",
    },
  ]);

  const visibleProducts = useMemo(() => {
    return adminProducts.filter((product) =>
      product.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [adminProducts, query]);
  const offerProductMatches = useMemo(() => {
    const search = offerDraft.target.trim().toLowerCase();

    if (!search) return adminProducts.slice(0, 6);

    return adminProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search),
      )
      .slice(0, 7);
  }, [adminProducts, offerDraft.target]);

  const pendingPrices = adminProducts.filter(
    (product) => !product.adminPrice,
  ).length;
  const productsToClean = adminProducts.filter((product) =>
    isGenericProductName(product.name),
  ).length;
  const missingImageProducts = adminProducts.filter((product) =>
    isMissingProductImage(product.image),
  ).length;
  const activeOrders = orders.filter((order) => order.status !== "Entregado");
  const activeOffers = offers.filter((offer) => offer.active).length;
  const demoRevenue = orders.reduce((total, order) => total + getOrderTotal(order), 0);

  function addAudit(action: string, detail: string) {
    setAuditLog((current) => [
      { id: Date.now(), action, detail, time: "Ahora" },
      ...current,
    ].slice(0, 8));
  }

  function getOrderLines(order: Order) {
    if (order.lines?.length) return order.lines;

    return seedProducts.slice(0, Math.min(order.items, 4)).map((product, index) => ({
      name: product.name,
      quantity: index === 0 ? Math.max(order.items - 3, 1) : 1,
      unitPrice: 0,
    }));
  }

  function getOrderSubtotal(order: Order) {
    return getOrderLines(order).reduce(
      (total, line) => total + line.quantity * line.unitPrice,
      0,
    );
  }

  function getOrderTotal(order: Order) {
    return getOrderSubtotal(order) + numberFromMoney(order.deliveryCost);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedProducts = window.localStorage.getItem(adminStorageKeys.products);
      const savedOrders = window.localStorage.getItem(adminStorageKeys.orders);
      const savedZones = window.localStorage.getItem(adminStorageKeys.zones);
      const savedOffers = window.localStorage.getItem(adminStorageKeys.offers);

      if (savedProducts) {
        setAdminProducts(
          JSON.parse(savedProducts).map((product: AdminProduct) => ({
            ...product,
            commerceStatus:
              product.commerceStatus ||
              (isGenericProductName(product.name)
                ? "Depurar"
                : product.adminPrice
                  ? "Publicado"
                  : "Pendiente de precio"),
          })),
        );
      }
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedZones) setZones(JSON.parse(savedZones));
      if (savedOffers) setOffers(JSON.parse(savedOffers));

      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      adminStorageKeys.products,
      JSON.stringify(adminProducts),
    );
  }, [adminProducts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(adminStorageKeys.orders, JSON.stringify(orders));
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(adminStorageKeys.zones, JSON.stringify(zones));
  }, [zones, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(adminStorageKeys.offers, JSON.stringify(offers));
  }, [offers, hydrated]);

  function openProductEditor(product?: AdminProduct) {
    setEditingProduct(
      product ?? {
        id: adminProducts.length + 1,
        name: "",
        category: "Productos",
        price: null,
        adminPrice: "",
        unit: "Precio por definir",
        stock: 1,
        tag: "Productos",
        image: "/brand/logo.png",
        active: true,
        featured: false,
        commerceStatus: "Pendiente de precio",
      },
    );
    setEditorOpen(true);
  }

  function updateEditingProduct(fields: Partial<AdminProduct>) {
    setEditingProduct((current) => (current ? { ...current, ...fields } : current));
  }

  function handleImagePreview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    updateEditingProduct({ image: previewUrl });
  }

  function saveProduct() {
    if (!editingProduct) return;
    const normalizedProduct = {
      ...editingProduct,
      commerceStatus:
        editingProduct.commerceStatus === "Pendiente de precio" &&
        editingProduct.adminPrice
          ? "Publicado"
          : editingProduct.commerceStatus,
      active: editingProduct.commerceStatus !== "Oculto",
    };

    setAdminProducts((current) => {
      const exists = current.some((product) => product.id === normalizedProduct.id);
      if (exists) {
        return current.map((product) =>
          product.id === normalizedProduct.id ? normalizedProduct : product,
        );
      }

      return [normalizedProduct, ...current];
    });
    addAudit("Producto guardado", normalizedProduct.name);
    setEditorOpen(false);
    setEditingProduct(null);
  }

  function exportInventoryCsv() {
    const rows = [
      ["ID", "Producto", "Categoria", "Precio", "Stock", "Estado", "Imagen", "Observaciones"],
      ...adminProducts.map((product) => [
        product.id.toString(),
        product.name,
        product.category,
        product.adminPrice,
        product.stock.toString(),
        product.commerceStatus,
        product.image,
        "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventario-lym.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPriceTemplate() {
    exportInventoryCsv();
    addAudit("Plantilla descargada", "CSV de precios e inventario");
  }

  function importPricesCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const [, ...rows] = text.split(/\r?\n/).filter(Boolean);
      let updated = 0;

      setAdminProducts((current) =>
        current.map((product) => {
          const row = rows
            .map(parseCsvLine)
            .find(
              (cells) =>
                cells[0] === String(product.id) ||
                cells[1]?.trim().toLowerCase() === product.name.toLowerCase(),
            );

          if (!row) return product;

          updated += 1;
          const [, , category, price, stock, status, image] = row;

          return {
            ...product,
            category: category || product.category,
            tag: category || product.tag,
            adminPrice: price?.replace(/[^\d]/g, "") || product.adminPrice,
            stock: Number(stock) || product.stock,
            commerceStatus: status || product.commerceStatus,
            active: (status || product.commerceStatus) !== "Oculto",
            image: image || product.image,
          };
        }),
      );
      addAudit("CSV importado", `${updated} productos actualizados`);
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function fillDemoPrices() {
    setAdminProducts((current) =>
      current.map((product, index) => ({
        ...product,
        adminPrice:
          product.adminPrice || String(18000 + ((index % 12) + 1) * 7000),
        commerceStatus: "Publicado",
      })),
    );
    addAudit("Precios demo", "Se completaron precios de prueba");
  }

  function resetDemo() {
    setAdminProducts(
      seedProducts.map((product) => ({
        ...product,
        adminPrice: "",
        active: true,
        featured: product.id <= 8,
        commerceStatus: isGenericProductName(product.name)
          ? "Depurar"
          : "Pendiente de precio",
      })),
    );
    setOrders(initialOrders);
    setZones(initialZones);
    setOffers(initialOffers);
    setLastDeliveryId("");
    window.localStorage.removeItem(adminStorageKeys.products);
    window.localStorage.removeItem(adminStorageKeys.orders);
    window.localStorage.removeItem(adminStorageKeys.zones);
    window.localStorage.removeItem(adminStorageKeys.offers);
  }

  function updateOrderStatus(orderId: string, status: string) {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );
    addAudit("Estado actualizado", `${orderId} cambió a ${status}`);
  }

  function openDeliveryAssignment(order: Order) {
    const selectedZone =
      zones.find((zone) => zone.name === order.delivery) ?? zones[0];

    setDeliveryOrder(order);
    setDeliveryDraft({
      zone: selectedZone.name,
      address: order.address,
      cost: order.deliveryCost || selectedZone.price,
      courier: order.courier || "Equipo LYM",
      window: order.deliveryWindow || "Hoy, 2:00 p.m. - 6:00 p.m.",
      notes: order.deliveryNotes || "",
    });
  }

  function updateDeliveryZone(zoneName: string) {
    const selectedZone = zones.find((zone) => zone.name === zoneName);

    setDeliveryDraft((current) => ({
      ...current,
      zone: zoneName,
      cost: selectedZone?.price ?? current.cost,
    }));
  }

  function saveDeliveryAssignment() {
    if (!deliveryOrder) return;

    setOrders((current) =>
      current.map((order) =>
        order.id === deliveryOrder.id
          ? {
              ...order,
              delivery: deliveryDraft.zone,
              address: deliveryDraft.address,
              status: "En domicilio",
              courier: deliveryDraft.courier,
              deliveryCost: deliveryDraft.cost,
              deliveryWindow: deliveryDraft.window,
              deliveryNotes: deliveryDraft.notes,
            }
          : order,
      ),
    );
    setLastDeliveryId(deliveryOrder.id);
    setSection("Domicilios");
    setDeliveryOrder(null);
  }

  function markOrderDelivered(orderId: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "Entregado" } : order,
      ),
    );
  }

  function whatsappDeliveryUrl(order: Order) {
    const phone = order.phone.replace(/\D/g, "");
    const colombiaPhone = phone.startsWith("57") ? phone : `57${phone}`;
    const message = [
      `Hola ${order.client}, somos Distribuciones LYM.`,
      `Tu pedido ${order.id} ya fue enviado a domicilio.`,
      `Dirección: ${order.address}.`,
      `Horario estimado: ${order.deliveryWindow || "por confirmar"}.`,
      `Valor domicilio: ${order.deliveryCost || "por definir"}.`,
    ].join("\n");

    return `https://wa.me/${colombiaPhone}?text=${encodeURIComponent(message)}`;
  }

  function addOffer() {
    if (!offerDraft.title.trim()) return;

    setOffers((current) => [
      {
        id: current.length + 1,
        title: offerDraft.title,
        target: offerDraft.target || "Toda la tienda",
        discount: offerDraft.discount || "Por definir",
        active: true,
      },
      ...current,
    ]);
    setOfferDraft({ title: "", target: "", discount: "" });
    setOfferTargetFocused(false);
    addAudit("Oferta creada", offerDraft.title);
  }

  function selectOfferProduct(product: AdminProduct) {
    setOfferDraft((current) => ({
      ...current,
      title: current.title || `Oferta ${product.name}`,
      target: product.name,
    }));
    setOfferTargetFocused(false);
  }

  function content() {
    if (section === "Productos") {
      return (
        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Inventario
              </p>
              <h2 className="font-display text-2xl font-bold">
                Productos de la tienda
              </h2>
              <p className="mt-1 text-sm text-[#617789]">
                {visibleProducts.length} visibles de {adminProducts.length}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 sm:w-80">
                <Search className="size-4 text-[#617789]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar producto"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </label>
              <button
                onClick={() => openProductEditor()}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-4 text-sm font-bold text-white"
              >
                <Plus className="size-4" />
                Nuevo producto
              </button>
              <button
                onClick={fillDemoPrices}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]"
              >
                <Save className="size-4" />
                Precios demo
              </button>
              <button
                onClick={downloadPriceTemplate}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]"
              >
                <Download className="size-4" />
                Plantilla precios
              </button>
              <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]">
                <Upload className="size-4" />
                Importar CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={importPricesCsv}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Productos por depurar", `${productsToClean} referencias genéricas o de prueba`],
              ["Imágenes faltantes", `${missingImageProducts} productos sin imagen definitiva`],
              ["CSV de precios", "Descarga, completa precios y vuelve a importar"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3"
              >
                <p className="text-sm font-bold text-[#0A3D5C]">{title}</p>
                <p className="mt-1 text-xs text-[#617789]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-[#0A3D5C]/10">
            <div className="hidden grid-cols-[1fr_140px_120px_130px_112px] bg-[#F8FAFB] px-3 py-2 text-xs font-bold uppercase text-[#617789] md:grid">
              <span>Producto</span>
              <span>Categoría</span>
              <span>Precio</span>
              <span>Estado</span>
              <span>Acción</span>
            </div>
            <div className="max-h-[720px] divide-y divide-[#0A3D5C]/10 overflow-y-auto">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-3 px-3 py-3 md:grid-cols-[1fr_140px_120px_130px_112px] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductThumb src={product.image} name={product.name} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{product.name}</p>
                      <p className="text-xs text-[#617789]">
                        Stock {product.stock} ·{" "}
                        {isMissingProductImage(product.image)
                          ? "Imagen pendiente"
                          : "Imagen lista"}
                        {isGenericProductName(product.name) ? " · Depurar nombre" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-[#36586C]">{product.category}</span>
                  <span className="text-sm font-bold text-[#FF6B35]">
                    {moneyFromInput(product.adminPrice)}
                  </span>
                  <span
                    className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${
                      product.commerceStatus === "Publicado" ||
                      product.commerceStatus === "Oferta activa"
                        ? "bg-[#EDFFF5] text-[#116A3C]"
                        : product.commerceStatus === "Depurar"
                          ? "bg-[#FFF4EF] text-[#C2441A]"
                        : "bg-[#F8FAFB] text-[#617789]"
                    }`}
                  >
                    {product.commerceStatus}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openProductEditor(product)}
                      className="flex h-9 items-center gap-2 rounded-md border border-[#0A3D5C]/12 px-3 text-sm font-bold text-[#0A3D5C]"
                    >
                      <Edit3 className="size-4" />
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section === "Pedidos") {
      return (
        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Pedidos
              </p>
              <h2 className="font-display text-2xl font-bold">
                Gestión de compras
              </h2>
            </div>
            <PackageCheck className="size-7 text-[#FF6B35]" />
          </div>
          <div className="grid gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid gap-3 rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4 lg:grid-cols-[1fr_220px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl font-bold">{order.id}</p>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-[#0A3D5C]">
                      {order.items} productos
                    </span>
                    <span className="rounded-md bg-[#FFF4EF] px-2 py-1 text-xs font-bold text-[#C2441A]">
                      {order.total}
                    </span>
                  </div>
                  <p className="mt-2 font-bold">{order.client}</p>
                  <p className="mt-1 text-sm text-[#617789]">
                    {order.phone} · {order.delivery}
                  </p>
                  <p className="mt-1 text-sm text-[#36586C]">{order.address}</p>
                  {order.courier ? (
                    <p className="mt-2 text-xs font-bold uppercase text-[#0084A3]">
                      {order.courier} · {order.deliveryCost} · {order.deliveryWindow}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-[#617789]">
                    Estado
                  </label>
                  <select
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold text-[#0A3D5C] outline-none"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openDeliveryAssignment(order)}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0A3D5C] text-sm font-bold text-white"
                  >
                    <Truck className="size-4" />
                    Asignar domicilio
                  </button>
                  <button
                    onClick={() => setRemissionOrder(order)}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white text-sm font-bold text-[#0A3D5C]"
                  >
                    <FileText className="size-4" />
                    Ver remisión
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section === "Domicilios") {
      return (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Zonas
            </p>
            <h2 className="font-display text-2xl font-bold">
              Tarifas de entrega
            </h2>
            <div className="mt-4 space-y-3">
              {zones.map((zone, index) => (
                <div
                  key={zone.name}
                  className="grid gap-3 rounded-lg bg-[#F8FAFB] p-3 sm:grid-cols-[1fr_120px_160px]"
                >
                  <input
                    value={zone.name}
                    onChange={(event) =>
                      setZones((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold outline-none"
                  />
                  <input
                    value={zone.price}
                    onChange={(event) =>
                      setZones((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, price: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm font-bold outline-none"
                  />
                  <input
                    value={zone.state}
                    onChange={(event) =>
                      setZones((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, state: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="h-10 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
            <MapPin className="mb-3 size-7 text-[#00B4D8]" />
            <h2 className="font-display text-2xl font-bold">
              Domicilios activos
            </h2>
            {lastDeliveryId ? (
              <div className="mt-3 rounded-lg border border-[#BDEFD7] bg-[#EDFFF5] p-3 text-sm text-[#116A3C]">
                <p className="font-bold">Pedido {lastDeliveryId} enviado a domicilio.</p>
                <p className="mt-1">
                  Ya puedes avisar al cliente por WhatsApp o marcarlo entregado.
                </p>
              </div>
            ) : null}
            <div className="mt-4 space-y-3">
              {activeOrders.map((order) => (
                <div key={order.id} className="rounded-lg bg-[#F8FAFB] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{order.id}</p>
                      <p className="text-sm text-[#617789]">{order.address}</p>
                      <p className="mt-2 text-xs font-bold uppercase text-[#00B4D8]">
                        {order.status}
                      </p>
                      {order.courier ? (
                        <p className="mt-1 text-xs text-[#617789]">
                          {order.courier} · {order.deliveryCost} · {order.deliveryWindow}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => setRemissionOrder(order)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#0A3D5C]/12 bg-white text-[#0A3D5C]"
                        aria-label="Ver remisión"
                      >
                        <FileText className="size-4" />
                      </button>
                      {order.status === "En domicilio" ? (
                        <a
                          href={whatsappDeliveryUrl(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex size-8 items-center justify-center rounded-md border border-[#0A3D5C]/12 bg-white text-[#0A3D5C]"
                          aria-label="Avisar por WhatsApp"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      ) : null}
                      <button
                        onClick={() => openDeliveryAssignment(order)}
                        className="rounded-md border border-[#0A3D5C]/12 bg-white px-2 py-1 text-xs font-bold text-[#0A3D5C]"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>
                  {order.status === "En domicilio" ? (
                    <button
                      onClick={() => markOrderDelivered(order.id)}
                      className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#0A3D5C] text-sm font-bold text-white"
                    >
                      <CheckCircle2 className="size-4" />
                      Marcar entregado
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section === "Ofertas") {
      return (
        <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Marketing
            </p>
            <h2 className="font-display text-2xl font-bold">Nueva oferta</h2>
            <div className="mt-4 grid gap-3">
              <input
                value={offerDraft.title}
                onChange={(event) =>
                  setOfferDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Nombre de la oferta"
                className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
              />
              <div className="relative">
                <label className="flex h-11 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
                  <Search className="size-4 text-[#617789]" />
                  <input
                    value={offerDraft.target}
                    onChange={(event) => {
                      setOfferDraft((current) => ({
                        ...current,
                        target: event.target.value,
                      }));
                      setOfferTargetFocused(true);
                    }}
                    onFocus={() => setOfferTargetFocused(true)}
                    placeholder="Buscar producto exacto"
                    className="h-full w-full bg-transparent text-sm outline-none"
                  />
                </label>
                {offerTargetFocused && (
                  <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-lg border border-[#0A3D5C]/12 bg-white shadow-xl">
                    <div className="border-b border-[#0A3D5C]/8 px-3 py-2 text-xs font-bold uppercase text-[#617789]">
                      Productos encontrados
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {offerProductMatches.length > 0 ? (
                        offerProductMatches.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectOfferProduct(product)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-[#F8FAFB]"
                          >
                            <ProductThumb src={product.image} name={product.name} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#0A3D5C]">
                                {product.name}
                              </p>
                              <p className="text-xs text-[#617789]">
                                {product.category} · Stock {product.stock}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm text-[#617789]">
                          No aparece en el catálogo. Puedes escribir una condición manual.
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setOfferTargetFocused(false)}
                      className="flex h-10 w-full items-center justify-center border-t border-[#0A3D5C]/8 text-sm font-bold text-[#0A3D5C]"
                    >
                      Usar texto escrito
                    </button>
                  </div>
                )}
              </div>
              <input
                value={offerDraft.discount}
                onChange={(event) =>
                  setOfferDraft((current) => ({
                    ...current,
                    discount: event.target.value,
                  }))
                }
                placeholder="Descuento: 10%, $20.000, domicilio gratis"
                className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
              />
              <button
                onClick={addOffer}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
              >
                <Plus className="size-4" />
                Crear oferta
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
            <h2 className="font-display text-2xl font-bold">Ofertas activas</h2>
            <div className="mt-4 space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-start justify-between gap-3 rounded-lg bg-[#F8FAFB] p-3"
                >
                  <div>
                    <p className="font-bold">{offer.title}</p>
                    <p className="text-sm text-[#617789]">{offer.target}</p>
                    <p className="mt-1 text-sm font-bold text-[#FF6B35]">
                      {offer.discount}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addAudit(
                        offer.active ? "Oferta pausada" : "Oferta activada",
                        offer.title,
                      );
                      setOffers((current) =>
                        current.map((item) =>
                          item.id === offer.id
                            ? { ...item, active: !item.active }
                            : item,
                        ),
                      );
                    }}
                    className={`h-9 rounded-lg px-3 text-sm font-bold ${
                      offer.active
                        ? "bg-[#0A3D5C] text-white"
                        : "bg-white text-[#617789]"
                    }`}
                  >
                    {offer.active ? "Activa" : "Pausada"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section === "Ajustes") {
      return (
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["Datos del negocio", "Dirección, teléfono, horario y NIT."],
            ["Pagos Wompi", "Llaves públicas/privadas y ambiente de prueba."],
            ["Usuarios admin", "Permisos para quienes gestionan la tienda."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm"
            >
              <Settings className="mb-3 size-6 text-[#00B4D8]" />
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#617789]">
                {description}
              </p>
              <button className="mt-4 h-10 rounded-lg border border-[#0A3D5C]/12 px-4 text-sm font-bold text-[#0A3D5C]">
                Configurar
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            [BarChart3, "Ventas demo", moneyFromNumber(demoRevenue), "Pedidos con valores simulados"],
            [PackageCheck, "Pedidos activos", String(activeOrders.length), "Requieren seguimiento"],
            [FileText, "Sin precio", String(pendingPrices), "Completar antes de vender"],
            [BadgePercent, "Ofertas activas", String(activeOffers), "Promociones visibles"],
          ].map(([Icon, label, value, helper]) => (
            <div
              key={label as string}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
                  <Icon className="size-5" />
                </div>
                <span className="rounded-md bg-[#F8FAFB] px-2 py-1 text-xs font-bold text-[#617789]">
                  Hoy
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase text-[#617789]">
                {label as string}
              </p>
              <p className="mt-1 font-display text-2xl font-bold">
                {value as string}
              </p>
              <p className="mt-1 text-xs text-[#617789]">{helper as string}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          {contentProductsSummary()}
          {contentOrdersSummary()}
        </div>
      </div>
    );
  }

  function contentProductsSummary() {
    return (
      <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Inventario
            </p>
            <h2 className="font-display text-xl font-bold">
              Productos por completar
            </h2>
          </div>
          <button
            onClick={() => setSection("Productos")}
            className="h-9 rounded-lg border border-[#0A3D5C]/12 px-3 text-sm font-bold text-[#0A3D5C]"
          >
            Ver todos
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {adminProducts.slice(0, 7).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-[#F8FAFB] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumb src={product.image} name={product.name} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{product.name}</p>
                  <p className="text-xs text-[#617789]">{product.category}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold text-[#FF6B35]">
                {moneyFromInput(product.adminPrice)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function contentOrdersSummary() {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Pedidos
              </p>
              <h2 className="font-display text-xl font-bold">Recientes</h2>
            </div>
            <PackageCheck className="size-6 text-[#FF6B35]" />
          </div>
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.id}</p>
                    <p className="text-sm text-[#617789]">{order.client}</p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-[#0A3D5C]">
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#617789]">
                  <span>{order.items} items</span>
                  <span>{order.delivery}</span>
                  <span className="font-bold text-[#FF6B35]">{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Ofertas
              </p>
              <h2 className="font-display text-xl font-bold">
                {activeOffers} activas
              </h2>
            </div>
            <BadgePercent className="size-6 text-[#FF6B35]" />
          </div>
        </div>

        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Notificaciones
              </p>
              <h2 className="font-display text-xl font-bold">Prioridades</h2>
            </div>
            <Bell className="size-6 text-[#FF6B35]" />
          </div>
          <div className="mt-4 space-y-2">
            {[
              ["Productos sin precio", `${pendingPrices} referencias necesitan valor`, "text-[#C2441A]"],
              ["Pedidos abiertos", `${activeOrders.length} pedidos requieren gestión`, "text-[#0084A3]"],
              ["Ofertas públicas", `${activeOffers} ofertas visibles para clientes`, "text-[#116A3C]"],
            ].map(([title, detail, tone]) => (
              <div key={title} className="rounded-lg bg-[#F8FAFB] p-3">
                <p className={`text-sm font-bold ${tone}`}>{title}</p>
                <p className="mt-1 text-xs text-[#617789]">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Auditoría
              </p>
              <h2 className="font-display text-xl font-bold">Últimos cambios</h2>
            </div>
            <FileText className="size-6 text-[#FF6B35]" />
          </div>
          <div className="mt-4 space-y-2">
            {auditLog.map((item) => (
              <div key={item.id} className="rounded-lg bg-[#F8FAFB] p-3">
                <p className="text-sm font-bold text-[#0A3D5C]">
                  {item.action}
                </p>
                <p className="mt-1 text-xs text-[#617789]">
                  {item.detail} · {item.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!adminUnlocked) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAFB] px-4 text-[#062A3E]">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden border-r border-[#0A3D5C]/10 bg-[#F8FAFB] p-6 text-[#062A3E] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,180,216,0.18),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(255,107,53,0.12),transparent_28%)]" />
            <div className="relative">
              <div className="relative mb-6 size-20 overflow-hidden rounded-lg bg-white">
                <Image
                  src="/brand/logo.png"
                  alt="Logo Distribuciones LYM"
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Admin demo
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight">
                Panel privado para gestionar la tienda.
              </h1>
              <p className="mt-4 text-sm leading-6 text-[#617789]">
                Acceso visual de presentación. La seguridad real se conectará
                con Supabase Auth antes de producción.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-4 flex justify-end">
              <ThemeToggle />
            </div>
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Acceso administrador
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              Ingresar al panel
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#617789]">
              Usa la clave demo <span className="font-bold text-[#0A3D5C]">admin</span>.
            </p>
            <label className="mt-5 flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
              <KeyRound className="size-5 text-[#617789]" />
              <input
                value={adminPass}
                onChange={(event) => setAdminPass(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && adminPass.trim()) {
                    setAdminUnlocked(true);
                  }
                }}
                type="password"
                placeholder="Clave de acceso"
                className="h-full w-full bg-transparent text-sm outline-none"
              />
            </label>
            <button
              onClick={() => setAdminUnlocked(true)}
              className="mt-4 h-12 w-full rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
            >
              Entrar al administrador
            </button>
            <Link
              href="/"
              className="mt-3 flex h-11 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-[#0A3D5C]/10 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="relative size-12 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
              <Image
                src="/brand/logo.png"
                alt="Logo Distribuciones LYM"
                fill
                sizes="48px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none">
                Admin LYM
              </p>
              <p className="text-xs text-[#617789]">Panel de gestión</p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
            {navItems.map(([Icon, label]) => (
              <button
                key={label}
                onClick={() => setSection(label)}
                className={`flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-bold transition lg:w-full ${
                  section === label
                    ? "bg-[#0A3D5C] text-white"
                    : "text-[#36586C] hover:bg-[#F0F6F8]"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mx-4 mb-4 hidden rounded-lg bg-[#F8FAFB] p-3 text-sm text-[#617789] lg:block">
            <p className="font-bold text-[#0A3D5C]">Modo visual</p>
            <p className="mt-1">
              Cambios simulados en memoria. Después se guardan en Supabase.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#0A3D5C]/10 bg-[#F8FAFB]/92 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-[#00B4D8]">
                  {section}
                </p>
                <h1 className="font-display text-2xl font-bold">
                  Control comercial Distribuciones LYM
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  href="/"
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]"
                >
                  <Home className="size-4" />
                  Ver tienda
                </Link>
                <button
                  onClick={resetDemo}
                  className="hidden h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C] sm:flex"
                >
                  Restaurar demo
                </button>
                <button
                  onClick={() => setPresentationMode((current) => !current)}
                  className={`hidden h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold sm:flex ${
                    presentationMode
                      ? "bg-[#0A3D5C] text-white"
                      : "border border-[#0A3D5C]/12 bg-white text-[#0A3D5C]"
                  }`}
                >
                  Modo presentación
                </button>
                <button
                  onClick={() => openProductEditor()}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#FF6B35] px-4 text-sm font-bold text-white"
                >
                  <Plus className="size-4" />
                  Nuevo producto
                </button>
                <button
                  onClick={() => setAdminUnlocked(false)}
                  className="hidden h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C] sm:flex"
                >
                  Salir
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
            {content()}
          </div>
        </section>
      </div>

      {editorOpen && editingProduct ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto grid max-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl lg:grid-cols-[0.82fr_1.18fr]">
            <div className="pool-depth relative hidden p-6 text-white lg:block">
              <div className="water-grid absolute inset-0" />
              <div className="relative">
                <p className="text-xs font-bold uppercase text-[#8BE7F7]">
                  Producto
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  Edita precio, imagen, estado y oferta.
                </h2>
                <div className="relative mt-6 aspect-square overflow-hidden rounded-lg bg-white">
                  <Image
                    src={editingProduct.image}
                    alt={editingProduct.name || "Producto"}
                    fill
                    sizes="360px"
                    className="object-contain p-5"
                    unoptimized={editingProduct.image.startsWith("blob:")}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[#00B4D8]">
                    Editor
                  </p>
                  <h2 className="font-display text-2xl font-bold">
                    {editingProduct.id > seedProducts.length
                      ? "Nuevo producto"
                      : "Editar producto"}
                  </h2>
                </div>
                <button
                  onClick={() => setEditorOpen(false)}
                  className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-[#36586C]"
                  aria-label="Cerrar editor"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-[#0A3D5C]">
                    Nombre
                  </span>
                  <input
                    value={editingProduct.name}
                    onChange={(event) =>
                      updateEditingProduct({ name: event.target.value })
                    }
                    className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Categoría
                    </span>
                    <input
                      value={editingProduct.category}
                      onChange={(event) =>
                        updateEditingProduct({
                          category: event.target.value,
                          tag: event.target.value,
                        })
                      }
                      className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Precio
                    </span>
                    <input
                      value={editingProduct.adminPrice}
                      onChange={(event) =>
                        updateEditingProduct({ adminPrice: event.target.value })
                      }
                      placeholder="Ej. 69000"
                      className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Stock
                    </span>
                    <input
                      value={editingProduct.stock}
                      onChange={(event) =>
                        updateEditingProduct({
                          stock: Number(event.target.value) || 0,
                        })
                      }
                      type="number"
                      className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Etiqueta
                    </span>
                    <input
                      value={editingProduct.tag}
                      onChange={(event) =>
                        updateEditingProduct({ tag: event.target.value })
                      }
                      className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-[#0A3D5C]">
                    Estado comercial
                  </span>
                  <select
                    value={editingProduct.commerceStatus}
                    onChange={(event) =>
                      updateEditingProduct({
                        commerceStatus: event.target.value,
                        active: event.target.value !== "Oculto",
                      })
                    }
                    className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm font-bold text-[#0A3D5C] outline-none"
                  >
                    {productStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-[#0A3D5C]">
                    Foto del producto
                  </span>
                  <div className="rounded-lg border border-dashed border-[#0A3D5C]/24 bg-[#F8FAFB] p-4">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <ImagePlus className="size-7 text-[#00B4D8]" />
                      <p className="text-sm font-bold text-[#0A3D5C]">
                        Arrastra o selecciona una imagen
                      </p>
                      <p className="text-xs text-[#617789]">
                        En producción se subirá a Supabase Storage y guardará la URL.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagePreview}
                        className="mt-2 w-full rounded-lg border border-[#0A3D5C]/12 bg-white p-2 text-sm"
                      />
                    </div>
                  </div>
                </label>

                <div className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4">
                  <p className="font-display text-lg font-bold">
                    Carga masiva de imágenes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#617789]">
                    Para esta demo, guarda imágenes en <span className="font-bold">public/products</span>,
                    descarga la plantilla CSV, pega la ruta en la columna Imagen
                    usando formato <span className="font-bold">/products/nombre.png</span> e importa el CSV.
                    En producción este paso se conectará a Supabase Storage.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() =>
                      updateEditingProduct({ active: !editingProduct.active })
                    }
                    className={`h-11 rounded-lg text-sm font-bold ${
                      editingProduct.active
                        ? "bg-[#0A3D5C] text-white"
                        : "bg-[#F8FAFB] text-[#617789]"
                    }`}
                  >
                    {editingProduct.active ? "Producto activo" : "Producto oculto"}
                  </button>
                  <button
                    onClick={() =>
                      updateEditingProduct({
                        featured: !editingProduct.featured,
                      })
                    }
                    className={`h-11 rounded-lg text-sm font-bold ${
                      editingProduct.featured
                        ? "bg-[#FF6B35] text-white"
                        : "bg-[#F8FAFB] text-[#617789]"
                    }`}
                  >
                    {editingProduct.featured ? "Destacado" : "No destacado"}
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={saveProduct}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                  >
                    <Save className="size-4" />
                    Guardar cambios
                  </button>
                  <button
                    onClick={() => setEditorOpen(false)}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 px-4 text-sm font-bold text-[#0A3D5C]"
                  >
                    Cancelar
                  </button>
                </div>

                <button
                  onClick={() => {
                    setAdminProducts((current) =>
                      current.filter((product) => product.id !== editingProduct.id),
                    );
                    setEditorOpen(false);
                  }}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold text-[#8A3A2A] hover:bg-[#FFF0EA]"
                >
                  <Trash2 className="size-4" />
                  Eliminar producto
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deliveryOrder ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
              <div className="pool-depth relative p-5 text-white">
                <div className="water-grid absolute inset-0" />
                <div className="relative">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-white/14">
                    <Truck className="size-6 text-[#8BE7F7]" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase text-[#8BE7F7]">
                    Domicilio
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold">
                    Asignar entrega del pedido
                  </h2>
                  <div className="mt-6 rounded-lg border border-white/14 bg-white/10 p-4">
                    <p className="font-display text-2xl font-bold">
                      {deliveryOrder.id}
                    </p>
                    <p className="mt-2 font-bold">{deliveryOrder.client}</p>
                    <p className="mt-1 text-sm text-white/72">
                      {deliveryOrder.phone}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/14 bg-white/10 p-3">
                      <p className="text-xs text-white/65">Productos</p>
                      <p className="font-display text-2xl font-bold">
                        {deliveryOrder.items}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/14 bg-white/10 p-3">
                      <p className="text-xs text-white/65">Estado</p>
                      <p className="text-sm font-bold">{deliveryOrder.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#00B4D8]">
                      Ruta de entrega
                    </p>
                    <h2 className="font-display text-2xl font-bold">
                      Confirmar domicilio
                    </h2>
                  </div>
                  <button
                    onClick={() => setDeliveryOrder(null)}
                    className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-[#36586C]"
                    aria-label="Cerrar asignación de domicilio"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="mt-5 grid gap-3">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Zona de entrega
                    </span>
                    <select
                      value={deliveryDraft.zone}
                      onChange={(event) => updateDeliveryZone(event.target.value)}
                      className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm font-bold text-[#0A3D5C] outline-none"
                    >
                      {zones.map((zone) => (
                        <option key={zone.name} value={zone.name}>
                          {zone.name} · {zone.price}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Dirección
                    </span>
                    <textarea
                      value={deliveryDraft.address}
                      onChange={(event) =>
                        setDeliveryDraft((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                      rows={3}
                      className="rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 py-2 text-sm outline-none"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className="text-sm font-bold text-[#0A3D5C]">
                        Valor domicilio
                      </span>
                      <input
                        value={deliveryDraft.cost}
                        onChange={(event) =>
                          setDeliveryDraft((current) => ({
                            ...current,
                            cost: event.target.value,
                          }))
                        }
                        className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-sm font-bold text-[#0A3D5C]">
                        Responsable
                      </span>
                      <input
                        value={deliveryDraft.courier}
                        onChange={(event) =>
                          setDeliveryDraft((current) => ({
                            ...current,
                            courier: event.target.value,
                          }))
                        }
                        placeholder="Nombre del repartidor"
                        className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                      />
                    </label>
                  </div>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Horario estimado
                    </span>
                    <input
                      value={deliveryDraft.window}
                      onChange={(event) =>
                        setDeliveryDraft((current) => ({
                          ...current,
                          window: event.target.value,
                        }))
                      }
                      className="h-11 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 text-sm outline-none"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-[#0A3D5C]">
                      Notas internas
                    </span>
                    <textarea
                      value={deliveryDraft.notes}
                      onChange={(event) =>
                        setDeliveryDraft((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Ej. llamar antes de llegar, portería, producto pesado..."
                      rows={3}
                      className="rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3 py-2 text-sm outline-none"
                    />
                  </label>

                  <div className="rounded-lg border border-[#00B4D8]/18 bg-[#EAF8FC] p-3">
                    <p className="text-sm font-bold text-[#0A3D5C]">
                      Al confirmar, el pedido pasa a “En domicilio”.
                    </p>
                    <p className="mt-1 text-sm text-[#36586C]">
                      La información quedará visible en Domicilios activos para seguimiento.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                    <button
                      onClick={saveDeliveryAssignment}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                    >
                      <Save className="size-4" />
                      Enviar a domicilio
                    </button>
                    <button
                      onClick={() => setDeliveryOrder(null)}
                      className="flex h-11 items-center justify-center rounded-lg border border-[#0A3D5C]/12 px-4 text-sm font-bold text-[#0A3D5C]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {remissionOrder ? (
        <div className="print-surface fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="no-print sticky top-0 z-10 flex flex-col gap-3 border-b border-[#0A3D5C]/10 bg-white/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-[#00B4D8]">
                  Remisión
                </p>
                <h2 className="font-display text-2xl font-bold">
                  Pedido {remissionOrder.id}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
                >
                  <Printer className="size-4" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setRemissionOrder(null)}
                  className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-[#36586C]"
                  aria-label="Cerrar remisión"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="print-card rounded-lg border border-[#0A3D5C]/12 bg-white p-5">
                <div className="flex flex-col gap-4 border-b border-[#0A3D5C]/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative size-16 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
                      <Image
                        src="/brand/logo.png"
                        alt="Logo Distribuciones LYM"
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold">
                        Distribuciones LYM
                      </p>
                      <p className="text-sm text-[#617789]">
                        Soluciones para su piscina
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#F8FAFB] p-3 text-sm sm:text-right">
                    <p className="font-bold text-[#0A3D5C]">
                      Remisión {remissionOrder.id}
                    </p>
                    <p className="text-[#617789]">Estado: {remissionOrder.status}</p>
                    <p className="text-[#617789]">
                      Fecha: {new Date().toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-[#F8FAFB] p-4">
                    <p className="text-xs font-bold uppercase text-[#617789]">
                      Cliente
                    </p>
                    <p className="mt-2 font-bold text-[#0A3D5C]">
                      {remissionOrder.client}
                    </p>
                    <p className="text-sm text-[#617789]">
                      {remissionOrder.phone}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#F8FAFB] p-4">
                    <p className="text-xs font-bold uppercase text-[#617789]">
                      Entrega
                    </p>
                    <p className="mt-2 font-bold text-[#0A3D5C]">
                      {remissionOrder.delivery}
                    </p>
                    <p className="text-sm text-[#617789]">
                      {remissionOrder.address}
                    </p>
                    {remissionOrder.deliveryWindow ? (
                      <p className="mt-1 text-sm text-[#617789]">
                        {remissionOrder.deliveryWindow}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-lg border border-[#0A3D5C]/10">
                  <div className="hidden grid-cols-[1fr_84px_130px_130px] bg-[#0A3D5C] px-3 py-2 text-xs font-bold uppercase text-white md:grid">
                    <span>Producto</span>
                    <span className="text-center">Cantidad</span>
                    <span className="text-right">Valor unitario</span>
                    <span className="text-right">Subtotal</span>
                  </div>
                  <div className="divide-y divide-[#0A3D5C]/10">
                    {getOrderLines(remissionOrder).map((line) => (
                      <div
                        key={`${remissionOrder.id}-${line.name}`}
                        className="grid gap-2 px-3 py-3 md:grid-cols-[1fr_84px_130px_130px] md:items-center"
                      >
                        <div>
                          <p className="font-bold text-[#0A3D5C]">{line.name}</p>
                          <p className="text-xs text-[#617789] md:hidden">
                            Cantidad {line.quantity}
                          </p>
                        </div>
                        <p className="hidden text-center text-sm font-bold md:block">
                          {line.quantity}
                        </p>
                        <p className="text-sm text-[#617789] md:text-right">
                          {line.unitPrice ? moneyFromNumber(line.unitPrice) : "Por definir"}
                        </p>
                        <p className="text-sm font-bold text-[#0A3D5C] md:text-right">
                          {line.unitPrice
                            ? moneyFromNumber(line.unitPrice * line.quantity)
                            : "Por definir"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div className="rounded-lg bg-[#F8FAFB] p-4">
                    <p className="text-xs font-bold uppercase text-[#617789]">
                      Observaciones
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#36586C]">
                      {remissionOrder.deliveryNotes ||
                        "Verificar productos al recibir. Esta remisión funciona como soporte de entrega del pedido."}
                    </p>
                    {remissionOrder.courier ? (
                      <p className="mt-3 text-sm font-bold text-[#0A3D5C]">
                        Responsable: {remissionOrder.courier}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-[#0A3D5C]/10 p-4">
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-[#617789]">Subtotal productos</span>
                      <span className="font-bold">
                        {getOrderSubtotal(remissionOrder)
                          ? moneyFromNumber(getOrderSubtotal(remissionOrder))
                          : "Por definir"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#0A3D5C]/10 py-2 text-sm">
                      <span className="text-[#617789]">Domicilio</span>
                      <span className="font-bold">
                        {remissionOrder.deliveryCost || "Por definir"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#0A3D5C]/10 pt-3">
                      <span className="font-display text-xl font-bold">Total</span>
                      <span className="font-display text-xl font-bold text-[#FF6B35]">
                        {getOrderTotal(remissionOrder)
                          ? moneyFromNumber(getOrderTotal(remissionOrder))
                          : "Por definir"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="border-t border-[#0A3D5C]/20 pt-3 text-sm text-[#617789]">
                    Firma quien entrega
                  </div>
                  <div className="border-t border-[#0A3D5C]/20 pt-3 text-sm text-[#617789]">
                    Firma quien recibe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

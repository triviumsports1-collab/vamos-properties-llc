/**
 * Common UI strings used across the site header, footer, call bar, and forms.
 * Page-specific body copy stays inline inside each page file.
 * Add a new locale by adding a matching entry in each `Record<Locale, …>` below.
 */

import type { Locale } from "@/lib/i18n/routes";

// ─── Navigation ───────────────────────────────────────────────────────────────

export const navLinks: Record<Locale, Array<{ href: string; label: string }>> = {
  en: [
    { href: "/properties", label: "See available homes" },
    { href: "/stop-foreclosure", label: "Stop a foreclosure" },
    { href: "/take-over-payments", label: "Take over payments" },
    { href: "/sell", label: "Situations we buy" },
    { href: "/about", label: "About us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact us" },
  ],
  es: [
    { href: "/es/propiedades", label: "Casas en venta" },
    { href: "/es/ejecucion-hipotecaria", label: "Ejecución hipotecaria" },
    { href: "/es/oferta-en-efectivo", label: "Oferta de contado" },
    { href: "/es/tomar-los-pagos", label: "Tomar los pagos" },
    { href: "/es/vender", label: "Situaciones" },
    { href: "/es/nosotros", label: "Nosotros" },
    { href: "/blog", label: "Artículos" },
    { href: "/es/contacto", label: "Contacto" },
  ],
};

export const navStrings: Record<Locale, { skip: string; menu: string; logoAlt: string; navLabel: string; mobileNavLabel: string; switchTo: string; switchToPath: string }> = {
  en: {
    skip: "Skip to content",
    menu: "Menu",
    logoAlt: "Vamos Properties",
    navLabel: "Primary",
    mobileNavLabel: "Mobile",
    switchTo: "Español",
    switchToPath: "/es",
  },
  es: {
    skip: "Saltar al contenido",
    menu: "Menú",
    logoAlt: "Vamos Properties",
    navLabel: "Principal",
    mobileNavLabel: "Móvil",
    switchTo: "English",
    switchToPath: "/",
  },
};

// ─── Footer ───────────────────────────────────────────────────────────────────

export const footerStrings: Record<Locale, {
  tagline: string;
  hoursLabel: string;
  helpHeading: string;
  citiesHeading: string;
  langHeading: string;
  disclaimer: string;
  links: Array<{ href: string; label: string }>;
}> = {
  en: {
    tagline: "Local buyers for homeowners in Maricopa County, Arizona. Call 8:00 a.m. to 7:00 p.m., seven days.",
    hoursLabel: "How we can help",
    helpHeading: "How we can help",
    citiesHeading: "Cities",
    langHeading: "En español",
    disclaimer:
      "Asking for an offer does not obligate you to sell. A cash price is usually below a listed price because the house is bought as-is and the closing costs are covered. Taking over payments can leave the loan in your name. Have a lawyer review anything you sign. This site is not legal advice.",
    links: [
      { href: "/cash-offer", label: "Get a cash offer" },
      { href: "/stop-foreclosure", label: "Stop a foreclosure" },
      { href: "/take-over-payments", label: "Take over the payments" },
      { href: "/sell", label: "Situations we buy" },
      { href: "/guides", label: "Selling guides" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "Patrick and Jaime" },
      { href: "/properties", label: "Homes for sale" },
    ],
  },
  es: {
    tagline: "Compradores locales para dueños de casa en el condado de Maricopa. Llame de 8:00 a.m. a 7:00 p.m., los siete días.",
    hoursLabel: "Cómo podemos ayudar",
    helpHeading: "Cómo podemos ayudar",
    citiesHeading: "Ciudades",
    langHeading: "También en inglés",
    disclaimer:
      "Pedir una oferta no lo obliga a vender. Un precio de contado suele ser menor que el de una casa listada, porque se compra tal como está y los costos de cierre van incluidos. Tomar los pagos puede dejar el préstamo a su nombre. Pida a un abogado que revise lo que firme. Este sitio no es un consejo legal.",
    links: [
      { href: "/es/ejecucion-hipotecaria", label: "Detener la ejecución hipotecaria" },
      { href: "/es/oferta-en-efectivo", label: "Oferta de contado" },
      { href: "/es/tomar-los-pagos", label: "Tomar los pagos" },
      { href: "/es/vender", label: "Situaciones que compramos" },
      { href: "/es/nosotros", label: "Patrick y Jaime" },
      { href: "/es/propiedades", label: "Casas en venta" },
      { href: "/blog", label: "Artículos, en inglés" },
    ],
  },
};

// ─── Call bar ─────────────────────────────────────────────────────────────────

export const callBarStrings: Record<Locale, { label: string; form: string }> = {
  en: { label: "Call or text", form: "Get an offer" },
  es: { label: "Llame o escriba", form: "Pedir oferta" },
};

export const whatsappStrings: Record<Locale, { label: string; message: string }> = {
  en: {
    label: "Chat on WhatsApp",
    message: "Hi, I would like to get more information about your properties/programs.",
  },
  es: {
    label: "Escribir por WhatsApp",
    message: "Hola, me gustaría más información sobre sus propiedades/programas.",
  },
};

// ─── Lead form ────────────────────────────────────────────────────────────────

export const formStrings: Record<Locale, {
  title: string;
  subtitle: string;
  address: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  messagePlaceholder: string;
  situation: string;
  path: string;
  consent: string;
  submit: string;
  submitting: string;
}> = {
  en: {
    title: "Tell us about the house",
    subtitle: "This takes under a minute. Patrick or Jaime reply the same day.",
    address: "Property address",
    name: "Your name",
    phone: "Mobile number",
    email: "Email address",
    message: "What is going on, in your words",
    messagePlaceholder: "A few lines are enough. Include the notice date if you have it.",
    situation: "What is happening",
    path: "How should we help",
    consent: "I agree that Vamos Properties LLC may call and text me about my house, including with automated messages. Message and data rates may apply. Consent is not required to sell or to receive an offer.",
    submit: "Get your cash offer",
    submitting: "Sending…",
  },
  es: {
    title: "Cuéntenos de la casa",
    subtitle: "Menos de un minuto. Patrick o Jaime responden el mismo día.",
    address: "Dirección de la propiedad",
    name: "Su nombre",
    phone: "Celular",
    email: "Correo electrónico",
    message: "Qué está pasando, en sus palabras",
    messagePlaceholder: "Unas líneas son suficientes. Incluya la fecha del aviso si la tiene.",
    situation: "Qué está pasando",
    path: "Cómo podemos ayudar",
    consent:
      "Acepto que Vamos Properties LLC me llame y me envíe mensajes de texto sobre mi casa, incluso con mensajes automáticos. Pueden aplicarse tarifas de mensajes y datos. El consentimiento no es necesario para vender ni para recibir una oferta.",
    submit: "Pedir mi oferta de contado",
    submitting: "Enviando…",
  },
};

// ─── Theme toggle ─────────────────────────────────────────────────────────────

export const themeStrings: Record<Locale, { light: string; dark: string }> = {
  en: { light: "Switch to light mode", dark: "Switch to dark mode" },
  es: { light: "Modo claro", dark: "Modo oscuro" },
};

// ─── Public property listings ─────────────────────────────────────────────────

export const propertyListingStrings: Record<
  Locale,
  {
    catalogTitle: string;
    catalogDescription: string;
    catalogIntro: string;
    catalogEmpty: string;
    search: string;
    searchPlaceholder: string;
    propertyType: string;
    allTypes: string;
    showHomes: string;
    noMatch: string;
    home: string;
    breadcrumb: string;
    back: string;
    forSale: string;
    callForPrice: string;
    call: string;
    about: string;
    priceHistory: string;
    facts: string;
    similarHeading: string;
    similarIntro: string;
    similarViewAll: string;
    map: string;
    mapCoords: string;
    mapAddress: string;
    openMap: string;
    openFolder: string;
    photos: string;
    photosEmpty: string;
    close: string;
    previous: string;
    next: string;
    copyLink: string;
    linkCopied: string;
    textHome: string;
    emailHome: string;
    askHeading: string;
    askSub: string;
    property: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    requestInfo: string;
    sending: string;
    checkFields: string;
    priceDropped: string;
    updated: string;
    down: string;
    beds: string;
    baths: string;
    sqft: string;
    type: string;
    hoa: string;
    ac: string;
    roof: string;
    waterHeater: string;
    titleCompany: string;
    arv: string;
    photoComing: string;
    statusActive: string;
    statusUnderContract: string;
    statusSold: string;
    statusInactive: string;
    types: Record<string, string>;
    nPhotos: (n: number) => string;
    allPhotos: (n: number) => string;
    viewAll: (n: number) => string;
    photoOf: (current: number, total: number) => string;
    photoAlt: (title: string, current: number, total: number) => string;
    mapTitle: (address: string) => string;
  }
> = {
  en: {
    catalogTitle: "Homes for sale",
    catalogDescription: "Homes for sale in Phoenix and Maricopa County. Call before you drive over.",
    catalogIntro: "Call before you drive over. Selling your own house starts on the contact page.",
    catalogEmpty: "No homes are listed right now. Call {phone} if you want to hear about the next one.",
    search: "Search",
    searchPlaceholder: "Address or title",
    propertyType: "Property type",
    allTypes: "All types",
    showHomes: "Show homes",
    noMatch: "Nothing matches that search right now.",
    home: "Home",
    breadcrumb: "Breadcrumb",
    back: "All homes",
    forSale: "For sale",
    callForPrice: "Call for the price",
    call: "Call",
    about: "About this home",
    priceHistory: "Price history",
    facts: "Facts and features",
    similarHeading: "Similar homes",
    similarIntro: "Other active homes in this city or close in price.",
    similarViewAll: "See all homes for sale",
    map: "Map",
    mapCoords: "The pin uses the coordinates from the listing. Confirm it before you visit.",
    mapAddress: "The pin is a search for the address. Confirm it before you visit.",
    openMap: "Open the map",
    openFolder: "Open the photo folder",
    photos: "Photos",
    photosEmpty: "Photos are not up yet.",
    close: "Close",
    previous: "Previous",
    next: "Next",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    textHome: "Text this home",
    emailHome: "Email this home",
    askHeading: "Ask about this home",
    askSub: "Patrick or Jaime will call you back. This does not hold the house.",
    property: "Property",
    name: "Your name",
    email: "Email",
    phone: "Mobile number",
    message: "What do you want to know",
    requestInfo: "Request information",
    sending: "Sending…",
    checkFields: "Check the highlighted fields, then send it again.",
    priceDropped: "Price dropped",
    updated: "Updated",
    down: "Down",
    beds: "Beds",
    baths: "Baths",
    sqft: "Sq ft",
    type: "Type",
    hoa: "HOA",
    ac: "A/C",
    roof: "Roof",
    waterHeater: "Water heater",
    titleCompany: "Title company",
    arv: "ARV",
    photoComing: "Photo coming",
    statusActive: "Active",
    statusUnderContract: "Under contract",
    statusSold: "Sold",
    statusInactive: "Inactive",
    types: {
      house: "House",
      townhouse: "Townhouse",
      condo: "Condo",
      manufactured: "Manufactured",
      land: "Land",
    },
    nPhotos: (n) => `${n} photos`,
    allPhotos: (n) => `All ${n} photos`,
    viewAll: (n) => `View all ${n}`,
    photoOf: (current, total) => `${current} of ${total}`,
    photoAlt: (title, current, total) => `${title}, photo ${current} of ${total}`,
    mapTitle: (address) => `Map of ${address}`,
  },
  es: {
    catalogTitle: "Casas en venta",
    catalogDescription: "Casas en venta en Phoenix y el condado de Maricopa. Llame antes de ir.",
    catalogIntro: "Llame antes de ir. Si quiere vender su casa, empiece en la página de contacto.",
    catalogEmpty: "No hay casas en la lista ahora. Llame al {phone} si quiere saber de la próxima.",
    search: "Buscar",
    searchPlaceholder: "Dirección o título",
    propertyType: "Tipo de propiedad",
    allTypes: "Todos los tipos",
    showHomes: "Ver casas",
    noMatch: "Nada coincide con esa búsqueda ahora.",
    home: "Inicio",
    breadcrumb: "Ruta de navegación",
    back: "Todas las casas",
    forSale: "En venta",
    callForPrice: "Llame para el precio",
    call: "Llamar",
    about: "Sobre esta casa",
    priceHistory: "Historial de precio",
    facts: "Datos y características",
    similarHeading: "Casas parecidas",
    similarIntro: "Otras casas activas en esta ciudad o de un precio parecido.",
    similarViewAll: "Ver todas las casas en venta",
    map: "Mapa",
    mapCoords: "El pin usa las coordenadas del anuncio. Confírmelo antes de ir.",
    mapAddress: "El pin es una búsqueda de la dirección. Confírmelo antes de ir.",
    openMap: "Abrir el mapa",
    openFolder: "Abrir la carpeta de fotos",
    photos: "Fotos",
    photosEmpty: "Las fotos aún no están.",
    close: "Cerrar",
    previous: "Anterior",
    next: "Siguiente",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    textHome: "Enviar esta casa por texto",
    emailHome: "Enviar esta casa por correo",
    askHeading: "Pregunte por esta casa",
    askSub: "Patrick o Jaime le devolverán la llamada. Esto no aparta la casa.",
    property: "Propiedad",
    name: "Su nombre",
    email: "Correo electrónico",
    phone: "Celular",
    message: "Qué quiere saber",
    requestInfo: "Pedir información",
    sending: "Enviando…",
    checkFields: "Revise los campos marcados y envíelo de nuevo.",
    priceDropped: "Bajó el precio",
    updated: "Actualizado",
    down: "Bajó",
    beds: "Recámaras",
    baths: "Baños",
    sqft: "Pies²",
    type: "Tipo",
    hoa: "HOA",
    ac: "Aire acondicionado",
    roof: "Techo",
    waterHeater: "Calentador de agua",
    titleCompany: "Compañía de título",
    arv: "ARV",
    photoComing: "Foto próximamente",
    statusActive: "Activa",
    statusUnderContract: "En contrato",
    statusSold: "Vendida",
    statusInactive: "Inactiva",
    types: {
      house: "Casa",
      townhouse: "Townhouse",
      condo: "Condominio",
      manufactured: "Manufacturada",
      land: "Terreno",
    },
    nPhotos: (n) => `${n} fotos`,
    allPhotos: (n) => `Las ${n} fotos`,
    viewAll: (n) => `Ver las ${n}`,
    photoOf: (current, total) => `${current} de ${total}`,
    photoAlt: (title, current, total) => `${title}, foto ${current} de ${total}`,
    mapTitle: (address) => `Mapa de ${address}`,
  },
};

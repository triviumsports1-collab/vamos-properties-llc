import type { Faq } from "@/lib/content/faqs";
import { spanishForeclosurePath } from "@/lib/site";

type Block = { title: string; body: string };

export type SituationEs = {
  /** English slug this page mirrors (used for hreflang). */
  enSlug: string;
  slug: string;
  label: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  heroLine: string;
  blurb: string;
  intro: string[];
  fact: { text: string; note: string };
  problems: Block[];
  steps: Block[];
  rules: Block[];
  gather: string[];
  faqs: Faq[];
  related: Array<{ href: string; label: string }>;
  /** YYYY-MM-DD of the last content change to this page pair; feeds the sitemap's lastmod. */
  updatedAt?: string;
};

const cashOffer = { href: "/es/oferta-en-efectivo", label: "Cómo se calcula una oferta de contado" };
const foreclosure = { href: spanishForeclosurePath, label: "¿Atrasado con los pagos? Detener una ejecución hipotecaria" };
const takeOver = { href: "/es/tomar-los-pagos", label: "Tomar los pagos" };

export const situationsEs: SituationEs[] = [
  {
    enSlug: "inherited-house",
    slug: "casa-heredada",
    label: "Casa heredada o sucesión",
    title: "Vender una casa heredada en Phoenix al contado",
    description:
      "¿Heredó una casa en el condado de Maricopa? Cómo una sucesión (probate), una escritura de beneficiario o una declaración jurada de patrimonio pequeño deciden quién firma, y cómo funciona una venta de contado.",
    eyebrow: "Heredó una casa en Arizona",
    h1: "Venda una casa heredada sin arreglarla ni vaciarla primero.",
    heroLine:
      "La casa llegó con una llave, un préstamo y un garaje lleno de la vida de otra persona. Antes de venderla, alguien tiene que tener el derecho de firmar. Empezamos por ahí.",
    blurb: "Sucesión, escritura de beneficiario, hermanos que no se ponen de acuerdo y una casa vacía.",
    intro: [
      "Casi todas las casas heredadas de las que nos hablan en el Valle no son primero un problema de bienes raíces. Son un problema de papeles: quién es dueño ahora, quién puede firmar y quién tiene que estar de acuerdo.",
      "Arizona ofrece varias formas de resolverlo. A veces una escritura de beneficiario ya lo hizo. A veces basta una declaración jurada de patrimonio pequeño. Y a veces la Corte Superior del condado de Maricopa tiene que nombrar primero a un representante personal. La respuesta decide qué tan pronto se puede cerrar, por eso es lo primero que preguntamos.",
      "Después de eso, la casa es la parte fácil. La compramos tal como está, con los muebles, el techo viejo y las cajas del garaje, y una compañía de título paga el préstamo y los gravámenes con la venta.",
    ],
    fact: {
      text: "Una escritura de beneficiario (A.R.S. § 33-405) registrada antes de que el dueño falleciera puede pasar la casa a la persona nombrada sin sucesión. Solo funciona si se registró en vida del dueño.",
      note: "Revise en el Registrador del condado de Maricopa si hay una escritura a nombre del dueño antes de dar por hecho que necesita una sucesión.",
    },
    problems: [
      {
        title: "Nadie vive ahí y sigue costando dinero",
        body: "La hipoteca, los impuestos, el seguro, la HOA y la luz del verano siguen llegando mientras se arregla la herencia. Una casa vacía también puede ser más difícil de asegurar.",
      },
      {
        title: "Los herederos no se ponen de acuerdo",
        body: "Uno quiere quedarse con ella, otro rentarla y otro venderla. Una venta necesita a quienes tienen derecho a firmar. Podemos mostrar a todos el mismo número y el mismo cálculo.",
      },
      {
        title: "Toda una vida de cosas adentro",
        body: "No tiene que vaciarla. Llévense lo que importa a la familia y dejen lo demás. Limpiarla es trabajo nuestro después del cierre.",
      },
      {
        title: "Reparaciones que nadie quiere pagar",
        body: "Una casa heredada a menudo necesita techo, plomería o aire acondicionado que se fueron dejando. Un precio de contado ya lo toma en cuenta, así la herencia no adelanta dinero.",
      },
    ],
    steps: [
      {
        title: "Cuéntenos qué tiene la herencia",
        body: "La dirección, el nombre en la escritura, si hay testamento, escritura de beneficiario o un caso en la corte, y cuánto se debe de la casa.",
      },
      {
        title: "Reciba un número por la casa tal como está",
        body: "Nuestros especialistas ven la casa y dan a todos los herederos el mismo número con el cálculo. Nadie tiene que limpiar ni reparar nada antes.",
      },
      {
        title: "Cierre cuando los papeles lo permitan",
        body: "Una compañía de título del condado de Maricopa confirma quién puede firmar, paga el préstamo y los gravámenes, y entrega el resto como indique la herencia.",
      },
    ],
    rules: [
      {
        title: "Quién puede firmar",
        body: "Normalmente la persona nombrada en una escritura de beneficiario, un heredero con una declaración jurada de patrimonio pequeño, o un representante personal nombrado por la corte. La compañía de título pedirá el documento que da esa autoridad.",
      },
      {
        title: "El camino de patrimonio pequeño para una casa",
        body: "Arizona permite una declaración jurada para bienes inmuebles en lugar de una sucesión completa cuando los bienes inmuebles en Arizona están por debajo del límite de A.R.S. § 14-3971, que es de $300,000 para fallecimientos desde el 26 de septiembre de 2025, y han pasado al menos seis meses desde el fallecimiento.",
      },
      {
        title: "El préstamo no se vence solo porque el dueño falleció",
        body: "La ley federal (Garn–St Germain) generalmente impide que el prestamista cobre todo el préstamo solo porque la casa pasó a un familiar por fallecimiento. Los pagos sí tienen que seguir, así que no conviene esperar demasiado.",
      },
    ],
    gather: [
      "El certificado de defunción",
      "El testamento o fideicomiso, si existe",
      "Cualquier escritura de beneficiario o cartas de la corte que nombren a un representante personal",
      "El último estado de cuenta de la hipoteca y la factura de impuestos",
      "Nombre y contacto de la HOA, si hay una",
      "Nombres y teléfonos de los demás herederos",
    ],
    faqs: [
      {
        question: "¿Podemos vender antes de que termine la sucesión?",
        answer:
          "Pueden hablar con nosotros, recibir un número y firmar cuando alguien tenga la autoridad legal para vender. En una sucesión informal, el representante personal a menudo puede vender una vez nombrado, sin esperar a que se cierre la herencia. Su abogado puede confirmar qué permiten sus cartas.",
      },
      {
        question: "¿Tenemos que vaciar la casa?",
        answer:
          "No. Llévense lo que la familia quiera conservar. Lo que quede después del cierre es asunto nuestro, incluidos muebles, aparatos y lo que haya en el garaje.",
      },
      {
        question: "¿Y si un heredero no quiere vender?",
        answer:
          "No presionamos a nadie. Una venta necesita a quienes tienen derecho a firmar, y a veces los herederos o la corte tienen que resolverlo primero. Podemos dar a todos la misma oferta por escrito para que la conversación empiece con los mismos datos.",
      },
      {
        question: "La casa todavía tiene hipoteca. ¿Es un problema?",
        answer:
          "No por sí solo. Al cierre, la compañía de título paga el préstamo con el precio de venta y la herencia recibe lo que sobra. Díganos el saldo pronto para decirle con claridad si el número lo cubre.",
      },
      {
        question: "¿Quién recibe el dinero de la venta?",
        answer:
          "La compañía de título lo entrega como indiquen el documento de autoridad y la herencia, normalmente al representante personal o a los herederos. Nosotros no decidimos cómo se reparte una herencia.",
      },
      {
        question: "Vivimos fuera de Arizona. ¿Podemos vender?",
        answer:
          "Sí. Muchos herederos nunca vienen a Arizona para esto. Las compañías de título normalmente pueden enviar un notario móvil o remoto para firmar, y nos vemos en la casa con quien tenga la llave.",
      },
    ],
    related: [cashOffer, foreclosure, takeOver],
  },
  {
    enSlug: "divorce",
    slug: "divorcio",
    label: "Divorcio",
    title: "Vender una casa durante un divorcio en Arizona",
    description:
      "Vender una casa en el condado de Maricopa durante o después de un divorcio: por qué normalmente firman los dos cónyuges, qué dice la orden de la corte y cómo una venta de contado da un solo número para repartir.",
    eyebrow: "Vender durante un divorcio",
    h1: "Una casa, dos personas y un número que los dos pueden ver.",
    heroLine:
      "En un divorcio, la casa suele ser lo más grande que queda por decidir. Una venta de contado da a los dos el mismo número por escrito, una fecha que ustedes eligen y nada de visitas mientras arreglan lo demás.",
    blurb: "Firman los dos, la orden de la corte importa y nadie quiere visitas.",
    intro: [
      "Arizona es un estado de bienes gananciales (propiedad comunitaria). Una casa comprada durante el matrimonio normalmente es de los dos cónyuges, sin importar a nombre de quién esté la hipoteca, y venderla normalmente requiere las dos firmas.",
      "Eso hace distinta una venta por divorcio. La pregunta no es solo cuánto vale la casa, sino si los dos están de acuerdo, si la corte ya dijo qué pasa con ella y cómo se reparte el dinero al cierre.",
      "No tomamos partido. Damos a los dos, o a los dos abogados, la misma oferta con el mismo cálculo. Si están de acuerdo, la compañía de título sigue el decreto o su acuerdo por escrito al pagar.",
    ],
    fact: {
      text: "Cuando se entrega una petición de divorcio en Arizona, una orden preliminar (A.R.S. § 25-315) generalmente impide que cualquiera de los cónyuges venda bienes comunes sin el consentimiento por escrito del otro o una orden de la corte.",
      note: "Pregunte a su abogado de familia qué dice su orden antes de firmar cualquier cosa.",
    },
    problems: [
      {
        title: "Ninguno de los dos puede pagarla solo",
        body: "Un solo ingreso tal vez no alcance para el pago, los impuestos y el seguro. Esperar una compra de la otra parte que no se puede financiar a menudo termina en pagos atrasados.",
      },
      {
        title: "Visitas mientras todavía viven ahí",
        body: "Listar significa limpiar, preparar la casa y extraños caminando por un hogar que ya está tenso. Una venta directa necesita una sola visita.",
      },
      {
        title: "Discutir el precio",
        body: "Una oferta de contado por escrito es un solo número que los dos abogados pueden revisar. Cualquiera puede compararla con un estimado de listado antes de decidir.",
      },
      {
        title: "Una fecha de mudanza que funcione",
        body: "Pueden elegir una fecha de cierre que encaje con el decreto, el año escolar o un contrato de renta en otro lugar.",
      },
    ],
    steps: [
      {
        title: "Cualquiera de los dos puede llamar",
        body: "Preguntaremos si el otro cónyuge sabe y está de acuerdo, y si hay abogado. Preguntar no obliga a nada.",
      },
      {
        title: "Los dos reciben la misma oferta",
        body: "Enviamos un número por escrito a los dos cónyuges o a los dos abogados, con lo que el pago del préstamo y los costos de cierre hacen al resultado.",
      },
      {
        title: "Título reparte como acordaron",
        body: "Firman los dos. La compañía de título paga el préstamo y los gravámenes, y divide lo que queda según el decreto o su acuerdo firmado.",
      },
    ],
    rules: [
      {
        title: "Normalmente firman los dos cónyuges",
        body: "Según A.R.S. § 25-214, vender bienes inmuebles comunes generalmente requiere que firmen ambos cónyuges. La compañía de título pedirá las dos firmas, o una orden de la corte que diga otra cosa.",
      },
      {
        title: "La orden de la corte manda",
        body: "Si un decreto o una orden temporal dice quién se queda con la casa o cómo se vende, la venta tiene que seguirla. Traiga la orden a la primera llamada.",
      },
      {
        title: "Impuestos sobre la venta",
        body: "Algunos vendedores pueden excluir parte de la ganancia de su vivienda principal según la ley federal. Cómo aplica en un divorcio depende de su caso. Consulte a un profesional de impuestos antes de cerrar.",
      },
    ],
    gather: [
      "El decreto de divorcio o cualquier orden temporal sobre la casa",
      "El último estado de cuenta de la hipoteca, y cualquier HELOC o segundo préstamo",
      "Los datos de contacto de los dos cónyuges, o de los dos abogados",
      "Nombre y contacto de la HOA, si hay una",
      "Una fecha de mudanza que funcione para los dos",
    ],
    faqs: [
      {
        question: "¿Puedo vender la casa si mi cónyuge no quiere firmar?",
        answer:
          "Normalmente no por su cuenta. Los bienes inmuebles comunes en Arizona generalmente requieren la firma de los dos, y una vez presentado el divorcio suele haber una orden contra vender sin consentimiento. Su abogado puede pedir una orden a la corte si su cónyuge no coopera.",
      },
      {
        question: "¿Podemos vender antes de que el divorcio sea final?",
        answer:
          "A menudo sí, si los dos están de acuerdo por escrito o la corte lo aprueba. Muchas parejas venden primero para repartir dinero en lugar de una casa.",
      },
      {
        question: "¿Quién recibe el dinero?",
        answer:
          "La compañía de título entrega el dinero como diga su decreto o su acuerdo por escrito. Nosotros no decidimos el reparto ni tomamos partido.",
      },
      {
        question: "¿Y si uno de los dos ya se mudó?",
        answer:
          "Es común. Podemos hacer la visita con quien todavía vive ahí, y el otro puede firmar por separado, a menudo con un notario móvil.",
      },
      {
        question: "¿Y si debemos más de lo que vale la casa?",
        answer:
          "Díganos el saldo. Le diremos con claridad si una venta de contado no lo cubre. En ese caso, su abogado puede ver una venta corta (short sale) u otra opción, y no vamos a fingir lo contrario.",
      },
    ],
    related: [cashOffer, takeOver, foreclosure],
  },
  {
    enSlug: "rental-property",
    slug: "casa-de-alquiler",
    label: "Casa rentada con inquilinos",
    title: "Vender una casa rentada con inquilinos en Phoenix",
    description:
      "¿Cansado de ser arrendador en el condado de Maricopa? Venda una casa rentada con el inquilino adentro, el contrato vigente y sin reparaciones entre inquilinos.",
    eyebrow: "Cansado de ser arrendador",
    h1: "Venda la casa rentada con el inquilino adentro.",
    heroLine:
      "No tiene que esperar a que termine el contrato, desalojar a nadie ni arreglar la casa entre inquilinos. Compramos casas rentadas tal como están, con el contrato incluido.",
    blurb: "Inquilino adentro, un contrato que no ha terminado o una casa que necesita trabajo.",
    intro: [
      "Muchas llamadas de arrendadores empiezan igual: la casa fue una buena idea en su momento, y ahora son rentas atrasadas, llamadas de reparación y la factura del administrador.",
      "Vender una casa rentada en el mercado abierto normalmente significa esperar a que el inquilino se vaya, pagar reparaciones y limpieza, y luego listar una casa vacía. Una venta directa se salta eso. Podemos comprar con el inquilino adentro y asumir el contrato.",
      "Si el inquilino está atrasado o la casa necesita trabajo, eso cambia el número. No impide la venta.",
    ],
    fact: {
      text: "En Arizona, un arrendador generalmente tiene que avisar al inquilino con dos días de anticipación antes de entrar por algo que no es emergencia (A.R.S. § 33-1343). Planeamos la única visita con ese aviso.",
      note: "El contrato puede decir más. Tráigalo a la llamada.",
    },
    problems: [
      {
        title: "Un inquilino que paga tarde, o no paga",
        body: "Puede vender con la situación como está. Queremos saber cuánto se debe y si se ha entregado algún aviso, para que el número lo refleje.",
      },
      {
        title: "Reparaciones entre cada inquilino",
        body: "Alfombra, pintura, aparatos y un aire acondicionado al final de su vida. Un precio de contado es por la casa como está, no después de prepararla.",
      },
      {
        title: "Vive lejos de la casa",
        body: "Los dueños fuera del estado pueden vender sin viajar. La compañía de título puede organizar la firma donde usted esté.",
      },
      {
        title: "Las visitas molestarían al inquilino",
        body: "Listar significa entradas repetidas y extraños caminando por la casa. Una venta directa normalmente necesita una visita, con el aviso debido.",
      },
    ],
    steps: [
      {
        title: "Envíe la dirección y los datos del contrato",
        body: "Renta, fecha de fin del contrato, depósito que tiene, si la renta está al corriente y cuánto se debe de la casa.",
      },
      {
        title: "Una visita, con aviso",
        body: "Programamos una sola visita, con el aviso que corresponde al inquilino. Luego recibe un número con el cálculo.",
      },
      {
        title: "Cierre y entregue el contrato",
        body: "La compañía de título paga el préstamo y los gravámenes. El contrato y el depósito pasan a nosotros al cierre, y le decimos al inquilino a quién pagar.",
      },
    ],
    rules: [
      {
        title: "El contrato sigue con la casa",
        body: "Una venta no cancela un contrato de renta residencial. El comprador generalmente toma el lugar del arrendador, y el inquilino conserva los derechos que le dan el contrato y la Ley de Arrendadores e Inquilinos Residenciales de Arizona.",
      },
      {
        title: "Los depósitos se transfieren",
        body: "El depósito que usted tiene pasa al nuevo dueño al cierre, así el dinero del inquilino queda en cuenta. Aparece en la hoja de cierre.",
      },
      {
        title: "Impuestos sobre una propiedad de inversión",
        body: "Vender una casa rentada puede generar ganancias de capital y recuperación de depreciación. Algunos dueños usan un intercambio 1031, con plazos federales estrictos (45 días para identificar y 180 para cerrar). Hable con un profesional de impuestos antes de firmar.",
      },
    ],
    gather: [
      "El contrato actual y cualquier aviso por escrito al inquilino",
      "Un registro de rentas pagadas y adeudadas",
      "El monto del depósito de seguridad",
      "El último estado de cuenta de la hipoteca y la factura de impuestos",
      "Contacto del administrador, si tiene uno",
    ],
    faqs: [
      {
        question: "¿Tengo que desalojar al inquilino antes de vender?",
        answer:
          "No. Compramos con inquilinos adentro. Si ya empezó un desalojo, díganos en qué va, porque afecta la fecha y el número.",
      },
      {
        question: "¿Van a subir la renta o sacar al inquilino?",
        answer:
          "Asumimos el contrato tal como está escrito, y el inquilino conserva los derechos que le da. Lo que pase al terminar el contrato es una conversación para después, y tiene que seguir la ley de Arizona.",
      },
      {
        question: "¿Qué pasa con el depósito de seguridad?",
        answer:
          "Se transfiere a nosotros al cierre y aparece en la hoja de cierre. Desde entonces, nosotros respondemos por él según el contrato.",
      },
      {
        question: "¿Puedo vender una casa rentada vacía y maltratada?",
        answer:
          "Sí. Una casa rentada vacía y con daños es una llamada común. La compramos tal como está, y el estado es parte del número.",
      },
      {
        question: "¿Compran dúplex o fourplex?",
        answer:
          "Envíelo. Dúplex, tríplex y fourplex en el condado de Maricopa valen una llamada. Edificios más grandes pueden quedar fuera de lo que compramos, y se lo diremos.",
      },
    ],
    related: [cashOffer, takeOver, foreclosure],
  },
  {
    enSlug: "as-is",
    slug: "tal-como-esta",
    label: "Casa que necesita reparaciones",
    title: "Vender una casa tal como está en Phoenix al contado",
    description:
      "Venda una casa en el condado de Maricopa que necesita reparaciones: techo, cimientos, plomería vieja, daños por fuego o agua, o una casa demasiado llena para mostrar. Sin reparaciones, sin limpieza, sin lista de inspección.",
    eyebrow: "Véndala tal como está",
    h1: "Venda la casa como está hoy.",
    heroLine:
      "Un techo que gotea, plomería de otra época, un incendio o una casa demasiado llena para mostrar. No tiene que arreglarla, limpiarla ni dar a un comprador una lista de reparaciones. El estado cambia el número, no si la vemos.",
    blurb: "Techo, cimientos, plomería vieja, daños por fuego o agua, o una casa llena.",
    intro: [
      "Un comprador normal suele necesitar un préstamo, y el prestamista suele pedir que la casa pase un avalúo y una inspección. Una casa con reparaciones grandes puede no pasar, o convertirse en una larga lista de peticiones después de la inspección.",
      "Nosotros pagamos de contado y compramos la casa como está. No hay petición de reparaciones ni un reporte de inspección que negociar después. La vemos una vez, incluimos las reparaciones en el precio y le mostramos el cálculo.",
      "Usted sigue decidiendo. Un precio de contado por una casa que necesita trabajo será menor que lo que podría pedir una casa ya arreglada. Algunos dueños aceptan el contado y otros la arreglan y la listan. Las dos opciones son válidas.",
    ],
    fact: {
      text: "Muchas casas del Valle construidas entre finales de los 70 y mediados de los 90 tienen tubería de polibutileno, que aseguradoras e inspectores suelen señalar. Es una de las reparaciones que incluimos en el precio, no una razón para decir que no.",
      note: "Si no sabe qué tubería tiene, podemos revisarla durante la visita.",
    },
    problems: [
      {
        title: "Techo, cimientos o aire acondicionado al final de su vida",
        body: "Las reparaciones caras que hacen que un prestamista o un comprador se retire. Las incluimos en el precio en vez de pedirle que las haga.",
      },
      {
        title: "Daños por fuego, agua o moho",
        body: "Daños tras un incendio, una tubería rota o una gotera del monzón. Si hay un reclamo de seguro abierto, díganos para que la compañía de título lo tome en cuenta.",
      },
      {
        title: "Demasiadas cosas para mostrarla",
        body: "Una casa con acumulación o años de pertenencias. Usted se lleva lo que quiere conservar. Lo que quede es trabajo nuestro después del cierre.",
      },
      {
        title: "Obras sin permiso o problemas con la ciudad",
        body: "Un patio cerrado, un garaje convertido o un aviso abierto de la ciudad. Díganos lo que sabe y lo tomamos en cuenta.",
      },
    ],
    steps: [
      {
        title: "Díganos qué está mal",
        body: "La dirección y lo que sabe del techo, la plomería, el aire acondicionado, los daños o los permisos. No limpie antes.",
      },
      {
        title: "Una visita y luego un número",
        body: "Nuestros especialistas recorren la casa una vez y le dan un precio con las reparaciones que consideramos. No sigue ninguna lista de inspección.",
      },
      {
        title: "Cierre en su fecha",
        body: "Una compañía de título del condado de Maricopa maneja el cierre y paga el préstamo y los gravámenes. Deje lo que no quiera.",
      },
    ],
    rules: [
      {
        title: "Tal como está también significa honesto",
        body: "En Arizona se espera que el vendedor diga lo que sabe de la casa. Díganos los problemas que conoce. No impide la venta y lo protege a usted.",
      },
      {
        title: "Violaciones abiertas de la ciudad o la HOA",
        body: "Un aviso de la ciudad o una multa de la HOA puede aparecer en el título como gravamen o cobro. La compañía de título resuelve qué se paga al cierre.",
      },
      {
        title: "Reclamos de seguro",
        body: "Si tiene un reclamo abierto o recibió dinero del seguro por daños, dígalo. Quién se queda con el reclamo o el pago se decide en el contrato, no después.",
      },
    ],
    gather: [
      "Lo que sabe del techo, la plomería, la electricidad, el aire acondicionado y los cimientos",
      "Número de reclamo de seguro por fuego o agua, si hay uno",
      "Avisos de violación de la ciudad, el condado o la HOA",
      "El último estado de cuenta de la hipoteca",
      "Permisos o recibos de trabajos hechos, si los tiene",
    ],
    faqs: [
      {
        question: "¿Tengo que limpiar la casa antes de que la vean?",
        answer:
          "No. Preferimos verla como está. Limpiar antes de la visita casi no cambia el número y le cuesta tiempo y dinero.",
      },
      {
        question: "¿Van a pedir reparaciones después de la inspección?",
        answer:
          "No. Vemos la casa antes de hacer la oferta y las reparaciones ya están en el precio. No regresamos con una lista después de que usted acepta.",
      },
      {
        question: "¿Por qué un precio de contado es menor que listar?",
        answer:
          "Porque nosotros pagamos las reparaciones, los costos de mantenerla y el riesgo, y usted se ahorra la comisión, las visitas y el ir y venir de la inspección. Le mostramos ese cálculo para que compare.",
      },
      {
        question: "¿Compran una casa con daños por fuego?",
        answer:
          "Sí. Díganos si hay un reclamo de seguro abierto y si la casa está tapiada o asegurada. Las dos cosas afectan la fecha y el número.",
      },
      {
        question: "¿Y si la casa tiene ampliaciones sin permiso?",
        answer:
          "Díganos qué se construyó y cuándo. Lo tomamos en cuenta en el precio. Es común en el Valle y, por sí solo, no impide una venta de contado.",
      },
    ],
    related: [cashOffer, { href: "/es/vender/casa-heredada", label: "¿Heredó una casa que necesita trabajo?" }, foreclosure],
  },
  {
    enSlug: "relocation",
    slug: "mudanza",
    label: "Mudanza o reubicación",
    title: "Vender su casa rápido si se muda de Phoenix",
    description:
      "¿Se muda por trabajo, el ejército o la familia? Venda una casa en el condado de Maricopa en la fecha que su mudanza necesita, sin pagar dos viviendas ni listar a distancia.",
    eyebrow: "Se muda fuera del Valle",
    h1: "Venda en la fecha que su mudanza necesita.",
    heroLine:
      "Un trabajo nuevo, órdenes militares o la familia en otro estado. Usted elige la fecha de cierre, firma desde donde esté y no paga dos viviendas mientras una casa listada espera.",
    blurb: "Trabajo nuevo, órdenes militares o familia lejos, en la fecha que usted elija.",
    intro: [
      "Una mudanza le pone fecha a todo. El trabajo empieza, las órdenes dicen preséntese, o la renta en la nueva ciudad comienza, y la casa de Phoenix sigue aquí.",
      "Listar a distancia significa manejar visitas, reparaciones y ofertas por teléfono cuando ya se fue. Una venta directa le da un número y una fecha de cierre que usted elige, para planear la mudanza alrededor de ella.",
      "Si la casa se vendería por más en el mercado abierto y tiene tiempo, listar puede ser mejor opción. Se lo diremos si el cálculo apunta ahí.",
    ],
    fact: {
      text: "Las compañías de título en Arizona normalmente pueden organizar un notario móvil o remoto, así puede firmar los papeles del cierre desde su nueva ciudad sin volar de regreso.",
      note: "Pregunte pronto a la compañía de título qué opción de firma ofrece para su caso.",
    },
    problems: [
      {
        title: "Dos pagos de vivienda al mismo tiempo",
        body: "Renta o una hipoteca nueva donde va, más el pago de Phoenix, impuestos, seguro y servicios hasta que la casa se venda.",
      },
      {
        title: "Una fecha de inicio que no se mueve",
        body: "Las fechas de trabajo y de presentación son fijas. Una fecha de cierre que usted elige le deja planear hacia atrás.",
      },
      {
        title: "Vender desde otro lugar",
        body: "Visitas, reparaciones e inspecciones son difíciles de manejar desde otro estado. Necesitamos una visita y su firma.",
      },
      {
        title: "Sin tiempo para arreglarla",
        body: "La compramos como está. Deje la pintura, el jardín y la alfombra gastada. Llévese lo que quiera y deje lo demás.",
      },
    ],
    steps: [
      {
        title: "Díganos su fecha de mudanza",
        body: "La dirección, cuánto debe y la fecha en que necesita irse o necesita el dinero.",
      },
      {
        title: "Una visita, antes o después de irse",
        body: "Podemos ver la casa mientras usted sigue ahí, o vernos con alguien que tenga la llave después de que se vaya.",
      },
      {
        title: "Firme desde donde esté",
        body: "La compañía de título organiza la firma en su nueva ciudad y paga el préstamo con la venta. El resto se le envía a usted.",
      },
    ],
    rules: [
      {
        title: "Su préstamo se paga al cierre",
        body: "La compañía de título pide el saldo a su prestamista y lo paga con la venta. No tiene que coordinarlo a distancia.",
      },
      {
        title: "Servicios y HOA",
        body: "Los servicios siguen hasta el cierre. Las cuotas de la HOA se prorratean, y la compañía de título pide los papeles de transferencia de la HOA.",
      },
      {
        title: "Mudanzas militares",
        body: "Si se muda con órdenes, por ejemplo desde la Base Aérea Luke, díganos su fecha de presentación. Hable con la oficina legal de su base sobre beneficios que apliquen a su préstamo o contrato.",
      },
    ],
    gather: [
      "Su fecha de mudanza y la fecha en que necesita el dinero",
      "El último estado de cuenta de la hipoteca",
      "Nombre y contacto de la HOA, si hay una",
      "Quién tendrá una llave después de que se vaya",
      "Su nueva dirección para los papeles del cierre",
    ],
    faqs: [
      {
        question: "¿Puedo cerrar después de mudarme?",
        answer:
          "Sí. La compañía de título normalmente puede organizar un notario móvil o remoto donde usted viva. Solo alguien tiene que abrirnos para la visita.",
      },
      {
        question: "¿Qué tan rápido podemos cerrar?",
        answer:
          "Un título limpio a menudo cierra en un par de semanas. No prometemos un número exacto de días antes de saber del préstamo, los gravámenes y la HOA.",
      },
      {
        question: "¿Puedo elegir una fecha de cierre más tarde?",
        answer:
          "Sí. Si su mudanza es en unos meses, podemos poner el cierre cuando lo necesite. Pregúntelo en la primera llamada.",
      },
      {
        question: "¿Debería listarla mejor?",
        answer:
          "Si tiene tiempo y la casa se ve bien, listar puede dar más. Si el problema es el tiempo, la distancia o las reparaciones, una venta de contado es más simple. Le mostramos el cálculo en los dos casos.",
      },
      {
        question: "¿Qué pasa con lo que deje en la casa?",
        answer:
          "Llévese lo que quiera. Lo que quede después del cierre es asunto nuestro, así no tiene que organizar una limpieza desde otro estado.",
      },
    ],
    related: [cashOffer, takeOver, foreclosure],
  },
  {
    enSlug: "behind-on-property-taxes",
    slug: "impuestos-atrasados",
    updatedAt: "2026-11-27",
    label: "Impuestos a la propiedad atrasados",
    title: "¿Debe impuestos a la propiedad en Maricopa? Venda al contado",
    description:
      "¿Debe impuestos a la propiedad en el condado de Maricopa? Cómo funcionan los impuestos morosos, la subasta de gravámenes y la ejecución de un tenedor del gravamen en Arizona, y cómo una venta de contado los paga al cierre.",
    eyebrow: "Impuestos a la propiedad atrasados en Arizona",
    h1: "¿Debe impuestos a la propiedad? La venta puede pagarlos.",
    heroLine:
      "Los impuestos morosos siguen sumando intereses, y una vez que se vende el gravamen empieza a correr el plazo para que el tenedor pida la ejecución. Una venta de contado paga lo que se debe en la compañía de títulos antes de llegar a eso.",
    blurb: "Impuestos morosos, un gravamen vendido en subasta o una carta de un tenedor del gravamen.",
    intro: [
      "La mayoría de los dueños que se atrasan con los impuestos en el Valle no tienen una cuenta de depósito (escrow) con su préstamo. La casa está pagada, fue heredada o el préstamo nunca cobró los impuestos, así que la factura llega directo al dueño, y un año malo se convierte en dos.",
      "En el condado de Maricopa, los impuestos que siguen sin pagarse pueden ofrecerse en la subasta anual de gravámenes del Tesorero. Un inversionista paga los impuestos y recibe un certificado de compra que gana intereses contra su casa. Si los impuestos siguen sin pagarse tres años después de esa subasta, el tenedor puede pedir a la Corte Superior la ejecución y quedarse con la casa.",
      "Si quedarse con la casa no es realista, vender suele ser la salida más limpia. La compramos tal como está, y la compañía de títulos paga los impuestos atrasados, los intereses y cualquier certificado de gravamen con el precio de venta. Lo que queda es para usted.",
    ],
    fact: {
      text: "Los impuestos a la propiedad morosos en Arizona generan intereses de hasta 16% al año (A.R.S. § 42-18053). Tres años después de vender el gravamen, el tenedor puede presentar la ejecución (A.R.S. § 42-18201).",
      note: "Puede buscar la parcela en el sitio del Tesorero del condado de Maricopa para ver qué está moroso y si ya se vendió un gravamen.",
    },
    problems: [
      {
        title: "Los intereses siguen creciendo",
        body: "Cada año sin pagar suma intereses y cargos encima del impuesto. El total puede crecer más rápido de lo que un dueño con ingreso fijo puede ponerse al día.",
      },
      {
        title: "Una carta del tenedor del gravamen",
        body: "Antes de presentar la ejecución, el tenedor tiene que avisar al dueño. Si ya le llegó esa carta, el tiempo para redimir es corto y vale la pena actuar ya.",
      },
      {
        title: "Una casa pagada y sin dinero disponible",
        body: "Muchos dueños atrasados con los impuestos tienen mucho valor en la casa y muy poco ingreso al mes. La casa vale mucho, pero el dinero está en las paredes.",
      },
      {
        title: "Reparaciones además de los impuestos",
        body: "Una casa atrasada con los impuestos muchas veces también necesita techo, aire acondicionado o plomería. Un precio de contado lo toma en cuenta, así no paga reparaciones antes de vender.",
      },
    ],
    steps: [
      {
        title: "Díganos qué se debe",
        body: "La dirección, qué años de impuestos no se han pagado, cualquier carta de un tenedor del gravamen y si todavía hay una hipoteca en la casa.",
      },
      {
        title: "Reciba un número por la casa como está",
        body: "Nuestros especialistas ven la casa y le muestran el precio, los impuestos e intereses estimados por pagar y lo que le queda a usted.",
      },
      {
        title: "Cierre antes del plazo",
        body: "Una compañía de títulos del condado de Maricopa pide el saldo al Tesorero, paga los impuestos y redime cualquier gravamen con la venta, y luego le paga a usted el resto.",
      },
    ],
    rules: [
      {
        title: "Cuándo se vuelven morosos los impuestos",
        body: "Los impuestos a la propiedad en Arizona se cobran en dos mitades. La primera mitad se vuelve morosa después del 1 de noviembre y la segunda después del 1 de mayo. Se cobran intereses sobre lo moroso.",
      },
      {
        title: "Redimir un gravamen fiscal",
        body: "Hasta que una corte dicte sentencia, el dueño por lo general puede redimir pagando al Tesorero los impuestos, intereses y cargos. Una venta que cierra a tiempo hace exactamente eso con el precio.",
      },
      {
        title: "La ejecución del tenedor del gravamen",
        body: "Tres años después de la subasta, el tenedor del certificado puede demandar en la Corte Superior para terminar el derecho a redimir. Si la corte lo concede, el Tesorero emite una escritura al tenedor y el dueño pierde la casa.",
      },
    ],
    gather: [
      "El número de parcela o la última factura de impuestos",
      "Qué años de impuestos no se han pagado, si lo sabe",
      "Cualquier carta de un tenedor del gravamen o de un abogado",
      "El último estado de cuenta de la hipoteca, si hay préstamo",
      "Nombre y contacto de la HOA, si hay una",
      "Los nombres de todos los que aparecen en la escritura",
    ],
    faqs: [
      {
        question: "¿Puedo vender una casa con impuestos a la propiedad morosos?",
        answer:
          "Sí. Los impuestos sin pagar son un gravamen sobre la casa, y la compañía de títulos los paga con el precio de venta al cierre, igual que paga una hipoteca. No tiene que pagarlos antes.",
      },
      {
        question: "Ya vendieron el gravamen de mis impuestos. ¿Es demasiado tarde?",
        answer:
          "Por lo general no. Un gravamen vendido normalmente se puede redimir hasta que una corte dicte la sentencia de ejecución, y el tenedor no puede presentar la ejecución hasta tres años después de la subasta. Llámenos lo antes posible, sobre todo si ya recibió un aviso del tenedor.",
      },
      {
        question: "¿Cuánto se llevarán los impuestos de mi venta?",
        answer:
          "La compañía de títulos pide el saldo exacto al Tesorero del condado de Maricopa, con intereses y cargos. Le damos un estimado desde el inicio para que vea lo que queda después de los impuestos, cualquier hipoteca y los costos de cierre.",
      },
      {
        question: "¿Hay forma de quedarme con la casa?",
        answer:
          "A veces. Puede pagar directamente al Tesorero, y algunas personas mayores califican para congelar el valor de la propiedad con el Asesor del condado de Maricopa. Si quedarse con la casa le funciona, se lo diremos. Si no, le mostramos lo que le deja una venta.",
      },
      {
        question: "También tengo hipoteca. ¿Eso cambia algo?",
        answer:
          "Una hipoteca normalmente exige que los impuestos estén pagados, así que el prestamista puede pagarlos y sumarlos a su préstamo, o tratarlo como incumplimiento. Al cierre, la compañía de títulos paga al prestamista y los impuestos con la venta. Díganos los dos saldos desde el principio.",
      },
      {
        question: "La casa fue heredada y no se pagaron los impuestos. ¿Podemos vender?",
        answer:
          "Sí, una vez que alguien tenga la autoridad para firmar por el patrimonio. Nuestra página de casa heredada explica cómo una escritura de beneficiario, una declaración jurada de patrimonio pequeño o una sucesión deciden quién es.",
      },
    ],
    related: [
      foreclosure,
      cashOffer,
      { href: "/es/vender/casa-heredada", label: "¿Heredó una casa con impuestos sin pagar?" },
      { href: "/es/vender/cuotas-hoa-atrasadas", label: "¿También debe cuotas de la HOA?" },
    ],
  },
  {
    enSlug: "house-with-solar-panels",
    slug: "casa-con-paneles-solares",
    updatedAt: "2026-11-28",
    label: "Casa con paneles solares",
    title: "Vender una casa con paneles solares rentados en Phoenix",
    description:
      "¿Vende una casa en el área de Phoenix con paneles solares rentados, con PPA o financiados? Cómo afectan la venta la transferencia del contrato, la liquidación o un registro UCC, y cómo un comprador de contado cierra sin aprobación de un banco.",
    eyebrow: "Vender una casa con paneles solares en Arizona",
    h1: "Venda una casa con paneles solares, aunque el contrato sea el problema.",
    heroLine:
      "Un contrato o préstamo solar puede frenar una venta normal: el comprador tiene que calificar con la compañía solar, el banco no cuenta los paneles y aparece un registro en el título. Primero leemos su contrato solar y le damos un precio que ya lo incluye.",
    blurb: "Un contrato de renta solar, un PPA o un préstamo solar que el comprador o el banco no aceptan.",
    intro: [
      "En el Valle hay paneles solares en muchos techos, y muchos no son del dueño de la casa. Eso importa el día que vende. Un sistema que usted pagó agrega valor. Un sistema rentado o un acuerdo de compra de energía (PPA) es de la compañía solar, y normalmente el comprador tiene que ser aprobado para tomarlo. Un préstamo solar se tiene que pagar o resolver al cierre.",
      "Las ventas tradicionales se caen por esto más de lo que la gente espera. El banco del comprador puede no contar los paneles rentados en el avalúo, el comprador puede no querer un pago de 20 años, o la compañía solar puede tardar semanas en aprobar la transferencia.",
      "Una venta de contado saca al banco del comprador de la ecuación. Leemos su contrato solar, averiguamos qué necesita la compañía para transferirlo o liquidarlo y le damos un número que ya lo toma en cuenta, para que sepa con cuánto se queda antes de firmar.",
    ],
    fact: {
      text: "Un sistema solar financiado o rentado muchas veces está respaldado por un registro UCC de accesorios fijos (fixture filing) en el Registrador del condado de Maricopa. Aparece en la búsqueda de título, y la compañía de títulos pedirá que se pague, se libere o se resuelva antes del cierre.",
      note: "Su contrato solar dice si es una compra, un préstamo, una renta o un PPA. Esa palabra decide casi todo lo que sigue, así que téngalo a la mano.",
    },
    problems: [
      {
        title: "El comprador tiene que calificar con la compañía solar",
        body: "La mayoría de las rentas y los PPA solo se transfieren si la compañía solar aprueba al nuevo dueño, muchas veces con revisión de crédito. Si el comprador no califica o no quiere el pago, la venta se detiene.",
      },
      {
        title: "El banco no cuenta los paneles rentados",
        body: "Los paneles que son de la compañía solar normalmente no cuentan como parte de la casa en el avalúo. El banco del comprador también puede pedir que se resuelva el registro solar antes de dar el préstamo.",
      },
      {
        title: "Liquidar cuesta más de lo esperado",
        body: "Terminar una renta o un PPA antes de tiempo puede significar pagar lo que falta o un precio fijo de liquidación. El saldo de un préstamo solar puede ser mayor de lo que el dueño recuerda.",
      },
      {
        title: "Arreglar el techo con los paneles encima",
        body: "Si el techo necesita reparación, hay que quitar los paneles y volver a ponerlos, muchas veces con la compañía solar. Un precio de contado puede incluir el techo y los paneles como están.",
      },
    ],
    steps: [
      {
        title: "Mande la dirección y el contrato solar",
        body: "Díganos la compañía solar y si es renta, PPA o préstamo. El pago mensual y los años que faltan nos ayudan a hacer el cálculo.",
      },
      {
        title: "Reciba un número con lo solar incluido",
        body: "Averiguamos los requisitos de transferencia o la liquidación y le damos un solo precio que ya incluye los paneles, el techo y el resto de la casa.",
      },
      {
        title: "Cierre en su fecha",
        body: "Una compañía de títulos del condado de Maricopa paga la hipoteca y cualquier préstamo o registro solar con la venta, y nosotros trabajamos con la compañía solar en la transferencia.",
      },
    ],
    rules: [
      {
        title: "De quién son los paneles",
        body: "Si pagó de contado o con préstamo, el sistema es suyo y se vende con la casa. Con una renta o un PPA, es de la compañía solar, y su contrato decide si se transfiere y cómo.",
      },
      {
        title: "El registro solar en el título",
        body: "Un registro UCC le da a la compañía solar o al prestamista un interés registrado en el equipo. La compañía de títulos lo encontrará y pedirá una liquidación, una liberación o la aprobación de la transferencia.",
      },
      {
        title: "La cuenta de la luz también cambia",
        body: "La interconexión y el crédito por la energía que exporta con APS o SRP están a nombre del titular de la cuenta. Después del cierre, el nuevo dueño tiene que darse de alta con la compañía de luz y la compañía solar.",
      },
    ],
    gather: [
      "Su contrato solar (renta, PPA o préstamo)",
      "El nombre de la compañía solar y su número de cuenta",
      "El pago solar mensual y los años que faltan",
      "Un estado de liquidación reciente del préstamo o la renta, si lo tiene",
      "El último estado de cuenta de la hipoteca",
      "Cualquier historial de reparaciones del techo o los paneles",
    ],
    faqs: [
      {
        question: "¿Puedo vender mi casa si los paneles solares son rentados?",
        answer:
          "Sí. Un sistema rentado normalmente se transfiere al nuevo dueño con la aprobación de la compañía solar, se liquida o, en algunos casos, se retira. Leemos su contrato y le decimos cuál aplica y cuánto cuesta antes de que decida.",
      },
      {
        question: "¿Los paneles solares aumentan el valor de una casa en Arizona?",
        answer:
          "Los paneles que son suyos pueden agregar valor porque bajan la factura de luz. Los paneles rentados o con PPA normalmente no agregan valor en el avalúo, porque son de la compañía solar, y el pago puede hacer que algunos compradores se retiren.",
      },
      {
        question: "¿Qué pasa con mi préstamo solar cuando vendo?",
        answer:
          "Un préstamo solar normalmente se paga al cierre con el precio de venta, igual que la hipoteca. La compañía de títulos pide el saldo al prestamista solar y libera el registro una vez pagado.",
      },
      {
        question: "¿Ustedes pueden tomar mi contrato de renta solar?",
        answer:
          "En muchos casos podemos solicitar tomar la renta o el PPA, si la compañía solar nos aprueba. Cuando no es posible o no conviene, incluimos la liquidación en el precio y le mostramos el cálculo.",
      },
      {
        question: "¿Qué es un registro UCC en mis paneles solares?",
        answer:
          "Es un registro público que le da a la compañía solar o al prestamista un interés en el equipo. No es una hipoteca sobre su casa, pero la compañía de títulos lo trata como algo que se debe resolver antes del cierre.",
      },
      {
        question: "El techo necesita reparación y los paneles están encima. ¿Lo arreglo primero?",
        answer:
          "No. Compramos la casa tal como está, con el techo y los paneles. Díganos lo que sepa del techo y tomamos en cuenta la reparación y el retiro de los paneles en el número.",
      },
    ],
    related: [{ href: "/es/vender/tal-como-esta", label: "Vender una casa que necesita reparaciones" }, cashOffer, takeOver],
  },
  {
    enSlug: "behind-on-hoa-dues",
    slug: "cuotas-hoa-atrasadas",
    updatedAt: "2026-11-28",
    label: "Cuotas de la HOA atrasadas",
    title: "¿Debe cuotas de la HOA en Arizona? Venda antes de la ejecución",
    description:
      "¿Atrasado con las cuotas de la HOA en el condado de Maricopa? Cuándo una HOA de Arizona puede ejecutar su gravamen (A.R.S. § 33-1807), qué puede y qué no puede sumar, y cómo una venta de contado le paga a la HOA al cierre.",
    eyebrow: "Cuotas de la HOA atrasadas en Arizona",
    h1: "¿Debe cuotas de la HOA? Venda antes de que la HOA ejecute.",
    heroLine:
      "Recargos, cartas de cobranza y honorarios de abogado pueden convertir unas cuotas atrasadas en un gravamen que se ejecuta en la corte. Una venta de contado le paga a la HOA con el precio y cierra la cuenta.",
    blurb: "Cuotas sin pagar, un abogado de cobranza o un gravamen de la HOA sobre la casa.",
    intro: [
      "Es fácil atrasarse con las cuotas de la HOA. Van aparte de la hipoteca, muchas veces se pagan a mano, y un cambio de trabajo, una cuenta médica o una cuota especial las manda al fondo de la pila.",
      "En Arizona, las cuotas sin pagar se convierten en un gravamen sobre la casa. Cuando la HOA pasa la cuenta a un abogado de cobranza, se suman honorarios a las cuotas y el saldo crece rápido. Si el dueño lleva un año atrasado o debe $1,200 o más, la HOA puede pedir la ejecución de ese gravamen en la Corte Superior.",
      "Si ponerse al día no es realista, vender suele ser la forma más limpia de detenerlo. Compramos la casa tal como está, y la compañía de títulos paga el saldo de la HOA, la hipoteca y cualquier otro gravamen con la venta. Lo que queda es para usted.",
    ],
    fact: {
      text: "Una HOA de Arizona solo puede ejecutar su gravamen cuando el dueño lleva un año atrasado o debe $1,200 o más, lo que ocurra primero (A.R.S. § 33-1807 para comunidades planificadas, § 33-1256 para condominios).",
      note: "El monto incluye cuotas, recargos y costos de cobranza. Las multas por violar reglas, por lo general, no pueden ser la base de una ejecución de la HOA.",
    },
    problems: [
      {
        title: "Honorarios de cobranza más altos que las cuotas",
        body: "Cuando entra un abogado, los honorarios pueden ser mayores que las cuotas atrasadas. Cada mes que pasa normalmente suma más.",
      },
      {
        title: "Un gravamen registrado contra la casa",
        body: "El gravamen de la HOA queda en el título. No puede refinanciar ni vender de forma normal hasta pagarlo, y puede terminar en una ejecución en la corte.",
      },
      {
        title: "También atrasado con la hipoteca",
        body: "Cuando el dinero no alcanza, la HOA y la hipoteca muchas veces se atrasan juntas. Una ejecución de la HOA no borra la hipoteca, así que hay que resolver las dos.",
      },
      {
        title: "Avisos de violación además del saldo",
        body: "Violaciones por el jardín, la pintura o reparaciones pueden sumar multas y presión. Compramos la casa con las violaciones abiertas, así no tiene que arreglarlas primero.",
      },
    ],
    steps: [
      {
        title: "Díganos lo que la HOA dice que debe",
        body: "La dirección, el nombre de la HOA, el último estado de cuenta o carta del abogado y si también está atrasado con la hipoteca.",
      },
      {
        title: "Reciba un número por la casa como está",
        body: "Nuestros especialistas ven la casa y le muestran el precio, el saldo estimado de la HOA, el saldo de la hipoteca y lo que le queda a usted.",
      },
      {
        title: "Cierre y pague a la HOA",
        body: "Una compañía de títulos del condado de Maricopa pide a la HOA el saldo y la declaración de reventa, paga a la HOA y la hipoteca con la venta y le paga a usted el resto.",
      },
    ],
    rules: [
      {
        title: "Cuándo puede ejecutar una HOA",
        body: "Solo después de un año de atraso o $1,200 adeudados, lo que ocurra primero. La HOA tiene que ir a la Corte Superior, así que hay una demanda y tiempo para responder antes de cualquier venta.",
      },
      {
        title: "Los recargos tienen límite",
        body: "Arizona limita el recargo de una HOA a $15 o 10% de la cuota sin pagar, lo que sea mayor (A.R.S. § 33-1803). Pida un estado de cuenta detallado y revíselo.",
      },
      {
        title: "El saldo de la HOA al cierre",
        body: "Cuando vende, la HOA tiene que dar a la compañía de títulos un saldo y una declaración de reventa (A.R.S. § 33-1806), y la ley limita lo que puede cobrar por eso. El saldo se paga con el precio de venta.",
      },
    ],
    gather: [
      "El nombre de la HOA y de la compañía administradora",
      "El último estado de cuenta o carta de cobranza de la HOA",
      "Cualquier carta o demanda del abogado de la HOA",
      "El último estado de cuenta de la hipoteca",
      "Cualquier aviso de violación de la HOA",
      "Los nombres de todos los que aparecen en la escritura",
    ],
    faqs: [
      {
        question: "¿Una HOA puede quitarme la casa en Arizona?",
        answer:
          "Sí, pero solo después de un año de atraso o de deber $1,200 o más, lo que ocurra primero, y solo con un caso en la corte. Las multas por violar reglas, por lo general, no pueden ser la base de la ejecución.",
      },
      {
        question: "¿Puedo vender mi casa si le debo a la HOA?",
        answer:
          "Sí. La compañía de títulos pide el saldo a la HOA y lo paga con el precio de venta al cierre, junto con la hipoteca. No tiene que pagarle a la HOA primero.",
      },
      {
        question: "El abogado de la HOA me mandó una carta. ¿Cuánto tiempo tengo?",
        answer:
          "Depende de cuánto debe y de si ya se presentó una demanda. Busque las fechas en la carta y llámenos a nosotros o a un abogado pronto. Una venta puede cerrar a tiempo si los papeles están en orden, pero más tiempo le da más opciones.",
      },
      {
        question: "¿Puedo negociar el saldo con la HOA?",
        answer:
          "A veces. Muchas HOA aceptan un plan de pagos, y algunas reducen honorarios o recargos para cobrar. Pida un estado de cuenta detallado por escrito. Si el plan es vender, la compañía de títulos paga el monto acordado al cierre.",
      },
      {
        question: "¿Una ejecución de la HOA borra mi hipoteca?",
        answer:
          "No. Una primera hipoteca registrada antes de la deuda con la HOA, por lo general, sigue sobre la casa, y usted puede seguir debiéndole al banco. Por eso una venta que paga las dos suele ser mejor que dejar que la HOA ejecute.",
      },
      {
        question: "La casa tiene violaciones abiertas con la HOA. ¿Igual la compran?",
        answer:
          "Sí. Díganos qué le citó la HOA. Tomamos en cuenta las reparaciones en el precio y las hacemos después del cierre, así no tiene que arreglar el jardín, la pintura o el techo primero.",
      },
    ],
    related: [
      foreclosure,
      { href: "/es/vender/impuestos-atrasados", label: "¿También debe impuestos a la propiedad?" },
      cashOffer,
    ],
  },
];

export function getSituationEs(slug: string) {
  return situationsEs.find((item) => item.slug === slug);
}

export function spanishSituationPath(enSlug: string) {
  const match = situationsEs.find((item) => item.enSlug === enSlug);
  return match ? `/es/vender/${match.slug}` : "/es/vender";
}

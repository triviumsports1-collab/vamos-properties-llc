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
        body: "Patrick o Jaime ven la casa y dan a todos los herederos el mismo número con el cálculo. Nadie tiene que limpiar ni reparar nada antes.",
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
        body: "Patrick o Jaime recorren la casa una vez y le dan un precio con las reparaciones que consideramos. No sigue ninguna lista de inspección.",
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
];

export function getSituationEs(slug: string) {
  return situationsEs.find((item) => item.slug === slug);
}

export function spanishSituationPath(enSlug: string) {
  const match = situationsEs.find((item) => item.enSlug === enSlug);
  return match ? `/es/vender/${match.slug}` : "/es/vender";
}

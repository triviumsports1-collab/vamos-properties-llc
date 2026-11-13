import type { Faq } from "@/lib/content/faqs";

/**
 * Spanish content for /es/zonas/[city]. Zip codes and nearby cities come from `areas.ts`.
 * Written for U.S. Spanish speakers in the Valley, using "usted".
 * Same rules as English: no invented numbers, reviews or seller names.
 */
export type AreaEs = {
  description: string;
  heroLine: string;
  opening: string;
  fact: string;
  paragraphs: string[];
  situations: { title: string; body: string }[];
  neighborhoods: { name: string; note: string }[];
  localNotes: { title: string; body: string }[];
  faqs: Faq[];
};

export const areasEs: Record<string, AreaEs> = {
  phoenix: {
    description:
      "Venda su casa en Phoenix tal como está, de Maryvale a Ahwatukee, o hable con Vamos sobre una hipoteca atrasada.",
    heroLine:
      "De Maryvale a Ahwatukee, con valor acumulado o ya atrasada. Patrick o Jaime revisan la dirección y le llaman el mismo día.",
    opening:
      "Phoenix no es un solo mercado. Una casa de bloque de los años 60 en Maryvale, un lote pequeño cerca de Central y una casa más nueva en Ahwatukee pueden estar atrasadas por la misma razón y aun así necesitar tres ofertas distintas.",
    fact: "Las ventas de fideicomisario de casas en Phoenix se registran en la Oficina del Registrador del Condado de Maricopa. La fecha del aviso es el reloj, no el día en que la carta empezó a preocuparle.",
    paragraphs: [
      "Si el aviso ya está registrado, una venta de contado busca pagar el préstamo en una compañía de título antes de esa fecha. Tomar los pagos es otra conversación, y el préstamo puede quedar a su nombre.",
      "Compramos tal como está. Eso incluye techos viejos, coolers que dejaron de funcionar, casas con inquilinos y casas heredadas que nadie ha vaciado. No necesita un letrero en el jardín ni fines de semana de visitas.",
      "Patrick o Jaime le preguntarán en qué parte de Phoenix está la casa, cuánto debe y si alguien más está en el título. El nombre de la ciudad no basta para darle un precio.",
    ],
    situations: [
      {
        title: "El aviso ya está registrado",
        body: "Un Aviso de Venta de Fideicomisario (Notice of Trustee's Sale) inicia un reloj en el Registrador del Condado de Maricopa. Empezamos por la fecha de venta y trabajamos hacia atrás hasta un cierre que la compañía de título pueda cumplir.",
      },
      {
        title: "Una casa heredada que no planeaba tener",
        body: "La casa de sus padres en el oeste o el sur de Phoenix, llena de muebles y de reparaciones pendientes. Puede venderla tal como está y dejar lo que no quiera.",
      },
      {
        title: "Una casa de renta que dejó de funcionar",
        body: "Renta atrasada, un inquilino que no se va o una casa vacía acumulando gastos. Una casa con contrato de renta sigue siendo una conversación de contado.",
      },
      {
        title: "Reparaciones que no puede pagar",
        body: "Un techo al final de su vida, un cooler que no funciona, plomería vieja. Para listar normalmente hay que reparar primero. Para vendernos, no.",
      },
    ],
    neighborhoods: [
      {
        name: "Maryvale",
        note: "Casas de bloque de un piso construidas entre los años 50 y 70, muchas con dueños de toda la vida. Techos, coolers, plomería y electricidad originales salen en la primera llamada más que una remodelación. Esas reparaciones las incluimos en la oferta.",
      },
      {
        name: "South Phoenix y Laveen",
        note: "Calles antiguas cerca de Baseline junto a subdivisiones nuevas de Laveen con HOA. Un lote grande no significa automáticamente valor acumulado si el préstamo es reciente o la casa necesita trabajo.",
      },
      {
        name: "Central Phoenix",
        note: "Casas más viejas, lotes pequeños y una mezcla de dueños y rentas cerca del tren ligero. Algunas tienen buen valor acumulado; muchos dueños aun así no quieren meses de visitas.",
      },
      {
        name: "Sunnyslope y North Mountain",
        note: "Lotes en colinas, construcción más vieja y algunas ampliaciones sin permiso. Una buena vista no arregla un techo cansado ni un pago atrasado. Revisamos lo que realmente hay, permisos incluidos.",
      },
      {
        name: "Ahwatukee",
        note: "Al sur de South Mountain, con más HOA y casas más nuevas que Maryvale. Un divorcio, un cambio de trabajo o las cuotas más la hipoteca igual atrasan a los dueños.",
      },
      {
        name: "Deer Valley y el norte de Phoenix",
        note: "Casas de producción desde los años 80 y trayectos más largos. El norte de Phoenix no tiene un solo precio. Envíe la dirección exacta.",
      },
    ],
    localNotes: [
      {
        title: "Sistemas viejos son normales aquí",
        body: "Muchas casas de Phoenix todavía tienen ductos originales, drenajes de hierro o un cooler evaporativo. Los incluimos en el precio; usted no los reemplaza primero.",
      },
      {
        title: "Ampliaciones y permisos",
        body: "Garajes convertidos y cuartos extra son comunes en barrios viejos. Un cuarto sin permiso cambia el número, no si podemos comprar.",
      },
      {
        title: "Inquilinos y herencias",
        body: "Un contrato de renta, un inquilino o un patrimonio sin resolver cambian quién firma y cuándo. Díganos temprano para que el título no sea la sorpresa.",
      },
    ],
    faqs: [
      {
        question: "¿Compran casas en el oeste y el sur de Phoenix?",
        answer:
          "Sí. Casas de bloque viejas, casas con reparaciones pendientes y casas ya en pre-ejecución son las que más vemos.",
      },
      {
        question: "¿Puedo quedarme unos días después del cierre?",
        answer:
          "A veces, si la venta es de contado y la compañía de título puede documentar una ocupación corta. Le diremos sí o no antes de firmar.",
      },
      {
        question: "¿El código postal decide la oferta?",
        answer:
          "Nos dice dónde mirar. La oferta sigue la cuadra, el estado de la casa, el saldo del préstamo y la fecha en que necesita cerrar.",
      },
      {
        question: "¿Qué tan rápido pueden cerrar en Phoenix?",
        answer:
          "Tan rápido como el título lo permita. Con un título limpio, a menudo un par de semanas. Una sucesión, un gravamen o un segundo dueño que debe firmar tardan más, y se lo decimos en la primera llamada.",
      },
      {
        question: "¿Tengo que vaciar la casa?",
        answer: "No. Llévese lo que quiera y deje lo demás.",
      },
      {
        question: "¿La oferta de contado es menor que listar?",
        answer:
          "Normalmente sí. Compramos tal como está y asumimos las reparaciones y la espera. Si listar le daría más y tiene tiempo, se lo diremos.",
      },
    ],
  },

  gilbert: {
    description:
      "Hable con Vamos sobre una casa en Gilbert que necesita vender tal como está, con valor acumulado o con pagos atrasados.",
    heroLine:
      "Heritage District, Val Vista, Power Ranch y el sur de Gilbert. Con valor acumulado o no, una venta tal como está y un número claro de Patrick o Jaime.",
    opening:
      "Los dueños en Gilbert a menudo tienen más valor acumulado de lo que creen, y también más presión: un pago, un divorcio o una casa heredada que no quieren manejar desde otro estado.",
    fact: "Las casitas del Heritage District y las casas de producción del sur de Gilbert no tienen el mismo precio. La oferta sigue la cuadra, no el nombre de la ciudad.",
    paragraphs: [
      "Si la casa se vendería bien en el mercado, le diremos que una venta tradicional podría dejarle más, y que también tomaría más tiempo y le pediría reparar y mostrarla. Nuestro número de contado es el seguro.",
      "Si ya está atrasado, esperar a un comprador tradicional puede chocar con la venta de fideicomisario. Ahí la fecha del aviso importa más que un estimado en línea.",
      "Power Ranch y el Heritage District no se valoran con la misma frase. Díganos las calles que cruzan.",
    ],
    situations: [
      {
        title: "Un divorcio y una sola casa",
        body: "Normalmente ambas personas en el título deben firmar, aunque no se hablen. Una venta de contado con fecha fija puede ser más simple que meses de visitas.",
      },
      {
        title: "Atrasado pero con valor acumulado",
        body: "Muchos dueños en Gilbert tienen valor acumulado y aun así se atrasan. Si hay una venta de fideicomisario registrada, vender antes de la fecha protege ese valor mejor que una subasta.",
      },
      {
        title: "Mudanza fuera del estado",
        body: "Un traslado de trabajo o una mudanza cerca de la familia, sin tiempo para reparar y listar desde lejos. Puede cerrar sin estar aquí para visitas.",
      },
      {
        title: "Cartas de la HOA acumuladas",
        body: "Multas, avisos de violación o cuotas atrasadas junto con la hipoteca. El pago a la asociación se hace al cierre con el dinero de la venta.",
      },
    ],
    neighborhoods: [
      {
        name: "Heritage District",
        note: "El centro original de Gilbert, con casitas viejas y construcción nueva cerca de Gilbert Road. El estado varía mucho de casa a casa, así que la visita importa más que el código postal.",
      },
      {
        name: "Val Vista y el centro de Gilbert",
        note: "Barrios establecidos de los años 90 y 2000, muchos con HOA. Los dueños aquí a menudo tienen valor acumulado y aun así necesitan una venta privada.",
      },
      {
        name: "Power Ranch y el sur de Gilbert",
        note: "Grandes comunidades planificadas con HOA. La carta de pago de la asociación puede tardar tanto como el pago de la hipoteca, así que pedimos el nombre de la comunidad desde el inicio.",
      },
      {
        name: "Higley y el extremo sur",
        note: "Construcción más nueva y pagos más grandes hacia Queen Creek. Estar más al sur no agrega días a una venta de fideicomisario.",
      },
    ],
    localNotes: [
      {
        title: "Las HOA son la regla",
        body: "Casi todas las subdivisiones de Gilbert tienen asociación. Las cuotas y multas se pagan de la venta, pero la carta de pago hay que pedirla, así que empezamos temprano.",
      },
      {
        title: "El valor acumulado cambia el consejo",
        body: "Si la casa se vendería bien y usted tiene tiempo, listar podría dejarle más. Se lo diremos en voz alta para que compare.",
      },
      {
        title: "Dos firmas",
        body: "Cuando dos personas están en el título, firman las dos. Podemos coordinar citas de firma separadas en la compañía de título.",
      },
    ],
    faqs: [
      {
        question: "¿Me van a ofrecer poco por una casa en buen estado?",
        answer: "Verá cómo llegamos al número: precio, reparaciones y el costo de cerrar en su tiempo. Puede decir que no.",
      },
      {
        question: "¿Pueden firmar dos dueños que no se hablan?",
        answer:
          "Normalmente ambos deben firmar. Podemos ajustarnos a sus horarios. No podemos saltarnos una firma que la compañía de título exige.",
      },
      {
        question: "¿Compran casas con inquilinos en Gilbert?",
        answer: "A menudo. Renta atrasada, un contrato vigente o una casa vacía son tres números distintos. Díganos cuál es.",
      },
      {
        question: "¿Compran casas en Power Ranch u otras comunidades con HOA?",
        answer: "Sí. Díganos el nombre de la comunidad. La compañía de título maneja el pago a la asociación al cierre.",
      },
      {
        question: "Nos estamos divorciando. ¿Tenemos que estar de acuerdo los dos?",
        answer:
          "Si ambos están en el título, ambos firman. No tomamos partido. Hable con sus abogados sobre el decreto antes de firmar.",
      },
      {
        question: "¿Puedo vender desde otro estado?",
        answer: "Normalmente sí. Las compañías de título pueden organizar firmas a distancia o móviles.",
      },
    ],
  },

  scottsdale: {
    description:
      "Venda su casa en Scottsdale tal como está, de Old Town al norte de Shea, o pregunte a Vamos sobre una hipoteca atrasada.",
    heroLine:
      "De Old Town a DC Ranch. Una calle bonita también puede esconder un pago atrasado, un aviso de la HOA o una herencia. Patrick o Jaime le dan un número y las ventajas y desventajas.",
    opening:
      "Scottsdale se ve impecable desde Scottsdale Road, y la gente supone que nadie está atrasado. Un divorcio, un cambio de trabajo, las cuotas de la HOA más la hipoteca, o una casa heredada desde otro estado igual ponen a los dueños contra el reloj.",
    fact: "Una venta de fideicomisario de una casa en Scottsdale sigue siendo un registro del Condado de Maricopa. La fecha del aviso es el reloj.",
    paragraphs: [
      "Compramos tal como está: un techo cansado en una casa vieja cerca de Old Town, un inquilino todavía en la casa, o una casa del norte de Scottsdale que se vería bien en fotos si tuviera meses para listarla.",
      "Old Town, McCormick Ranch y DC Ranch no tienen un solo precio. Una fachada junto al campo de golf no arregla un pago atrasado.",
      "Si la casa se vendería bien, le diremos que una venta tradicional podría dejarle más y que tomaría más tiempo. Nuestro número de contado es el seguro.",
    ],
    situations: [
      {
        title: "Un pago alto que dejó de funcionar",
        body: "Un préstamo grande, cuotas de HOA y seguro pueden superar el ingreso después de un cambio de trabajo. Si está atrasado, la fecha del aviso importa más que la vista.",
      },
      {
        title: "Una casa heredada en Scottsdale",
        body: "La casa de sus padres cerca de Old Town o McCormick Ranch, manejada desde otro estado. Puede venderla tal como está sin coordinar reparaciones a distancia.",
      },
      {
        title: "Divorcio en una casa con mucho valor",
        body: "Dos dueños, una casa y un mercado que espera una lista perfecta. Una venta de contado cambia algo de precio por una fecha y menos gente entrando.",
      },
      {
        title: "Una casa anticuada en un buen barrio",
        body: "Cocinas originales, piscinas viejas y techos cansados. Los compradores tradicionales esperan mejoras. Nosotros compramos sin ellas.",
      },
    ],
    neighborhoods: [
      {
        name: "Old Town y el sur de Scottsdale",
        note: "Casas tipo rancho y lotes pequeños cerca de Indian School, McDowell y Scottsdale Road. El estado, los permisos y quién está en el título importan más que una capa de pintura.",
      },
      {
        name: "McCormick Ranch",
        note: "Un área planificada establecida, con lagos, áreas verdes y reglas de asociación. Muchos techos, piscinas y aires acondicionados llegan a la edad en que un inspector los marca.",
      },
      {
        name: "Gainey Ranch y el corredor de Shea",
        note: "HOA, calles con acceso controlado en algunas partes y pagos más altos. Las cuotas y cualquier cargo especial van en la primera llamada junto al saldo del préstamo.",
      },
      {
        name: "North Scottsdale y DC Ranch",
        note: "Comunidades planificadas más nuevas y casas más grandes. Las cartas de la asociación pueden tardar tanto como el pago de la hipoteca.",
      },
      {
        name: "McDowell Mountain y el noreste",
        note: "Lotes más grandes y otro tipo de comprador que en Old Town. El norte de Scottsdale no es un solo número. Díganos las calles y la comunidad.",
      },
    ],
    localNotes: [
      {
        title: "Asociaciones y cartas de pago",
        body: "Muchas comunidades tienen una o dos asociaciones. Cada una emite una carta de pago antes del cierre. Las pedimos temprano.",
      },
      {
        title: "La comparación honesta",
        body: "Una casa bien cuidada en Scottsdale a menudo se vende bien en el mercado. Si ese es su caso y tiene tiempo, listar podría dejarle más.",
      },
      {
        title: "Piscinas y techos",
        body: "Equipo de piscina, techos de espuma o teja y aires viejos son la lista usual. Los incluimos en el precio para que no los arregle primero.",
      },
    ],
    faqs: [
      {
        question: "¿Compran casas en North Scottsdale y DC Ranch?",
        answer: "Sí. Díganos el nombre de la comunidad en la primera llamada.",
      },
      {
        question: "¿Me van a ofrecer poco por una casa que se vendería bien?",
        answer:
          "Verá cómo llegamos al número: precio, reparaciones, cuotas y el costo de cerrar en su tiempo. Si listar le daría más, se lo diremos.",
      },
      {
        question: "¿Las cuotas de la HOA detienen una venta de contado?",
        answer: "Rara vez la detienen. Pueden agregar un pago. Preferimos saber el nombre de la asociación desde el inicio.",
      },
      {
        question: "¿Solo compran casas en mal estado?",
        answer: "No. También compramos casas en buen estado cuando el dueño quiere una venta privada y una fecha.",
      },
      {
        question: "¿Pueden cerrar si la casa tiene dos HOA?",
        answer: "Sí. Es común en Scottsdale. La compañía de título pide la carta de cada asociación y les paga de la venta.",
      },
      {
        question: "¿Puedo vivir en la casa hasta el cierre?",
        answer: "Sí. Usted se queda hasta el cierre. A veces se puede quedar unos días después; se lo decimos antes de firmar.",
      },
    ],
  },

  chandler: {
    description:
      "Dueños en Chandler pueden pedir una oferta de contado o preguntar por una hipoteca atrasada, con HOA incluida.",
    heroLine:
      "Downtown, el oeste de Chandler, Ocotillo y el corredor de la 202. Cuotas de HOA, un pago atrasado o una casa que solo quiere vender: una oferta tal como está y una respuesta clara.",
    opening:
      "Chandler se ve nuevo desde la calle, y la gente supone que nadie está atrasado. Los pagos igual se rompen cuando se pierde un trabajo, empieza un divorcio o la HOA y la hipoteca llegan el mismo mes.",
    fact: "Muchas casas en Chandler están en una HOA. Las cuotas sin pagar pueden aparecer al cierre junto al pago de la hipoteca.",
    paragraphs: [
      "Le preguntaremos por la asociación, el saldo del préstamo y las reparaciones que ha ido posponiendo. No tiene que dejar la casa al estándar de la HOA antes de que la veamos.",
      "Downtown Chandler no es Ocotillo, y el oeste no es el extremo sur. La oferta sigue la subdivisión.",
      "Un cierre de contado está diseñado para pagar los gravámenes con la venta. Tomar los pagos no los elimina automáticamente, y no quita su nombre de la hipoteca.",
    ],
    situations: [
      {
        title: "HOA e hipoteca el mismo mes",
        body: "Cuotas, un cargo especial y el pago del préstamo se acumulan rápido. Una venta de contado paga a la asociación y al prestamista al cierre.",
      },
      {
        title: "Un cambio de trabajo",
        body: "Muchos dueños en Chandler trabajan en tecnología y manufactura cerca. Un despido o un traslado puede convertir un pago cómodo en uno atrasado en pocos meses.",
      },
      {
        title: "Una casa de renta que ya no quiere manejar",
        body: "Inquilinos, desgaste y reparaciones cambian el número, no si podemos comprar.",
      },
      {
        title: "Una casa que necesita trabajo antes de listar",
        body: "Sistemas originales de los años 80 y 90 en el oeste de Chandler, o una casa nueva con mantenimiento pendiente. Puede saltarse las reparaciones y las visitas.",
      },
    ],
    neighborhoods: [
      {
        name: "Downtown Chandler",
        note: "Casas más viejas y lotes pequeños alrededor de la plaza histórica y Arizona Avenue. Otra lista de reparaciones: plomería original, techos viejos y ampliaciones.",
      },
      {
        name: "Oeste de Chandler",
        note: "Muchas casas de los años 80 y 90, algunas con HOA. Techos, aire acondicionado original e interiores anticuados son la conversación usual.",
      },
      {
        name: "Ocotillo y el sur de Chandler",
        note: "Comunidades planificadas con HOA, construcción nueva y algunas casas junto a lagos o golf. La asociación y el saldo del préstamo se pagan al cierre.",
      },
      {
        name: "Norte de Chandler",
        note: "Cerca de Tempe y la 202, con lotes más pequeños y más rentas. Díganos si hay un inquilino y cuándo termina el contrato.",
      },
    ],
    localNotes: [
      {
        title: "Casi todas las calles tienen HOA",
        body: "Cuotas, multas y cargos de transferencia se pagan de la venta. Pedimos el nombre de la asociación temprano.",
      },
      {
        title: "Dos edades de casas",
        body: "Las casas del centro y el oeste tienen a menudo 30 o 40 años; el sur es más nuevo. La oferta sigue la casa, no la ciudad.",
      },
      {
        title: "No solo ventas difíciles",
        body: "Si su casa se vendería bien y tiene tiempo, una venta tradicional podría dejarle más. Le damos nuestro número para comparar.",
      },
    ],
    faqs: [
      {
        question: "¿Las reglas de la HOA detienen una venta de contado?",
        answer: "Rara vez. Pueden agregar un pago. Preferimos saber la asociación desde la primera llamada.",
      },
      {
        question: "¿Y si solo debo un pago?",
        answer:
          "Quizá todavía tenga tiempo de trabajar con su prestamista. Si quiere otra opción, le damos una oferta clara para comparar.",
      },
      {
        question: "¿Compran casas en buen estado en Chandler?",
        answer: "Sí. Si se vendería bien, también le diremos que una venta tradicional podría dejarle más.",
      },
      {
        question: "¿Compran casas en Ocotillo y otras HOA del sur?",
        answer: "Sí. La compañía de título maneja el pago a la asociación y los cargos de transferencia al cierre.",
      },
      {
        question: "¿Pueden comprar una casa con inquilino?",
        answer: "A menudo sí. Díganos si el contrato está vigente, cuánto falta y si pagan la renta.",
      },
      {
        question: "¿Cómo recibo la oferta?",
        answer:
          "Envíe la dirección con el formulario o llame. Patrick o Jaime hacen unas preguntas, ven la casa y le dan un número con el cálculo. Puede decir que no.",
      },
    ],
  },

  mesa: {
    description:
      "Una oferta de contado local para dueños en Mesa, incluidas casas tipo rancho viejas y casas que necesitan venderse sin listar.",
    heroLine:
      "Downtown y el oeste de Mesa, Dobson Ranch, el este de Mesa y el corredor de Superstition. Casas de toda la vida y casas nuevas con HOA, compradas tal como están.",
    opening:
      "Mesa tiene muchas casas de bloque de un piso que han sido de la misma familia por décadas. Muchos de esos dueños están atrasados porque el pago, el techo o ambos se les salieron de las manos.",
    fact: "Mesa está en el East Valley, y una venta de fideicomisario aquí también pasa por el Condado de Maricopa, no por una subasta de la ciudad.",
    paragraphs: [
      "Compramos en Mesa tal como está, incluidas casas que necesitan cooler nuevo, techo nuevo o una limpieza completa. Puede dejar lo que no pueda llevarse.",
      "El este y el oeste de Mesa no tienen el mismo precio. El centro y la cuadrícula vieja son otra conversación que una subdivisión nueva cerca de Superstition.",
      "Si la hipoteca es vieja y la tasa es baja, pídanos comparar un pago de contado con tomar los pagos. Le diremos cuál se ajusta al saldo.",
    ],
    situations: [
      {
        title: "Una casa de familia pagada por décadas",
        body: "Muchos dueños en Mesa llevan 30 años o más en la misma casa. Cuando el techo, el cooler y el pago llegan juntos, una venta privada puede ser más simple que arreglar para listar.",
      },
      {
        title: "Una casa heredada y una sucesión",
        body: "La casa de sus padres en el oeste de Mesa, todavía con sus cosas. Cuando esté claro quién puede firmar, puede venderla tal como está.",
      },
      {
        title: "Atrasado en una casa nueva del este",
        body: "Un pago más grande más cuotas de HOA pueden atrasarse rápido después de un cambio de trabajo. Si hay un aviso registrado, la fecha decide cuánto tiempo queda.",
      },
      {
        title: "Un préstamo con tasa baja",
        body: "Si la tasa es baja, comparamos un pago de contado con tomar los pagos. Le diremos cuál conviene y qué queda a su nombre.",
      },
    ],
    neighborhoods: [
      {
        name: "Downtown y el oeste de Mesa",
        note: "La cuadrícula vieja alrededor de Main Street y el tren ligero, con casas de bloque y dueños de muchos años. Reparaciones pospuestas son normales y las incluimos en la oferta.",
      },
      {
        name: "Dobson Ranch",
        note: "Una comunidad establecida del oeste de Mesa con lagos, asociación y jardines maduros. Muchas casas tienen sistemas originales que un inspector marcaría.",
      },
      {
        name: "Este de Mesa",
        note: "Más espacio, lotes grandes en algunas calles y una mezcla de casas viejas, subdivisiones nuevas y comunidades de casas prefabricadas. Díganos las calles que cruzan.",
      },
      {
        name: "Cerca de Superstition Springs",
        note: "Más nuevo que la cuadrícula vieja y a menudo con HOA. Las cuotas sin pagar aparecen junto al pago de la hipoteca.",
      },
    ],
    localNotes: [
      {
        title: "Cuadrícula vieja contra subdivisiones nuevas",
        body: "El oeste y el este de Mesa son casas distintas con reparaciones distintas. La oferta sigue la dirección y el estado.",
      },
      {
        title: "Casas prefabricadas y terreno",
        body: "Si es una casa prefabricada, díganos si el terreno es suyo o renta el lote. Eso cambia quién firma y si se puede escribir una venta.",
      },
      {
        title: "¿Ya está listada?",
        body: "Si tiene un contrato con un agente, ese contrato manda. Podemos hablar cuando termine como el contrato lo permita.",
      },
    ],
    faqs: [
      {
        question: "¿Compran casas heredadas en Mesa?",
        answer:
          "Sí, cuando esté claro quién puede firmar. La sucesión puede hacer más lenta la escritura. Traiga los nombres del título y le diremos qué pedirá la compañía de título.",
      },
      {
        question: "¿Pueden comprar una casa que ya está listada?",
        answer: "Si tiene un contrato de listado, ese contrato manda. Podemos hablar cuando usted y su agente lo terminen.",
      },
      {
        question: "¿Van al este de Mesa?",
        answer: "Sí. El primer paso sigue siendo la llamada. Si los números funcionan, vamos a la casa.",
      },
      {
        question: "¿Compran casas en Dobson Ranch?",
        answer: "Sí. Díganos la dirección y si las cuotas están al día.",
      },
      {
        question: "¿Tengo que arreglar el techo o el cooler antes de vender?",
        answer: "No. Incluimos las reparaciones en la oferta.",
      },
      {
        question: "¿Cuánto tarda una venta de contado en Mesa?",
        answer:
          "A menudo un par de semanas cuando el título está limpio. Sucesiones, gravámenes o un segundo dueño toman más tiempo.",
      },
    ],
  },

  tempe: {
    description:
      "Un comprador de contado en Tempe para casas que necesita vender sin listar, incluidas casas de renta y casas heredadas.",
    heroLine:
      "Cerca de la universidad, el sur de Tempe, el lago y el norte. Rentas, compañeros de cuarto y casas heredadas incluidas. Un número tal como está de Patrick o Jaime.",
    opening:
      "Las casas de Tempe suelen estar en lotes pequeños, cerca de la universidad o del lago, y son difíciles de mostrar si la situación en casa ya está complicada.",
    fact: "Los condominios y townhomes en Tempe pueden tener cartas de pago de la asociación que tardan más que la casa misma. Empiece ese reloj temprano.",
    paragraphs: [
      "Compramos casas en Tempe tal como están, incluidas las que no se pueden mostrar fácilmente por inquilinos, compañeros de cuarto o una cerradura que apenas funciona.",
      "Las subdivisiones del sur de Tempe y las calles cerca de la universidad son propiedades distintas. Un condominio cerca del lago agrega una asociación y reglas de renta.",
      "Tendrá una persona, un número y una explicación clara de si el préstamo queda pagado. Si no, se lo decimos.",
    ],
    situations: [
      {
        title: "Una renta cerca de la universidad",
        body: "Rotación cada verano, compañeros de cuarto y desgaste que se acumula. Vender con inquilinos a menudo es posible, y se ahorra la limpieza entre contratos.",
      },
      {
        title: "Heredada de un padre que vivió aquí por años",
        body: "Una casa en el sur de Tempe con acabados originales, manejada desde otro estado. Con autoridad para firmar, puede vender sin venir a reparar ni a mostrar.",
      },
      {
        title: "Un condominio con problemas de HOA",
        body: "Cuotas, un cargo especial o límites de renta cerca del lago. Revisamos la asociación, las reglas y el saldo antes de dar un número.",
      },
      {
        title: "Atrasado en el pago",
        body: "Un cambio de trabajo o un hogar dividido pueden atrasar una casa en Tempe. Si hay una venta de fideicomisario registrada, la fecha del aviso es el reloj.",
      },
    ],
    neighborhoods: [
      {
        name: "Cerca de la universidad y Maple-Ash",
        note: "Casas más viejas y pequeñas cerca de Arizona State University, muchas rentadas a estudiantes. La ocupación, los contratos y el desgaste importan tanto como el techo.",
      },
      {
        name: "Sur de Tempe",
        note: "Calles más suburbanas al sur de la US-60, algunas con asociación, muchas con dueños de décadas. Una venta tranquila y privada suele ser el punto.",
      },
      {
        name: "Cerca de Tempe Town Lake",
        note: "Precios más altos y más condominios. Las cartas de la asociación y las reglas de renta pueden tardar más que el pago del préstamo.",
      },
      {
        name: "Norte de Tempe",
        note: "Cerca de la 202, Papago y Phoenix, con lotes pequeños y casas más viejas. Igual necesitamos la dirección exacta.",
      },
    ],
    localNotes: [
      {
        title: "Inquilinos y fechas de contrato",
        body: "Díganos cuántas personas viven ahí, si la renta está al día y cuándo termina cada contrato. Una casa ocupada es otro número y otro plazo.",
      },
      {
        title: "Los condominios son otra conversación",
        body: "En un condominio, la asociación, sus reglas de renta y cualquier cargo especial deciden si una venta de contado funciona.",
      },
      {
        title: "Vender desde otro estado",
        body: "Herederos y propietarios a menudo viven lejos. Las compañías de título normalmente pueden organizar firmas a distancia.",
      },
    ],
    faqs: [
      {
        question: "¿Compran condominios en Tempe?",
        answer: "A veces. La asociación, las reglas de renta y el saldo del préstamo lo deciden. El formulario sigue siendo el inicio.",
      },
      {
        question: "¿Un heredero fuera del estado puede vender una casa en Tempe?",
        answer: "Sí, si tiene autoridad para firmar. No tiene que viajar solo para pedir una oferta.",
      },
      {
        question: "¿Y si la casa está llena de inquilinos?",
        answer: "Díganos cuántos y si pagan. A menudo podemos hacer una oferta de contado.",
      },
      {
        question: "¿Pueden comprar una casa cerca de ASU con estudiantes viviendo ahí?",
        answer: "A menudo sí. Díganos cuántos inquilinos, si pagan y cuándo terminan los contratos.",
      },
      {
        question: "¿Compran casas en buen estado en Tempe?",
        answer: "Sí. Si listar le daría más y tiene tiempo, se lo diremos para que compare.",
      },
      {
        question: "¿Tengo que estar en Arizona para vender?",
        answer: "Normalmente no. La compañía de título puede organizar una firma a distancia.",
      },
    ],
  },

  glendale: {
    description:
      "Venda su casa en Glendale tal como está, de la cuadrícula vieja al norte de la 101, o hable sobre una hipoteca atrasada.",
    heroLine:
      "De Catlin Court a Arrowhead, del oeste de Glendale a Grand Avenue. Casas de bloque viejas y calles nuevas con HOA, compradas tal como están.",
    opening:
      "Glendale va desde barrios viejos cerca del centro hasta subdivisiones nuevas al norte de la 101. Las casas, y el valor acumulado, no son iguales en ambos lugares.",
    fact: "Los dueños en Glendale tienen el mismo plazo del Condado de Maricopa que Phoenix. El día 91 se cuenta desde el registro, no desde que llegó la carta.",
    paragraphs: [
      "Una oferta de contado es la salida directa: tal como está, sin visitas, con un cierre en una fecha que el título pueda cumplir. Si el préstamo no se cubre con la venta, se lo decimos antes de empezar papeles.",
      "Las casas cerca de Grand Avenue y el centro viejo son otra visita que Arrowhead o las calles planificadas al norte de la 101.",
      "Llame aunque la cocina no esté lista para fotos. No necesitamos una casa impecable para empezar.",
    ],
    situations: [
      {
        title: "Una casa de bloque que necesita trabajo",
        body: "El oeste de Glendale tiene muchas casas como las de Maryvale: bloque sólido, sistemas originales, dueños de muchos años. Puede vender sin reemplazar el techo primero.",
      },
      {
        title: "Una renta con problemas de inquilino",
        body: "Renta atrasada, un contrato que todavía dura meses o un inquilino que no se va. Cada caso cambia el número y el tiempo.",
      },
      {
        title: "Pagos atrasados al norte de la 101",
        body: "Las casas más nuevas cerca de Arrowhead tienen pagos y cuotas más altos. Un cambio de trabajo puede atrasarlas rápido.",
      },
      {
        title: "Solo tiene la fecha de venta",
        body: "Ponga la dirección y la fecha de venta en el formulario. Esa fecha nos dice si hay tiempo para abrir un expediente de título.",
      },
    ],
    neighborhoods: [
      {
        name: "Downtown Glendale y Catlin Court",
        note: "Casas viejas y lotes pequeños cerca del centro histórico, incluido el distrito histórico de Catlin Court. El estado, los permisos y quién está en el título importan más que la pintura.",
      },
      {
        name: "Oeste de Glendale",
        note: "Casas de bloque y dueños de muchos años, parecido a Maryvale, más calles nuevas hacia el estadio y Westgate. Reparaciones pendientes son normales.",
      },
      {
        name: "Arrowhead y al norte de la 101",
        note: "Calles planificadas, HOA y pagos más altos. Una fachada bonita igual puede estar atrasada.",
      },
      {
        name: "A lo largo de Grand Avenue",
        note: "Bordes mixtos, casas viejas y algunas rentas. Díganos si hay un inquilino antes de hablar de precio.",
      },
    ],
    localNotes: [
      {
        title: "Dos Glendales distintos",
        body: "La cuadrícula vieja al sur del Loop y las calles con HOA al norte tienen precios distintos. Envíe la dirección, no la salida de la autopista.",
      },
      {
        title: "No necesita una cocina para fotos",
        body: "Vemos la casa como está y calculamos el trabajo en la oferta.",
      },
      {
        title: "Cuando la venta no cubre el préstamo",
        body: "Si el saldo es mayor que un precio de contado, se lo decimos antes de perder una semana en papeles y le explicamos las otras opciones.",
      },
    ],
    faqs: [
      {
        question: "¿Pueden ayudar si la casa está rentada?",
        answer: "A menudo sí. Díganos si hay un inquilino y si la renta está al día.",
      },
      {
        question: "¿Cómo empiezo si solo tengo la fecha de venta?",
        answer: "Ponga la dirección y la fecha en el formulario. Con esa fecha sabemos si hay tiempo.",
      },
      {
        question: "¿Las cuotas de HOA en el norte de Glendale detienen una venta?",
        answer: "Rara vez. Pueden agregar un pago. Díganos el nombre de la asociación en la primera llamada.",
      },
      {
        question: "¿Compran casas en Arrowhead Ranch?",
        answer: "Sí. La compañía de título le paga a la asociación con el dinero de la venta.",
      },
      {
        question: "¿Puedo vender una casa con trabajos sin permiso?",
        answer: "Normalmente sí. Cambia el número, no si podemos comprar. Díganos desde el inicio.",
      },
      {
        question: "¿Cuesta algo pedir una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
    ],
  },

  peoria: {
    description: "Una venta de contado en Peoria, o una conversación clara sobre tomar una hipoteca atrasada.",
    heroLine:
      "De Old Town cerca de Grand Avenue hasta Vistancia y Lake Pleasant. Una venta de contado en Peoria, o una conversación clara sobre una hipoteca atrasada.",
    opening:
      "Peoria va desde barrios viejos cerca de Grand Avenue hasta calles planificadas más nuevas. La distancia al centro de Phoenix se nota en el precio, y en lo pesado que se vuelve un pago con un trayecto largo.",
    fact: "Peoria sigue siendo el Condado de Maricopa. Un Aviso de Venta de Fideicomisario es un registro del condado.",
    paragraphs: [
      "Traiga la dirección y, si la tiene, la fecha de venta. Compramos tal como está, incluidas casas con techos viejos y rentas cansadas.",
      "Old Town y Vistancia no son la misma casa. Las HOA del norte de Peoria agregan un pago que una casita en Grand Avenue quizá no tiene.",
      "Si la tasa del préstamo es lo único bueno que queda, le explicamos qué haría y qué no haría tomar los pagos. Su nombre puede quedar en ese préstamo.",
    ],
    situations: [
      {
        title: "Un trayecto largo y un pago que dejó de alcanzar",
        body: "Muchos dueños del norte de Peoria compraron lejos por espacio. Un cambio de trabajo o un segundo pago de carro puede atrasar la hipoteca.",
      },
      {
        title: "Una casa vacía que sigue costando",
        body: "Servicios, seguro y cuotas de HOA en una casa donde nadie vive. Una casa vacía está bien; díganos si no hay luz para planear la visita de día.",
      },
      {
        title: "Una renta cansada en Old Town",
        body: "Sistemas viejos, desgaste y un inquilino que ya no quiere manejar. Compramos tal como está.",
      },
      {
        title: "Un préstamo con tasa baja en una subdivisión nueva",
        body: "Si la tasa es lo mejor del trato, le explicamos qué haría tomar los pagos. Su nombre puede quedar en el préstamo.",
      },
    ],
    neighborhoods: [
      {
        name: "Old Town Peoria",
        note: "La cuadrícula vieja cerca de Grand Avenue y Washington Street. Casas pequeñas, sistemas viejos y dueños de muchos años.",
      },
      {
        name: "Al norte de la 101",
        note: "Subdivisiones nuevas con HOA cerca del complejo deportivo. El estrés suele ser el pago y las cuotas, no los cimientos.",
      },
      {
        name: "Vistancia",
        note: "Una comunidad planificada grande, más al norte, con reglas de asociación que el título revisará. Otro precio que Old Town.",
      },
      {
        name: "Hacia Lake Pleasant",
        note: "Más lejos, con lotes grandes en algunas calles. Igual vamos si los números funcionan. El primer paso es la dirección.",
      },
    ],
    localNotes: [
      {
        title: "HOA en el norte de Peoria",
        body: "La mayoría de las calles nuevas tienen asociación. Puede hacer más lento el papeleo, pero rara vez impide la venta.",
      },
      {
        title: "La distancia no cambia el reloj",
        body: "Peoria es Condado de Maricopa. Un aviso aquí sigue el mismo plazo que en Phoenix.",
      },
      {
        title: "Casas vacías",
        body: "Una casa vacía está bien. Díganos sobre los servicios y el acceso para que la visita no se pierda.",
      },
    ],
    faqs: [
      {
        question: "¿Van al norte de Peoria a ver la casa?",
        answer: "Sí. El primer paso sigue siendo la llamada. Si los números funcionan, vamos.",
      },
      {
        question: "¿Y si la casa está vacía?",
        answer: "Está bien. Díganos si no hay luz para planear la visita de día.",
      },
      {
        question: "¿Una HOA de Peoria puede bloquear la venta?",
        answer: "Puede hacer más lento el papeleo y agregar un saldo. Rara vez hace la casa invendible.",
      },
      {
        question: "¿Compran casas en Vistancia?",
        answer: "Sí. Díganos la villa y si las cuotas están al día.",
      },
      {
        question: "¿Compran una casa con inquilino en Peoria?",
        answer: "A menudo sí. Díganos si el contrato está vigente y cuándo termina.",
      },
      {
        question: "¿La oferta de contado es menor que listar?",
        answer: "Normalmente sí. Si listar le daría más y tiene tiempo, se lo diremos.",
      },
    ],
  },

  surprise: {
    description: "Dueños en Surprise pueden pedir a Vamos una oferta de contado o ayuda cuando la hipoteca está atrasada.",
    heroLine:
      "Surprise original, Marley Park, el norte de Surprise y cerca de las comunidades para adultos mayores. Sin listar, sin decorar, sin alfombra nueva primero.",
    opening:
      "Surprise creció rápido, y muchos de esos pagos se fijaron cuando la vida se veía más estable. Un cambio de trabajo o un trayecto más largo bastan para atrasar una casa.",
    fact: "Las ventas de fideicomisario del noroeste del Valle no reciben más tiempo por estar lejos del centro de Phoenix. La fecha del aviso manda.",
    paragraphs: [
      "Compramos en Surprise sin pedirle listar, decorar o cambiar la alfombra primero. La oferta toma en cuenta lo que la casa necesita.",
      "El pueblo original y los barrios planificados nuevos son casas distintas. Las comunidades para adultos mayores tienen sus propias reglas; díganos si la casa está en una.",
      "Si tiene una fecha de venta en las próximas semanas, póngala en el formulario. El título necesita más que un fin de semana.",
    ],
    situations: [
      {
        title: "Un pago fijado cuando la vida era más estable",
        body: "Muchos préstamos se calcularon para dos ingresos o un trayecto más corto. Un cambio de trabajo basta para atrasar una casa.",
      },
      {
        title: "La casa de un padre en una comunidad para adultos mayores",
        body: "Esas reglas pueden limitar quién puede tener el título. Díganos la comunidad antes de suponer que un comprador puede recibir la escritura.",
      },
      {
        title: "Cuotas de HOA encima de todo",
        body: "Los barrios planificados tienen asociación. Las cuotas se pagan de la venta, pero la carta de pago hay que pedirla temprano.",
      },
      {
        title: "Una fecha de venta a pocas semanas",
        body: "Ponga la fecha en el formulario. Le diremos en la primera llamada si ya está demasiado cerca.",
      },
    ],
    neighborhoods: [
      {
        name: "Surprise original",
        note: "El pueblo original cerca de Grand Avenue: casas más viejas y pequeñas que el lado norte. Reparaciones y dueños de muchos años son comunes.",
      },
      {
        name: "Marley Park y barrios planificados",
        note: "Calles con HOA, parques y amenidades. La carta de la asociación puede tardar tanto como el pago del préstamo.",
      },
      {
        name: "Norte de Surprise",
        note: "Casas nuevas, pagos más grandes y un trayecto más largo. Que sea nueva no significa que el préstamo esté al día.",
      },
      {
        name: "Cerca de comunidades para adultos mayores",
        note: "Surprise tiene grandes comunidades con restricción de edad. Sus reglas pueden limitar quién tiene el título o vive ahí. Díganoslo en la primera llamada.",
      },
    ],
    localNotes: [
      {
        title: "Las reglas de edad deciden el papeleo",
        body: "En una comunidad para adultos mayores, las reglas pueden decidir si se puede escribir una venta. Lo revisamos antes de prometer.",
      },
      {
        title: "Sin decorar ni alfombra nueva",
        body: "No le pedimos listar, decorar ni reemplazar nada. La oferta toma en cuenta lo que la casa necesita.",
      },
      {
        title: "El mismo reloj del condado",
        body: "Estar lejos del centro de Phoenix no da días extra. La fecha del aviso manda.",
      },
    ],
    faqs: [
      {
        question: "¿Pueden cerrar antes de una venta de fideicomisario en Surprise?",
        answer: "A veces, si quedan suficientes días. Le diremos en la primera llamada si la fecha ya está demasiado cerca.",
      },
      {
        question: "¿Cobran por hacer una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
      {
        question: "¿Y si la casa está en una comunidad para adultos mayores?",
        answer: "Díganos la comunidad. Algunas reglas deciden si se puede escribir una venta. No vamos a adivinar.",
      },
      {
        question: "¿Compran casas en Marley Park?",
        answer: "Sí. Díganos si las cuotas están al día.",
      },
      {
        question: "¿Puedo vender una casa heredada desde otro estado?",
        answer: "Normalmente sí, cuando su autoridad para firmar esté documentada.",
      },
      {
        question: "¿Qué tan pronto me llaman?",
        answer:
          "Patrick o Jaime llaman de 8:00 a.m. a 7:00 p.m., los siete días. Si envía la dirección después, le llamamos a la mañana siguiente.",
      },
    ],
  },

  avondale: {
    description: "Venda su casa en Avondale tal como está, o hable con Vamos sobre pagos atrasados.",
    heroLine:
      "Avondale histórico, Garden Lakes, al norte de la I-10 y el lado oeste. Reparaciones, avisos de la ciudad y cosas que quedaron, incluidos en una oferta tal como está.",
    opening:
      "Avondale tiene calles viejas y subdivisiones nuevas en la misma ciudad. Necesitamos la dirección, no una suposición desde la salida de la autopista.",
    fact: "Las casas en Avondale con gravámenes de la ciudad o avisos de reparación viejos se pueden vender. Esos son pagos al cierre, no una razón para esconder la casa.",
    paragraphs: [
      "Una venta de contado maneja reparaciones, cosas que quedaron y una fecha de cierre dentro de lo que el título puede hacer. Sabrá los costos antes de firmar.",
      "El sur de la I-10 y las calles nuevas al norte no tienen el mismo precio. Garden Lakes no es el centro histórico.",
      "Si un divorcio o la pérdida de trabajo es la razón, puede decirlo en una línea en el formulario.",
    ],
    situations: [
      {
        title: "Un aviso o gravamen de la ciudad",
        body: "Avisos de reparación o gravámenes viejos se pueden resolver en la venta. Se pagan en la compañía de título.",
      },
      {
        title: "Divorcio o un cónyuge que se fue",
        body: "Si ambos están en el título, ambos firman. Le explicamos esa parte sin hacerle contar toda la historia.",
      },
      {
        title: "Una casa nueva con un pago que creció",
        body: "Muchas casas al norte de la I-10 se compraron con pagos grandes. Una mudanza, un despido o un hogar dividido pueden atrasarlas.",
      },
      {
        title: "Una casa llena para vaciar",
        body: "Muebles, un garaje lleno de herramientas, un jardín descuidado. Llévese lo que quiera y deje lo demás.",
      },
    ],
    neighborhoods: [
      {
        name: "Avondale histórico",
        note: "Casas viejas al sur de la autopista, alrededor de Western Avenue. Reparaciones pendientes y lotes pequeños son normales.",
      },
      {
        name: "Garden Lakes",
        note: "Una comunidad conocida del oeste con lagos, calles propias y, en partes, una asociación. Díganos si las cuotas están atrasadas.",
      },
      {
        name: "Al norte de la I-10",
        note: "Casas de producción de los 2000 en adelante. El estrés suele ser el pago, una mudanza o un divorcio.",
      },
      {
        name: "Hacia el lado oeste",
        note: "Cerca de Goodyear y la pista de carreras. Sigue siendo Condado de Maricopa para una venta de fideicomisario.",
      },
    ],
    localNotes: [
      {
        title: "Los avisos son pagos al cierre",
        body: "Traiga cualquier aviso o gravamen de la ciudad a la primera llamada. Normalmente se vuelve un pago o una reparación que asumimos.",
      },
      {
        title: "Sur contra norte de la I-10",
        body: "Las calles históricas y las nuevas no tienen el mismo precio. Díganos en cuál está.",
      },
      {
        title: "Sabe los costos antes de firmar",
        body: "Ve el número y lo que incluye antes de firmar cualquier cosa.",
      },
    ],
    faqs: [
      {
        question: "¿Y si mi cónyuge ya se fue de la casa?",
        answer: "Si está en el título, igual tiene que firmar. Le explicamos esa parte sin que cuente toda la historia en un formulario.",
      },
      {
        question: "¿Compran casas que necesitan techo nuevo?",
        answer: "Sí. El techo se descuenta de la oferta. No tiene que cambiarlo primero.",
      },
      {
        question: "¿Un aviso de reparación de la ciudad detiene la venta?",
        answer: "Normalmente se vuelve un pago o una reparación que asumimos. Tráigalo.",
      },
      {
        question: "¿Compran casas en Garden Lakes?",
        answer: "Sí. Díganos si hay cuotas de asociación atrasadas.",
      },
      {
        question: "¿Tengo que vaciar la casa primero?",
        answer: "No. Llévese lo que quiera y deje lo demás.",
      },
      {
        question: "¿Pueden comprar si debo más de lo que vale la casa?",
        answer:
          "A veces no con contado. Si la venta no cubre el préstamo, se lo diremos y le explicaremos otras opciones, incluido hablar con su prestamista o un abogado.",
      },
    ],
  },

  goodyear: {
    description:
      "Venda su casa en Goodyear tal como está, de Estrella a Palm Valley, o hable con Vamos sobre una hipoteca atrasada.",
    heroLine:
      "Estrella, Palm Valley, PebbleCreek y las calles nuevas cerca de la I-10. Sin listar, sin decorar y sin pintar primero.",
    opening:
      "Goodyear tiene sobre todo casas nuevas en calles con HOA: pagos más grandes, cuotas de asociación y un trayecto que cambió cuando cambió el trabajo. Esas son las llamadas que recibimos.",
    fact: "Las ventas de fideicomisario en Goodyear se registran en el Registrador del condado de Maricopa, como en el resto del Valle. La venta no puede hacerse antes del día 91 después de registrar el aviso.",
    paragraphs: [
      "Compramos casas en Goodyear tal como están. No necesita pintar, decorar ni pasar un fin de semana de visitas para un comprador que todavía necesita préstamo.",
      "Muchas calles de Goodyear están en comunidades planificadas. La asociación tiene que enviar una carta de pago y transferencia antes del cierre, por eso preguntamos el nombre de la comunidad en la primera llamada.",
      "Si está atrasado, díganos la fecha de cualquier aviso. Trabajamos hacia atrás desde esa fecha.",
    ],
    situations: [
      {
        title: "Un pago nuevo que se volvió muy grande",
        body: "Muchas casas se compraron hace poco, a precios recientes. Un cambio de trabajo o un segundo ingreso que se perdió bastan para atrasar el pago.",
      },
      {
        title: "Cuotas y multas de la HOA",
        body: "Casi todas las calles tienen asociación. Las cuotas atrasadas se pagan de la venta al cierre, pero la carta de pago hay que pedirla temprano.",
      },
      {
        title: "La casa de un padre en PebbleCreek",
        body: "Los herederos a menudo reciben casas en comunidades para adultos mayores. Díganos la comunidad para revisar sus reglas antes de prometer una fecha.",
      },
      {
        title: "Mudanza por trabajo",
        body: "Un traslado o un trabajo nuevo en otro lugar. Usted elige la fecha de cierre y puede firmar desde donde esté.",
      },
    ],
    neighborhoods: [
      {
        name: "Estrella",
        note: "Gran comunidad planificada al sur del río, con lagos, reglas de HOA y un trayecto largo a la autopista. Préstamos nuevos y cuotas son las primeras preguntas.",
      },
      {
        name: "Palm Valley",
        note: "Al norte de la I-10, calles con HOA viejas y nuevas. Una casa aquí puede tener años de valor acumulado o casi nada, según cuándo se compró.",
      },
      {
        name: "PebbleCreek",
        note: "Comunidad con restricción de edad. Sus reglas pueden limitar quién vive ahí o tiene el título, así que díganoslo antes de suponer que se puede escribir una venta.",
      },
      {
        name: "Canyon Trails y el centro de Goodyear",
        note: "Subdivisiones nuevas cerca de la autopista. Pagos fijados a un precio reciente son la razón más común de atraso.",
      },
    ],
    localNotes: [
      {
        title: "Planificada significa papeleo",
        body: "La carta de transferencia y pago de la asociación puede tardar tanto como el pago del préstamo. Preguntamos el nombre de la comunidad desde el inicio.",
      },
      {
        title: "Préstamos recientes dejan menos espacio",
        body: "Con un préstamo nuevo puede quedar poco después del pago. Se lo diremos con claridad en vez de hacer una oferta que no puede cerrar.",
      },
      {
        title: "El mismo reloj del condado",
        body: "Un aviso en Goodyear se registra en el condado de Maricopa. El mínimo de 91 días es el mismo.",
      },
    ],
    faqs: [
      {
        question: "¿Compran casas en Estrella?",
        answer: "Sí. Díganos si las cuotas de la HOA están al día. La compañía de título paga a la asociación con la venta.",
      },
      {
        question: "¿Pueden cerrar antes de una venta de fideicomisario en Goodyear?",
        answer: "A veces, si quedan suficientes días. Le diremos en la primera llamada si la fecha ya está demasiado cerca.",
      },
      {
        question: "¿Compran en Palm Valley?",
        answer: "Sí. Envíe la dirección y díganos si las cuotas de la HOA están al día.",
      },
      {
        question: "¿Cobran por hacer una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
    ],
  },

  buckeye: {
    description:
      "Venda su casa en Buckeye tal como está, de Verrado al centro de Buckeye, o hable con Vamos sobre un pago que ya no puede cubrir.",
    heroLine:
      "Verrado, Sundance, Festival Ranch y los terrenos más grandes cerca del centro. Nueva o vieja, atrasada o no, primero vemos la dirección.",
    opening:
      "Buckeye creció más rápido que casi cualquier lugar del Valle, y muchas casas se compraron a precios recientes y con trayectos largos. Cuando cambia la gasolina, el trabajo o un plan familiar, el pago es lo primero que se rompe.",
    fact: "Buckeye está en el condado de Maricopa, así que las ventas de fideicomisario se registran en el Registrador del condado de Maricopa y siguen el mismo mínimo de 91 días que Phoenix.",
    paragraphs: [
      "Compramos en Buckeye sin pedirle listar, decorar ni esperar a un comprador que también tiene que vender otra casa.",
      "Construcción nueva no significa una venta limpia. Un préstamo reciente puede dejar poco después del pago, y algunos barrios nuevos tienen cargos de distrito especial o de HOA. Preguntamos por los dos antes de dar un número.",
      "Las partes más viejas de Buckeye, cerca del centro y en terrenos grandes, son otras casas con otras preguntas: pozos, fosas sépticas, ampliaciones y cuántos años lleva el dueño.",
    ],
    situations: [
      {
        title: "Un trayecto largo y un pago grande",
        body: "Muchos dueños manejan lejos para trabajar. Cuando el trabajo cambia o los costos suben, el pago es lo primero que falla.",
      },
      {
        title: "Comprada cerca del precio más alto",
        body: "Algunas casas se compraron en máximos recientes. Vemos el saldo primero y le decimos con claridad si una venta de contado lo cubre.",
      },
      {
        title: "Casas viejas en terrenos grandes",
        body: "Pozos, fosas sépticas y ampliaciones son comunes cerca del centro. Los incluimos en el precio en vez de pedirle que los arregle.",
      },
      {
        title: "Vender una casa rentada a distancia",
        body: "Muchos inversionistas compraron casas para rentar. Podemos comprar con el inquilino adentro y asumir el contrato.",
      },
    ],
    neighborhoods: [
      {
        name: "Verrado",
        note: "Comunidad planificada al pie de las White Tank. Los papeles de la HOA y un precio de compra reciente son lo primero que revisamos.",
      },
      {
        name: "Sundance y el sur de Buckeye",
        note: "Subdivisiones de los 2000 al sur de la I-10. Muchas se compraron cerca del último pico, así que revisamos con cuidado lo que se debe.",
      },
      {
        name: "Festival Ranch y el lado norte",
        note: "Más nuevo y más lejos. El lado norte también tiene una comunidad con restricción de edad y sus propias reglas, así que díganos en qué parte está la casa.",
      },
      {
        name: "Centro de Buckeye y terrenos grandes",
        note: "Casas viejas y acres. Pozos, fosas sépticas y ampliaciones sin permiso aparecen más aquí, y los incluimos en el precio.",
      },
    ],
    localNotes: [
      {
        title: "Cargos de HOA y de distrito",
        body: "Algunas comunidades nuevas tienen cuotas de HOA y cargos de distrito especial en el recibo de impuestos. La compañía de título resuelve qué se paga al cierre.",
      },
      {
        title: "Pozos y fosas sépticas",
        body: "Fuera de las subdivisiones nuevas, una casa puede tener pozo o fosa séptica. Díganoslo en la primera llamada.",
      },
      {
        title: "El mismo reloj del condado",
        body: "Buckeye está en el condado de Maricopa. El aviso se registra ahí y el mínimo de 91 días es el mismo.",
      },
    ],
    faqs: [
      {
        question: "¿Compran casas nuevas en Buckeye?",
        answer:
          "Sí, si los números funcionan. Con un préstamo nuevo puede quedar poco después del pago. Le diremos con claridad si una venta de contado no lo cubre.",
      },
      {
        question: "¿Y si la casa tiene pozo o fosa séptica?",
        answer: "No hay problema. Díganoslo en la primera llamada. Cambia las preguntas y el precio, no si la vemos.",
      },
      {
        question: "¿Compran en Verrado?",
        answer: "Sí. Díganos si las cuotas de la HOA están al día. La compañía de título paga a la asociación al cierre.",
      },
      {
        question: "¿Cobran por hacer una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
    ],
  },

  "queen-creek": {
    description:
      "Venda su casa en Queen Creek tal como está, de una propiedad con caballos a calles nuevas con HOA, o hable con Vamos sobre una hipoteca atrasada.",
    heroLine:
      "Propiedades con caballos, acres, Hastings Farms y las calles nuevas con HOA. Tal como está, con el establo, el pozo y las ampliaciones.",
    opening:
      "Queen Creek tiene dos tipos de casas: casas viejas en acres, a menudo con instalaciones para caballos, y subdivisiones nuevas con pagos más grandes. Se venden por razones distintas y necesitan ofertas distintas.",
    fact: "Queen Creek está en dos condados. La mayor parte está en el condado de Maricopa, pero una parte está en el condado de Pinal, donde los avisos se registran en el Registrador del condado de Pinal. Revise qué condado aparece en su aviso.",
    paragraphs: [
      "Compramos casas en Queen Creek tal como están, incluidos acres con establos, corrales, pozos y ampliaciones que nunca tuvieron permiso.",
      "Los barrios nuevos normalmente tienen HOA y un préstamo reciente. Esos dos datos deciden cuánto queda después del pago, así que preguntamos por ellos primero.",
      "Si tiene un aviso, díganos la fecha y el condado. El reloj es el mismo mínimo de 91 días, pero la oficina del registrador cambia del lado de Pinal.",
    ],
    situations: [
      {
        title: "Acres que un prestamista no valúa fácil",
        body: "Instalaciones para caballos, pozos, casas de huéspedes y ampliaciones pueden hacer lenta una venta con préstamo. Un comprador de contado ve la propiedad como está.",
      },
      {
        title: "Un pago nuevo que dejó de funcionar",
        body: "Las casas nuevas suelen tener préstamos más grandes y cuotas de HOA. Un cambio de ingreso basta para atrasar una.",
      },
      {
        title: "Demasiado terreno para mantener",
        body: "Dueños cansados de cuidar un terreno grande, o listos para algo más pequeño, nos llaman antes de gastar en arreglos.",
      },
      {
        title: "Un aviso de otro condado",
        body: "Parte de Queen Creek está en el condado de Pinal. Si su aviso vino del Registrador de Pinal, díganoslo para revisar los registros correctos.",
      },
    ],
    neighborhoods: [
      {
        name: "Acres y propiedades con caballos",
        note: "Terrenos grandes con pozo, fosa séptica, establos y arenas. Aquí un comprador de contado suele ser más fácil que un prestamista.",
      },
      {
        name: "Hastings Farms y comunidades nuevas con HOA",
        note: "Casas nuevas, cuotas de HOA y préstamos recientes. La carta de pago de la asociación se pide temprano.",
      },
      {
        name: "Town Center",
        note: "El centro más viejo del pueblo, alrededor de Ellsworth y Ocotillo. Mezcla de dueños de muchos años y casas nuevas.",
      },
      {
        name: "El lado del condado de Pinal",
        note: "Algunas direcciones de Queen Creek están en el condado de Pinal. La venta funciona igual, pero los registros del condado son otros.",
      },
    ],
    localNotes: [
      {
        title: "Dos condados, un pueblo",
        body: "La mayor parte de Queen Creek está en Maricopa, pero una parte está en Pinal. El condado de su escritura decide dónde se archivan registros y avisos.",
      },
      {
        title: "Pozos, fosas sépticas y animales",
        body: "Los acres traen preguntas que una casa de subdivisión no tiene. Díganos qué hay y lo incluimos en el precio.",
      },
      {
        title: "Cartas de HOA en calles nuevas",
        body: "Las comunidades nuevas tienen asociación. Su carta de pago se pide temprano para que no retrase el cierre.",
      },
    ],
    faqs: [
      {
        question: "¿Compran propiedades con caballos en Queen Creek?",
        answer: "Sí. Díganos del pozo, la fosa séptica, los establos y las ampliaciones. Los incluimos en el precio.",
      },
      {
        question: "Mi casa está del lado del condado de Pinal. ¿Pueden comprarla?",
        answer:
          "Envíe la dirección. Muchas direcciones del lado de Pinal están lo bastante cerca para hablar. Le diremos con claridad si queda fuera de donde compramos.",
      },
      {
        question: "¿Compran en Hastings Farms?",
        answer: "Sí. Envíe la dirección y díganos si las cuotas de la HOA están al día.",
      },
      {
        question: "¿Cobran por hacer una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
    ],
  },

  "sun-city": {
    description:
      "Venda una casa en Sun City o Sun City West tal como está, sea suya, de sus padres o de una herencia.",
    heroLine:
      "Sun City y Sun City West, vendidas tal como están: cocinas originales, sistemas viejos y toda una vida de cosas adentro. A menudo lo maneja la familia, a menudo desde otro estado.",
    opening:
      "La mayoría de las llamadas de Sun City no son por un pago atrasado. Son por un padre que se muda a una residencia asistida, una casa que quedó a hijos que viven en otro estado, o un dueño que ya no quiere cuidar el jardín.",
    fact: "Sun City y Sun City West son comunidades no incorporadas con restricción de edad en el condado de Maricopa. Cada una tiene sus centros recreativos y reglas que un comprador debe seguir, así que los papeles de la venta las incluyen.",
    paragraphs: [
      "Compramos casas en Sun City y Sun City West tal como están: cocinas originales, techos y plomería viejos, y toda una vida de cosas adentro.",
      "Como son comunidades con restricción de edad, las reglas pueden afectar quién vive en la casa y cómo se escribe una venta. Las revisamos antes de prometer, no después.",
      "Muchas de estas ventas las maneja la familia. Si usted es heredero, fideicomisario o tiene un poder notarial, díganos cuál, porque la compañía de título pedirá ese documento.",
    ],
    situations: [
      {
        title: "Un padre que se muda a una residencia asistida",
        body: "La mudanza sigue el calendario de la residencia, no el del mercado. Una venta de contado puede ayudar a pagar el cuidado sin meses de visitas.",
      },
      {
        title: "Una casa heredada, herederos en otro estado",
        body: "Muchos vendedores son hijos que viven lejos. Las compañías de título pueden organizar la firma a distancia, y nos vemos con quien tenga la llave.",
      },
      {
        title: "Una casa en un fideicomiso",
        body: "Muchos dueños pusieron la casa en un fideicomiso en vida. El fideicomisario sucesor a menudo puede vender sin sucesión, con los documentos del fideicomiso.",
      },
      {
        title: "Sistemas y acabados originales",
        body: "Techos, plomería y cocinas viejos son comunes. Compramos tal como está, así la familia no tiene que actualizar nada.",
      },
    ],
    neighborhoods: [
      {
        name: "Sun City (original)",
        note: "Construida desde 1960, la comunidad original de Del Webb. Muchas casas tienen sus sistemas originales, y muchos vendedores son herederos o fideicomisarios.",
      },
      {
        name: "Sun City West",
        note: "Construida después, al oeste, con sus propios centros recreativos y reglas. Díganos en cuál está la casa.",
      },
      {
        name: "Casas patio y dúplex",
        note: "Comunes en las dos comunidades, a menudo con paredes compartidas y una asociación. La carta de la asociación es parte del papeleo.",
      },
      {
        name: "Casas en un fideicomiso",
        note: "Muchas casas están en un fideicomiso en vida. El fideicomisario sucesor a menudo puede vender sin sucesión.",
      },
    ],
    localNotes: [
      {
        title: "Primero las reglas de edad",
        body: "Sun City y Sun City West tienen restricción de edad. Revisamos cómo afectan una venta antes de prometer una fecha.",
      },
      {
        title: "Papeles de los centros recreativos",
        body: "Cada comunidad tiene sus centros recreativos, y una venta incluye sus papeles y cualquier cuota que pague el comprador. La compañía de título lo maneja al cierre.",
      },
      {
        title: "El documento correcto para firmar",
        body: "Un poder notarial, los papeles del fideicomiso o las cartas de la corte para una herencia. La compañía de título pedirá el que dé autoridad al vendedor.",
      },
    ],
    faqs: [
      {
        question: "¿Pueden comprar una casa en una comunidad con restricción de edad?",
        answer:
          "Revisamos las reglas de la comunidad antes de escribir algo. Algunas reglas afectan quién vive en la casa o cómo se estructura una venta. Le diremos lo que encontremos, sin adivinar.",
      },
      {
        question: "Mi padre se mudó a una residencia asistida. ¿Puedo vender su casa?",
        answer:
          "Normalmente sí, si tiene autoridad legal para firmar, como un poder notarial que cubra bienes raíces, o como fideicomisario si la casa está en un fideicomiso.",
      },
      {
        question: "¿Compran también en Sun City West?",
        answer: "Sí. Díganos en qué comunidad está la casa, porque las reglas y los papeles cambian.",
      },
      {
        question: "¿Tenemos que vaciar la casa primero?",
        answer: "No. Llévense lo que la familia quiera conservar. Lo que quede después del cierre es asunto nuestro.",
      },
    ],
  },

  "el-mirage": {
    description:
      "Venda su casa en El Mirage tal como está, o hable con Vamos sobre una hipoteca atrasada, cerca de la Base Aérea Luke.",
    heroLine:
      "Rancho El Mirage, el pueblo original y las subdivisiones de los 2000 cerca de Luke. Casas rentadas, mudanzas militares y casas atrasadas.",
    opening:
      "El Mirage es una ciudad pequeña con muchas casas de los 2000, muchos dueños de primera vez y muchas familias militares que se mudan con órdenes desde la cercana Base Aérea Luke.",
    fact: "El Mirage está en el condado de Maricopa. Las ventas de fideicomisario se registran en el Registrador del condado de Maricopa, y la venta no puede hacerse antes del día 91 después de registrar el aviso.",
    paragraphs: [
      "Compramos casas en El Mirage tal como están. No necesita pintar, cambiar la alfombra ni arreglar el aire acondicionado antes de que la veamos.",
      "Muchas casas de El Mirage hoy están rentadas. Podemos comprar con el inquilino adentro y asumir el contrato, sin esperar a que termine.",
      "Si se muda con órdenes militares, díganos su fecha de presentación. Planeamos el cierre alrededor de ella.",
    ],
    situations: [
      {
        title: "Mudanza con órdenes militares",
        body: "Las familias de la Base Luke a menudo tienen una fecha fija. Planeamos el cierre alrededor de ella, y puede firmar desde su siguiente destino.",
      },
      {
        title: "Una casa rentada que ya no quiere manejar",
        body: "Muchas casas están rentadas. Podemos comprar con el inquilino adentro, sin esperar a que termine el contrato.",
      },
      {
        title: "Un pago atrasado",
        body: "Un pago atrasado puede volverse un aviso registrado. Díganos la fecha y trabajamos hacia atrás hasta un cierre posible.",
      },
      {
        title: "Reparaciones pendientes",
        body: "Aire acondicionado, techo y pisos que se fueron dejando. Compramos tal como está, y el estado es parte del número.",
      },
    ],
    neighborhoods: [
      {
        name: "Rancho El Mirage y subdivisiones de los 2000",
        note: "La mayoría de las casas se construyeron en los 2000 en calles con HOA. Préstamos recientes y cuotas son las primeras preguntas.",
      },
      {
        name: "El pueblo original",
        note: "Casas más viejas y pequeñas que las subdivisiones nuevas. Dueños de muchos años y reparaciones pendientes son comunes.",
      },
      {
        name: "Casas rentadas",
        note: "Muchas casas de El Mirage están rentadas. Un inquilino adentro no impide una venta.",
      },
      {
        name: "Cerca de la Base Aérea Luke",
        note: "Las familias militares a menudo tienen que vender en una fecha fija. Díganos cuándo se presenta para planear hacia atrás.",
      },
    ],
    localNotes: [
      {
        title: "Casi todo con HOA",
        body: "La mayoría de las casas están en subdivisiones de los 2000 con asociación. La carta de pago se pide temprano.",
      },
      {
        title: "Cerca de Luke",
        body: "Las mudanzas militares vienen con fechas fijas. Díganos la suya en la primera llamada.",
      },
      {
        title: "El mismo reloj del condado",
        body: "El Mirage está en el condado de Maricopa. El aviso se registra ahí y el mínimo de 91 días es el mismo.",
      },
    ],
    faqs: [
      {
        question: "¿Pueden comprar mi casa en El Mirage si me mudo con órdenes PCS?",
        answer:
          "Sí. Díganos su fecha de presentación. La compañía de título normalmente puede organizar la firma donde esté después de irse.",
      },
      {
        question: "¿Compran casas rentadas con inquilinos en El Mirage?",
        answer: "Sí. Podemos asumir el contrato y el depósito al cierre, así el inquilino no tiene que mudarse por la venta.",
      },
      {
        question: "¿Compran en Rancho El Mirage?",
        answer: "Sí. Envíe la dirección y díganos si las cuotas de la HOA están al día.",
      },
      {
        question: "¿Cobran por hacer una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
    ],
  },

  laveen: {
    description:
      "Venda su casa en Laveen tal como está, de terrenos viejos a subdivisiones nuevas cerca de South Mountain, o hable con Vamos sobre una hipoteca atrasada.",
    heroLine:
      "Subdivisiones nuevas sobre Baseline, terrenos viejos y casas cerca de South Mountain. Tal como está, con el inquilino, el pozo o el segundo préstamo.",
    opening:
      "La mayor parte de Laveen es parte de la ciudad de Phoenix, pero no se siente como el resto. Antiguas tierras de granjas y lecherías ahora están junto a subdivisiones de los 2000 en adelante, y los dos tipos de casas se venden por razones muy distintas.",
    fact: "La mayoría de las direcciones de Laveen están en la ciudad de Phoenix y algunas son terreno no incorporado del condado. En los dos casos están en el condado de Maricopa, así que una venta de fideicomisario se registra en el Registrador del condado de Maricopa y no puede hacerse antes del día 91.",
    paragraphs: [
      "Compramos casas en Laveen tal como están, de casas viejas en terrenos grandes a casas nuevas en calles con HOA.",
      "Muchas subdivisiones se construyeron en los 2000, y muchos de esos préstamos se refinanciaron o modificaron después. Díganos lo que debe y si hay un segundo préstamo, porque eso decide cuánto queda.",
      "Las propiedades viejas en terrenos grandes pueden tener pozo, derechos de riego, ampliaciones o animales. Nada de eso impide que la veamos. Cambia las preguntas y el precio.",
    ],
    situations: [
      {
        title: "Un préstamo de los 2000 que nunca se recuperó",
        body: "Algunas casas se compraron o refinanciaron en un punto alto. Revisamos el primer préstamo y cualquier segundo antes de dar un número.",
      },
      {
        title: "Una propiedad vieja en terreno grande",
        body: "Riego, pozos, animales y ampliaciones. Un comprador de contado puede ser más simple que un prestamista que no sabe cómo valuarla.",
      },
      {
        title: "Una casa rentada con inquilino",
        body: "Muchas casas de Laveen están rentadas. Podemos comprar con el contrato vigente.",
      },
      {
        title: "Un aviso ya registrado",
        body: "Díganos la fecha. El título necesita tiempo, y le diremos en la primera llamada si la fecha ya está demasiado cerca.",
      },
    ],
    neighborhoods: [
      {
        name: "Subdivisiones nuevas sobre Baseline y la Avenida 51",
        note: "Casas de los 2000 en adelante en calles con HOA. Préstamos recientes y cuotas son las primeras preguntas.",
      },
      {
        name: "Terrenos viejos y lotes de granja",
        note: "Terrenos grandes con riego, pozo o animales. Un comprador de contado puede ser más simple que un prestamista.",
      },
      {
        name: "Cerca de South Mountain",
        note: "Casas nuevas con vista a la montaña y pagos más grandes. Una buena vista no significa que el préstamo esté al día.",
      },
      {
        name: "Casas rentadas",
        note: "Muchas casas de Laveen están rentadas. Podemos comprar con el inquilino adentro y asumir el contrato.",
      },
    ],
    localNotes: [
      {
        title: "Phoenix, casi siempre",
        body: "La mayor parte de Laveen está en la ciudad de Phoenix y algunas direcciones son terreno del condado. Ciudad o condado, la venta funciona igual.",
      },
      {
        title: "Segundos préstamos",
        body: "Si hay un HELOC o una segunda hipoteca, díganoslo. También se paga de la venta y cambia lo que queda.",
      },
      {
        title: "El mismo reloj del condado",
        body: "Laveen está en el condado de Maricopa. El aviso se registra ahí y el mínimo de 91 días es el mismo.",
      },
    ],
    faqs: [
      {
        question: "¿Laveen es una ciudad aparte?",
        answer:
          "Casi siempre no. Laveen Village es parte de la ciudad de Phoenix, y algunas direcciones con el nombre postal Laveen son terreno no incorporado del condado de Maricopa. Una venta de contado funciona igual en los dos casos.",
      },
      {
        question: "¿Compran propiedades viejas con acres en Laveen?",
        answer: "Sí. Díganos del pozo, el riego, las ampliaciones y los animales. Los incluimos en el precio.",
      },
      {
        question: "¿Compran cerca de South Mountain?",
        answer: "Sí. Envíe la dirección y díganos si hay HOA.",
      },
      {
        question: "¿Cobran por hacer una oferta?",
        answer: "No. No hay costo por preguntar ni si dice que no.",
      },
    ],
  },
};

export function getAreaEs(slug: string): AreaEs | undefined {
  return areasEs[slug];
}

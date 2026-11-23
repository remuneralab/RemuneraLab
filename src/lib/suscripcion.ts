// Suscripción DEMO (prueba de funcionalidad): no hay cobro real.
// El "pago" solo deja una cookie que habilita /herramientas y la API de análisis.
export const COOKIE_SUSCRIPCION = "rl_sub_demo";
export const VALOR_SUSCRIPCION  = "demo-activa";
export const DIAS_SUSCRIPCION   = 30;
export const PRECIO_MENSUAL_CLP = 1000;

export function tieneSuscripcion(valor: string | undefined): boolean {
  return valor === VALOR_SUSCRIPCION;
}

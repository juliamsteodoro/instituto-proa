/** Minúsculas e sem acentos, para a busca encontrar "jose" em "José". */
export function normalizar(texto = '') {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

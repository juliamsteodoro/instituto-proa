/** 4821 -> "4.821" */
export function formatarNumero(n) {
  return n.toLocaleString('pt-BR')
}

/** 31800 -> "31,8 mil"; 980 -> "980" (como nos perfis do Instagram). */
export function formatarCompacto(n) {
  if (n < 10000) return formatarNumero(n)
  if (n < 1000000) return `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  return `${(n / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
}

/** "1 curtida" / "2 curtidas" */
export function pluralizar(n, singular, plural) {
  return `${formatarNumero(n)} ${n === 1 ? singular : plural}`
}

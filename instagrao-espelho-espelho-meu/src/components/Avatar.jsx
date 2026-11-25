/**
 * Foto redonda. Com `anel`, ganha a borda colorida de story;
 * `visto` deixa a borda cinza (story já assistido).
 */
function Avatar({ src, alt, tamanho = 36, anel = false, visto = false, onClick, rotulo }) {
  const conteudo = (
    <span
      className={`avatar${anel ? ' avatar--anel' : ''}${visto ? ' avatar--visto' : ''}`}
      style={{ '--tamanho': `${tamanho}px` }}
    >
      <img src={src} alt={alt} width={tamanho} height={tamanho} />
    </span>
  )
  if (!onClick) return conteudo
  return (
    <button type="button" className="avatar-botao" onClick={onClick} aria-label={rotulo}>
      {conteudo}
    </button>
  )
}

export default Avatar

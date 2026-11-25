import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import { FiHeart } from 'react-icons/fi'
import { USUARIO_ATUAL } from '../data/usuario'

const VISIVEIS = 2

/** Lista de comentários (com "ver todos") e campo para publicar um novo. */
function Comentarios({ comentarios, campoRef, onComentar, onCurtirComentario, onAbrirPerfil }) {
  const [todos, setTodos] = useState(false)
  const [texto, setTexto] = useState('')

  // Os comentários novos do usuário sempre aparecem, mesmo com a lista recolhida
  const antigos = comentarios.filter((c) => !c.novo)
  const novos = comentarios.filter((c) => c.novo)
  const visiveis = todos ? comentarios : [...antigos.slice(-VISIVEIS), ...novos]
  const escondidos = comentarios.length - visiveis.length

  function publicar(e) {
    e.preventDefault()
    if (!texto.trim()) return
    onComentar(texto)
    setTexto('')
  }

  return (
    <div className="comentarios">
      {escondidos > 0 && (
        <button type="button" className="link-discreto comentarios__ver-todos" onClick={() => setTodos(true)}>
          Ver todos os {comentarios.length} comentários
        </button>
      )}

      <ul className="comentarios__lista">
        {visiveis.map((c) => (
          <li key={c.id} className="comentario">
            <p>
              {c.user === USUARIO_ATUAL.user ? (
                <strong>{c.user}</strong>
              ) : (
                <button type="button" className="link-usuario" onClick={() => onAbrirPerfil(c.user)}>{c.user}</button>
              )}{' '}
              {c.text}
            </p>
            <button
              type="button"
              className={`comentario__curtir${c.curtido ? ' comentario__curtir--ativo' : ''}`}
              aria-label={c.curtido ? `Descurtir comentário de ${c.user}` : `Curtir comentário de ${c.user}`}
              aria-pressed={c.curtido}
              onClick={() => onCurtirComentario(c.id)}
            >
              {c.curtido ? <FaHeart /> : <FiHeart />}
            </button>
          </li>
        ))}
      </ul>

      <form className="comentarios__form" onSubmit={publicar}>
        <input
          ref={campoRef}
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Adicione um comentário…"
          aria-label="Adicione um comentário"
          maxLength={300}
        />
        <button type="submit" className="comentarios__publicar" disabled={!texto.trim()}>
          Publicar
        </button>
      </form>
    </div>
  )
}

export default Comentarios

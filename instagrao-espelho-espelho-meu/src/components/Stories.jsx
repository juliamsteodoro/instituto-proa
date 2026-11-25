import Avatar from './Avatar'

/** Barra horizontal de stories no topo do feed. */
function Stories({ pessoas, vistos, onAbrir }) {
  return (
    <section className="stories" aria-label="Stories">
      <ul className="stories__lista">
        {pessoas.map((p, indice) => (
          <li key={p.user}>
            <button
              type="button"
              className="stories__item"
              onClick={() => onAbrir(indice)}
              aria-label={`Ver story de ${p.user}${vistos[p.user] ? ' (visto)' : ''}`}
            >
              <Avatar src={p.avatar} alt="" tamanho={62} anel visto={vistos[p.user]} />
              <span className="stories__nome">{p.user}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Stories

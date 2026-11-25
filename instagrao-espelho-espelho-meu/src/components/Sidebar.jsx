import Avatar from './Avatar'
import { USUARIO_ATUAL } from '../data/usuario'

/** Coluna da direita (telas largas): meu perfil + "Quem eu admiro". */
function Sidebar({ pessoas, seguindo, dispatch, onAbrirPerfil }) {
  return (
    <aside className="sidebar" aria-label="Sugestões">
      <div className="sidebar__eu">
        <Avatar src={USUARIO_ATUAL.avatar} alt="" tamanho={48} onClick={() => onAbrirPerfil(USUARIO_ATUAL.user)} rotulo="Meu perfil" />
        <div>
          <strong>{USUARIO_ATUAL.user}</strong>
          <span>{USUARIO_ATUAL.nome}</span>
        </div>
      </div>

      <h2 className="sidebar__titulo">Pessoas que eu admiro</h2>
      <ul className="sidebar__lista">
        {pessoas.map((p) => (
          <li key={p.user}>
            <Avatar src={p.avatar} alt="" tamanho={34} onClick={() => onAbrirPerfil(p.user)} rotulo={`Abrir perfil de ${p.user}`} />
            <div className="sidebar__pessoa">
              <button type="button" className="link-usuario" onClick={() => onAbrirPerfil(p.user)}>{p.user}</button>
              <span>{p.nome}</span>
            </div>
            <button
              type="button"
              className={`sidebar__seguir${seguindo[p.user] ? ' sidebar__seguir--ativo' : ''}`}
              onClick={() => dispatch({ tipo: 'ALTERNAR_SEGUIR', user: p.user })}
              aria-pressed={!!seguindo[p.user]}
              aria-label={`${seguindo[p.user] ? 'Deixar de seguir' : 'Seguir'} ${p.user}`}
            >
              {seguindo[p.user] ? 'Seguindo' : 'Seguir'}
            </button>
          </li>
        ))}
      </ul>

      <p className="sidebar__rodape">
        Instagrão · um feed onde cada post é o maior sonho de quem publicou.
        <br />
        Feito com React para o Hora de Codar · Instituto PROA · 2026
      </p>
    </aside>
  )
}

export default Sidebar

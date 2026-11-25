import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import { FiArrowLeft, FiBookmark, FiGrid, FiHeart, FiMessageCircle } from 'react-icons/fi'
import Avatar from './Avatar'
import { USUARIO_ATUAL } from '../data/usuario'
import { formatarCompacto, formatarNumero } from '../utils/formatar'

function Grade({ posts, estado, onAbrirPost, vazio }) {
  if (posts.length === 0) return <p className="perfil__vazio">{vazio}</p>
  return (
    <ul className="perfil__grade">
      {posts.map((p) => (
        <li key={p.id}>
          <button type="button" className="perfil__miniatura" onClick={() => onAbrirPost(p.id)} aria-label={`Abrir publicação de ${p.user}`}>
            <img src={p.image} alt={p.alt} />
            <span className="perfil__sobreposicao" aria-hidden="true">
              <span><FaHeart /> {formatarCompacto(p.likes + (estado.posts[p.id].curtido ? 1 : 0))}</span>
              <span><FiMessageCircle /> {estado.posts[p.id].comentarios.length}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/**
 * Tela de perfil. Para as pessoas do feed mostra bio, o que ela mais quer ver
 * e as publicações. Para "eu.no.espelho" mostra os posts curtidos e salvos.
 */
function Perfil({ user, posts, estado, dispatch, aba: abaInicial = 'curtidos', onVoltar, onAbrirPost, onAbrirStory }) {
  const [aba, setAba] = useState(abaInicial)
  const ehEu = user === USUARIO_ATUAL.user
  const pessoa = ehEu ? USUARIO_ATUAL : posts.find((p) => p.user === user)
  if (!pessoa) return null

  const postsDaPessoa = posts.filter((p) => p.user === user)
  const curtidos = posts.filter((p) => estado.posts[p.id].curtido)
  const salvos = posts.filter((p) => estado.posts[p.id].salvo)
  const seguindoQtd = Object.values(estado.seguindo).filter(Boolean).length
  const segue = !!estado.seguindo[user]

  const numeros = ehEu
    ? [[curtidos.length, 'curtidos'], [salvos.length, 'salvos'], [seguindoQtd, 'seguindo']]
    : [[postsDaPessoa.length, postsDaPessoa.length === 1 ? 'publicação' : 'publicações'],
       [pessoa.seguidores + (segue ? 1 : 0), 'seguidores'], [180 + pessoa.id * 37, 'seguindo']]

  return (
    <section className="perfil" aria-label={`Perfil de ${user}`}>
      <button type="button" className="perfil__voltar" onClick={onVoltar}>
        <FiArrowLeft /> Voltar ao feed
      </button>

      <header className="perfil__topo">
        <Avatar
          src={pessoa.avatar}
          alt={`Foto de ${user}`}
          tamanho={150}
          anel={!ehEu}
          visto={!!estado.storiesVistos[user]}
          onClick={ehEu ? undefined : () => onAbrirStory(user)}
          rotulo={`Ver story de ${user}`}
        />
        <div className="perfil__info">
          <div className="perfil__linha">
            <h1>{user}</h1>
            {!ehEu && (
              <button
                type="button"
                className={`perfil__seguir${segue ? ' perfil__seguir--ativo' : ''}`}
                onClick={() => dispatch({ tipo: 'ALTERNAR_SEGUIR', user })}
                aria-pressed={segue}
              >
                {segue ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </div>
          <ul className="perfil__numeros">
            {numeros.map(([n, rotulo]) => (
              <li key={rotulo}><strong>{n >= 10000 ? formatarCompacto(n) : formatarNumero(n)}</strong> {rotulo}</li>
            ))}
          </ul>
          <p className="perfil__nome">{pessoa.nome}</p>
          {pessoa.location && <p className="perfil__local">{pessoa.location}</p>}
          <p className="perfil__bio">{pessoa.bio}</p>
        </div>
      </header>

      {!ehEu && (
        <aside className="perfil__desejo">
          <span>✨ O que eu mais quero ver</span>
          <p>“{pessoa.desejo}”</p>
        </aside>
      )}

      {ehEu ? (
        <>
          <div className="perfil__abas" role="tablist">
            <button type="button" role="tab" aria-selected={aba === 'curtidos'} onClick={() => setAba('curtidos')}>
              <FiHeart /> Curtidos
            </button>
            <button type="button" role="tab" aria-selected={aba === 'salvos'} onClick={() => setAba('salvos')}>
              <FiBookmark /> Salvos
            </button>
          </div>
          <Grade
            posts={aba === 'curtidos' ? curtidos : salvos}
            estado={estado}
            onAbrirPost={onAbrirPost}
            vazio={aba === 'curtidos' ? 'Você ainda não curtiu nenhum sonho. Dê um duplo clique numa foto do feed!' : 'Nada salvo ainda. Use o marcador ao lado das curtidas.'}
          />
        </>
      ) : (
        <>
          <div className="perfil__abas" role="tablist">
            <button type="button" role="tab" aria-selected="true"><FiGrid /> Publicações</button>
          </div>
          <Grade posts={postsDaPessoa} estado={estado} onAbrirPost={onAbrirPost} vazio="Nenhuma publicação." />
        </>
      )}
    </section>
  )
}

export default Perfil

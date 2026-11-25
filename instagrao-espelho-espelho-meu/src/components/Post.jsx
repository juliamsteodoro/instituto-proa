import { useRef, useState } from 'react'
import { FaBookmark, FaHeart } from 'react-icons/fa'
import { FiBookmark, FiHeart, FiMessageCircle, FiMoreHorizontal, FiSend } from 'react-icons/fi'
import Avatar from './Avatar'
import Comentarios from './Comentarios'
import { pluralizar } from '../utils/formatar'

const LIMITE_LEGENDA = 110

function Post({ post, estado, seguindo, dispatch, onAbrirPerfil }) {
  const [coracaoGrande, setCoracaoGrande] = useState(false)
  const [legendaInteira, setLegendaInteira] = useState(false)
  const campoComentario = useRef(null)

  const { curtido, salvo, comentarios } = estado
  const curtidas = post.likes + (curtido ? 1 : 0)
  const legendaLonga = post.caption.length > LIMITE_LEGENDA

  function curtirComDuploClique() {
    dispatch({ tipo: 'CURTIR', id: post.id })
    setCoracaoGrande(true)
    setTimeout(() => setCoracaoGrande(false), 900)
  }

  const abrirPerfil = () => onAbrirPerfil(post.user)

  return (
    <article className="post" id={`post-${post.id}`} aria-label={`Publicação de ${post.user}`}>
      <header className="post__header">
        <Avatar src={post.avatar} alt={`Foto de ${post.user}`} tamanho={36} anel onClick={abrirPerfil} rotulo={`Abrir perfil de ${post.user}`} />
        <div className="post__user">
          <span className="post__linha-nome">
            <button type="button" className="link-usuario" onClick={abrirPerfil}>{post.user}</button>
            <span className="post__ponto" aria-hidden="true">•</span>
            <span className="post__tempo">{post.tempo}</span>
            <span className="post__ponto" aria-hidden="true">•</span>
            <button
              type="button"
              className={`botao-seguir${seguindo ? ' botao-seguir--ativo' : ''}`}
              onClick={() => dispatch({ tipo: 'ALTERNAR_SEGUIR', user: post.user })}
              aria-pressed={seguindo}
            >
              {seguindo ? 'Seguindo' : 'Seguir'}
            </button>
          </span>
          <span className="post__local">{post.location}</span>
        </div>
        <button className="icon-button post__more" type="button" aria-label="Mais opções">
          <FiMoreHorizontal />
        </button>
      </header>

      <div className="post__midia" onDoubleClick={curtirComDuploClique}>
        <img className="post__image" src={post.image} alt={post.alt} draggable="false" />
        {coracaoGrande && <FaHeart className="post__coracao-grande" aria-hidden="true" data-testid="coracao-grande" />}
      </div>

      <div className="post__content">
        <div className="post__actions">
          <button
            className={`icon-button${curtido ? ' icon-button--curtido' : ''}`}
            type="button"
            aria-label={curtido ? 'Descurtir' : 'Curtir'}
            aria-pressed={curtido}
            onClick={() => dispatch({ tipo: 'ALTERNAR_CURTIDA', id: post.id })}
          >
            {curtido ? <FaHeart /> : <FiHeart />}
          </button>
          <button className="icon-button" type="button" aria-label="Comentar" onClick={() => campoComentario.current?.focus()}>
            <FiMessageCircle />
          </button>
          <button className="icon-button" type="button" aria-label="Enviar">
            <FiSend />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={salvo ? 'Remover dos salvos' : 'Salvar'}
            aria-pressed={salvo}
            onClick={() => dispatch({ tipo: 'ALTERNAR_SALVO', id: post.id })}
          >
            {salvo ? <FaBookmark /> : <FiBookmark />}
          </button>
        </div>

        <p className="post__likes"><strong data-testid="curtidas">{pluralizar(curtidas, 'curtida', 'curtidas')}</strong></p>

        <p className="post__caption">
          <button type="button" className="link-usuario" onClick={abrirPerfil}>{post.user}</button>{' '}
          {legendaLonga && !legendaInteira ? (
            <>
              {post.caption.slice(0, LIMITE_LEGENDA).trimEnd()}…{' '}
              <button type="button" className="link-discreto" onClick={() => setLegendaInteira(true)}>mais</button>
            </>
          ) : post.caption}
        </p>

        <Comentarios
          comentarios={comentarios}
          campoRef={campoComentario}
          onComentar={(texto) => dispatch({ tipo: 'COMENTAR', id: post.id, texto })}
          onCurtirComentario={(comentarioId) => dispatch({ tipo: 'ALTERNAR_CURTIDA_COMENTARIO', id: post.id, comentarioId })}
          onAbrirPerfil={onAbrirPerfil}
        />
      </div>
    </article>
  )
}

export default Post

import { useEffect } from 'react'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import Avatar from './Avatar'
import { CORES_STORY } from '../data/usuario'

export const DURACAO_STORY = 6000

/**
 * Visualizador de stories em tela cheia. Cada story mostra
 * "o que eu mais quero ver" da pessoa. Avança sozinho a cada 6 s.
 */
function StoryViewer({ pessoas, indice, onMudar, onFechar, onVisto }) {
  const pessoa = pessoas[indice]
  const [cor1, cor2] = CORES_STORY[pessoa.user] ?? ['#7C3AED', '#F97362']

  const anterior = () => (indice > 0 ? onMudar(indice - 1) : onFechar())
  const proximo = () => (indice < pessoas.length - 1 ? onMudar(indice + 1) : onFechar())

  useEffect(() => {
    onVisto(pessoa.user)
    const timer = setTimeout(() => (indice < pessoas.length - 1 ? onMudar(indice + 1) : onFechar()), DURACAO_STORY)
    return () => clearTimeout(timer)
  }, [indice, pessoa.user, pessoas.length, onMudar, onFechar, onVisto])

  useEffect(() => {
    const teclado = (e) => {
      if (e.key === 'Escape') onFechar()
      if (e.key === 'ArrowRight') (indice < pessoas.length - 1 ? onMudar(indice + 1) : onFechar())
      if (e.key === 'ArrowLeft' && indice > 0) onMudar(indice - 1)
    }
    window.addEventListener('keydown', teclado)
    return () => window.removeEventListener('keydown', teclado)
  }, [indice, pessoas.length, onMudar, onFechar])

  return (
    <div className="story-viewer" role="dialog" aria-modal="true" aria-label={`Story de ${pessoa.user}`}>
      <button type="button" className="story-viewer__fechar" onClick={onFechar} aria-label="Fechar story">
        <FiX />
      </button>

      <button type="button" className="story-viewer__seta" onClick={anterior} aria-label="Story anterior" disabled={indice === 0}>
        <FiChevronLeft />
      </button>

      <article className="story" style={{ background: `linear-gradient(160deg, ${cor1}, ${cor2})` }}>
        <div className="story__progresso">
          {pessoas.map((p, i) => (
            <span key={p.user} className="story__barra">
              <span
                key={`${p.user}-${indice}`}
                className={`story__preenchimento${i < indice ? ' story__preenchimento--cheio' : ''}${i === indice ? ' story__preenchimento--ativo' : ''}`}
                style={{ animationDuration: `${DURACAO_STORY}ms` }}
              />
            </span>
          ))}
        </div>

        <header className="story__topo">
          <Avatar src={pessoa.avatar} alt="" tamanho={34} />
          <strong>{pessoa.user}</strong>
          <span>{pessoa.tempo}</span>
        </header>

        <div className="story__corpo">
          <p className="story__chamada">O que eu mais quero ver:</p>
          <p className="story__desejo">“{pessoa.desejo}”</p>
          <img className="story__miniatura" src={pessoa.image} alt="" />
          <p className="story__assinatura">— {pessoa.nome}</p>
        </div>

        <button type="button" className="story__zona story__zona--esq" onClick={anterior} aria-label="Voltar" tabIndex={-1} />
        <button type="button" className="story__zona story__zona--dir" onClick={proximo} aria-label="Avançar" tabIndex={-1} />
      </article>

      <button type="button" className="story-viewer__seta" onClick={proximo} aria-label="Próximo story">
        <FiChevronRight />
      </button>
    </div>
  )
}

export default StoryViewer

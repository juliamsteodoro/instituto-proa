import { useEffect, useReducer } from 'react'
import { USUARIO_ATUAL } from '../data/usuario'

const CHAVE = 'instagrao:estado:v1'

/** Estado inicial: interações zeradas a partir do JSON. */
export function criarEstadoInicial(posts) {
  return {
    posts: Object.fromEntries(posts.map((p) => [p.id, {
      curtido: false,
      salvo: false,
      comentarios: p.comments.map((c) => ({ ...c, curtido: false })),
    }])),
    seguindo: {},
    storiesVistos: {},
  }
}

/** Junta o estado salvo no navegador com o JSON (posts novos no JSON também aparecem). */
function carregarEstado(posts) {
  const inicial = criarEstadoInicial(posts)
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE))
    if (!salvo) return inicial
    return {
      posts: Object.fromEntries(Object.entries(inicial.posts).map(([id, p]) => [id, { ...p, ...salvo.posts?.[id] }])),
      seguindo: salvo.seguindo ?? {},
      storiesVistos: salvo.storiesVistos ?? {},
    }
  } catch {
    return inicial
  }
}

function atualizarPost(estado, id, mudanca) {
  const atual = estado.posts[id]
  return { ...estado, posts: { ...estado.posts, [id]: { ...atual, ...mudanca(atual) } } }
}

export function feedReducer(estado, acao) {
  switch (acao.tipo) {
    case 'ALTERNAR_CURTIDA':
      return atualizarPost(estado, acao.id, (p) => ({ curtido: !p.curtido }))
    case 'CURTIR': // duplo clique na foto só curte (não descurte), como no Instagram
      return atualizarPost(estado, acao.id, () => ({ curtido: true }))
    case 'ALTERNAR_SALVO':
      return atualizarPost(estado, acao.id, (p) => ({ salvo: !p.salvo }))
    case 'COMENTAR': {
      const texto = acao.texto.trim()
      if (!texto) return estado
      return atualizarPost(estado, acao.id, (p) => ({
        comentarios: [...p.comentarios, {
          id: Math.max(0, ...p.comentarios.map((c) => c.id)) + 1,
          user: USUARIO_ATUAL.user,
          text: texto,
          curtido: false,
          novo: true,
        }],
      }))
    }
    case 'ALTERNAR_CURTIDA_COMENTARIO':
      return atualizarPost(estado, acao.id, (p) => ({
        comentarios: p.comentarios.map((c) => (c.id === acao.comentarioId ? { ...c, curtido: !c.curtido } : c)),
      }))
    case 'ALTERNAR_SEGUIR':
      return { ...estado, seguindo: { ...estado.seguindo, [acao.user]: !estado.seguindo[acao.user] } }
    case 'VER_STORY':
      return { ...estado, storiesVistos: { ...estado.storiesVistos, [acao.user]: true } }
    case 'REINICIAR':
      return criarEstadoInicial(acao.posts)
    default:
      return estado
  }
}

export function useFeed(posts) {
  const [estado, dispatch] = useReducer(feedReducer, posts, carregarEstado)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado))
    } catch {
      // navegador sem localStorage: segue funcionando só em memória
    }
  }, [estado])

  return [estado, dispatch]
}

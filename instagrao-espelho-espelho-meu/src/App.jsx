import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiHeart, FiHome, FiPlusSquare, FiSearch } from 'react-icons/fi'
import Avatar from './components/Avatar'
import Header from './components/Header'
import Perfil from './components/Perfil'
import Post from './components/Post'
import Sidebar from './components/Sidebar'
import Stories from './components/Stories'
import StoryViewer from './components/StoryViewer'
import posts from './data/posts.json'
import { USUARIO_ATUAL } from './data/usuario'
import { useFeed } from './hooks/useFeed'
import { normalizar } from './utils/busca'
import './App.css'

function App() {
  const [estado, dispatch] = useFeed(posts)
  const [tela, setTela] = useState({ tipo: 'feed' }) // { tipo: 'feed' } | { tipo: 'perfil', user, aba }
  const [storyAberto, setStoryAberto] = useState(null) // índice do story ou null
  const [busca, setBusca] = useState('')
  const [buscaAberta, setBuscaAberta] = useState(false)
  const postParaRolar = useRef(null)

  const postsFiltrados = useMemo(() => {
    const termo = normalizar(busca)
    if (!termo) return posts
    return posts.filter((p) => [p.user, p.nome, p.location, p.caption, p.desejo].some((t) => normalizar(t).includes(termo)))
  }, [busca])

  // Ao abrir um post a partir do perfil, volta ao feed e rola até ele
  useEffect(() => {
    if (tela.tipo !== 'feed' || postParaRolar.current === null) return
    document.getElementById(`post-${postParaRolar.current}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    postParaRolar.current = null
  }, [tela])

  const irParaFeed = () => {
    setTela({ tipo: 'feed' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const abrirPerfil = (user, aba) => {
    setTela({ tipo: 'perfil', user, aba })
    window.scrollTo({ top: 0 })
  }
  const abrirPost = (id) => {
    setBusca('')
    postParaRolar.current = id
    setTela({ tipo: 'feed' })
  }

  const fecharStory = useCallback(() => setStoryAberto(null), [])
  const marcarVisto = useCallback((user) => dispatch({ tipo: 'VER_STORY', user }), [dispatch])

  return (
    <div className="app">
      <Header
        busca={busca}
        onBusca={(valor) => { setBusca(valor); if (tela.tipo !== 'feed') setTela({ tipo: 'feed' }) }}
        buscaAberta={buscaAberta}
        onFecharBusca={() => setBuscaAberta(false)}
        onInicio={irParaFeed}
        onPerfil={() => abrirPerfil(USUARIO_ATUAL.user, 'curtidos')}
        onAtividades={() => abrirPerfil(USUARIO_ATUAL.user, 'curtidos')}
      />

      <div className="layout">
        <main className="principal">
          {tela.tipo === 'feed' ? (
            <>
              {!busca && <Stories pessoas={posts} vistos={estado.storiesVistos} onAbrir={setStoryAberto} />}

              <section className="feed" aria-label="Feed de publicações">
                {busca && (
                  <p className="feed__aviso">
                    {postsFiltrados.length
                      ? `${postsFiltrados.length} resultado(s) para “${busca}”`
                      : `Nenhum sonho encontrado para “${busca}”.`}
                  </p>
                )}
                {postsFiltrados.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    estado={estado.posts[post.id]}
                    seguindo={!!estado.seguindo[post.user]}
                    dispatch={dispatch}
                    onAbrirPerfil={abrirPerfil}
                  />
                ))}
                {!busca && <p className="feed__fim">✨ Você viu todos os sonhos de hoje ✨</p>}
              </section>
            </>
          ) : (
            <Perfil
              key={`${tela.user}-${tela.aba}`}
              user={tela.user}
              aba={tela.aba}
              posts={posts}
              estado={estado}
              dispatch={dispatch}
              onVoltar={irParaFeed}
              onAbrirPost={abrirPost}
              onAbrirStory={(user) => setStoryAberto(posts.findIndex((p) => p.user === user))}
            />
          )}
        </main>

        <Sidebar pessoas={posts} seguindo={estado.seguindo} dispatch={dispatch} onAbrirPerfil={abrirPerfil} />
      </div>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        <button type="button" aria-label="Início" onClick={() => { setBuscaAberta(false); irParaFeed() }}><FiHome /></button>
        <button type="button" aria-label="Pesquisar" onClick={() => { setBuscaAberta((v) => !v); setTela({ tipo: 'feed' }) }}><FiSearch /></button>
        <button type="button" aria-label="Criar publicação" title="Em breve"><FiPlusSquare /></button>
        <button type="button" aria-label="Atividades" onClick={() => abrirPerfil(USUARIO_ATUAL.user, 'curtidos')}><FiHeart /></button>
        <Avatar src={USUARIO_ATUAL.avatar} alt="" tamanho={26} onClick={() => abrirPerfil(USUARIO_ATUAL.user, 'curtidos')} rotulo="Perfil" />
      </nav>

      {storyAberto !== null && (
        <StoryViewer
          pessoas={posts}
          indice={storyAberto}
          onMudar={setStoryAberto}
          onFechar={fecharStory}
          onVisto={marcarVisto}
        />
      )}
    </div>
  )
}

export default App

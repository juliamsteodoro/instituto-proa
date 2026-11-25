import { FiHeart, FiHome, FiPlusSquare, FiSearch, FiX } from 'react-icons/fi'
import Avatar from './Avatar'
import { USUARIO_ATUAL } from '../data/usuario'

function Logo() {
  return (
    <span className="logo" aria-label="Instagrão">
      <svg className="logo__espelho" viewBox="0 0 32 40" aria-hidden="true">
        <defs>
          <linearGradient id="logo-gradiente" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset=".55" stopColor="#EC4899" />
            <stop offset="1" stopColor="#F97362" />
          </linearGradient>
        </defs>
        <ellipse cx="16" cy="18" rx="12" ry="15" fill="none" stroke="url(#logo-gradiente)" strokeWidth="3.5" />
        <path d="M10 12 Q12 8 16 7" stroke="url(#logo-gradiente)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M16 33 V39 M11 39 H21" stroke="url(#logo-gradiente)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="logo__texto">Instagrão</span>
    </span>
  )
}

function Header({ busca, onBusca, onInicio, onPerfil, onAtividades, buscaAberta, onFecharBusca }) {
  return (
    <header className="header">
      <div className="header__conteudo">
        <button type="button" className="header__logo" onClick={onInicio} aria-label="Ir para o início">
          <Logo />
        </button>

        <label className={`busca${buscaAberta ? ' busca--aberta' : ''}`}>
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Pesquisar pessoas e sonhos"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
            aria-label="Pesquisar"
          />
          {busca && (
            <button type="button" className="busca__limpar" onClick={() => { onBusca(''); onFecharBusca?.() }} aria-label="Limpar pesquisa">
              <FiX />
            </button>
          )}
        </label>

        <nav className="header__acoes" aria-label="Navegação principal">
          <button className="icon-button" type="button" aria-label="Início" onClick={onInicio}>
            <FiHome />
          </button>
          <button className="icon-button" type="button" aria-label="Criar publicação" title="Em breve">
            <FiPlusSquare />
          </button>
          <button className="icon-button" type="button" aria-label="Atividades" onClick={onAtividades}>
            <FiHeart />
          </button>
          <Avatar src={USUARIO_ATUAL.avatar} alt="" tamanho={26} onClick={onPerfil} rotulo="Meu perfil" />
        </nav>
      </div>
    </header>
  )
}

export default Header

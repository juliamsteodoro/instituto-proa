import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import posts from '../data/posts.json'
import { criarEstadoInicial, feedReducer } from '../hooks/useFeed'
import { formatarCompacto } from '../utils/formatar'

const primeiroPost = () => screen.getByRole('article', { name: 'Publicação de cida.ensina' })

describe('Feed', () => {
  it('mostra todas as publicações do JSON e os stories', () => {
    render(<App />)
    expect(screen.getAllByRole('article')).toHaveLength(posts.length)
    const stories = screen.getByRole('region', { name: 'Stories' })
    expect(within(stories).getAllByRole('button')).toHaveLength(posts.length)
  })

  it('curtir alterna o ícone e atualiza a quantidade', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()

    await user.click(within(post).getByRole('button', { name: 'Curtir' }))
    expect(within(post).getByTestId('curtidas')).toHaveTextContent('4.822 curtidas')
    expect(within(post).getByRole('button', { name: 'Descurtir' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(within(post).getByRole('button', { name: 'Descurtir' }))
    expect(within(post).getByTestId('curtidas')).toHaveTextContent('4.821 curtidas')
  })

  it('duplo clique na foto curte (e não descurte) e mostra o coração', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    const foto = within(post).getByRole('img', { name: /biblioteca escolar/ })

    await user.dblClick(foto)
    expect(within(post).getByTestId('coracao-grande')).toBeInTheDocument()
    expect(within(post).getByTestId('curtidas')).toHaveTextContent('4.822 curtidas')

    await user.dblClick(foto)
    expect(within(post).getByTestId('curtidas')).toHaveTextContent('4.822 curtidas')
  })

  it('publica um comentário e só habilita o botão com texto', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    const publicar = within(post).getByRole('button', { name: 'Publicar' })
    expect(publicar).toBeDisabled()

    await user.type(within(post).getByRole('textbox', { name: 'Adicione um comentário' }), 'Que lindo, Dona Cida!')
    expect(publicar).toBeEnabled()
    await user.click(publicar)

    expect(within(post).getByText('Que lindo, Dona Cida!')).toBeInTheDocument()
    expect(within(post).getByText('eu.no.espelho')).toBeInTheDocument()
    expect(within(post).getByRole('textbox', { name: 'Adicione um comentário' })).toHaveValue('')
  })

  it('comentário só com espaços é ignorado (Enter)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    await user.type(within(post).getByRole('textbox', { name: 'Adicione um comentário' }), '    {enter}')
    expect(within(post).queryByText('eu.no.espelho')).not.toBeInTheDocument()
  })

  it('"Ver todos os comentários" mostra os comentários escondidos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    const escondido = 'A senhora me ensinou a ler em 1998'
    expect(within(post).queryByText(new RegExp(escondido))).not.toBeInTheDocument()

    await user.click(within(post).getByRole('button', { name: 'Ver todos os 3 comentários' }))
    expect(within(post).getByText(new RegExp(escondido))).toBeInTheDocument()
  })

  it('curte um comentário', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    await user.click(within(post).getByRole('button', { name: 'Curtir comentário de bia.codigo' }))
    expect(within(post).getByRole('button', { name: 'Descurtir comentário de bia.codigo' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('"Mais" mostra a legenda inteira', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    expect(within(post).queryByText(/📚💛/)).not.toBeInTheDocument()
    await user.click(within(post).getByRole('button', { name: 'mais' }))
    expect(within(post).getByText(/📚💛/)).toBeInTheDocument()
  })

  it('seguir no post também atualiza a lista lateral', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(primeiroPost()).getByRole('button', { name: 'Seguir' }))
    expect(within(primeiroPost()).getByRole('button', { name: 'Seguindo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deixar de seguir cida.ensina' })).toBeInTheDocument()
  })

  it('a busca filtra por nome, legenda ou sonho, sem diferenciar acentos', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('searchbox', { name: 'Pesquisar' }), 'via lactea')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('1 resultado(s) para “via lactea”')).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Pesquisar' }))
    await user.type(screen.getByRole('searchbox', { name: 'Pesquisar' }), 'xyz')
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })
})

describe('Perfil', () => {
  it('abre o perfil da pessoa com bio e "o que eu mais quero ver"', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: 'Abrir perfil de maya.nofundo' })[0])
    const perfil = screen.getByRole('region', { name: 'Perfil de maya.nofundo' })
    expect(within(perfil).getByText(/O recife colorido de novo/)).toBeInTheDocument()
    expect(within(perfil).getByText('27,3 mil')).toBeInTheDocument()

    await user.click(within(perfil).getByRole('button', { name: /Voltar ao feed/ }))
    expect(screen.getAllByRole('article')).toHaveLength(posts.length)
  })

  it('meu perfil mostra os posts curtidos e salvos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const post = primeiroPost()
    await user.click(within(post).getByRole('button', { name: 'Curtir' }))
    await user.click(within(post).getByRole('button', { name: 'Salvar' }))

    await user.click(screen.getAllByRole('button', { name: 'Meu perfil' })[0])
    const perfil = screen.getByRole('region', { name: 'Perfil de eu.no.espelho' })
    expect(within(perfil).getAllByRole('button', { name: 'Abrir publicação de cida.ensina' })).toHaveLength(1)

    await user.click(within(perfil).getByRole('tab', { name: /Salvos/ }))
    expect(within(perfil).getAllByRole('button', { name: 'Abrir publicação de cida.ensina' })).toHaveLength(1)
  })
})

describe('Stories', () => {
  it('abre, avança, fecha com Esc e marca como visto', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ver story de cida.ensina' }))

    const dialogo = screen.getByRole('dialog', { name: 'Story de cida.ensina' })
    expect(within(dialogo).getByText(/fila na porta/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Próximo story' }))
    expect(screen.getByRole('dialog', { name: 'Story de rafa.brigadista' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver story de cida.ensina (visto)' })).toBeInTheDocument()
  })

  it('avança sozinho depois de 6 segundos', () => {
    vi.useFakeTimers()
    render(<App />)
    act(() => screen.getByRole('button', { name: 'Ver story de lia.olhaproceu' }).click())
    expect(screen.getByRole('dialog', { name: 'Story de lia.olhaproceu' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(6000))
    expect(screen.getByRole('dialog', { name: 'Story de seu.joaquim.pesca' })).toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('Estado e persistência', () => {
  it('o reducer ignora comentário vazio', () => {
    const estado = criarEstadoInicial(posts)
    expect(feedReducer(estado, { tipo: 'COMENTAR', id: 1, texto: '   ' })).toBe(estado)
  })

  it('curtidas ficam salvas no navegador (localStorage)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(within(primeiroPost()).getByRole('button', { name: 'Curtir' }))
    unmount()

    render(<App />)
    expect(within(primeiroPost()).getByTestId('curtidas')).toHaveTextContent('4.822 curtidas')
  })

  it('formata números como no Instagram', () => {
    expect(formatarCompacto(980)).toBe('980')
    expect(formatarCompacto(31800)).toBe('31,8 mil')
    expect(formatarCompacto(1250000)).toBe('1,3 mi')
  })
})

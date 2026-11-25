# Instagrão: Espelho, espelho meu, existe alguém mais bonito que eu?

Clone da página principal do Instagram feito em **React**. Nesse feed, cada pessoa publica **aquilo que ela mais quer ver no mundo**.

> Espelho, espelho meu, existe alguém mais bonito que eu?
> Existe sim: gente que sonha com um mundo melhor para os outros.

![Feed no computador](docs/prints/01-feed-desktop.png)

🔗 **Repositório:** `https://github.com/SEU-USUARIO/instagrao` (troque pelo link do seu repositório)
🎬 **Vídeo de demonstração:** [`docs/demo-instagrao.mp4`](docs/demo-instagrao.mp4)

---

## 💡 A ideia: quem está no meu feed

O exercício pede um feed só com pessoas que eu admiro (pessoas que não existem), em que cada post é aquilo que a pessoa mais quer ver. Escolhi sete pessoas comuns que cuidam dos outros:

| Perfil | Quem é | O que mais quer ver |
|---|---|---|
| `cida.ensina` | **Dona Cida**, 50 anos alfabetizando crianças em Caruaru | A biblioteca da escola com fila na porta |
| `rafa.brigadista` | **Rafael**, brigadista voluntário no Pantanal | Uma seca inteira sem nenhum incêndio |
| `lia.olhaproceu` | **Lia**, astrônoma amadora no sertão do Ceará | Toda criança vendo a Via Láctea do quintal |
| `seu.joaquim.pesca` | **Seu Joaquim**, pescador há 60 anos no Velho Chico | O rio limpo e cheio de peixe de novo |
| `maya.nofundo` | **Maya**, bióloga que replanta corais | O recife colorido, sem nenhum coral branco |
| `tiago.enfermeiro` | **Tiago**, enfermeiro de UTI pediátrica | A UTI vazia porque todo mundo teve alta |
| `bia.codigo` | **Bia**, dev que ensina meninas da periferia a programar | A primeira turma formada e contratada |

Eles também comentam nos posts uns dos outros, como uma comunidade de verdade. Quem usa o app é o `eu.no.espelho`, o reflexo de quem está olhando.

As imagens são **ilustrações originais em SVG** geradas por código ([`scripts/gerar_imagens.py`](scripts/gerar_imagens.py)). Assim, nenhuma pessoa real aparece no feed.

## 📸 Prints

| Interações num post | Story ("o que eu mais quero ver") |
|---|---|
| ![Post com curtida, comentário e salvo](docs/prints/02-interacoes-post.png) | ![Story aberto](docs/prints/03-story.png) |

| Perfil de uma pessoa | Meu perfil (curtidos e salvos) |
|---|---|
| ![Perfil](docs/prints/04-perfil-pessoa.png) | ![Meu perfil](docs/prints/05-meu-perfil-curtidos.png) |

| Celular | Story no celular | Busca |
|---|---|---|
| ![Feed no celular](docs/prints/07-feed-celular.png) | ![Story no celular](docs/prints/08-story-celular.png) | ![Busca](docs/prints/06-busca.png) |

O print do feed completo está em [`docs/prints/09-feed-completo.png`](docs/prints/09-feed-completo.png).

## ✅ Desafios do enunciado

| # | Desafio | O que foi feito |
|---|---|---|
| 1 | Nova identidade visual | Nome **Instagrão**, logo de espelho, fonte *Grand Hotel* no logo e paleta violeta → rosa → coral |
| 2 | Editar as publicações no JSON | 7 publicações novas em `src/data/posts.json`, com bio, sonho e comentários |
| 3 | Curtir alterna o ícone e a contagem | ❤️ preenchido e vermelho, contagem atualizada; **duplo clique na foto** curte com coração animado |
| 4 | Comentários | Lista com "Ver todos os N comentários", campo para publicar (Enter ou botão) e curtida em cada comentário |
| 5 | Perfil ou stories | **Os dois.** Stories com avanço automático e teclado (← → Esc); perfil de cada pessoa e o meu perfil, com abas Curtidos e Salvos |

Também implementei:
- **Salvar** posts.
- **Seguir** pessoas, em sincronia entre o post, a lista lateral e o perfil.
- **Busca** por nome, cidade ou sonho, sem diferenciar acentos.
- Legenda com **"mais"**.
- Layout **responsivo**, com barra inferior no celular.
- Tudo fica salvo no navegador (`localStorage`): curtidas e comentários continuam lá ao recarregar a página.

## ▶️ Como executar

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

Outros comandos:

```bash
npm test           # 17 testes automatizados (Vitest + Testing Library)
npm run lint       # verificação de código (ESLint)
npm run build      # versão de produção em dist/
```

Para gerar as ilustrações de novo (opcional): `python3 scripts/gerar_imagens.py`.

## 🧱 Arquitetura

```text
src/
├── App.jsx                 # estado da tela (feed/perfil), busca e story aberto
├── hooks/useFeed.js        # useReducer com todas as interações + localStorage
├── data/
│   ├── posts.json          # pessoas, posts, sonhos e comentários
│   └── usuario.js          # usuário logado (eu.no.espelho) e cores dos stories
├── components/
│   ├── Header.jsx          # logo, busca e ícones
│   ├── Stories.jsx         # barra de stories
│   ├── StoryViewer.jsx     # story em tela cheia com barras de progresso
│   ├── Post.jsx            # publicação: curtir, salvar, seguir, duplo clique
│   ├── Comentarios.jsx     # lista e formulário de comentários
│   ├── Perfil.jsx          # perfil da pessoa / meu perfil
│   ├── Sidebar.jsx         # "Pessoas que eu admiro" (telas largas)
│   └── Avatar.jsx          # foto redonda com anel de story
├── utils/                  # formatação de números e busca sem acento
└── test/App.test.jsx       # testes de interface
```

**Decisões principais:**
- **`useReducer` num só lugar.** Todas as interações passam por ações (`ALTERNAR_CURTIDA`, `COMENTAR`, `ALTERNAR_SEGUIR`...) em `useFeed.js`. Seguir alguém no post já atualiza a lateral e o perfil, porque o estado é um só.
- **JSON como fonte do conteúdo.** Para adicionar uma pessoa nova, basta acrescentar um objeto no `posts.json`.
- **Sem roteador.** A troca entre feed e perfil é um estado simples (`tela`), suficiente para o projeto.
- **Acessibilidade.** Os botões têm `aria-label` e `aria-pressed`, as imagens têm texto alternativo, o story fecha com Esc e o app respeita `prefers-reduced-motion`.

## 🧪 Testes

São 17 testes que simulam o usuário: curtir e descurtir, duplo clique, comentar, ver todos os comentários, "mais" na legenda, seguir, busca, perfis, abas, stories (inclusive o avanço automático) e a persistência no navegador. O resultado está em [`docs/resultado-testes.txt`](docs/resultado-testes.txt).

## 📣 Para o LinkedIn

O vídeo [`docs/demo-instagrao.mp4`](docs/demo-instagrao.mp4) (35 s) mostra stories, curtidas, comentário, perfil e salvos. Ele pode servir de base para o post: grave sua narração contando sobre o desenvolvimento, os desafios e os sucessos, e marque o professor, o Senac e o Instituto PROA.

---

Projeto do **Hora de Codar** · Instituto PROA · 2026

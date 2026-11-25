"""Gera as ilustrações SVG originais do Instagrão (avatares e posts).

Uso: python3 scripts/gerar_imagens.py  (só usa a biblioteca padrão do Python)
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'public' / 'images'
(OUT / 'avatars').mkdir(parents=True, exist_ok=True)
(OUT / 'posts').mkdir(parents=True, exist_ok=True)


def svg(w, h, defs, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<defs>{defs}</defs>{body}</svg>\n')


def lin(id_, stops, x1=0, y1=0, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"{"" if op is None else f" stop-opacity=\"{op}\""}/>'
                for o, c, *rest in stops for op in [rest[0] if rest else None])
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rad(id_, stops, cx=.5, cy=.5, r=.5):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"{"" if op is None else f" stop-opacity=\"{op}\""}/>'
                for o, c, *rest in stops for op in [rest[0] if rest else None])
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


# =====================================================================
# AVATARES
# =====================================================================
def avatar(nome, bg1, bg2, pele, camisa, cabelo_tras='', cabelo_frente='', extras='', barba=''):
    defs = lin('bg', [(0, bg1), (1, bg2)], 0, 0, 1, 1)
    corpo = (f'<path d="M40 320 C40 245 95 215 160 215 C225 215 280 245 280 320 Z" fill="{camisa}"/>'
             f'<rect x="138" y="180" width="44" height="50" rx="18" fill="{pele}"/>'
             f'<path d="M138 205 Q160 222 182 205 L182 214 Q160 230 138 214 Z" fill="#000" opacity=".12"/>')
    rosto = (f'<ellipse cx="160" cy="140" rx="62" ry="70" fill="{pele}"/>'
             f'<ellipse cx="98" cy="146" rx="10" ry="15" fill="{pele}"/><ellipse cx="222" cy="146" rx="10" ry="15" fill="{pele}"/>'
             '<circle cx="137" cy="142" r="6.5" fill="#2b1d16"/><circle cx="183" cy="142" r="6.5" fill="#2b1d16"/>'
             '<circle cx="139" cy="140" r="2" fill="#fff"/><circle cx="185" cy="140" r="2" fill="#fff"/>'
             '<ellipse cx="122" cy="165" rx="11" ry="7" fill="#ff7b7b" opacity=".35"/>'
             '<ellipse cx="198" cy="165" rx="11" ry="7" fill="#ff7b7b" opacity=".35"/>'
             '<path d="M142 172 Q160 188 178 172" stroke="#5a2e22" stroke-width="5" fill="none" stroke-linecap="round"/>')
    corpo_txt = (f'<rect width="320" height="320" fill="url(#bg)"/>{cabelo_tras}{corpo}{rosto}{barba}'
                 f'{cabelo_frente}{extras}')
    (OUT / 'avatars' / f'{nome}.svg').write_text(svg(320, 320, defs, corpo_txt))


# Dona Cida — cabelo grisalho em coque, óculos
avatar('cida', '#C9B6F2', '#F3C6E8', '#B5794A', '#7C4DBC',
       cabelo_tras='<circle cx="160" cy="62" r="34" fill="#d9d9de"/>',
       cabelo_frente='<path d="M96 140 C92 80 128 62 160 62 C194 62 228 80 224 140 C214 110 196 92 160 92 C126 92 106 110 96 140 Z" fill="#e4e4ea"/>'
                     '<path d="M120 80 Q160 70 200 80" stroke="#c4c4cc" stroke-width="4" fill="none"/>',
       extras='<g fill="none" stroke="#3b2a6b" stroke-width="5"><circle cx="137" cy="142" r="17"/><circle cx="183" cy="142" r="17"/>'
              '<path d="M154 142 h12"/></g>'
              '<path d="M96 330 L160 250 L224 330" fill="#fff" opacity=".25"/>')
# Rafa — brigadista, boné vermelho, camisa laranja
avatar('rafa', '#9EE6A8', '#3FA66B', '#EBC08F', '#F2711C',
       cabelo_frente='<path d="M98 128 C98 78 128 62 160 62 C196 62 222 82 222 128 C210 104 190 98 160 98 C130 98 110 104 98 128 Z" fill="#1d1d1f"/>'
                     '<path d="M94 112 C96 70 126 52 162 52 C200 52 226 74 226 112 Z" fill="#D7263D"/>'
                     '<path d="M150 108 C190 104 236 110 250 122 C230 126 190 120 150 120 Z" fill="#a81b2e"/>'
                     '<rect x="146" y="70" width="28" height="22" rx="4" fill="#fff"/><path d="M160 74 v14 M153 81 h14" stroke="#D7263D" stroke-width="4"/>',
       extras='<rect x="70" y="262" width="180" height="12" fill="#ffe14d" opacity=".9"/>')
# Lia — astrônoma, black power, camisa roxa com estrelas
avatar('lia', '#1E2A5A', '#5B3D99', '#7A4A2B', '#8E5BD6',
       cabelo_tras='<circle cx="160" cy="118" r="96" fill="#2a1a12"/>'
                   + ''.join(f'<circle cx="{160 + 92 * math.cos(a)}" cy="{118 + 92 * math.sin(a)}" r="22" fill="#2a1a12"/>'
                             for a in [i * math.pi / 8 for i in range(16)]),
       cabelo_frente='<path d="M100 120 C104 84 130 70 160 70 C192 70 216 84 220 120 C204 100 186 94 160 94 C134 94 116 100 100 120 Z" fill="#2a1a12"/>',
       extras='<path d="M110 288 l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z M210 270 l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffe680"/>'
              '<circle cx="96" cy="168" r="5" fill="#ffe680"/><circle cx="224" cy="168" r="5" fill="#ffe680"/>')
# Seu Joaquim — chapéu de palha, barba branca
avatar('joaquim', '#8FD3F4', '#3A86C8', '#9C6233', '#3E7CB1',
       barba='<path d="M104 150 C106 214 136 232 160 232 C184 232 214 214 216 150 C206 182 190 196 160 196 C130 196 114 182 104 150 Z" fill="#f1f1f1"/>'
             '<path d="M136 174 Q160 166 184 174 Q160 184 136 174 Z" fill="#f1f1f1"/>',
       cabelo_frente='<ellipse cx="160" cy="96" rx="118" ry="24" fill="#E2B865"/>'
                     '<path d="M104 96 C104 54 130 38 160 38 C190 38 216 54 216 96 Z" fill="#EAC57A"/>'
                     '<path d="M104 86 C140 94 180 94 216 86 L216 98 C180 106 140 106 104 98 Z" fill="#9b5b2e"/>'
                     '<g stroke="#c99a46" stroke-width="2" opacity=".7"><path d="M60 96 h200"/><path d="M120 50 l-8 40 M160 40 v50 M200 50 l8 40"/></g>',
       extras='<path d="M128 214 L160 250 L192 214" fill="#2f6390"/>')
# Maya — bióloga marinha, cabelo longo ondulado, máscara de mergulho na testa
avatar('maya', '#7EE0D3', '#1C8CA8', '#D9A066', '#0F6E7E',
       cabelo_tras='<path d="M88 130 C80 60 120 46 160 46 C204 46 244 64 232 140 C246 200 236 250 214 270 L106 270 C84 250 74 200 88 130 Z" fill="#5a3418"/>',
       cabelo_frente='<path d="M98 132 C98 86 126 66 160 66 C196 66 222 86 222 132 C206 104 184 96 160 96 C140 96 112 104 98 132 Z" fill="#6b3f1e"/>',
       extras='<rect x="104" y="78" width="112" height="34" rx="16" fill="#ffb703" stroke="#e08b00" stroke-width="4"/>'
              '<rect x="114" y="84" width="40" height="22" rx="9" fill="#bde8ff"/><rect x="166" y="84" width="40" height="22" rx="9" fill="#bde8ff"/>'
              '<path d="M150 268 c10-14 30-14 40 0" stroke="#7EE0D3" stroke-width="6" fill="none"/>')
# Tiago — enfermeiro, roupa de UTI verde-água, estetoscópio
avatar('tiago', '#FFE08A', '#FFB347', '#5E3A22', '#2EC4B6',
       cabelo_frente='<path d="M100 120 C100 76 128 62 160 62 C194 62 220 78 220 120 C206 96 186 90 160 90 C134 90 114 96 100 120 Z" fill="#1b120d"/>'
                     + ''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="#1b120d"/>' for x, y in
                               [(112, 92), (128, 76), (146, 68), (164, 66), (182, 70), (200, 80), (212, 96)]),
       barba='<path d="M120 180 C130 200 190 200 200 180 C196 196 180 206 160 206 C140 206 124 196 120 180 Z" fill="#1b120d" opacity=".55"/>',
       extras='<path d="M128 214 L160 246 L192 214" fill="#22a699"/>'
              '<path d="M110 240 C110 290 150 290 150 266" stroke="#444" stroke-width="6" fill="none"/>'
              '<circle cx="150" cy="262" r="9" fill="#bbb" stroke="#444" stroke-width="3"/>')
# Bia — dev, tranças presas no alto, óculos e brincos grandes
avatar('bia', '#FF9EC7', '#B24BF3', '#4A2A17', '#1F1B3A',
       cabelo_tras='<ellipse cx="160" cy="54" rx="44" ry="36" fill="#140b07"/>'
                   + ''.join(f'<path d="M{130 + i * 12} 50 q4 30 0 60" stroke="#2a170d" stroke-width="5" fill="none"/>' for i in range(6)),
       cabelo_frente='<path d="M100 126 C100 82 128 68 160 68 C194 68 220 84 220 126 C206 100 186 92 160 92 C134 92 114 100 100 126 Z" fill="#140b07"/>'
                     '<path d="M108 112 Q160 70 212 112" stroke="#ffcc33" stroke-width="5" fill="none"/>',
       extras='<g fill="none" stroke="#ffcc33" stroke-width="5"><rect x="118" y="128" width="38" height="28" rx="10"/>'
              '<rect x="164" y="128" width="38" height="28" rx="10"/><path d="M156 140 h8"/></g>'
              '<circle cx="98" cy="178" r="11" fill="none" stroke="#ffcc33" stroke-width="5"/>'
              '<circle cx="222" cy="178" r="11" fill="none" stroke="#ffcc33" stroke-width="5"/>'
              '<text x="160" y="296" font-family="monospace" font-size="34" font-weight="700" fill="#7CF5C6" text-anchor="middle">&lt;/&gt;</text>')

# Você — o espelho
eu = ('<rect width="320" height="320" fill="url(#bg)"/>'
      '<ellipse cx="160" cy="160" rx="96" ry="122" fill="#E9D8A6" stroke="#b8924a" stroke-width="10"/>'
      '<ellipse cx="160" cy="160" rx="80" ry="106" fill="url(#vidro)"/>'
      '<path d="M112 92 C126 72 146 64 160 62" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>'
      '<path d="M104 120 C106 110 110 102 114 96" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".5"/>'
      '<path d="M206 214 l8 18 20 3-15 13 4 20-17-10-17 10 4-20-15-13 20-3z" fill="#fff" opacity=".9"/>')
(OUT / 'avatars' / 'eu.svg').write_text(svg(320, 320, lin('bg', [(0, '#7C3AED'), (1, '#F97362')], 0, 0, 1, 1)
                                          + lin('vidro', [(0, '#E0F2FE'), (.5, '#A5B4FC'), (1, '#F0ABFC')], 0, 0, 1, 1), eu))


# =====================================================================
# POSTS (1080 x 1080)
# =====================================================================
W = 1080


def pessoa(x, y, pele, roupa, cabelo, escala=1.0, bracos_up=False, livro=None):
    """Bonequinho simples sentado/em pé (estilo flat)."""
    s = escala
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += f'<path d="M-38 120 C-38 60 -20 40 0 40 C20 40 38 60 38 120 Z" fill="{roupa}"/>'
    if bracos_up:
        g += (f'<path d="M-30 60 L-58 -10" stroke="{pele}" stroke-width="14" stroke-linecap="round"/>'
              f'<path d="M30 60 L58 -10" stroke="{pele}" stroke-width="14" stroke-linecap="round"/>')
    g += f'<circle cx="0" cy="10" r="30" fill="{pele}"/>'
    g += f'<path d="M-31 6 C-30 -26 -10 -30 0 -30 C14 -30 32 -22 31 6 C24 -10 10 -14 0 -14 C-12 -14 -24 -8 -31 6 Z" fill="{cabelo}"/>'
    if livro:
        g += (f'<path d="M-34 70 L0 80 L34 70 L34 104 L0 114 L-34 104 Z" fill="{livro}"/>'
              f'<path d="M0 80 L0 114" stroke="#fff" stroke-width="3"/>'
              f'<path d="M-30 74 L-4 82 M30 74 L4 82" stroke="#fff" stroke-width="2" opacity=".6"/>')
    return g + '</g>'


PELES = ['#F1C27D', '#8D5524', '#C68642', '#E0AC69', '#5C3A21', '#FFDBAC', '#A0662F']


def biblioteca():
    random.seed(1)
    d = lin('parede', [(0, '#FFE9C7'), (1, '#F7D7A8')]) + lin('ceu', [(0, '#8EC5FC'), (1, '#E0C3FC')])
    b = '<rect width="1080" height="1080" fill="url(#parede)"/>'
    # janela
    b += '<rect x="400" y="110" width="280" height="250" rx="16" fill="#8a5a3b"/><rect x="415" y="125" width="250" height="220" rx="10" fill="url(#ceu)"/>'
    b += '<circle cx="610" cy="185" r="34" fill="#FFE066"/><path d="M415 300 Q480 250 540 290 T665 280 V345 H415 Z" fill="#7BC47F"/>'
    b += '<path d="M540 125 V345 M415 235 H665" stroke="#8a5a3b" stroke-width="10"/>'
    # placa
    b += '<rect x="370" y="40" width="340" height="54" rx="27" fill="#7C4DBC"/>'
    b += '<text x="540" y="78" font-family="Georgia, serif" font-size="32" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="6">BIBLIOTECA</text>'
    # estantes
    for ex in (40, 720):
        b += f'<rect x="{ex}" y="90" width="320" height="640" rx="10" fill="#8a5a3b"/>'
        for prat in range(5):
            py = 110 + prat * 124
            b += f'<rect x="{ex + 14}" y="{py}" width="292" height="104" fill="#5e3b25"/>'
            bx = ex + 18
            while bx < ex + 292:
                lw = random.randint(16, 30)
                lh = random.randint(70, 100)
                cor = random.choice(['#E63946', '#F4A261', '#2A9D8F', '#264653', '#E9C46A', '#8E7DBE', '#3A86FF', '#FF006E', '#06D6A0'])
                if random.random() < 0.12 and prat == 1:
                    bx += lw  # espaço vazio: livro emprestado!
                    continue
                b += f'<rect x="{bx}" y="{py + 104 - lh}" width="{lw}" height="{lh}" rx="3" fill="{cor}"/>'
                b += f'<rect x="{bx + 3}" y="{py + 104 - lh + 10}" width="{lw - 6}" height="5" fill="#fff" opacity=".45"/>'
                bx += lw + 3
            b += f'<rect x="{ex + 8}" y="{py + 104}" width="304" height="12" fill="#a0704c"/>'
    # chão e tapete
    b += '<rect y="740" width="1080" height="340" fill="#C98B5A"/>'
    b += '<ellipse cx="540" cy="900" rx="470" ry="140" fill="#E76F51"/><ellipse cx="540" cy="900" rx="420" ry="112" fill="none" stroke="#F4A261" stroke-width="12" stroke-dasharray="30 18"/>'
    # crianças lendo
    criancas = [(250, 760, '#3A86FF'), (420, 790, '#FFBE0B'), (600, 770, '#8338EC'), (790, 790, '#06D6A0'),
                (340, 880, '#FF006E'), (690, 880, '#FB5607')]
    for i, (x, y, roupa) in enumerate(criancas):
        b += pessoa(x, y, PELES[i % len(PELES)], roupa, random.choice(['#2b1d16', '#4a2c1a', '#1b120d', '#8B5A2B', '#e0b45a']),
                    escala=1.05, livro=random.choice(['#2A9D8F', '#E63946', '#264653', '#E9C46A']))
    # fila na porta (à direita)
    b += '<rect x="955" y="520" width="110" height="220" rx="8" fill="#6d4429"/><circle cx="975" cy="635" r="6" fill="#ffd166"/>'
    return svg(W, W, d, b)


def pantanal():
    random.seed(2)
    d = (lin('ceu', [(0, '#FFB88C'), (.45, '#FFE3A3'), (1, '#BDE7F5')]) + lin('agua', [(0, '#7FD1E8'), (1, '#2F8FB3')]) +
         rad('sol', [(0, '#FFF6C9'), (.4, '#FFE27A'), (1, '#FFB347', 0)]))
    b = '<rect width="1080" height="1080" fill="url(#ceu)"/>'
    b += '<circle cx="760" cy="300" r="260" fill="url(#sol)"/><circle cx="760" cy="300" r="90" fill="#FFF3B0"/>'
    b += '<path d="M0 520 C160 440 300 470 420 500 C560 430 720 450 860 500 C960 470 1030 480 1080 490 V640 H0 Z" fill="#7CB86A"/>'
    b += '<path d="M0 580 C200 530 380 560 540 570 C700 540 900 560 1080 550 V660 H0 Z" fill="#4E9A51"/>'
    b += '<rect y="640" width="1080" height="200" fill="url(#agua)"/>'
    for i in range(14):
        y = 660 + i * 13
        x = random.randint(0, 900)
        b += f'<rect x="{x}" y="{y}" width="{random.randint(60, 200)}" height="4" rx="2" fill="#fff" opacity=".35"/>'
    b += '<ellipse cx="760" cy="700" rx="70" ry="10" fill="#FFF3B0" opacity=".6"/>'
    # ipês amarelos
    for x, y, s in [(160, 560, 1.3), (900, 540, 1.1), (520, 590, .8)]:
        b += f'<g transform="translate({x} {y}) scale({s})"><path d="M-8 0 L-12 120 L12 120 L8 0 Z" fill="#6b4226"/>'
        b += '<path d="M0 30 L-60 -20 M0 50 L60 -10 M0 10 L-20 -60 M0 20 L30 -60" stroke="#6b4226" stroke-width="8" stroke-linecap="round"/>'
        for _ in range(40):
            a, r = random.uniform(0, 2 * math.pi), random.uniform(0, 95)
            b += f'<circle cx="{r * math.cos(a)}" cy="{-50 + r * math.sin(a) * .7}" r="{random.randint(16, 28)}" fill="{random.choice(["#FFD60A", "#FFC300", "#FFE45C", "#F4B400"])}"/>'
        b += '</g>'
    # vitórias-régias
    for x, y in [(120, 780), (300, 750), (640, 800), (950, 760), (820, 820)]:
        b += f'<ellipse cx="{x}" cy="{y}" rx="70" ry="18" fill="#3E8E41"/><path d="M{x} {y} L{x + 60} {y - 8} L{x + 60} {y + 8} Z" fill="url(#agua)"/>'
        b += f'<circle cx="{x - 20}" cy="{y - 10}" r="9" fill="#FF8FAB"/>'
    # capim em primeiro plano
    b += '<rect y="840" width="1080" height="240" fill="#3C8D40"/>'
    for i in range(160):
        x = random.randint(-10, 1090)
        h = random.randint(60, 180)
        b += f'<path d="M{x} 1080 Q{x + random.randint(-30, 30)} {1080 - h / 2} {x + random.randint(-40, 40)} {1080 - h}" stroke="{random.choice(["#2E7D32", "#43A047", "#66BB6A", "#1B5E20"])}" stroke-width="5" fill="none"/>'
    # araras-azuis voando
    for x, y, s in [(330, 210, 1), (450, 150, .8), (240, 300, .7)]:
        b += (f'<g transform="translate({x} {y}) scale({s})"><path d="M-70 0 Q-30 -40 0 0 Q30 -40 70 0 Q30 -10 0 10 Q-30 -10 -70 0 Z" fill="#1E5AA8"/>'
              f'<ellipse cx="0" cy="8" rx="16" ry="10" fill="#2566C2"/><path d="M0 14 L-6 60 L6 60 Z" fill="#1E5AA8"/>'
              f'<circle cx="16" cy="2" r="8" fill="#FFD60A"/></g>')
    return svg(W, W, d, b)


def via_lactea():
    random.seed(3)
    d = (lin('noite', [(0, '#060B26'), (.6, '#1B1442'), (1, '#3B1F5C')]) +
         lin('faixa', [(0, '#9D7BFF', 0), (.5, '#F2D7FF', .55), (1, '#9D7BFF', 0)], 0, 0, 1, 0) +
         '<filter id="blur"><feGaussianBlur stdDeviation="28"/></filter><filter id="brilho"><feGaussianBlur stdDeviation="2"/></filter>')
    b = '<rect width="1080" height="1080" fill="url(#noite)"/>'
    b += '<g transform="rotate(-32 540 480)" filter="url(#blur)"><rect x="-200" y="400" width="1500" height="170" fill="url(#faixa)"/>'
    b += '<ellipse cx="560" cy="485" rx="420" ry="55" fill="#FFE8F7" opacity=".35"/><ellipse cx="400" cy="470" rx="200" ry="30" fill="#2a1446" opacity=".7"/></g>'
    for _ in range(900):
        t = random.uniform(-200, 1300)
        off = random.gauss(0, 70)
        a = math.radians(-32)
        x = 540 + (t - 540) * math.cos(a) - off * math.sin(a)
        y = 485 + (t - 540) * math.sin(a) + off * math.cos(a)
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{random.choice([.8, 1, 1.2, 1.6])}" fill="#fff" opacity="{random.uniform(.4, 1):.2f}"/>'
    for _ in range(260):
        b += f'<circle cx="{random.uniform(0, 1080):.1f}" cy="{random.uniform(0, 760):.1f}" r="{random.choice([1, 1.3, 1.8, 2.4])}" fill="#fff" opacity="{random.uniform(.3, 1):.2f}"/>'
    for x, y in [(160, 120), (900, 200), (780, 90), (250, 420)]:
        b += f'<g filter="url(#brilho)"><circle cx="{x}" cy="{y}" r="5" fill="#fff"/></g><path d="M{x - 16} {y} H{x + 16} M{x} {y - 16} V{y + 16}" stroke="#fff" stroke-width="1.5" opacity=".8"/>'
    b += '<path d="M700 140 l60 26" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M640 114 l60 26" stroke="#fff" stroke-width="1" opacity=".3"/>'
    # serras (monólitos de Quixadá)
    b += '<path d="M0 820 C80 700 150 640 220 700 C260 600 330 560 380 650 C430 720 480 760 560 760 C640 640 700 600 760 690 C820 600 900 620 960 720 C1010 700 1050 720 1080 740 V1080 H0 Z" fill="#160C2E"/>'
    b += '<path d="M0 900 C200 860 400 880 560 870 C760 850 900 880 1080 860 V1080 H0 Z" fill="#0B0618"/>'
    # mandacarus
    for x, s in [(140, 1.2), (930, 1), (820, .7)]:
        b += (f'<g transform="translate({x} 880) scale({s})" fill="#05030c"><rect x="-14" y="-230" width="28" height="240" rx="14"/>'
              f'<path d="M-14 -90 H-60 V-170" stroke="#05030c" stroke-width="24" stroke-linecap="round" fill="none"/>'
              f'<path d="M14 -120 H56 V-200" stroke="#05030c" stroke-width="24" stroke-linecap="round" fill="none"/></g>')
    # pessoa + telescópio
    b += ('<g transform="translate(560 870)" fill="#05030c"><circle cx="0" cy="-118" r="20"/><path d="M-22 -96 H22 L28 -20 H-28 Z"/>'
          '<rect x="-24" y="-24" width="16" height="30"/><rect x="8" y="-24" width="16" height="30"/>'
          '<path d="M24 -80 L66 -66" stroke="#05030c" stroke-width="10" stroke-linecap="round"/>'
          '<rect x="60" y="-150" width="120" height="26" rx="8" transform="rotate(-32 60 -150)"/>'
          '<path d="M100 -110 L80 6 M100 -110 L124 6 M100 -110 L104 6" stroke="#05030c" stroke-width="6"/></g>')
    return svg(W, W, d, b)


def peixe(x, y, s, cor, cor2, vira=False):
    t = f'translate({x} {y}) scale({-s if vira else s} {s})'
    return (f'<g transform="{t}"><path d="M-50 0 Q0 -36 46 0 Q0 36 -50 0 Z" fill="{cor}"/>'
            f'<path d="M-46 0 L-80 -26 L-74 0 L-80 26 Z" fill="{cor2}"/><path d="M-10 -24 Q4 -40 16 -22 Z" fill="{cor2}"/>'
            f'<path d="M-14 -20 Q-4 0 -14 20" stroke="{cor2}" stroke-width="6" fill="none" opacity=".7"/>'
            f'<circle cx="26" cy="-6" r="7" fill="#fff"/><circle cx="28" cy="-6" r="3.5" fill="#111"/></g>')


def rio():
    random.seed(4)
    d = (lin('ceu', [(0, '#7EC8E3'), (1, '#D8F3FF')]) + lin('agua', [(0, '#5ED3D0'), (.5, '#2BA3B8'), (1, '#16697A')]) +
         lin('luz', [(0, '#fff', .35), (1, '#fff', 0)]))
    b = '<rect width="1080" height="380" fill="url(#ceu)"/><circle cx="880" cy="120" r="70" fill="#FFE066"/>'
    b += '<ellipse cx="220" cy="110" rx="90" ry="30" fill="#fff" opacity=".9"/><ellipse cx="290" cy="95" rx="60" ry="28" fill="#fff" opacity=".9"/>'
    b += '<path d="M0 330 C140 280 240 300 340 320 C460 290 560 300 640 330 C760 290 900 300 1080 320 V380 H0 Z" fill="#6FAF5A"/>'
    for x in (60, 980):
        b += (f'<g transform="translate({x} 330)"><rect x="-8" y="-140" width="16" height="140" fill="#7a5230"/>'
              + ''.join(f'<path d="M0 -140 Q{dx} {-170 + dy} {dx * 2} {-120 + dy}" stroke="#3E8E41" stroke-width="16" stroke-linecap="round" fill="none"/>'
                        for dx, dy in [(-50, 0), (50, 0), (-30, -30), (30, -30)]) + '</g>')
    b += '<rect y="370" width="1080" height="710" fill="url(#agua)"/>'
    b += '<path d="M0 370 Q60 360 120 370 T240 370 T360 370 T480 370 T600 370 T720 370 T840 370 T960 370 T1080 370 V384 H0 Z" fill="#fff" opacity=".6"/>'
    for i in range(5):
        b += f'<polygon points="{150 + i * 200},380 {230 + i * 200},380 {120 + i * 200},1080 {20 + i * 200},1080" fill="url(#luz)"/>'
    # canoa
    b += ('<g transform="translate(560 362)"><path d="M-170 0 H170 Q150 40 100 46 H-100 Q-150 40 -170 0 Z" fill="#9C5B2E"/>'
          '<path d="M-170 0 H170" stroke="#6d3d1d" stroke-width="8"/>'
          '<circle cx="30" cy="-74" r="22" fill="#9C6233"/><ellipse cx="30" cy="-92" rx="48" ry="10" fill="#E2B865"/><path d="M8 -92 C8 -118 52 -118 52 -92 Z" fill="#EAC57A"/>'
          '<path d="M6 -52 H54 L58 0 H2 Z" fill="#3E7CB1"/>'
          '<path d="M50 -40 L200 -170" stroke="#5b3a1e" stroke-width="6" stroke-linecap="round"/>'
          '<path d="M200 -170 Q230 -60 220 120" stroke="#eee" stroke-width="2" fill="none"/></g>')
    # fundo do rio
    b += '<path d="M0 960 C160 930 300 960 460 950 C620 930 800 960 1080 940 V1080 H0 Z" fill="#C8A26B"/>'
    for i in range(30):
        x = random.randint(0, 1080)
        b += f'<ellipse cx="{x}" cy="{random.randint(960, 1070)}" rx="{random.randint(10, 26)}" ry="{random.randint(6, 12)}" fill="{random.choice(["#A1885A", "#8C7448", "#B79562"])}"/>'
    for x in (90, 260, 820, 1000, 640):
        h = random.randint(140, 260)
        b += f'<path d="M{x} 970 Q{x - 30} {970 - h / 2} {x + 10} {970 - h}" stroke="#2E8B57" stroke-width="12" fill="none" stroke-linecap="round"/>'
        b += f'<path d="M{x + 14} 970 Q{x + 40} {970 - h / 2} {x + 4} {970 - h * .8}" stroke="#3CB371" stroke-width="10" fill="none" stroke-linecap="round"/>'
    cores = [('#FF9F1C', '#E07A00'), ('#C0C7D1', '#8C95A3'), ('#FFD166', '#E0A800'), ('#EF476F', '#B5294E'),
             ('#06D6A0', '#05A87D'), ('#118AB2', '#0B5F7B')]
    for i in range(16):
        c = random.choice(cores)
        b += peixe(random.randint(80, 1000), random.randint(460, 900), random.uniform(.6, 1.3), c[0], c[1], random.random() < .5)
    for _ in range(30):
        b += f'<circle cx="{random.randint(0, 1080)}" cy="{random.randint(420, 940)}" r="{random.randint(3, 9)}" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>'
    return svg(W, W, d, b)


def coral():
    random.seed(5)
    d = (lin('mar', [(0, '#7FE7E0'), (.35, '#1FA8C9'), (1, '#0B3C6E')]) + lin('raio', [(0, '#fff', .4), (1, '#fff', 0)]))
    b = '<rect width="1080" height="1080" fill="url(#mar)"/>'
    for i in range(6):
        x = 60 + i * 190
        b += f'<polygon points="{x},0 {x + 70},0 {x + 260},1080 {x + 120},1080" fill="url(#raio)"/>'
    b += '<path d="M0 860 C180 820 320 850 480 840 C660 820 820 850 1080 830 V1080 H0 Z" fill="#E9D3A1"/>'
    b += '<path d="M0 930 C200 900 380 930 560 920 C760 900 900 930 1080 915 V1080 H0 Z" fill="#DCC08A"/>'

    def ramificado(x, y, cor, esc, seed):
        rnd = random.Random(seed)
        out = ''

        def galho(x0, y0, ang, comp, larg, n):
            nonlocal out
            x1 = x0 + comp * math.cos(ang)
            y1 = y0 + comp * math.sin(ang)
            out += f'<path d="M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f}" stroke="{cor}" stroke-width="{larg:.1f}" stroke-linecap="round"/>'
            if n > 0:
                for da in (-.45, .4):
                    galho(x1, y1, ang + da + rnd.uniform(-.15, .15), comp * .72, larg * .75, n - 1)
            else:
                out += f'<circle cx="{x1:.1f}" cy="{y1:.1f}" r="{larg * .8:.1f}" fill="{cor}"/>'
        galho(x, y, -math.pi / 2, 110 * esc, 26 * esc, 4)
        return out

    b += ramificado(200, 900, '#FF6B9A', 1.1, 1) + ramificado(860, 890, '#FFA94D', 1.2, 2) + ramificado(560, 920, '#B388FF', .8, 3)
    # coral-cérebro e anêmonas
    for x, y, r, c in [(380, 880, 80, '#F9C74F'), (720, 900, 70, '#90BE6D'), (1000, 900, 60, '#F94144')]:
        b += f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r * .7}" fill="{c}"/>'
        for k in range(4):
            b += f'<path d="M{x - r * .8} {y - r * .3 + k * 18} Q{x} {y - r * .6 + k * 18} {x + r * .8} {y - r * .3 + k * 18}" stroke="#000" stroke-opacity=".15" stroke-width="5" fill="none"/>'
    for x in (80, 470, 650, 950):
        for k in range(9):
            a = math.radians(-160 + k * 17.5)
            b += f'<path d="M{x} 930 Q{x + 30 * math.cos(a)} {930 + 60 * math.sin(a)} {x + 70 * math.cos(a)} {930 + 90 * math.sin(a)}" stroke="#FF8FAB" stroke-width="9" stroke-linecap="round" fill="none"/>'
    # cardume
    for i in range(22):
        b += peixe(520 + i % 6 * 70 + random.randint(-10, 10), 330 + i // 6 * 55 + random.randint(-10, 10), .45, '#FFD60A', '#3A86FF')
    for _ in range(9):
        c = random.choice([('#FF7F11', '#fff'), ('#3A86FF', '#FFD60A'), ('#FF006E', '#FFBE0B'), ('#06D6A0', '#118AB2')])
        b += peixe(random.randint(80, 1000), random.randint(520, 780), random.uniform(.7, 1.2), c[0], c[1], random.random() < .5)
    # tartaruga
    b += ('<g transform="translate(240 300) rotate(-12)"><ellipse cx="0" cy="0" rx="110" ry="76" fill="#4D7C3A"/>'
          '<ellipse cx="0" cy="0" rx="84" ry="56" fill="#6A9E4F"/><path d="M-40 -40 L0 -10 L40 -40 M-60 10 L0 -10 L60 10 M0 -10 V50" stroke="#4D7C3A" stroke-width="6" fill="none"/>'
          '<ellipse cx="128" cy="-6" rx="36" ry="26" fill="#8BB174"/><circle cx="142" cy="-12" r="5" fill="#111"/>'
          '<ellipse cx="60" cy="-80" rx="60" ry="18" fill="#8BB174" transform="rotate(-30 60 -80)"/>'
          '<ellipse cx="60" cy="80" rx="56" ry="16" fill="#8BB174" transform="rotate(30 60 80)"/>'
          '<ellipse cx="-96" cy="50" rx="30" ry="12" fill="#8BB174"/><ellipse cx="-96" cy="-50" rx="30" ry="12" fill="#8BB174"/></g>')
    for _ in range(40):
        b += f'<circle cx="{random.randint(0, 1080)}" cy="{random.randint(0, 820)}" r="{random.randint(3, 11)}" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>'
    return svg(W, W, d, b)


def pracinha():
    random.seed(6)
    d = lin('ceu', [(0, '#6EC6FF'), (1, '#D6F0FF')]) + rad('sol', [(0, '#FFF7C2'), (1, '#FFE066', 0)])
    b = '<rect width="1080" height="1080" fill="url(#ceu)"/><circle cx="150" cy="150" r="180" fill="url(#sol)"/><circle cx="150" cy="150" r="70" fill="#FFE066"/>'
    for x, y in [(520, 120), (820, 200)]:
        b += f'<g fill="#fff"><ellipse cx="{x}" cy="{y}" rx="90" ry="34"/><ellipse cx="{x + 50}" cy="{y - 20}" rx="60" ry="34"/><ellipse cx="{x - 50}" cy="{y - 10}" rx="50" ry="28"/></g>'
    # hospital ao fundo
    b += ('<rect x="680" y="330" width="360" height="420" fill="#F1F5F9"/><rect x="680" y="330" width="360" height="40" fill="#CBD5E1"/>'
          + ''.join(f'<rect x="{710 + c * 80}" y="{400 + r * 80}" width="50" height="50" rx="6" fill="#93C5FD"/>' for r in range(4) for c in range(4))
          + '<rect x="820" y="250" width="80" height="80" rx="12" fill="#fff"/><path d="M860 262 V318 M832 290 H888" stroke="#EF4444" stroke-width="18"/>')
    b += '<rect y="700" width="1080" height="380" fill="#7BCB6B"/><path d="M0 700 C300 670 700 690 1080 680 V720 H0 Z" fill="#8EDB7B"/>'
    # faixa
    b += ('<path d="M120 300 Q400 360 680 300" stroke="#fff" stroke-width="4" fill="none"/>'
          '<path d="M140 304 Q400 370 660 304 L660 380 Q400 446 140 380 Z" fill="#FF5D8F"/>'
          '<text x="400" y="372" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="46" font-weight="800" fill="#fff" text-anchor="middle">TODO MUNDO DE ALTA!</text>')
    # balanço
    b += ('<path d="M90 980 L170 540 L250 980 M470 980 L390 540 L310 980" stroke="#EF476F" stroke-width="22" stroke-linecap="round" fill="none"/>'
          '<path d="M150 540 H410" stroke="#EF476F" stroke-width="24" stroke-linecap="round"/>'
          '<path d="M230 550 L190 780 M290 550 L330 780" stroke="#555" stroke-width="5"/>'
          '<rect x="176" y="776" width="168" height="18" rx="9" fill="#FFD166"/>')
    b += pessoa(260, 680, '#5C3A21', '#3A86FF', '#1b120d', 1.0, bracos_up=True)
    # escorregador
    b += ('<path d="M560 980 V560 M640 980 V560" stroke="#118AB2" stroke-width="18"/>'
          + ''.join(f'<path d="M560 {600 + i * 70} H640" stroke="#118AB2" stroke-width="10"/>' for i in range(6))
          + '<path d="M640 580 C760 620 760 900 900 960 L900 990 C720 940 720 650 640 620 Z" fill="#FFB703"/>')
    b += pessoa(600, 470, '#F1C27D', '#06D6A0', '#e0b45a', .95, bracos_up=True)
    b += pessoa(840, 860, '#8D5524', '#8338EC', '#1b120d', .9, bracos_up=True)
    b += pessoa(470, 880, '#FFDBAC', '#FB5607', '#8B5A2B', .85)
    # balões
    for x, y, c in [(960, 120, '#FF006E'), (1010, 210, '#FFBE0B'), (900, 230, '#3A86FF'), (40, 420, '#8338EC'), (110, 470, '#06D6A0')]:
        b += (f'<ellipse cx="{x}" cy="{y}" rx="42" ry="52" fill="{c}"/><path d="M{x - 8} {y + 50} L{x + 8} {y + 50} L{x} {y + 62} Z" fill="{c}"/>'
              f'<path d="M{x} {y + 62} q-20 60 10 130" stroke="#666" stroke-width="2" fill="none"/>'
              f'<ellipse cx="{x - 14}" cy="{y - 18}" rx="9" ry="14" fill="#fff" opacity=".5"/>')
    for _ in range(60):
        x = random.randint(0, 1080)
        b += f'<circle cx="{x}" cy="{random.randint(1000, 1075)}" r="{random.randint(4, 8)}" fill="{random.choice(["#fff", "#FFD166", "#FF8FAB"])}"/>'
    return svg(W, W, d, b)


def formatura():
    random.seed(7)
    d = lin('fundo', [(0, '#2A1B5C'), (.6, '#6A2C91'), (1, '#C2417F')]) + rad('spot', [(0, '#fff', .35), (1, '#fff', 0)])
    b = '<rect width="1080" height="1080" fill="url(#fundo)"/>'
    b += '<ellipse cx="540" cy="420" rx="520" ry="360" fill="url(#spot)"/>'
    # telão
    b += ('<rect x="200" y="90" width="680" height="300" rx="20" fill="#120B2B" stroke="#7CF5C6" stroke-width="6"/>'
          '<text x="540" y="170" font-family="monospace" font-size="38" fill="#7CF5C6" text-anchor="middle">console.log(</text>'
          '<text x="540" y="250" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#fff" text-anchor="middle">TURMA 01</text>'
          '<text x="540" y="310" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#FFCC33" text-anchor="middle">Meninas que Codam</text>'
          '<text x="540" y="365" font-family="monospace" font-size="38" fill="#7CF5C6" text-anchor="middle">);</text>')
    # capelos voando
    for _ in range(14):
        x, y, a = random.randint(60, 1020), random.randint(380, 640), random.randint(-40, 40)
        s = random.uniform(.7, 1.2)
        b += (f'<g transform="translate({x} {y}) rotate({a}) scale({s})"><path d="M-60 0 L0 -26 L60 0 L0 26 Z" fill="#111"/>'
              f'<path d="M-34 10 V34 Q0 50 34 34 V10 L0 26 Z" fill="#222"/><path d="M0 0 L46 14 V44" stroke="#FFCC33" stroke-width="4" fill="none"/>'
              f'<circle cx="46" cy="48" r="7" fill="#FFCC33"/></g>')
    # confete
    for _ in range(170):
        x, y = random.randint(0, 1080), random.randint(0, 900)
        if 190 < x < 890 and 80 < y < 400:
            continue  # não cobre o telão
        c = random.choice(['#FFCC33', '#7CF5C6', '#FF6FB5', '#8EC5FF', '#fff'])
        if random.random() < .5:
            b += f'<rect x="{x}" y="{y}" width="12" height="6" fill="{c}" transform="rotate({random.randint(0, 180)} {x} {y})"/>'
        else:
            b += f'<circle cx="{x}" cy="{y}" r="5" fill="{c}"/>'
    # formandas comemorando
    b += '<rect y="900" width="1080" height="180" fill="#1A1033"/>'
    for i, x in enumerate(range(70, 1080, 120)):
        b += pessoa(x, 790 + (i % 2) * 40, PELES[i % len(PELES)], random.choice(['#111', '#1F1B3A', '#2a1446']),
                    random.choice(['#140b07', '#2a170d', '#4a2c1a', '#8B5A2B']), 1.05, bracos_up=True)
    return svg(W, W, d, b)


for nome, f in [('biblioteca', biblioteca), ('pantanal', pantanal), ('via-lactea', via_lactea), ('rio', rio),
                ('coral', coral), ('pracinha', pracinha), ('formatura', formatura)]:
    (OUT / 'posts' / f'{nome}.svg').write_text(f())
print('ok')

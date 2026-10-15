"""Build public/images/map-johannesburg.svg, the street-map background of the Contact section.

Input: an OpenStreetMap Overpass export (JSON, `out geom`) of roads around
Rosebank / Sandton, Johannesburg (bbox -26.135,28.025,-26.095,28.075). Fetch it with:

  curl -o jhb.json --data-urlencode 'data=[out:json][timeout:60];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified)$"](-26.135,28.025,-26.095,28.075););out geom;' https://overpass-api.de/api/interpreter

Run: python scripts/build-map.py jhb.json
Map data © OpenStreetMap contributors (ODbL); the attribution is shown on the page.
"""
import json
import math
import sys
from collections import defaultdict

S, W, N, E = -26.135, 28.025, -26.095, 28.075
WIDTH = 1600
KX = math.cos(math.radians((S + N) / 2))
HEIGHT = round(WIDTH * (N - S) / ((E - W) * KX))

# Road classes: stroke width and opacity (lines are the palette's rule colour on ink).
STYLE = {
    'motorway': (7, 0.22),
    'trunk': (6, 0.2),
    'primary': (5, 0.18),
    'secondary': (4, 0.15),
    'tertiary': (2.6, 0.12),
    'residential': (1.6, 0.08),
    'unclassified': (1.6, 0.08),
}
LABELLED = ('motorway', 'trunk', 'primary', 'secondary')


def xy(p):
    return ((p['lon'] - W) / (E - W) * WIDTH, (N - p['lat']) / (N - S) * HEIGHT)


def d_of(pts):
    out, last = [], None
    for x, y in pts:
        q = (round(x, 1), round(y, 1))
        if q != last:
            out.append(q)
            last = q
    return 'M' + ' L'.join(f'{x:g} {y:g}' for x, y in out)


def length(pts):
    return sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))


def main(src):
    data = json.load(open(src, encoding='utf8'))
    groups = defaultdict(list)
    best = {}  # one label per named main road: on its longest segment
    for el in data['elements']:
        if el.get('type') != 'way' or 'geometry' not in el:
            continue
        kind = el['tags'].get('highway')
        if kind not in STYLE:
            continue
        pts = [xy(p) for p in el['geometry']]
        groups[kind].append(d_of(pts))
        name = el['tags'].get('name')
        if kind in LABELLED and name:
            L = length(pts)
            if L > best.get(name, (0,))[0]:
                # Read left to right
                if pts[0][0] > pts[-1][0]:
                    pts = pts[::-1]
                best[name] = (L, d_of(pts))

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" '
        f'preserveAspectRatio="xMidYMid slice">',
        '<!-- Map data © OpenStreetMap contributors (ODbL). Rosebank / Sandton, Johannesburg. -->',
    ]
    for kind in ['residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'trunk', 'motorway']:
        if not groups[kind]:
            continue
        w, o = STYLE[kind]
        parts.append(
            f'<path d="{" ".join(groups[kind])}" fill="none" stroke="#d2c9bc" stroke-opacity="{o}" '
            f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
        )
    labels = sorted(best.items(), key=lambda kv: -kv[1][0])[:9]
    parts.append('<defs>')
    for i, (name, (L, d)) in enumerate(labels):
        parts.append(f'<path id="r{i}" d="{d}"/>')
    parts.append('</defs>')
    parts.append('<g font-family="IBM Plex Mono, Menlo, monospace" font-size="15" letter-spacing="1.5" fill="#b2a696" fill-opacity="0.45">')
    for i, (name, (L, d)) in enumerate(labels):
        parts.append(f'<text dy="-9"><textPath href="#r{i}" startOffset="50%" text-anchor="middle">{name}</textPath></text>')
    parts.append('</g></svg>')
    out = 'public/images/map-johannesburg.svg'
    open(out, 'w', encoding='utf8').write('\n'.join(parts))
    print(out, WIDTH, HEIGHT, sum(len(v) for v in groups.values()), 'roads', [n for n, _ in labels])


if __name__ == '__main__':
    main(sys.argv[1])

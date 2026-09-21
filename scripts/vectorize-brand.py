"""Rebuild supplied ORVION references as transparent paths (no embedded bitmap).
Usage: python scripts/vectorize-brand.py <directory containing brand PNGs>
Requires Pillow and numpy. Only needed to regenerate brand assets.
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image

def simplify(points, tolerance=0.85):
    if len(points) < 3:
        return points
    p = np.array(points, dtype=float)
    d = p[-1] - p[0]
    if np.dot(d, d) == 0:
        distances = np.linalg.norm(p - p[0], axis=1)
    else:
        t = np.clip((p - p[0]) @ d / np.dot(d, d), 0, 1)
        distances = np.linalg.norm(p - (p[0] + t[:, None] * d), axis=1)
    i = int(np.argmax(distances))
    if distances[i] <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[:i+1], tolerance)[:-1] + simplify(points[i:], tolerance)

def trace(mask):
    pad = np.pad(mask, 1)
    edges = {}
    for dy, dx, start, end in [(-1,0,(0,0),(1,0)), (0,1,(1,0),(1,1)), (1,0,(1,1),(0,1)), (0,-1,(0,1),(0,0))]:
        ys, xs = np.nonzero(mask & ~pad[1+dy:1+dy+mask.shape[0],1+dx:1+dx+mask.shape[1]])
        for y,x in zip(ys.tolist(),xs.tolist()):
            edges[(x+start[0],y+start[1])] = (x+end[0],y+end[1])
    paths = []
    while edges:
        first = next(iter(edges)); current = first; loop = [first]
        while current in edges:
            current = edges.pop(current); loop.append(current)
            if current == first: break
        if len(loop) < 60: continue
        half = len(loop)//2
        points = simplify(loop[:half+1])[:-1] + simplify(loop[half:])
        paths.append('M'+' L'.join(f'{x},{y}' for x,y in points)+' Z')
    return ' '.join(paths)

source = Path(sys.argv[1]); dest = Path(__file__).resolve().parents[1]/'public'/'brand'
dest.mkdir(parents=True, exist_ok=True)
for name, filename in [('symbol','logo_orvion.png'),('logo','tipografia_orvion.png')]:
    pixels = np.asarray(Image.open(source/filename).convert('RGB'))
    ink = (pixels.max(axis=2) < 120)
    coral = (pixels[:,:,0] > 130) & (pixels[:,:,1] < 110) & (pixels[:,:,2] < 110)
    ys,xs = np.nonzero(ink|coral)
    x,y,w,h = int(xs.min()-4),int(ys.min()-4),int(xs.max()-xs.min()+9),int(ys.max()-ys.min()+9)
    black_path, accent_path = trace(ink),trace(coral)
    for variant, fill, accent in [('light','#F4F6F8','#FF5A5F'),('dark','#080B12','#FF5A5F'),('mono','#F4F6F8','#F4F6F8')]:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" fill="none"><path fill="{fill}" fill-rule="evenodd" d="{black_path}"/><path fill="{accent}" d="{accent_path}"/></svg>'
        (dest/f'{name}-{variant}.svg').write_text(svg,encoding='utf-8')
    if name == 'symbol':
        (dest/'favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x-80} {y-80} {w+160} {h+160}"><rect x="{x-80}" y="{y-80}" width="{w+160}" height="{h+160}" rx="180" fill="#080B12"/><path fill="#F4F6F8" fill-rule="evenodd" d="{black_path}"/><path fill="#FF5A5F" d="{accent_path}"/></svg>',encoding='utf-8')
print('Generated 7 SVG assets from the supplied brand references.')

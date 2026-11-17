"""
Images de partage (Open Graph) « avant / après » — 1200 × 630, JPEG.

Quand on partage un lien de vprr.fr (SMS, WhatsApp, Messenger, Facebook…), l'aperçu affiche l'image og:image
de la page. Ce script fabrique une image par service à partir des vraies photos avant/après de media/services/ :
moitié gauche « AVANT », moitié droite « APRÈS », poignée centrale comme le curseur du site, bandeau aux
couleurs du logo (titre, nom, téléphone).

Usage (une fois, ou après un changement de photo) :  python scripts/make-og-images.py
Dépendance : Pillow (pip install pillow). Police : Bahnschrift (Windows), proche de Barlow Condensed ;
sinon DejaVu. Le site lui-même n'a aucune dépendance : seules les images produites (media/og/*.jpg) sont publiées.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'media', 'og')
W, H, BAR = 1200, 630, 120
INK, BROWN, BRONZE, SAND, WHITE = '#261E16', '#673A12', '#9F814F', '#C9B99F', '#FFFFFF'

S = 'media/services/'
IMAGES = {
    'og-vprr': (S + 'ravalement_facade/ravalement_avant-1200w.webp', S + 'ravalement_facade/ravalement_apres-1200w.webp',
                'Ravalement · nettoyage · peinture · toiture'),
    'og-ravalement': (S + 'ravalement_facade/ravalement_avant-1200w.webp', S + 'ravalement_facade/ravalement_apres-1200w.webp',
                      'Ravalement de façade'),
    'og-nettoyage-facade': (S + 'nettoyage_facade/nettoyage_facade_avant-1200w.webp', S + 'nettoyage_facade/nettoyage_facade_apres-1200w.webp',
                            'Nettoyage de façade'),
    'og-toiture': (S + 'nettoyag_toiture/toiture_avant-1200w.webp', S + 'nettoyag_toiture/toiture_apres-1200w.webp',
                   'Nettoyage de toiture'),
    'og-peinture': (S + 'etancheite_balcon/balcon_avant-1200w.webp', S + 'etancheite_balcon/balcon_apres-1200w.webp',
                    'Peinture & étanchéité extérieure'),
}


def font(size, style):
    for path in ('C:/Windows/Fonts/bahnschrift.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(path):
            f = ImageFont.truetype(path, size)
            try:
                f.set_variation_by_name(style)
            except Exception:
                pass
            return f
    return ImageFont.load_default()


def half(path, w, h):
    """Recadrage centré au même endroit pour l'avant et l'après (les paires sont alignées)."""
    im = Image.open(os.path.join(ROOT, path)).convert('RGB')
    ratio = w / h
    cw, ch = (im.height * ratio, im.height) if im.width / im.height > ratio else (im.width, im.width / ratio)
    left, top = (im.width - cw) / 2, (im.height - ch) / 2
    return im.crop((round(left), round(top), round(left + cw), round(top + ch))).resize((w, h), Image.LANCZOS)


def label(draw, x, y, text):
    f = font(30, 'Bold Condensed')
    l, t, r, b = draw.textbbox((0, 0), text, font=f)
    pad_x, pad_y = 18, 10
    draw.rectangle((x, y, x + (r - l) + 2 * pad_x, y + (b - t) + 2 * pad_y), fill=BROWN)
    draw.text((x + pad_x - l, y + pad_y - t), text, font=f, fill=WHITE)


def make(name, before, after, title):
    ph = H - BAR
    img = Image.new('RGB', (W, H), INK)
    img.paste(half(before, W // 2, ph), (0, 0))
    img.paste(half(after, W // 2, ph), (W // 2, 0))
    d = ImageDraw.Draw(img)

    # Séparateur et poignée, comme le curseur avant/après du site
    cx, cy = W // 2, ph // 2
    d.rectangle((cx - 3, 0, cx + 3, ph), fill=WHITE)
    d.ellipse((cx - 34, cy - 34, cx + 34, cy + 34), fill=WHITE)
    d.polygon([(cx - 22, cy), (cx - 8, cy - 11), (cx - 8, cy + 11)], fill=BROWN)
    d.polygon([(cx + 22, cy), (cx + 8, cy - 11), (cx + 8, cy + 11)], fill=BROWN)

    label(d, 24, 24, 'AVANT')
    label(d, W // 2 + 24, 24, 'APRÈS')

    # Bandeau bas
    d.rectangle((0, ph, W, ph + 5), fill=BRONZE)
    f_title, f_sub, f_tel, f_url = font(46, 'Bold Condensed'), font(25, 'SemiCondensed'), font(44, 'Bold Condensed'), font(24, 'SemiCondensed')
    d.text((36, ph + 18), title.upper(), font=f_title, fill=WHITE)
    d.text((36, ph + 74), 'Villéger Peinture Raval Rénovation · Angoulême & Charente', font=f_sub, fill=SAND)
    tel, url = '05 45 91 22 70', 'vprr.fr · devis gratuit'
    tw = d.textlength(tel, font=f_tel)
    uw = d.textlength(url, font=f_url)
    d.text((W - 36 - tw, ph + 18), tel, font=f_tel, fill=WHITE)
    d.text((W - 36 - uw, ph + 75), url, font=f_url, fill=SAND)

    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f'{name}.jpg')
    img.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    print(f'{out}  {os.path.getsize(out) // 1024} Ko')


if __name__ == '__main__':
    for name, (b, a, t) in IMAGES.items():
        make(name, b, a, t)

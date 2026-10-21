(() => {
  'use strict';

  const LIVE = 'https://mizoz.github.io/email-signature/';
  const KEY = 'email-signature:v1';
  const GMAIL_LIMIT = 10000;

  const FONTS = {
    arial: 'Arial, Helvetica, sans-serif',
    helvetica: 'Helvetica, Arial, sans-serif',
    verdana: 'Verdana, Geneva, sans-serif',
    tahoma: 'Tahoma, Geneva, sans-serif',
    trebuchet: "'Trebuchet MS', Helvetica, sans-serif",
    georgia: "Georgia, 'Times New Roman', serif",
    times: "'Times New Roman', Times, serif",
    courier: "'Courier New', Courier, monospace"
  };

  const SOCIAL = [
    { k: 'linkedin', label: 'LinkedIn', base: 'https://www.linkedin.com/in/' },
    { k: 'x', label: 'X', base: 'https://x.com/' },
    { k: 'instagram', label: 'Instagram', base: 'https://www.instagram.com/' },
    { k: 'facebook', label: 'Facebook', base: 'https://www.facebook.com/' },
    { k: 'youtube', label: 'YouTube', base: 'https://www.youtube.com/@' },
    { k: 'tiktok', label: 'TikTok', base: 'https://www.tiktok.com/@' },
    { k: 'github', label: 'GitHub', base: 'https://github.com/' }
  ];

  const TEMPLATES = [
    { id: 'divider', name: 'Photo + divider' },
    { id: 'classic', name: 'Classic' },
    { id: 'compact', name: 'Compact' },
    { id: 'stacked', name: 'Photo on top' },
    { id: 'logo', name: 'Logo right' },
    { id: 'accent', name: 'Accent bar' },
    { id: 'centered', name: 'Centered' },
    { id: 'minimal', name: 'Plain minimal' }
  ];

  const DEFAULTS = {
    template: 'divider',
    name: 'Alex Rivera',
    pronouns: 'she/her',
    title: 'Marketing Manager',
    company: 'Northwind Studio',
    phone: '+1 403 555 0142',
    mobile: '',
    email: 'alex@example.com',
    website: 'example.com',
    address: '',
    photo: LIVE + 'demo/photo.png',
    photoShape: 'round',
    photoSize: '88',
    logo: LIVE + 'demo/logo.png',
    logoWidth: '140',
    linkedin: 'alexrivera',
    x: '',
    instagram: 'northwindstudio',
    facebook: '',
    youtube: '',
    tiktok: '',
    github: '',
    socialStyle: 'icons',
    iconColor: 'slate',
    cta: 'Book a 15-minute intro call',
    ctaUrl: 'https://example.com/book',
    disclaimer: '',
    accent: '#2563eb',
    text: '#1f2937',
    font: 'arial',
    size: '13',
    labels: 'letters'
  };

  let s = { ...DEFAULTS };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---------- helpers ----------
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = (v, fb) => (/^#[0-9a-f]{6}$/i.test(v) ? v : fb);

  function webUrl(v) {
    v = (v || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    if (/^[a-z]+:/i.test(v)) return ''; // no javascript:, data: etc. for links
    return 'https://' + v.replace(/^\/+/, '');
  }
  const prettyUrl = (u) => u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  const imgUrl = (v) => {
    v = (v || '').trim();
    return /^https:\/\//i.test(v) ? v : '';
  };
  const telHref = (p) => 'tel:' + p.replace(/[^\d+]/g, '');

  function socialUrl(net, v) {
    v = (v || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    if (/^(www\.)?[a-z0-9.-]+\.[a-z]{2,}\//i.test(v)) return 'https://' + v;
    return net.base + v.replace(/^@/, '');
  }

  function ctx() {
    const font = FONTS[s.font] || FONTS.arial;
    const size = Math.min(16, Math.max(11, parseInt(s.size, 10) || 13));
    const accent = hex(s.accent, DEFAULTS.accent);
    const text = hex(s.text, DEFAULTS.text);
    const muted = '#6b7280';
    const base = `font-family:${font};font-size:${size}px;line-height:1.4;color:${text};`;
    return { font, size, accent, text, muted, base };
  }

  // ---------- pieces ----------
  function nameBlock(c, color) {
    if (!s.name.trim()) return '';
    const pr = s.pronouns.trim()
      ? ` <span style="font-weight:normal;font-size:${c.size - 1}px;color:${c.muted};">(${esc(s.pronouns.trim())})</span>`
      : '';
    return `<span style="font-family:${c.font};font-size:${c.size + 5}px;font-weight:bold;color:${color || c.text};">${esc(s.name.trim())}</span>${pr}`;
  }

  function roleLine(c, sep = ' | ') {
    const parts = [s.title.trim(), s.company.trim()].filter(Boolean).map(esc);
    if (!parts.length) return '';
    return `<span style="font-family:${c.font};font-size:${c.size}px;color:${c.muted};">${parts.join(sep)}</span>`;
  }

  function contactItems(c) {
    const link = `color:${c.text};text-decoration:none;`;
    const items = [];
    const lab = (letter, word) => {
      if (s.labels === 'none') return '';
      const t = s.labels === 'words' ? word : letter;
      return `<span style="color:${c.accent};font-weight:bold;">${t}</span>&nbsp;`;
    };
    if (s.phone.trim()) items.push(lab('P', 'Phone') + `<a href="${esc(telHref(s.phone))}" style="${link}">${esc(s.phone.trim())}</a>`);
    if (s.mobile.trim()) items.push(lab('M', 'Mobile') + `<a href="${esc(telHref(s.mobile))}" style="${link}">${esc(s.mobile.trim())}</a>`);
    if (s.email.trim()) items.push(lab('E', 'Email') + `<a href="mailto:${esc(s.email.trim())}" style="${link}">${esc(s.email.trim())}</a>`);
    const w = webUrl(s.website);
    if (w) items.push(lab('W', 'Web') + `<a href="${esc(w)}" style="${link}">${esc(prettyUrl(w))}</a>`);
    if (s.address.trim()) items.push(lab('A', 'Address') + `<span style="color:${c.text};">${esc(s.address.trim())}</span>`);
    return items;
  }

  function contactStack(c) {
    return contactItems(c).map((i) => `<div style="${c.base}">${i}</div>`).join('');
  }

  function contactInline(c) {
    const items = contactItems(c);
    if (!items.length) return '';
    return `<div style="${c.base}">${items.join(`<span style="color:${c.muted};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`)}</div>`;
  }

  function socialList() {
    return SOCIAL.map((n) => ({ ...n, url: socialUrl(n, s[n.k]) })).filter((n) => n.url);
  }

  function socialBlock(c, align = 'left', forceText = false) {
    const list = socialList();
    if (!list.length) return '';
    if (forceText || s.socialStyle === 'text') {
      const links = list.map((n) => `<a href="${esc(n.url)}" style="color:${c.accent};text-decoration:none;">${n.label}</a>`);
      return `<div style="${c.base}text-align:${align};">${links.join(`<span style="color:${c.muted};">&nbsp;&middot;&nbsp;</span>`)}</div>`;
    }
    const color = s.iconColor in ICON_COLORS ? s.iconColor : 'slate';
    const cells = list
      .map(
        (n) =>
          `<td style="padding:0 6px 0 0;"><a href="${esc(n.url)}" style="text-decoration:none;"><img src="${LIVE}icons/${n.k}-${color}.png" width="22" height="22" alt="${n.label}" style="display:block;border:0;width:22px;height:22px;"></a></td>`
      )
      .join('');
    return `<table cellpadding="0" cellspacing="0" border="0" role="presentation"${align === 'center' ? ' align="center"' : ''} style="border-collapse:collapse;"><tr>${cells}</tr></table>`;
  }

  function ctaBlock(c, align = 'left') {
    if (!s.cta.trim()) return '';
    const u = webUrl(s.ctaUrl);
    const t = esc(s.cta.trim());
    const inner = u
      ? `<a href="${esc(u)}" style="color:${c.accent};font-weight:bold;text-decoration:none;">${t} &rarr;</a>`
      : `<span style="color:${c.accent};font-weight:bold;">${t}</span>`;
    return `<div style="${c.base}text-align:${align};">${inner}</div>`;
  }

  function disclaimerBlock(c, align = 'left') {
    if (!s.disclaimer.trim()) return '';
    const t = esc(s.disclaimer.trim()).replace(/\n/g, '<br>');
    return `<tr><td colspan="3" style="padding-top:12px;font-family:${c.font};font-size:10px;line-height:1.4;color:#8a8f98;text-align:${align};max-width:520px;">${t}</td></tr>`;
  }

  function photoImg(c, sizeOverride) {
    const u = imgUrl(s.photo);
    if (!u) return '';
    const px = sizeOverride || Math.min(160, Math.max(40, parseInt(s.photoSize, 10) || 88));
    const radius = s.photoShape === 'round' ? `border-radius:${Math.round(px / 2)}px;` : s.photoShape === 'rounded' ? 'border-radius:10px;' : '';
    return `<img src="${esc(u)}" width="${px}" height="${px}" alt="${esc(s.name.trim() || 'Photo')}" style="display:block;border:0;width:${px}px;height:${px}px;${radius}">`;
  }

  function logoImg(c) {
    const u = imgUrl(s.logo);
    if (!u) return '';
    const w = Math.min(300, Math.max(40, parseInt(s.logoWidth, 10) || 140));
    const href = webUrl(s.website);
    const img = `<img src="${esc(u)}" width="${w}" alt="${esc(s.company.trim() || 'Logo')}" style="display:block;border:0;width:${w}px;height:auto;">`;
    return href ? `<a href="${esc(href)}" style="text-decoration:none;">${img}</a>` : img;
  }

  const gap = (px) => `<div style="font-size:0;line-height:0;height:${px}px;">&nbsp;</div>`;
  const wrap = (c, rows) =>
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${c.base}">${rows}</table>`;
  const join = (...blocks) => blocks.filter(Boolean).join('');

  // ---------- templates ----------
  const T = {
    divider(c) {
      const photo = photoImg(c) || logoImg(c);
      const left = photo
        ? `<td valign="top" style="padding:0 16px 0 0;">${photo}</td><td style="width:2px;background-color:${c.accent};font-size:0;line-height:0;">&nbsp;</td>`
        : '';
      const right = join(
        `<div>${nameBlock(c)}</div>`,
        roleLine(c) && `<div>${roleLine(c)}</div>`,
        gap(8),
        contactStack(c),
        socialList().length && gap(8) + socialBlock(c),
        s.cta.trim() && gap(8) + ctaBlock(c)
      );
      return wrap(c, `<tr>${left}<td valign="top" style="padding:0 0 0 ${photo ? 16 : 0}px;">${right}</td></tr>${disclaimerBlock(c)}`);
    },

    classic(c) {
      const logo = logoImg(c);
      const body = join(
        `<div>${nameBlock(c, c.accent)}</div>`,
        roleLine(c) && `<div>${roleLine(c)}</div>`,
        `<div style="border-top:1px solid #d1d5db;margin:8px 0;font-size:0;line-height:0;height:0;">&nbsp;</div>`,
        contactStack(c),
        socialList().length && gap(8) + socialBlock(c),
        s.cta.trim() && gap(8) + ctaBlock(c),
        logo && gap(10) + logo
      );
      return wrap(c, `<tr><td valign="top" style="width:420px;">${body}</td></tr>${disclaimerBlock(c)}`);
    },

    compact(c) {
      const head = join(nameBlock(c), roleLine(c) && `<span style="color:${c.muted};">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>${roleLine(c)}`);
      const body = join(
        `<div style="${c.base}">${head}</div>`,
        contactInline(c),
        (socialList().length || s.cta.trim()) && gap(4),
        socialBlock(c),
        s.cta.trim() && (socialList().length ? gap(4) : '') + ctaBlock(c)
      );
      return wrap(c, `<tr><td valign="top">${body}</td></tr>${disclaimerBlock(c)}`);
    },

    stacked(c) {
      const photo = photoImg(c);
      const body = join(
        photo && photo + gap(10),
        `<div>${nameBlock(c)}</div>`,
        roleLine(c) && `<div>${roleLine(c)}</div>`,
        gap(8),
        contactStack(c),
        socialList().length && gap(8) + socialBlock(c),
        s.cta.trim() && gap(8) + ctaBlock(c)
      );
      return wrap(c, `<tr><td valign="top">${body}</td></tr>${disclaimerBlock(c)}`);
    },

    logo(c) {
      const logo = logoImg(c) || photoImg(c);
      const left = join(
        `<div>${nameBlock(c)}</div>`,
        roleLine(c) && `<div>${roleLine(c)}</div>`,
        gap(8),
        contactStack(c),
        socialList().length && gap(8) + socialBlock(c)
      );
      const right = logo
        ? `<td style="width:1px;background-color:#d1d5db;font-size:0;line-height:0;">&nbsp;</td><td valign="middle" style="padding:0 0 0 18px;">${logo}</td>`
        : '';
      const cta = s.cta.trim() ? `<tr><td colspan="3" style="padding-top:10px;">${ctaBlock(c)}</td></tr>` : '';
      return wrap(c, `<tr><td valign="top" style="padding:0 18px 0 0;">${left}</td>${right}</tr>${cta}${disclaimerBlock(c)}`);
    },

    accent(c) {
      const photo = photoImg(c);
      const info = join(
        `<div>${nameBlock(c)}</div>`,
        roleLine(c) && `<div>${roleLine(c)}</div>`,
        gap(6),
        contactInline(c),
        socialList().length && gap(8) + socialBlock(c)
      );
      const left = photo ? `<td valign="top" style="padding:0 14px 0 0;">${photo}</td>` : '';
      const bar = `<tr><td colspan="3" style="height:4px;background-color:${c.accent};font-size:0;line-height:0;">&nbsp;</td></tr><tr><td colspan="3" style="height:10px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
      const cta = s.cta.trim()
        ? `<tr><td colspan="3" style="padding-top:10px;">${ctaBlock(c)}</td></tr>`
        : '';
      const logo = logoImg(c);
      const logoRow = logo ? `<tr><td colspan="3" style="padding-top:10px;">${logo}</td></tr>` : '';
      return wrap(c, `${bar}<tr>${left}<td valign="top">${info}</td></tr>${cta}${logoRow}${disclaimerBlock(c)}`);
    },

    centered(c) {
      const photo = photoImg(c);
      const center = (h) => `<div style="${c.base}text-align:center;">${h}</div>`;
      const body = join(
        photo && `<table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center" style="border-collapse:collapse;"><tr><td>${photo}</td></tr></table>` + gap(8),
        center(nameBlock(c)),
        roleLine(c) && center(roleLine(c)),
        gap(6),
        center(contactItems(c).join(`<span style="color:${c.muted};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`)),
        socialList().length && gap(8) + socialBlock(c, 'center'),
        s.cta.trim() && gap(8) + ctaBlock(c, 'center')
      );
      return wrap(c, `<tr><td align="center" valign="top" style="text-align:center;">${body}</td></tr>${disclaimerBlock(c, 'center')}`);
    },

    minimal(c) {
      // no images at all, safest option for strict mail servers
      const body = join(
        `<div>${nameBlock(c)}</div>`,
        roleLine(c) && `<div>${roleLine(c)}</div>`,
        contactStack(c),
        socialBlock(c, 'left', true),
        ctaBlock(c)
      );
      return wrap(c, `<tr><td valign="top">${body}</td></tr>${disclaimerBlock(c)}`);
    }
  };

  const ICON_COLORS = { slate: 1, black: 1, gray: 1, blue: 1, teal: 1, red: 1, purple: 1 };

  function buildHtml() {
    const c = ctx();
    const fn = T[s.template] || T.divider;
    return fn(c).replace(/\n\s*/g, '');
  }

  function buildText() {
    const out = [];
    const head = s.name.trim() + (s.pronouns.trim() ? ` (${s.pronouns.trim()})` : '');
    if (head.trim()) out.push(head);
    const role = [s.title.trim(), s.company.trim()].filter(Boolean).join(' | ');
    if (role) out.push(role);
    const lab = (l, w) => (s.labels === 'none' ? '' : (s.labels === 'words' ? w : l) + ': ');
    if (s.phone.trim()) out.push(lab('P', 'Phone') + s.phone.trim());
    if (s.mobile.trim()) out.push(lab('M', 'Mobile') + s.mobile.trim());
    if (s.email.trim()) out.push(lab('E', 'Email') + s.email.trim());
    const w = webUrl(s.website);
    if (w) out.push(lab('W', 'Web') + prettyUrl(w));
    if (s.address.trim()) out.push(lab('A', 'Address') + s.address.trim());
    const soc = socialList();
    if (soc.length) out.push(soc.map((n) => `${n.label}: ${n.url}`).join('\n'));
    if (s.cta.trim()) out.push(s.cta.trim() + (webUrl(s.ctaUrl) ? ' ' + webUrl(s.ctaUrl) : ''));
    if (s.disclaimer.trim()) out.push('', s.disclaimer.trim());
    return out.join('\n');
  }

  function fullDoc(html) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Email signature${s.name.trim() ? ' - ' + esc(s.name.trim()) : ''}</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff;">
<!-- Open this file in a browser, select the signature (Ctrl/Cmd+A), copy, and paste it into your mail app's signature box. -->
${html}
</body>
</html>
`;
  }

  // ---------- state ----------
  function encodeState(obj) {
    const diff = {};
    for (const k of Object.keys(DEFAULTS)) if (obj[k] !== DEFAULTS[k]) diff[k] = obj[k];
    const bytes = new TextEncoder().encode(JSON.stringify(diff));
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeState(str) {
    try {
      const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
      const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
      const obj = JSON.parse(new TextDecoder().decode(bytes));
      return obj && typeof obj === 'object' ? obj : null;
    } catch {
      return null;
    }
  }
  function clean(obj) {
    const out = {};
    for (const k of Object.keys(DEFAULTS)) if (typeof obj[k] === 'string') out[k] = obj[k].slice(0, 2000);
    return out;
  }

  function load() {
    const m = location.hash.match(/[#&]s=([A-Za-z0-9_-]+)/);
    if (m) {
      const obj = decodeState(m[1]);
      if (obj) {
        s = { ...DEFAULTS, ...clean(obj) };
        return 'link';
      }
    }
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) s = { ...DEFAULTS, ...clean(JSON.parse(raw)) };
    } catch {}
    return 'local';
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {}
  }

  // ---------- UI ----------
  const form = $('#sig-form');
  const preview = $('#preview');
  const htmlOut = $('#html-out');
  const textOut = $('#text-out');
  const status = $('#status');
  const sizeNote = $('#size-note');
  const warnings = $('#warnings');

  function fillForm() {
    for (const el of $$('[name]', form)) {
      const k = el.name;
      if (!(k in s)) continue;
      if (el.type === 'radio') el.checked = el.value === s[k];
      else el.value = s[k];
    }
    syncColorText();
  }

  function syncColorText() {
    $('#accent-hex').value = s.accent;
    $('#text-hex').value = s.text;
  }

  function imageWarnings() {
    const list = [];
    const check = (v, label) => {
      v = (v || '').trim();
      if (!v) return;
      if (/^data:/i.test(v)) list.push(`${label}: embedded (base64) images get stripped by Gmail and blocked or turned into attachments by Outlook. Upload the image somewhere public and paste its https link.`);
      else if (/^http:\/\//i.test(v)) list.push(`${label}: use an https link. Plain http images are blocked or shown as broken in most mail apps.`);
      else if (!/^https:\/\//i.test(v)) list.push(`${label}: this doesn't look like a full https image link, so it's left out.`);
      else if (/drive\.google\.com\/file|dropbox\.com\/s\/|dropbox\.com\/scl\//i.test(v)) list.push(`${label}: share links from Drive or Dropbox open a viewer page, not the image itself. Use a direct image link (it should end in .png or .jpg when opened).`);
    };
    check(s.photo, 'Photo');
    check(s.logo, 'Logo');
    return list;
  }

  let lastHtml = '';
  function render() {
    const html = buildHtml();
    lastHtml = html;
    preview.innerHTML = html;
    htmlOut.value = html;
    textOut.value = buildText();
    const n = html.length;
    sizeNote.textContent = `${n.toLocaleString()} characters of HTML. Gmail allows up to ${GMAIL_LIMIT.toLocaleString()}.`;
    sizeNote.classList.toggle('bad', n > GMAIL_LIMIT);
    const w = imageWarnings();
    warnings.innerHTML = w.map((t) => `<li>${esc(t)}</li>`).join('');
    warnings.hidden = !w.length;
    $$('.tpl-card').forEach((card) => card.classList.toggle('on', card.dataset.id === s.template));
    save();
  }

  function onInput(e) {
    const el = e.target;
    if (el.id === 'accent-hex' || el.id === 'text-hex') {
      const k = el.id === 'accent-hex' ? 'accent' : 'text';
      const v = el.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        s[k] = v.toLowerCase();
        form.elements[k].value = s[k];
        render();
      }
      return;
    }
    if (!el.name || !(el.name in s)) return;
    if (el.type === 'radio' && !el.checked) return;
    s[el.name] = el.value;
    if (el.name === 'accent' || el.name === 'text') syncColorText();
    render();
  }

  function flash(msg) {
    status.textContent = msg;
    clearTimeout(flash.t);
    flash.t = setTimeout(() => (status.textContent = ''), 3500);
  }

  async function copyText(text, what) {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${what} copied.`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      flash(ok ? `${what} copied.` : 'Copy failed. Select the text and copy it by hand.');
    }
  }

  async function copyRich() {
    const html = lastHtml;
    const text = buildText();
    try {
      if (!window.ClipboardItem || !navigator.clipboard?.write) throw new Error('no ClipboardItem');
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        })
      ]);
      flash('Signature copied. Paste it into your mail app’s signature box.');
    } catch {
      // older browsers: select the rendered preview and copy that
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(preview);
      sel.removeAllRanges();
      sel.addRange(range);
      const ok = document.execCommand('copy');
      sel.removeAllRanges();
      flash(ok ? 'Signature copied. Paste it into your mail app’s signature box.' : 'Copy failed. Select the preview and press Ctrl/Cmd+C.');
    }
  }

  function download() {
    const blob = new Blob([fullDoc(lastHtml)], { type: 'text/html' });
    const a = document.createElement('a');
    const slug = (s.name.trim() || 'email').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'email';
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}-signature.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    flash('Downloaded.');
  }

  function shareLink() {
    const url = location.href.split('#')[0] + '#s=' + encodeState(s);
    history.replaceState(null, '', url);
    copyText(url, 'Share link');
  }

  function buildTemplatePicker() {
    const box = $('#templates');
    box.innerHTML = TEMPLATES.map(
      (t) => `<label class="tpl-card" data-id="${t.id}"><input type="radio" name="template" value="${t.id}"><span>${t.name}</span></label>`
    ).join('');
  }

  function init() {
    buildTemplatePicker();
    const from = load();
    fillForm();
    render();
    if (from === 'link') flash('Loaded settings from the shared link.');

    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    form.addEventListener('submit', (e) => e.preventDefault());
    $('#copy-rich').addEventListener('click', copyRich);
    $('#copy-html').addEventListener('click', () => copyText(lastHtml, 'HTML source'));
    $('#copy-text').addEventListener('click', () => copyText(buildText(), 'Plain text version'));
    $('#download').addEventListener('click', download);
    $('#share').addEventListener('click', shareLink);
    $('#reset').addEventListener('click', () => {
      if (!confirm('Start over with the example signature? Your current details will be replaced.')) return;
      s = { ...DEFAULTS };
      history.replaceState(null, '', location.href.split('#')[0]);
      fillForm();
      render();
      flash('Reset to the example.');
    });
    $('#clear').addEventListener('click', () => {
      if (!confirm('Clear every field?')) return;
      const keep = ['template', 'photoShape', 'photoSize', 'logoWidth', 'socialStyle', 'iconColor', 'accent', 'text', 'font', 'size', 'labels'];
      for (const k of Object.keys(s)) if (!keep.includes(k)) s[k] = '';
      history.replaceState(null, '', location.href.split('#')[0]);
      fillForm();
      render();
      flash('Cleared.');
    });

    // preview background + width toggles
    $$('[name="pv-bg"]').forEach((r) => r.addEventListener('change', () => $('#preview-frame').classList.toggle('dark', r.value === 'dark' && r.checked)));
    $$('[name="pv-w"]').forEach((r) => r.addEventListener('change', () => $('#preview-frame').classList.toggle('narrow', r.value === 'mobile' && r.checked)));

    // install tabs
    const tabs = $$('[role="tab"]');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = tabs.length - 1;
        if (j !== null) {
          e.preventDefault();
          selectTab(tabs[j]);
          tabs[j].focus();
        }
      });
    });
    function selectTab(tab) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      try {
        localStorage.setItem(KEY + ':tab', tab.id);
      } catch {}
    }
    try {
      const saved = localStorage.getItem(KEY + ':tab');
      if (saved && $('#' + saved)) selectTab($('#' + saved));
    } catch {}
  }

  init();
})();

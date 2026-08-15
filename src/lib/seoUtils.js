/**
 * Utilitários de SEO para geração e busca de URLs 100% limpas (Path Slugs sem query string/IDs/hashing).
 */

export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Decomposição NFD de acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove acentuação
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-'); // Remove hífens múltiplos
}

export function getPropertySEOSlug(property) {
  if (!property) return '';
  const titleSlug = slugify(property.title || property.titulo || 'imovel');
  const locationSlug = slugify(property.location || property.localizacao || '');
  if (locationSlug) {
    return `${titleSlug}-em-${locationSlug}`;
  }
  return titleSlug;
}

export function getPropertyPublicURL(property) {
  if (!property) return '';
  const slug = getPropertySEOSlug(property);
  const origin = window.location.origin;
  // URL 100% limpa sem interrogação '?' e sem misturas de letras e números/UUIDs
  return `${origin}/imoveis/${slug}`;
}

export function findPropertyBySlug(properties, targetSlug) {
  if (!properties || properties.length === 0 || !targetSlug) return null;
  const cleanTarget = slugify(targetSlug);

  // 1. Match exato pelo getPropertySEOSlug
  let match = properties.find(p => getPropertySEOSlug(p) === cleanTarget);
  if (match) return match;

  // 2. Match pelo título
  match = properties.find(p => slugify(p.title || p.titulo) === cleanTarget);
  if (match) return match;

  // 3. Match por inclusão de substring
  match = properties.find(p => {
    const pSlug = getPropertySEOSlug(p);
    return pSlug.includes(cleanTarget) || cleanTarget.includes(pSlug);
  });
  if (match) return match;

  // 4. Fallback por ID se necessário
  match = properties.find(p => p.id === targetSlug);
  return match || null;
}

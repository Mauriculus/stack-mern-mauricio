// Filtro simples de linguagem ofensiva/sexual. Não é à prova de burla

const PALAVRAS_BLOQUEADAS = [
  'porra',
  'caralho',
  'merda',
  'buceta',
  'piroca',
  'foda',
  'foder',
  'fudido',
  'fodido',
  'fudida',
  'fodida',
  'viado',
  'viadinho',
  'bicha',
  'bichinha',
  'puta',
  'putaria',
  'prostituta',
  'arrombado',
  'arrombada',
  'corno',
  'cornudo',
  'vagabundo',
  'vagabunda',
  'desgraçado',
  'desgraçada',
  'retardado',
  'retardada',
  'estuprador',
  'estupro',
  'pedofilo',
  'pedófilo',
  'pornografia',
  'pornô',
  'porno',
  'xoxota',
  'siririca',
  'boquete',
  'transar',
  'ejacular',
  'orgasmo',
  'punheta',
  'punheteiro',
  'baitola',
  'safado',
  'safada',
  'xana',
  'xereca',
];

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const PADRAO = new RegExp(
  `\\b(${PALAVRAS_BLOQUEADAS.map((p) => normalizar(p)).join('|')})\\b`,
  'i'
);

function contemPalavrao(texto) {
  if (!texto || typeof texto !== 'string') return false;
  return PADRAO.test(normalizar(texto));
}

module.exports = { contemPalavrao };

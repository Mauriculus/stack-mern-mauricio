export const API_BASE = 'http://localhost:7777';

export const ASSUNTOS = [
  'Elétrica',
  'Hidráulica',
  'Eletrodomésticos',
  'Limpeza',
  'Culinária',
  'Costura',
  'Outro',
];

export const COR_ASSUNTO = {
  Elétrica: '#c9971f',
  Hidráulica: '#2065a8',
  Eletrodomésticos: '#c85a2e',
  Limpeza: '#8a3fbf',
  Culinária: '#3f8f4f',
  Costura: '#c23f7a',
  Outro: '#5b5f77',
};

export const COR_RISCO = {
  'Baixo Risco': '#3f8f4f',
  'Médio Risco': '#c9971f',
  'Alto Risco': '#b3261e',
};

export function extrairIdYoutube(url) {
  const match = String(url).match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// prioridade: capa enviada pelo usuário > primeira imagem da galeria (aulas
// antigas, de antes da capa virar obrigatória) > thumb do youtube > nada
export function capaDaAula(aula) {
  if (aula.cover) {
    return { tipo: 'imagem', src: `${API_BASE}${aula.cover}` };
  }

  const medias = aula.medias || [];
  const imagem = medias.find((m) => m.type === 'imagem');
  if (imagem) {
    return { tipo: 'imagem', src: `${API_BASE}${imagem.value}` };
  }

  const video = medias.find((m) => m.type === 'youtube');
  if (video) {
    const id = extrairIdYoutube(video.value);
    if (id) return { tipo: 'imagem', src: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
  }

  return { tipo: 'placeholder' };
}
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Class = require('../models/Class');
const Playlist = require('../models/Playlist');
const { Comment, Response } = require('../models/Comment');
const Report = require('../models/Report');

const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

// Roda contra MONGO_URI do .env por padrão. Para apontar pro banco LOCAL
// sem mexer no .env, defina SEED_MONGO_URI antes de rodar (veja instruções
// no final deste arquivo).
const MONGO_URI = process.env.SEED_MONGO_URI || process.env.MONGO_URI;

const normalizeUsername = (value) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeTitle = (value) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

const normalizePlaylistName = (value) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

const SENHA_PADRAO = 'SSeeder_14CA';

// ---------------------------------------------------------------------------
// Usuários (o admin fixo sobrevivencia1domestica@gmail.com NÃO entra aqui —
// ele já existe de verdade e não deve ser criado/apagado pelo seeder)
// ---------------------------------------------------------------------------
const USUARIOS = [
  {
    key: 'marina',
    email: 'videosefotoscx240@gmail.com',
    username: 'Marina Alves',
    admin: false,
    profilePicture: 'https://i.pravatar.cc/300?u=videosefotoscx240@gmail.com',
  },
  {
    key: 'ricardo',
    email: 'videosefotoscx241@gmail.com',
    username: 'Ricardo Tanaka',
    admin: false,
    profilePicture: 'https://i.pravatar.cc/300?u=videosefotoscx241@gmail.com',
  },
  {
    key: 'juliana',
    email: 'videosefotoscx242@gmail.com',
    username: 'Juliana Costa',
    admin: false,
    profilePicture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrxIi2uXpdER8sq2uHNhC2euSnlAauREXn4heRDRwPJHuAdXrCIPUbEMJe&s=10',
  },
];

// ---------------------------------------------------------------------------
// Aulas — 3 por tema (uma de cada usuário comum), 21 no total.
// "ratings" referencia quem avaliou (chave do usuário) e a nota dada.
// ---------------------------------------------------------------------------
const AULAS = [
  // Elétrica
  {
    key: 'chuveiro',
    autor: 'marina',
    title: 'Como trocar a resistência do chuveiro elétrico',
    subject: 'Elétrica',
    dangerLevel: 'Alto Risco',
    content:
      'Antes de tudo, desligue o disjuntor específico do chuveiro (não só o botão do próprio chuveiro) e confirme com um teste de contato que não há energia chegando. Abra a tampa do chuveiro removendo os parafusos visíveis, geralmente dois ou quatro pontos. Localize a resistência (fica na parte de trás, presa por dois bornes com parafusos) e anote a posição dos fios antes de soltar, tirando foto se puder. Solte os dois parafusos dos bornes, remova a resistência antiga e compare com a nova para garantir que é o mesmo modelo e voltagem (127V ou 220V, isso não pode ser trocado por engano). Encaixe a resistência nova, aperte bem os bornes e feche a tampa. Só ligue o disjuntor de novo depois de tudo fechado e teste em uma potência baixa primeiro.',
    danger:
      'Risco alto de choque elétrico e queimaduras. Nunca troque a resistência com o disjuntor ligado, mesmo que o chuveiro esteja "desligado" no botão. Confirme sempre a voltagem correta antes de comprar a peça, usar a resistência errada pode danificar a instalação ou causar um curto.',
    cover: 'https://www.ecompletocdn.com.br/i/fp/1517/1134092_2_1591631056.jpg',
    medias: [
      { type: 'imagem', value: 'https://s2-casaejardim.glbimg.com/okIYOGfTy8HRqD0yB4ivj2R8Cjg=/0x0:1400x1000/924x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_a0b7e59562ef42049f4e191fe476fe7d/internal_photos/bs/2023/x/B/wwPo0GT8GzQNLPBpUZpQ/tudo-sobre-resistencia-eletrica-do-chuveiro-casaejardim.jpg' },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=qc4NudnZcYo' },
    ],
    ratings: [{ by: 'ricardo', rate: 5 }, { by: 'juliana', rate: 4 }],
  },
  {
    key: 'tomada-queimada',
    autor: 'ricardo',
    title: 'Como trocar uma tomada de parede queimada',
    subject: 'Elétrica',
    dangerLevel: 'Médio Risco',
    content:
      'Sinais de uma tomada queimada: marcas pretas ao redor do encaixe, cheiro de queimado ou pino que não encaixa mais firme. Desligue o disjuntor do cômodo antes de tocar em qualquer fio. Remova a placa da tomada com uma chave de fenda e puxe o corpo da tomada para fora da caixa de embutir. Solte os três fios (fase, neutro e terra), anotando qual cor estava em qual parafuso, geralmente vermelho ou preto para fase, azul para neutro e verde/amarelo para terra. Conecte os mesmos fios na tomada nova, respeitando essa posição, aperte bem os parafusos e empurre o corpo de volta para dentro da caixa. Recoloque a placa e só então religue o disjuntor.',
    danger:
      'Nunca mexa em uma tomada sem desligar o disjuntor primeiro, mesmo que ela pareça sem uso. Se os fios estiverem muito ressecados, quebradiços ou se a caixa de embutir estiver derretida, chame um eletricista em vez de tentar consertar sozinho.',
    cover: 'https://eletricistafloripa.com.br/images/tomada-queimada-florianopolis-destaque.webp',
    medias: [
      { type: 'imagem', value: 'https://i.redd.it/an-outlet-blew-how-do-i-go-about-rewiring-this-v0-gyealjxwymjc1.jpg?width=3024&format=pjpg&auto=webp&s=a558236d0f8245b7a709cdf340a8728b80c26b07' },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=jtGPHxKTR9I' },
    ],
    ratings: [{ by: 'marina', rate: 4 }],
  },
  {
    key: 'disjuntor',
    autor: 'juliana',
    title: 'Como identificar e religar o disjuntor que desarma sozinho',
    subject: 'Elétrica',
    dangerLevel: 'Médio Risco',
    content:
      'Quando um disjuntor desarma sozinho repetidamente, geralmente é sinal de sobrecarga (muitos aparelhos ligados no mesmo circuito) ou de um curto-circuito. Primeiro, desligue todos os aparelhos que estavam ligados naquele circuito antes de tentar religar. Vá até o quadro de disjuntores e observe qual disjuntor está na posição intermediária ou para baixo, empurre-o totalmente para baixo primeiro e depois para cima para religar. Se ele desarmar de novo assim que você ligar um aparelho específico, esse é provavelmente o problema. Se desarmar mesmo sem nada ligado, o problema pode estar na fiação.',
    danger:
      'Se o disjuntor desarmar imediatamente ao religar, sem nenhum aparelho ligado, não insista tentando religar várias vezes, isso pode indicar um curto-circuito na fiação e requer um eletricista. Nunca troque um disjuntor por um de amperagem maior só para "parar de desarmar".',
    cover: 'https://blog.leveros.com.br/wp-content/uploads/2023/12/mulher-desligando-o-interruptor-de-luz-scaled.webp',
    medias: [
      { type: 'imagem', value: 'https://cdn.awsli.com.br/2541/2541980/produto/264292691/disjuntor-bipolar-tdj3ka-63a-curva-c-tramontina-bf34122f-b52j7alp65.jpg' },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=H9rWzpLAjfE' },
    ],
    ratings: [{ by: 'marina', rate: 3 }],
  },

  // Hidráulica
  {
    key: 'torneira-pingando',
    autor: 'marina',
    title: 'Como consertar uma torneira pingando (troca de vedação)',
    subject: 'Hidráulica',
    dangerLevel: 'Baixo Risco',
    content:
      'Antes de começar, feche o registro de água daquele ponto (geralmente embaixo da pia) para não precisar fechar o registro geral da casa. Abra a torneira para escoar a água que restou na tubulação. Remova o capuz decorativo do registro da torneira com uma chave de fenda pequena, solte o parafuso e retire o manípulo. Use uma chave inglesa para soltar a porca interna e retire o conjunto do vedante (courinho ou vedação de borracha). Leve a peça velha até uma loja de materiais de construção para comprar uma igual, encaixe a nova, remonte tudo na ordem inversa e abra o registro devagar para testar.',
    danger:
      'Risco baixo, mas tenha um pano ou balde por perto, sempre sobra um pouco de água na tubulação mesmo com o registro fechado. Não aperte demais a porca ao remontar, isso pode rachar peças plásticas do registro.',
    cover: 'https://www.encanador.srv.br/wp-content/uploads/2019/08/torneira-pingando-como-resolver.jpg',
    medias: [
      { type: 'imagem', value: 'https://images.tcdn.com.br/img/img_prod/920732/vedante_de_borracha_para_torneira_liege_1_2_20321_1_f4f88b5220518748169e9c0a111235ad_20240514144116.jpeg' },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=SN_5gkpNhW0' },
    ],
    ratings: [{ by: 'ricardo', rate: 5 }],
  },
  {
    key: 'desentupir-ralo',
    autor: 'ricardo',
    title: 'Como desentupir o ralo do banheiro sem produtos químicos fortes',
    subject: 'Hidráulica',
    dangerLevel: 'Médio Risco',
    content:
      'Entupimentos de ralo de banheiro costumam ser causados por acúmulo de cabelo e sabão. Primeiro, remova a grelha do ralo e tire manualmente o que estiver visível, usando uma luva. Depois, jogue meia xícara de bicarbonato de sódio seguido de meia xícara de vinagre branco, direto no ralo, e tampe com um pano por cerca de 15 minutos, a reação ajuda a soltar a gordura e o sabão grudados na parede do cano. Em seguida, jogue um litro de água quente (não fervente) para arrastar o que soltou. Se ainda estiver lento, repita o processo uma segunda vez antes de considerar chamar um profissional.',
    danger:
      'Nunca misture vinagre com produtos desentupidores químicos comprados prontos, a combinação pode gerar gases tóxicos. Use luvas ao remover cabelo e sujeira manualmente da grelha.',
    cover: 'https://triider-prd-blog-files.s3.sa-east-1.amazonaws.com/wp-content/uploads/2018/06/21195932/208651-conheca-4-maneiras-de-desentupir-ralo.jpg',
    medias: [
      { type: 'imagem', value: "https://www.ype.ind.br/assets-NS/vinagre_e_bicarbonato_de_sodio-scaled.jpg" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=UUp_Mrs01xk' }
    ],
    ratings: [{ by: 'juliana', rate: 4 }],
  },
  {
    key: 'registro-chuveiro',
    autor: 'juliana',
    title: 'Como trocar o registro de gaveta do chuveiro',
    subject: 'Hidráulica',
    dangerLevel: 'Médio Risco',
    content:
      'O registro de gaveta é aquele que fica embutido na parede e controla a água que vai para o chuveiro. Antes de trocar, feche o registro geral de água da casa, já que normalmente não há um registro individual antes dele. Remova o acabamento (a "canopla") girando ou soltando o parafuso lateral, dependendo do modelo. Com uma chave de grifo, solte a rosca do registro antigo, tomando cuidado para não forçar demais o cano embutido na parede. Vede as roscas do registro novo com fita veda-rosca antes de instalar, rosqueie no lugar do antigo e recoloque o acabamento.',
    danger:
      'Trabalhar com o registro geral fechado ainda deixa uma quantidade de água na tubulação, tenha panos por perto. Se o cano estiver muito antigo ou enferrujado dentro da parede, force o mínimo possível e considere chamar um encanador para evitar quebrar a tubulação embutida.',
    cover: 'https://www.hidraulicapotenza.com.br/wp-content/uploads/2023/03/P1_1170500.png',
    medias: [
      { type: 'imagem', value: "https://i.ytimg.com/vi/sCcWJRiPOa0/maxresdefault.jpg" },
      { type: 'imagem', value: 'https://p16-common-sign.tiktokcdn-us.com/tos-maliva-p-0068/oQGEjLFfEEfeiqsAQgwMAkkzfgQRg1bgGwESIA~tplv-tiktokx-origin.image?dr=9636&x-expires=1789315200&x-signature=U7oF%2BiICw6kPzQdaNZ09r%2F6t1R8%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=55bbe6a9&idc=useast5' }
    ],
    ratings: [{ by: 'marina', rate: 2 }, { by: 'ricardo', rate: 3 }],
  },

  // Eletrodomésticos
  {
    key: 'filtro-lavadora',
    autor: 'marina',
    title: 'Como limpar o filtro da máquina de lavar roupas',
    subject: 'Eletrodomésticos',
    dangerLevel: 'Baixo Risco',
    content:
      'Desligue a máquina da tomada antes de qualquer manutenção. Localize o filtro, na maioria dos modelos ele fica na parte de baixo, atrás de uma tampinha, ou dentro do agitador central em máquinas mais antigas. Retire o filtro girando levemente ou puxando (verifique o manual do modelo se tiver dúvida) e lave com água corrente, removendo fiapos e pelos acumulados com uma escova pequena. Aproveite para limpar o compartimento de sabão e amaciante com uma esponja, já que ali também acumula resíduo. Encaixe o filtro de volta com firmeza antes de usar a máquina novamente.',
    danger:
      'Risco baixo, mas sempre desligue da tomada antes de tocar em qualquer parte interna. Nunca use a máquina sem o filtro no lugar, mesmo que pareça funcionar normalmente sem ele.',
    cover: 'https://compracerta.vtexassets.com/arquivos/ids/419180-800-800?v=637357110060300000&width=800&height=800&aspect=true',
    medias: [
      { type: 'imagem', value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFZolC5h6dbcZ4qv2OA6oqVa85KvL42869OivNYC02S7LFZ9gi4qiwWYg&s=10" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=0tLJPfFEXxU' }
    ],
    ratings: [{ by: 'ricardo', rate: 5 }],
  },
  {
    key: 'descongelar-geladeira',
    autor: 'ricardo',
    title: 'Como descongelar a geladeira sem estragar o gabinete',
    subject: 'Eletrodomésticos',
    dangerLevel: 'Médio Risco',
    content:
      'Antes de começar, retire todos os alimentos e guarde em uma caixa de isopor ou cooler. Desligue a geladeira da tomada e deixe a porta aberta para o gelo derreter naturalmente — isso pode levar de 3 a 6 horas dependendo da quantidade de gelo acumulado. Coloque toalhas no chão ao redor para absorver a água. Nunca acelere o processo com faca ou objetos pontiagudos tentando quebrar o gelo, isso pode furar a serpentina interna e estragar o aparelho de vez. Se quiser acelerar, uma bacia com água quente (não fervente) dentro do freezer ajuda a soltar o gelo mais rápido.',
    danger:
      'Nunca use faca, chave de fenda ou qualquer objeto pontiagudo para tentar quebrar ou raspar o gelo do freezer, é a causa mais comum de furos na serpentina, que exigem conserto caro ou troca do aparelho.',
    cover: 'https://static.vecteezy.com/ti/fotos-gratis/p2/7675482-muito-gelo-no-congelador-da-antiga-geladeira-gratis-foto.jpg',
    medias: [
      { type: 'imagem', value: "https://images.ctfassets.net/qfxflpv0atz9/6g7IdqGyQLzQzL8IkCB5Oh/459a42e776a8f7fecbc3e312116d93e3/como-descongelar-freezer-post4.webp?fm=webp&q=90" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=sSJetL7U_S4' }
    ],
    ratings: [],
  },
  {
    key: 'filtro-exaustor',
    autor: 'juliana',
    title: 'Como limpar o filtro de gordura do exaustor do fogão',
    subject: 'Eletrodomésticos',
    dangerLevel: 'Baixo Risco',
    content:
      'O filtro de gordura do exaustor (a telinha ou placa metálica logo abaixo da coifa) deve ser limpo pelo menos uma vez por mês para não perder eficiência e não virar risco de incêndio. Desligue o exaustor da tomada antes de remover o filtro, geralmente preso por encaixes ou pequenos parafusos de aperto manual. Deixe de molho em água quente com detergente e um pouco de bicarbonato por cerca de 30 minutos, isso ajuda a soltar a gordura mais grudada. Escove suavemente com uma escova de cerdas macias, enxágue bem e deixe secar completamente antes de recolocar.',
    danger:
      'Um filtro de gordura sujo acumula material inflamável perto do fogão, então não deixe passar muito tempo sem limpar. Certifique-se de que o filtro está completamente seco antes de recolocar, para não pingar água quando o exaustor for ligado.',
    cover: 'https://catracalivre.com.br/wp-content/uploads/2026/06/filtro-metalico-com-gordura-amar-202606131607.jpeg',
    medias: [
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=xph-rdihAxo' },
    ],
    ratings: [{ by: 'marina', rate: 4 }],
  },

  // Limpeza
  {
    key: 'rejunte',
    autor: 'marina',
    title: 'Como limpar rejunte de banheiro sem estragar o piso',
    subject: 'Limpeza',
    dangerLevel: 'Baixo Risco',
    content:
      'Rejunte escurecido geralmente é mofo ou acúmulo de sabão, não sujeira comum, então detergente sozinho não resolve bem. Misture uma pasta de bicarbonato de sódio com um pouco de água até formar uma consistência de pasta e aplique direto nas linhas do rejunte com uma escova de dente velha. Deixe agir por 15 a 20 minutos. Depois, borrife um pouco de água oxigenada 10 volumes por cima (não misture com o bicarbonato antes, aplique depois) e escove novamente antes de enxaguar bem com água.',
    danger:
      'Nunca misture água oxigenada com produtos que contenham cloro, isso gera gases tóxicos. Mantenha o banheiro ventilado durante e depois da limpeza, e evite deixar a pasta secar completamente no rejunte antes de enxaguar, pois fica mais difícil de remover.',
    cover: 'https://conteudo.imguol.com.br/c/entretenimento/32/2022/02/24/limpeza-de-rejunte-1645739304241_v2_4x3.jpg',
    medias: [{ type: 'youtube', value: 'https://www.youtube.com/watch?v=TKuNHZ6snP4' }],
    ratings: [{ by: 'juliana', rate: 5 }, { by: 'ricardo', rate: 4 }],
  },
  {
    key: 'mofo-box',
    autor: 'ricardo',
    title: 'Como tirar mofo do box do banheiro',
    subject: 'Limpeza',
    dangerLevel: 'Médio Risco',
    content:
      'Mofo no silicone do box costuma aparecer pela umidade constante sem ventilação adequada. Prepare uma solução com água sanitária diluída em água (uma parte de água sanitária para três partes de água) e aplique com um pano ou escova de cerdas macias direto nas manchas escuras do silicone. Deixe agir por cerca de 10 minutos sem deixar secar completamente e enxágue bem com água. Depois de seco, para evitar que volte, deixe o box entreaberto por um tempo após o banho para o ambiente ventilar e secar mais rápido.',
    danger:
      'Nunca misture água sanitária com nenhum outro produto de limpeza, principalmente os que contêm amônia ou vinagre, a mistura libera gás cloro, que é tóxico. Use luvas e mantenha a janela ou porta do banheiro aberta durante a aplicação.',
    cover: 'https://media-cdn.tripadvisor.com/media/photo-s/04/b6/92/2e/hotel-jatiuca.jpg',
    medias: [{ type: 'youtube', value: 'https://www.youtube.com/watch?v=L6133A3h9eA' }],
    ratings: [{ by: 'marina', rate: 3 }],
  },
  {
    key: 'geladeira-organizada',
    autor: 'juliana',
    title: 'Como organizar e limpar a geladeira por dentro',
    subject: 'Limpeza',
    dangerLevel: 'Baixo Risco',
    content:
      'Antes de organizar, retire tudo de dentro da geladeira e separe o que já venceu ou está estragado. Remova as prateleiras e gavetas que forem removíveis e lave na pia com água e detergente neutro, secando bem antes de recolocar. Limpe o interior com um pano úmido com uma mistura de água e um pouco de vinagre, que ajuda a neutralizar odores sem deixar cheiro forte. Ao organizar de volta, separe por categoria (laticínios, molhos, sobras) e coloque os itens mais próximos do vencimento na frente, para não esquecer deles.',
    danger:
      'Risco baixo. Apenas tome cuidado ao manusear vidros de molhos e potes ao lavar na pia, e não deixe a geladeira desligada por muito tempo durante a limpeza para não estragar o que ainda estiver guardado no isopor.',
    cover: 'https://blog.madesa.com/wp-content/uploads/2023/03/image2-2.png',
    medias: [{ type: 'imagem', value: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuTQJCE5qWS96NFmnWlXa48mE9aK2DfwYlBgHQYrmp9kI9cOIthZdkE-w&s=10' }],
    ratings: [],
  },

  // Culinária
  {
    key: 'arroz',
    autor: 'marina',
    title: 'Como fazer arroz soltinho sem errar a proporção de água',
    subject: 'Culinária',
    dangerLevel: 'Baixo Risco',
    content:
      'A proporção clássica é uma medida de arroz para duas medidas de água, mas o segredo do arroz soltinho está também no refogado antes de adicionar a água. Refogue o arroz cru em um fio de óleo com alho e cebola picados até os grãos ficarem levemente translúcidos e brilhantes, isso ajuda a selar o grão. Adicione a água já quente (não fria) para não interromper o cozimento, tempere com sal e deixe ferver em fogo alto por cerca de 2 minutos. Abaixe para fogo baixo, tampe a panela e não mexa mais até a água secar, o que leva de 15 a 18 minutos.',
    danger:
      'Risco baixo. Cuidado apenas ao adicionar a água quente na panela com o arroz refogado, pois pode espirrar e causar pequenas queimaduras nas mãos ou braços.',
    cover: 'https://www.lecreuset.com.br/dw/image/v2/BDRT_PRD/on/demandware.static/-/Sites-le-creuset-br-master/default/dwd44ad97f/images/receita-arroz-branco1.png?sw=650&sh=650&sm=fit',
    medias: [
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=0__Hcabqnu0' },
    ],
    ratings: [{ by: 'ricardo', rate: 5 }, { by: 'juliana', rate: 5 }],
  },
  {
    key: 'frango-assado',
    autor: 'ricardo',
    title: 'Como temperar e assar um frango inteiro no forno de casa',
    subject: 'Culinária',
    dangerLevel: 'Médio Risco',
    content:
      'Tempere o frango na véspera se possível, esfregando sal, alho amassado, ervas (alecrim ou tomilho) e um fio de azeite por dentro e por fora, incluindo embaixo da pele do peito. Amarre as pernas com barbante de cozinha para o frango assar de forma mais uniforme. Coloque em uma assadeira com um fundo de água ou caldo para não ressecar embaixo, e leve ao forno pré-aquecido a 200°C. Calcule cerca de 20 minutos por quilo, virando a assadeira na metade do tempo. O ponto certo é quando o suco que sai ao espetar a coxa estiver transparente, sem sangue.',
    danger:
      'Certifique-se de que o frango atingiu temperatura interna segura antes de servir (o suco deve sair claro, não rosado) para evitar contaminação por salmonela. Lave bem as mãos e utensílios que tocaram o frango cru antes de usá-los em outros alimentos.',
    cover: 'https://www.kitano.com.br/_next/image?url=https%3A%2F%2Fprodcontent.kitano.com.br%2Fwp-content%2Fuploads%2F2025%2F01%2FSSP_2480-Frango-assado-com-salsa-e-cebolinha-1.jpg&w=1400&q=75',
    medias: [
      { type: 'imagem', value: "https://i0.wp.com/comidinhasdochef.com/wp-content/uploads/2021/12/Temperar-Frango-para-Assar-na-Ma%CC%81quina0.jpg?fit=1000%2C1000&ssl=1" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=SvWcHW3K9Cw' }
    ],
    ratings: [{ by: 'marina', rate: 4 }],
  },
  {
    key: 'feijao-pressao',
    autor: 'juliana',
    title: 'Como fazer um feijão básico de panela de pressão',
    subject: 'Culinária',
    dangerLevel: 'Médio Risco',
    content:
      'Deixe o feijão de molho em água por pelo menos 4 horas (ou durante a noite) para reduzir o tempo de cozimento e facilitar a digestão. Escorra essa água antes de cozinhar. Na panela de pressão, refogue alho e cebola em um fio de óleo, adicione o feijão escorrido e água nova cobrindo cerca de três dedos acima do feijão. Tampe a panela, espere pegar pressão em fogo alto e depois abaixe para fogo médio, cozinhando por cerca de 20 a 25 minutos a partir do início do chiado. Só abra a panela depois que toda a pressão for liberada naturalmente.',
    danger:
      'Nunca tente abrir a panela de pressão à força ou coloque debaixo de água corrente para acelerar o resfriamento sem antes ter certeza de que a válvula de segurança já liberou toda a pressão, isso pode causar um estouro e queimaduras graves.',
    cover: 'https://receitanatureba.com/wp-content/uploads/2025/07/como-cozinhar-feijao-na-pressao.jpg',
    medias: [
      { type: 'imagem', value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu1wBL6ODzAJAe0E5Tst63uNLeOdLog_B1fjt9XGxJNQ&s" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=QbS3ZS1SSMw' }
    ],
    ratings: [{ by: 'marina', rate: 2 }],
  },

  // Costura
  {
    key: 'botao',
    autor: 'marina',
    title: 'Como pregar um botão que caiu da camisa',
    subject: 'Costura',
    dangerLevel: 'Baixo Risco',
    content:
      'Escolha uma linha resistente, de preferência da mesma cor do botão ou do tecido. Corte um pedaço de cerca de 40 cm, passe pela agulha e dobre ao meio, dando um nó firme nas duas pontas juntas para garantir mais reforço. Posicione o botão no lugar certo e passe a agulha por baixo do tecido, saindo por um dos furos do botão. Alterne entre os furos formando um X (para botões de 4 furos) ou linhas paralelas (para 2 furos), repetindo o processo umas 6 a 8 vezes. Para finalizar, dê algumas voltas de linha por baixo do botão criando uma pequena "haste" que facilita o fechamento, depois dê um nó por baixo do tecido e corte o excesso.',
    danger:
      'Risco baixo. Cuidado apenas ao manusear a agulha, evitando deixá-la espetada em estofados ou ao alcance de crianças e animais quando não estiver em uso.',
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4Y1gfX3olG8gIXRo-n4qmv0y2FUt2CkJ9Vklr4kZOM5MMrKCWaid8ZEy&s=10',
    medias: [
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=yfpxiPbF1Lk' }
    ],
    ratings: [],
  },
  {
    key: 'bainha',
    autor: 'ricardo',
    title: 'Como fazer uma bainha simples de calça à mão',
    subject: 'Costura',
    dangerLevel: 'Baixo Risco',
    content:
      'Vista a calça com o calçado que normalmente usa com ela para marcar a altura correta, dobrando a barra para dentro na medida desejada e prendendo com alfinetes. Retire a calça e passe a ferro a dobra para marcar bem o vinco. Usando uma linha da cor da calça, faça um ponto invisível (ponto de bainha), pegando só um fiozinho do tecido externo a cada passada e depois um pedaço maior na dobra interna, para que a costura não apareça do lado de fora. Vá contornando toda a barra até fechar o círculo completo, terminando com um nó firme por dentro da dobra.',
    danger:
      'Risco baixo. Tome cuidado ao marcar e cortar excesso de tecido, se precisar, para não cortar mais do que o planejado, é mais seguro cortar aos poucos e conferir antes de cada corte adicional.',
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9lYSkP1ZCRjzzkm94rXwgOWZXOMX4uDoVzldlfZGQH9f9rm54HfgxkMg&s=10',
    medias: [
      { type: 'imagem', value: "https://i0.wp.com/blog.elgin.com.br/wp-content/uploads/fazer-bainha-de-calca-scaled.jpg" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=UbuKk4iEyns' }
    ],
    ratings: [{ by: 'juliana', rate: 4 }],
  },
  {
    key: 'remendo',
    autor: 'juliana',
    title: 'Como remendar um buraco pequeno em uma peça de roupa',
    subject: 'Costura',
    dangerLevel: 'Baixo Risco',
    content:
      'Para buracos pequenos (até 1 cm), vire a peça do avesso e recorte um pedaço de tecido parecido (pode ser de uma parte interna da própria peça, como a barra) um pouco maior que o buraco. Posicione por baixo do furo e prenda com alfinetes para não deslizar. Costure ao redor das bordas do buraco com pontos pequenos e próximos, fixando o remendo por trás, e depois reforce com alguns pontos cruzados por cima do próprio furo para dar mais firmeza. Vire a peça do lado certo para conferir o acabamento.',
    danger:
      'Risco baixo. Ao usar tesoura para recortar o tecido do remendo, mantenha os dedos afastados da lâmina e corte sobre uma superfície firme.',
    cover: 'https://thumbs.dreamstime.com/b/um-buraco-na-roupa-feita-de-l%C3%A3-conceito-casamento-deficiente-ou-tra%C3%A7a-insetos-183122008.jpg ',
    medias: [
      { type: 'imagem', value: "https://www.wikihow.com/images/9/9a/Repair-a-Moth-Hole-Step-15-Version-3.jpg" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=n3oJZoBHSxg' }
    ],
    ratings: [{ by: 'marina', rate: 5 }],
  },

  // Outro
  {
    key: 'contas-casa',
    autor: 'marina',
    title: 'Como organizar as contas da casa para não esquecer o vencimento',
    subject: 'Finanças',
    dangerLevel: 'Baixo Risco',
    content:
      'Reúna todas as contas fixas (água, luz, internet, aluguel) e anote o dia de vencimento de cada uma em um só lugar, pode ser um aplicativo de lembretes no celular ou um calendário na parede da cozinha. Sempre que possível, ative o débito automático nas contas que têm valor fixo todo mês, e para as de valor variável, configure um alerta de 3 a 5 dias antes do vencimento. Reserve um dia fixo no mês (por exemplo, todo dia 5) só para revisar se todas as contas foram pagas e conferir se não veio nenhuma cobrança inesperada.',
    danger:
      'Risco baixo. O maior risco aqui é financeiro, não físico, atraso recorrente pode gerar multas e juros, então vale revisar o sistema de lembretes de vez em quando para garantir que está funcionando.',
    cover: 'https://blog.mag.com.br/wp-content/uploads/2019/01/Despesas-domesticas-scaled.jpg',
    ratings: [{ by: 'ricardo', rate: 3 }],
  },
  {
    key: 'filtro-purificador',
    autor: 'ricardo',
    title: 'Como trocar o filtro do purificador de água da pia',
    subject: 'Outro',
    dangerLevel: 'Baixo Risco',
    content:
      'Antes de trocar, feche o registro de água que alimenta o purificador (geralmente uma torneirinha própria embaixo da pia). Gire a carcaça do filtro no sentido anti-horário para abri-la, a maioria dos modelos tem uma seta indicando o sentido. Retire o filtro usado, descarte, e limpe a carcaça por dentro com um pano limpo antes de colocar o filtro novo, prestando atenção na posição correta de encaixe. Feche a carcaça girando no sentido horário até travar, abra o registro devagar e deixe a água correr por cerca de 2 minutos antes de usar, para eliminar carvão ativado solto do filtro novo.',
    danger:
      'Risco baixo. Tenha um pano por perto, pois sempre escorre um pouco de água ao abrir a carcaça. Não use o purificador nos primeiros minutos após a troca sem deixar a água correr, pois pode sair com resíduo do filtro novo.',
    cover: 'https://cdn.awsli.com.br/600x450/617/617022/produto/1871935841b820d16df.jpg',
    medias: [
      { type: 'imagem', value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-A16eroMcs7L1e3_OmLQHdenb6uxg1xvRMgsRN6CKOTRvSqTYkpophVW-&s=10" },
      { type: 'youtube', value: 'https://www.youtube.com/watch?v=xxbcrTZUWlc' }
    ],
    ratings: [],
  },
  {
    key: 'lixo-reciclavel',
    autor: 'juliana',
    title: 'Como separar o lixo reciclável corretamente em apartamento',
    subject: 'Outro',
    dangerLevel: 'Baixo Risco',
    content:
      'Separe o lixo em pelo menos duas categorias básicas: reciclável (papel, plástico limpo, vidro e metal) e orgânico/rejeito (restos de comida, papel higiênico, embalagens sujas de gordura). Lave rapidamente embalagens de plástico e vidro que tiveram alimento antes de descartar, já que resíduo de comida pode contaminar todo o lote reciclável. Reserve dois potes ou sacos pequenos na cozinha, um para cada categoria, para não precisar separar tudo depois. Verifique com a administração do prédio ou a coleta do bairro os dias específicos de coleta seletiva, para saber quando descartar cada tipo.',
    danger:
      'Risco baixo. Cuidado ao descartar vidro quebrado, embale bem em papel ou papelão e sinalize por fora (escrevendo "vidro" no pacote) para não machucar quem for manusear o lixo depois.',
    cover: 'https://i0.wp.com/www.larplasticos.com.br/wp-content/uploads/2018/07/lixeiras-de-coleta-seletiva-larplasticos.jpg?resize=660%2C396',
    ratings: [{ by: 'marina', rate: 4 }, { by: 'ricardo', rate: 4 }],
  },
];

// ---------------------------------------------------------------------------
// Comentários (e respostas) — usam a "key" das aulas acima
// ---------------------------------------------------------------------------
const COMENTARIOS = [
  {
    aula: 'chuveiro',
    by: 'ricardo',
    content: 'Segui certinho e deu tudo certo. Só reforçando: testem com um multímetro se tiverem, não confiem só em desligar o disjuntor "de olho".',
    responses: [{ by: 'marina', content: 'Boa dica! Vou adicionar isso na próxima revisão da aula.' }],
  },
  {
    aula: 'tomada-queimada',
    by: 'juliana',
    content: 'As cores dos fios podem variar dependendo de quem fez a instalação lá em casa, então sempre vale anotar antes de tirar, como você falou.',
  },
  {
    aula: 'filtro-lavadora',
    by: 'juliana',
    content: 'Fiz isso ontem e saiu uma quantidade assustadora de fiapo do filtro, não limpava fazia tempo.',
    responses: [{ by: 'marina', content: 'Rs, comigo foi a mesma coisa da primeira vez. Recomendo fazer isso uma vez por mês.' }],
  },
  {
    aula: 'rejunte',
    by: 'ricardo',
    content: 'A combinação bicarbonato + água oxigenada realmente funciona bem melhor que só detergente. Testei no rejunte do box também.',
    responses: [{ by: 'marina', content: 'Isso, funciona em qualquer rejunte da casa, não só no chão!' }],
  },
  {
    aula: 'arroz',
    by: 'ricardo',
    content: 'Sempre errava a água até ler essa aula. O truque de esquentar a água antes fez toda diferença.',
  },
  {
    aula: 'frango-assado',
    by: 'marina',
    content: 'Fiz no domingo pra família toda e ficou muito bom, o barbante nas pernas realmente ajuda a assar por igual.',
  },
  {
    aula: 'lixo-reciclavel',
    by: 'ricardo',
    content: 'Muito útil, principalmente a parte de lavar as embalagens antes — não sabia que isso fazia diferença pra reciclagem.',
  },
];

// ---------------------------------------------------------------------------
// Denúncias (Report) — usam a "key" das aulas acima
// ---------------------------------------------------------------------------
const DENUNCIAS = [
  {
    aula: 'tomada-queimada',
    by: 'juliana',
    reason: 'Conteúdo incorreto ou perigoso',
    text: 'As cores dos fios podem variar dependendo da instalação elétrica da casa, acho que devia ter um aviso mais forte sobre isso antes de generalizar.',
    type: "Aula",
  },
  {
    aula: 'descongelar-geladeira',
    by: 'marina',
    reason: 'Informações desatualizadas',
    type: "Aula",
  },
  {
    aula: 'feijao-pressao',
    by: 'ricardo',
    reason: 'Outro',
    text: 'Achei o tempo de cozimento meio curto pro tipo de feijão que uso aqui em casa.',
    type: "Aula",
  },
];

// ---------------------------------------------------------------------------
// Playlists — usam a "key" das aulas acima
// ---------------------------------------------------------------------------
const PLAYLISTS = [
  {
    owner: 'marina',
    name: 'Manutenção elétrica básica',
    description: 'Tudo que você precisa saber pra lidar com os problemas elétricos mais comuns de casa.',
    private: false,
    aulas: ['chuveiro', 'tomada-queimada', 'disjuntor'],
    cover: 'https://dutotec.com.br/blog/wp-content/uploads/2021/02/manutencao-eletrica.jpg',
  },
  {
    owner: 'ricardo',
    name: 'Cozinha do dia a dia',
    description: 'Receitas simples pra quem tá começando a cozinhar sozinho.',
    private: false,
    aulas: ['arroz', 'frango-assado', 'feijao-pressao'],
    cover: 'https://ms.senac.br/Portals/0/Cursos/33168/Anexo_33168_133601858618739087.webp',
  },
  {
    owner: 'juliana',
    name: 'Casa sempre limpa',
    description: 'Rotina de limpeza pra manter a casa em ordem sem complicação.',
    private: false,
    aulas: ['rejunte', 'mofo-box', 'geladeira-organizada', 'desentupir-ralo'],
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs-i2-eDuhghqbwCGs-Rrmkty5d1VdeA-5Apl2hI9bNny3jwRsSS0MH5kL&s=10',
  },
  {
    owner: 'marina',
    name: 'Guia rápido pra quem tá começando',
    description: 'Uma seleção enxuta com o básico do básico pra quem acabou de sair de casa.',
    private: true,
    aulas: ['botao', 'contas-casa', 'filtro-lavadora'],
    cover: 'https://picsum.photos/seed/sd-playlist-basico/800/450',
  },
];

// ---------------------------------------------------------------------------
// Funções de criação
// ---------------------------------------------------------------------------
async function limparDadosAntigos(emails) {
  const usuariosAntigos = await User.find({ email: { $in: emails } }).select('_id');
  const ids = usuariosAntigos.map((u) => u._id);

  const aulasAntigas = await Class.find({ author: { $in: ids } }).select('_id');
  const aulaIds = aulasAntigas.map((c) => c._id);

  const comentariosAntigos = await Comment.find({ commentedClass: { $in: aulaIds } }).select('_id');
  const comentarioIds = comentariosAntigos.map((c) => c._id);

  await Response.deleteMany({ comment: { $in: comentarioIds } });
  await Comment.deleteMany({ commentedClass: { $in: aulaIds } });
  await Report.deleteMany({ class: { $in: aulaIds } });
  await Playlist.deleteMany({ author: { $in: ids } });
  await Class.deleteMany({ author: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
}

async function criarUsuarios() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(SENHA_PADRAO, salt);

  const criados = {};
  for (const u of USUARIOS) {
    const usuario = new User({
      username: u.username,
      usernameNormalized: normalizeUsername(u.username),
      email: u.email,
      password: passwordHash,
      isVerified: true,
      type: u.admin ? 'admin' : undefined,
      profilePicture: u.profilePicture,
      hideEmail: true,
      banned: false,
      followers: 0,
      following: [],
      ratedClasses: [],
    });
    await usuario.save();
    criados[u.key] = usuario;
  }
  return criados;
}

async function aplicarSeguindo(usuarios) {
  const { marina, ricardo, juliana } = usuarios;

  // cadeia entre os três (sem o admin, que não é mais gerenciado pelo seeder)
  marina.following = [ricardo._id];
  ricardo.following = [juliana._id];
  juliana.following = [marina._id];

  marina.followers = 1; // seguida pela juliana
  ricardo.followers = 1; // seguido pela marina
  juliana.followers = 1; // seguida pelo ricardo

  await Promise.all([marina.save(), ricardo.save(), juliana.save()]);
}

async function criarAulas(usuarios) {
  const criadas = {};

  for (const dados of AULAS) {
    const autor = usuarios[dados.autor];
    const aula = new Class({
      author: autor._id,
      authorUsername: autor.username,
      title: dados.title,
      normalizedTitle: normalizeTitle(dados.title),
      content: dados.content,
      subject: dados.subject,
      danger: dados.danger,
      dangerLevel: dados.dangerLevel,
      cover: dados.cover,
      medias: dados.medias,
      ratingCount: 0,
      ratingSum: 0,
      ratingAverage: 0,
    });
    await aula.save();
    criadas[dados.key] = aula;
  }

  // aplica as notas depois que todas as aulas já existem
  for (const dados of AULAS) {
    if (!dados.ratings || dados.ratings.length === 0) continue;

    const aula = criadas[dados.key];
    let soma = 0;

    for (const avaliacao of dados.ratings) {
      soma += avaliacao.rate;
      const avaliador = usuarios[avaliacao.by];
      avaliador.ratedClasses.push({ classesIds: aula._id, rate: avaliacao.rate });
    }

    aula.ratingCount = dados.ratings.length;
    aula.ratingSum = soma;
    aula.ratingAverage = Math.round((soma / dados.ratings.length) * 100) / 100;
    await aula.save();
  }

  await Promise.all(Object.values(usuarios).map((u) => u.save()));

  return criadas;
}

async function criarComentarios(usuarios, aulas) {
  for (const dados of COMENTARIOS) {
    const aula = aulas[dados.aula];
    const autor = usuarios[dados.by];

    const comentario = new Comment({
      author: autor._id,
      authorUsername: autor.username,
      commentedClass: aula._id,
      classTitle: aula.normalizedTitle,
      content: dados.content,
    });
    await comentario.save();

    aula.comments.push(comentario._id);
    await aula.save();

    if (dados.responses) {
      for (const resposta of dados.responses) {
        const respAutor = usuarios[resposta.by];
        const novaResposta = new Response({
          author: respAutor._id,
          authorUsername: respAutor.username,
          comment: comentario._id,
          class: aula._id,
          content: resposta.content,
        });
        await novaResposta.save();

        comentario.responses.push(novaResposta._id);
        await comentario.save();
      }
    }
  }
}

async function criarDenuncias(usuarios, aulas) {
  for (const dados of DENUNCIAS) {
    const aula = aulas[dados.aula];
    const autor = usuarios[dados.by];

    const denuncia = new Report({
      author: autor._id,
      class: aula._id,
      reason: dados.reason,
      text: dados.text,
      type: dados.type
    });
    await denuncia.save();

    aula.reports.push(denuncia._id);
    aula.reportCount = (aula.reportCount || 0) + 1;
    await aula.save();
  }
}

async function criarPlaylists(usuarios, aulas) {
  for (const dados of PLAYLISTS) {
    const autor = usuarios[dados.owner];

    const playlist = new Playlist({
      author: autor._id,
      name: dados.name,
      normalizedName: normalizePlaylistName(dados.name),
      cover: dados.cover,
      description: dados.description,
      private: dados.private,
      classes: dados.aulas.map((key) => aulas[key]._id),
    });
    await playlist.save();
  }
}

async function main() {
  if (!MONGO_URI) {
    console.error('Nenhuma MONGO_URI encontrada (nem SEED_MONGO_URI nem MONGO_URI). Abortando.');
    process.exit(1);
  }

  console.log(`Conectando em: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const emails = USUARIOS.map((u) => u.email);
  console.log('Limpando dados antigos desses usuários (se existirem)...');
  await limparDadosAntigos(emails);

  console.log('Criando usuários...');
  const usuarios = await criarUsuarios();

  console.log('Aplicando relações de seguir...');
  await aplicarSeguindo(usuarios);

  console.log('Criando aulas e aplicando notas...');
  const aulas = await criarAulas(usuarios);

  console.log('Criando comentários e respostas...');
  await criarComentarios(usuarios, aulas);

  console.log('Criando denúncias...');
  await criarDenuncias(usuarios, aulas);

  console.log('Criando playlists...');
  await criarPlaylists(usuarios, aulas);

  console.log('\nPronto! Contas criadas (senha para todas: ' + SENHA_PADRAO + '):');
  for (const u of USUARIOS) {
    console.log(`  - ${u.email} (${u.username})${u.admin ? ' [admin]' : ''}`);
  }
  console.log(`\nResumo: ${AULAS.length} aulas, ${COMENTARIOS.length} comentários, ${DENUNCIAS.length} denúncias, ${PLAYLISTS.length} playlists.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Erro ao rodar o seed:', err);
  process.exit(1);
});
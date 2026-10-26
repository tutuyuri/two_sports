import { Link } from "react-router-dom";
import { DocumentoLegal } from "../reutilizavel/documentoLegal.jsx";
import { DADOS_LEGAIS } from "../utils/dadosLegais.js";

const AVISO = (
  <p>
    <strong>Projeto de demonstração.</strong> Como a loja é fictícia, recomendamos
    usar dados fictícios (por exemplo, um endereço inventado) sempre que possível.
  </p>
);

const INTRODUCAO = [
  "Esta Política de privacidade explica quais dados pessoais o Two Sports trata, para que, com quem os compartilha e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).",
];

const SECOES = [
  {
    id: "controlador",
    titulo: "Quem é o responsável pelos dados",
    paragrafos: [
      <>
        O responsável pelo tratamento dos dados é {DADOS_LEGAIS.responsavel},
        autor do projeto Two Sports. Para falar sobre privacidade, escreva para{" "}
        <a href={`mailto:${DADOS_LEGAIS.email}`}>{DADOS_LEGAIS.email}</a>.
      </>,
    ],
  },
  {
    id: "dados",
    titulo: "Quais dados coletamos",
    paragrafos: ["Coletamos apenas o que o site precisa para funcionar:"],
    itens: [
      "Cadastro: nome, e-mail e senha. A senha é guardada de forma irreversível (hash) e nem nós conseguimos lê-la.",
      "Compras: itens do carrinho e dos pedidos, valores, forma de pagamento escolhida (apenas o nome da opção) e data.",
      "Entrega: o endereço que você informa no checkout (CEP, rua, número, complemento, bairro, cidade e UF).",
      "Preferências: suas escolhas de notificação (salvas na conta) e de tema e acessibilidade (salvas no seu navegador).",
      "Avaliações: a nota, o comentário e a data das avaliações que você publicar. Na página do produto aparecem seu primeiro nome e a inicial do sobrenome.",
      "Dados técnicos: o cookie de login e informações como endereço IP, navegador e horário de acesso, que os serviços de hospedagem podem registrar para operar e proteger o site.",
    ],
    depois: [
      "Não coletamos CPF, número de cartão, dados bancários, chaves Pix, documentos de identidade nem localização.",
    ],
  },
  {
    id: "finalidades",
    titulo: "Para que usamos seus dados",
    itens: [
      "Criar e manter sua conta e permitir o login: execução de contrato ou de procedimentos preliminares (LGPD, art. 7º, V).",
      "Registrar carrinho e pedidos e mostrar seu histórico em Minhas compras: execução de contrato ou de procedimentos preliminares (art. 7º, V).",
      "Lembrar suas preferências de notificação, quando você as ativa: consentimento (art. 7º, I), que pode ser retirado a qualquer momento.",
      "Proteger o site e as contas contra uso indevido e fraudes: legítimo interesse (art. 7º, IX).",
    ],
    depois: [
      "Não vendemos seus dados e não os usamos para publicidade nem para decisões automatizadas.",
    ],
  },
  {
    id: "cookies",
    titulo: "Cookies e armazenamento no navegador",
    itens: [
      "Cookie de login (two_sports_sessao): essencial para manter você logado. Dura 7 dias, não pode ser lido por scripts da página e é enviado de forma segura (HTTPS) em produção.",
      "Armazenamento local (two_sports_preferencias): guarda seu tema e seus ajustes de acessibilidade neste navegador.",
    ],
    depois: [
      "No momento, não usamos cookies de publicidade nem de análise de audiência.",
    ],
  },
  {
    id: "compartilhamento",
    titulo: "Com quem compartilhamos",
    paragrafos: [
      "Usamos serviços de terceiros para o site funcionar. Eles tratam dados em nosso nome:",
    ],
    itens: [
      "Vercel: hospedagem do site e das funções do servidor.",
      "Neon: banco de dados em que ficam sua conta, seu carrinho e seus pedidos.",
      "DummyJSON: base de produtos de exemplo. Ao carregar as imagens dos produtos, seu navegador se conecta ao servidor desse serviço, que pode registrar seu endereço IP.",
    ],
    depois: [
      "Esses serviços podem ter servidores fora do Brasil. Também podemos compartilhar dados quando a lei exigir.",
    ],
  },
  {
    id: "retencao",
    titulo: "Por quanto tempo guardamos",
    itens: [
      "Seus dados ficam guardados enquanto sua conta existir.",
      <>
        Ao excluir a conta em <Link to="/configuracoes">Configurações</Link>,
        apagamos do nosso banco seu perfil, seu carrinho e seu histórico de compras.
      </>,
      "Registros técnicos e cópias de segurança mantidos pelos provedores de hospedagem e de banco de dados seguem os prazos deles e podem existir por um tempo limitado.",
    ],
  },
  {
    id: "direitos",
    titulo: "Seus direitos",
    paragrafos: ["A LGPD garante a você, entre outros, o direito de:"],
    itens: [
      "confirmar que tratamos seus dados e acessá-los;",
      "corrigir dados incompletos, inexatos ou desatualizados;",
      "pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;",
      "pedir a portabilidade dos seus dados;",
      "pedir a eliminação dos dados tratados com base no seu consentimento;",
      "saber com quem compartilhamos seus dados;",
      "ser informado sobre a possibilidade de não consentir e suas consequências;",
      "retirar o consentimento quando quiser.",
    ],
    depois: [
      <>
        Parte disso você faz sozinho em <Link to="/configuracoes">Configurações</Link>:
        alterar o nome e a senha, ajustar as notificações e excluir a conta. Para o
        restante, escreva para{" "}
        <a href={`mailto:${DADOS_LEGAIS.email}`}>{DADOS_LEGAIS.email}</a>. Respondemos
        em até 15 dias, conforme a LGPD.
      </>,
      "Se achar que seus direitos não foram respeitados, você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).",
    ],
  },
  {
    id: "seguranca",
    titulo: "Como protegemos seus dados",
    itens: [
      "Senhas guardadas em hash, nunca em texto puro.",
      "Conexão segura (HTTPS) e cookie de login protegido contra leitura por scripts.",
      "Acesso restrito ao banco de dados.",
    ],
    depois: [
      "Nenhum sistema é 100% seguro. Se houver um incidente que possa trazer risco relevante a você, avisaremos você e a ANPD, como a lei determina.",
    ],
  },
  {
    id: "menores",
    titulo: "Crianças e adolescentes",
    paragrafos: [
      "O site não é voltado a menores de 18 anos. Quem tiver menos de 18 anos deve usá-lo com autorização e acompanhamento de um responsável. Se você acredita que uma criança nos enviou dados sem autorização, avise-nos para que possamos apagá-los.",
    ],
  },
  {
    id: "alteracoes",
    titulo: "Alterações nesta Política",
    paragrafos: [
      <>
        Podemos atualizar esta Política. A data da última atualização fica no topo
        desta página. O uso do site é regido também pelos{" "}
        <Link to="/termos">Termos de uso</Link>.
      </>,
    ],
  },
  {
    id: "contato",
    titulo: "Contato",
    paragrafos: [
      <>
        Dúvidas ou pedidos sobre seus dados: {DADOS_LEGAIS.responsavel},{" "}
        <a href={`mailto:${DADOS_LEGAIS.email}`}>{DADOS_LEGAIS.email}</a>.
      </>,
    ],
  },
];

export function Privacidade() {
  return (
    <DocumentoLegal
      atualizadoEm={DADOS_LEGAIS.atualizadoEm}
      aviso={AVISO}
      introducao={INTRODUCAO}
      secoes={SECOES}
    />
  );
}
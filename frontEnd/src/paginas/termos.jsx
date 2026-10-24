import { Link } from "react-router-dom";
import { DocumentoLegal } from "../reutilizavel/documentoLegal.jsx";
import { DADOS_LEGAIS } from "../utils/dadosLegais.js";

const AVISO = (
  <p>
    <strong>Projeto de demonstração.</strong> O Two Sports é uma loja fictícia:
    nenhuma compra é real, nenhum valor é cobrado e nenhum produto é enviado.
  </p>
);

const INTRODUCAO = [
  "Estes Termos de uso explicam as regras para usar o Two Sports. Ao navegar pelo site ou criar uma conta, você concorda com eles. Se não concordar, por favor, não utilize o site.",
];

const SECOES = [
  {
    id: "natureza",
    titulo: "O que é o Two Sports",
    paragrafos: [
      "O Two Sports é um projeto de demonstração: uma loja virtual fictícia de produtos esportivos, criada para estudo e portfólio.",
    ],
    itens: [
      "Os produtos, preços, fotos, avaliações e notas são dados de exemplo, obtidos de uma base pública de testes (DummyJSON) e adaptados para o projeto.",
      "Nenhum pagamento é cobrado e nenhuma mercadoria é enviada.",
      "Os pedidos são simulados e servem apenas para mostrar como a loja funciona.",
    ],
    depois: [
      "Por isso, sempre que possível, use dados fictícios (por exemplo, um endereço inventado) e não reutilize uma senha que você já usa em outros serviços.",
    ],
  },
  {
    id: "conta",
    titulo: "Cadastro e conta",
    itens: [
      "Para finalizar um pedido de demonstração, é preciso criar uma conta com nome, e-mail e senha.",
      "Pessoas com menos de 18 anos devem usar o site com autorização e acompanhamento de um responsável.",
      "Você é responsável pelas informações que fornece e por manter sua senha em sigilo.",
      "Avise-nos se suspeitar de uso indevido da sua conta.",
      "Não crie contas em nome de outras pessoas nem se passe por elas.",
    ],
  },
  {
    id: "uso",
    titulo: "Como você pode usar o site",
    paragrafos: [
      "Você se compromete a usar o site de forma legal e respeitosa. Não é permitido:",
    ],
    itens: [
      "tentar acessar contas, dados ou sistemas sem autorização;",
      "sobrecarregar o site, testar falhas de segurança ou interferir no seu funcionamento sem nossa permissão;",
      "usar robôs ou coleta automática de dados em volume que prejudique o serviço;",
      "inserir conteúdo ilegal, ofensivo ou que viole direitos de terceiros.",
    ],
    depois: [
      "Se você encontrar uma falha de segurança, agradecemos que nos avise pelos canais de contato, em vez de explorá-la.",
    ],
  },
  {
    id: "compras",
    titulo: "Carrinho, pedidos e pagamentos simulados",
    itens: [
      "Você pode adicionar produtos ao carrinho, alterar quantidades e finalizar um pedido de demonstração.",
      "As formas de pagamento (Pix, cartão e boleto) são apenas ilustrativas. O site não pede, não processa e não guarda número de cartão, dados bancários ou chaves Pix.",
      "O frete segue uma regra fixa de exemplo: é grátis quando todos os itens do carrinho têm frete grátis; caso contrário, é cobrado um valor fixo simulado.",
      <>
        Ao confirmar, você recebe um número de pedido, que fica registrado em{" "}
        <Link to="/minhas-compras">Minhas compras</Link>. Esse registro não gera
        cobrança, entrega, nota fiscal nem obrigação para nenhuma das partes.
      </>,
    ],
  },
  {
    id: "conteudo",
    titulo: "Conteúdo de terceiros e avaliações",
    itens: [
      "As avaliações exibidas nas páginas de produto são exemplos de uma base de testes, não opiniões de clientes reais.",
      "Imagens e descrições dos produtos pertencem aos seus titulares ou fazem parte de bases públicas de teste, e podem conter erros ou estar em inglês.",
      "Links para outros sites (como o GitHub) levam a páginas fora do nosso controle, que têm regras próprias.",
    ],
  },
  {
    id: "propriedade",
    titulo: "Propriedade intelectual",
    paragrafos: [
      <>
        O nome Two Sports, a logo, o design e o código do projeto pertencem ao
        responsável por ele. O código-fonte pode ser consultado no{" "}
        <a href={DADOS_LEGAIS.repositorio} target="_blank" rel="noopener noreferrer">
          repositório do projeto no GitHub
        </a>
        , e o uso dele segue o que estiver indicado lá.
      </>,
      "Não é permitido apresentar o site como uma loja real nem usar a marca para enganar outras pessoas.",
    ],
  },
  {
    id: "encerramento",
    titulo: "Encerrar ou suspender sua conta",
    paragrafos: [
      <>
        Você pode excluir sua conta quando quiser, em{" "}
        <Link to="/configuracoes">Configurações</Link>. A exclusão é definitiva e
        apaga seu perfil, seu carrinho e seu histórico de compras.
      </>,
      "Podemos suspender ou excluir contas que violem estes Termos ou que coloquem o site em risco.",
    ],
  },
  {
    id: "disponibilidade",
    titulo: "Disponibilidade e limitação de responsabilidade",
    itens: [
      "Por ser um projeto de demonstração hospedado em serviços gratuitos, o site pode ficar fora do ar, mudar ou ser encerrado a qualquer momento, e os dados cadastrados podem ser apagados ou reiniciados sem aviso.",
      "O site é oferecido como está, sem garantia de funcionamento contínuo ou livre de erros.",
      "Na medida permitida pela lei, não nos responsabilizamos por danos decorrentes do uso do site ou da perda de dados de demonstração. Isso não afasta direitos que a lei garante a você.",
    ],
  },
  {
    id: "privacidade",
    titulo: "Privacidade",
    paragrafos: [
      <>
        Explicamos como tratamos seus dados pessoais na{" "}
        <Link to="/privacidade">Política de privacidade</Link>.
      </>,
    ],
  },
  {
    id: "alteracoes",
    titulo: "Alterações nestes Termos",
    paragrafos: [
      "Podemos atualizar estes Termos. A data da última atualização fica no topo desta página. Se você continuar usando o site depois da mudança, entendemos que aceitou a nova versão.",
    ],
  },
  {
    id: "lei",
    titulo: "Lei aplicável",
    paragrafos: ["Estes Termos são regidos pelas leis do Brasil."],
  },
  {
    id: "contato",
    titulo: "Contato",
    paragrafos: [
      <>
        Dúvidas sobre estes Termos? Fale com {DADOS_LEGAIS.responsavel} pelo e-mail{" "}
        <a href={`mailto:${DADOS_LEGAIS.email}`}>{DADOS_LEGAIS.email}</a>.
      </>,
    ],
  },
];

export function Termos() {
  return (
    <DocumentoLegal
      atualizadoEm={DADOS_LEGAIS.atualizadoEm}
      aviso={AVISO}
      introducao={INTRODUCAO}
      secoes={SECOES}
    />
  );
}
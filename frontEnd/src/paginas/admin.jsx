import { Link } from "react-router-dom";
import { Package, Palette, ShieldCheck, Tags } from "lucide-react";
import "./admin.css";

export function Admin() {
  return (
    <ul className="adminPainel">
      <li>
        <Link to="/admin/produtos">
          <Package size={32} />
          <strong>Produtos</strong>
          <span>Adicionar e editar itens, com prévia ao vivo da página de venda.</span>
        </Link>
      </li>
      <li>
        <Link to="/admin/categorias">
          <Tags size={32} />
          <strong>Categorias</strong>
          <span>Criar novas categorias para organizar os produtos da loja.</span>
        </Link>
      </li>
      <li>
        <Link to="/admin/cores">
          <Palette size={32} />
          <strong>Cores do app</strong>
          <span>Mudar as cores do modo claro e do modo escuro.</span>
        </Link>
      </li>
      <li>
        <Link to="/admin/administradores">
          <ShieldCheck size={32} />
          <strong>Administradores</strong>
          <span>Dar ou retirar o acesso de administrador de uma conta.</span>
        </Link>
      </li>
    </ul>
  );
}
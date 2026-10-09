import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Search, User, LogIn, UserPlus, Settings, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import './hud.css'


function Usuario() {

  const [aberto, setAberto] = useState(false);
  const areaUsuarioRef = useRef(null);

  useEffect(() => {
    function handleClickFora(event) {
      if (
        areaUsuarioRef.current &&
        !areaUsuarioRef.current.contains(event.target)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("click", handleClickFora);

    return () => {
      document.removeEventListener("click", handleClickFora);
    };
  }, []);


  return (
    <div className="area-usuario" ref={areaUsuarioRef}>

      <button
        className="botao-usuario"
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir menu do usuário"
      >
        <User size={40} />
        <ChevronDown size={30} className={`setaUsuario ${aberto ? 'ativo' : ''}`} />
      </button>

      {aberto && (
        <div className="menu-usuario">

          <Link to="/login">
            <LogIn size={18} />
            <span>Login</span>
          </Link>

          <Link to="/registro">
            <UserPlus size={18} />
            <span>Registrar-se</span>
          </Link>

          <Link to="/configuracoes">
            <Settings size={18} />
            <span>Configurações</span>
          </Link>

          <button className="botao-sair">
            <LogOut size={18} />
            <span>Sair</span>
          </button>

        </div>
      )}

    </div>
  );
}


export function Header() {

  const pesquisaRef = useRef(null);
  const location = useLocation();
  console.log(location.pathname);

  function focarPesquisa() {
    pesquisaRef.current?.focus();
  }

  return (
    <header className= {`cabecalho ${location.pathname}`}>
        <div className="cabecalho_conteudo">
            <Link className="logo" to="/"></Link>

            <div className="pesquisa" role="search" aria-label="Barra de pesquisa" >
              <input type="text" name="search" id="pesquisa" placeholder="O que você está procurando?" title="Barra de pesquisa" ref={pesquisaRef} />
              <Search size={20} className="iconPesquisa" color="#000" onClick={focarPesquisa} />
            </div>

            <nav className="menu" aria-label="Menu principal">
                <div className="menu_links">
                  <Link to="/">Início</Link>
                  <Link to="/produtos" title="Produtos">Minhas Compras</Link>
                  <Link to="/carrinho" className="menu_carrinho icon" ><ShoppingCart size={22} /><span className="contador-carrinho" data-cart-count>0</span></Link>
                </div>
            </nav>
        </div>
      <Usuario />
    </header>
  )
}

export function Footer() {
  return (
  <footer className="footer">
    {/* Identidade da loja */}
    <div className="footer_marca">
      <Link className="logo" to="/"></Link>

      <p className="footer_descricao">
        Seu esporte, sua paixão.
        <br />
        Encontre os produtos ideais para acompanhar você em cada desafio.
      </p>
    </div>

    <div className="footer_conteudo">
    {/* Navegação */}
      <div className="footer_coluna">
        <h3>Navegação</h3>
        <ul>
          <li>
            <Link to="/">Início</Link>
          </li>
          <li>
            <Link to="/produtos">Produtos</Link>
          </li>
          <li>
            <Link to="/carrinho">Carrinho</Link>
          </li>
        </ul>
      </div>

      {/* Informações institucionais */}
      <div className="footer_coluna">
        <h3>Informações</h3>

        <ul>
          <li>
            <Link to="/privacidade">Política de privacidade</Link>
          </li>
          <li>
            <Link to="/termos">Termos de uso</Link>
          </li>
        </ul>
      </div>

      {/* Repositório do projeto */}
      <div className="footer_coluna footer_github">
        <h3>Projeto</h3>

        <p>
          Confira o desenvolvimento do Two Sports.
        </p>

        <a
          className="footer_link-github"
          href="https://github.com/tutuyuri/two_sports"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Acessar o repositório Two Sports no GitHub"
        >
          <img src="github.svg" alt="GitHub Logo" className="footer_github-logo" width="40"/>
          <span>GitHub</span>
        </a>
      </div>

    </div>

  {/* Rodapé inferior */}
  <div className="footer_inferior">
    <p>
      © {new Date().getFullYear()} Two Sports.
      Todos os direitos reservados.
    </p>
  </div>
</footer>

);
}
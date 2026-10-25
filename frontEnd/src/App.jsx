import './App.css'
import { Header, Footer } from './reutilizavel/hud.jsx'
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Inicio } from './paginas/inicial.jsx';
import { Login } from './paginas/login.jsx';
import { Registro } from './paginas/registro.jsx';
import { Config } from './paginas/config.jsx';
import { Termos } from './paginas/termos.jsx';
import { Carrinho } from './paginas/carrinho.jsx';
import { Privacidade } from './paginas/privacidade.jsx';
import { Produtos } from './paginas/produtos.jsx';
import { Produto } from './paginas/produto.jsx';
import { Checkout } from './paginas/checkout.jsx';
import { SessaoProvider } from './contexto/sessao.jsx';
import { MinhasCompras } from './paginas/minhasCompras.jsx';
import { EsqueciSenha } from './paginas/esqueciSenha.jsx';
import { RedefinirSenha } from './paginas/redefinirSenha.jsx';
import { RotaAdmin } from './reutilizavel/rotaAdmin.jsx';
import { Admin } from './paginas/admin.jsx';
import { AdminProdutos } from './paginas/adminProdutos.jsx';
import { AdminProdutoForm } from './paginas/adminProdutoForm.jsx';
import { AdminCores } from './paginas/adminCores.jsx';
import { AdminAdmins } from './paginas/adminAdmins.jsx';


function Layout() {
  const location = useLocation();
  let localizacao = ""
  if (location.pathname == "/") {
    localizacao = "Início"
  } else if (location.pathname.startsWith("/produtos/")) {
    localizacao = "Produto"
  } else if (location.pathname == "/minhas-compras") {
    localizacao = "Minhas compras"
  } else if (location.pathname == "/configuracoes") {
    localizacao = "Configurações"
  } else if (location.pathname == "/termos") {
    localizacao = "Termos de uso"
  } else if (location.pathname == "/privacidade") {
    localizacao = "Política de privacidade"
  } else if (location.pathname == "/esqueci-senha") {
    localizacao = "Esqueci minha senha"
  } else if (location.pathname == "/redefinir-senha") {
    localizacao = "Redefinir senha"
  } else if (location.pathname.startsWith("/admin")) {
    localizacao = "Administração"
  } else { localizacao = location.pathname.replace("/", "")}

  return (
    <div className="App">
      <Header />

      <main className="content">
        <h1>{localizacao}</h1>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function App() {
  return (
    <SessaoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />
            <Route path="esqueci-senha" element={<EsqueciSenha />} />
            <Route path="redefinir-senha" element={<RedefinirSenha />} />
            <Route path="configuracoes" element={<Config />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="carrinho" element={<Carrinho />} />
            <Route path="privacidade" element={<Privacidade />} />
            <Route path="termos" element={<Termos />} />
            <Route path="produtos/:id" element={<Produto />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="minhas-compras" element={<MinhasCompras />} />
            <Route path="admin" element={<RotaAdmin><Admin /></RotaAdmin>} />
            <Route path="admin/produtos" element={<RotaAdmin><AdminProdutos /></RotaAdmin>} />
            <Route path="admin/produtos/novo" element={<RotaAdmin><AdminProdutoForm /></RotaAdmin>} />
            <Route path="admin/produtos/:id" element={<RotaAdmin><AdminProdutoForm /></RotaAdmin>} />
            <Route path="admin/cores" element={<RotaAdmin><AdminCores /></RotaAdmin>} />
            <Route path="admin/administradores" element={<RotaAdmin><AdminAdmins /></RotaAdmin>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessaoProvider>
  );
}


export { App };

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


function Layout() {
  const location = useLocation();
  let localizacao = ""
  if (location.pathname == "/") {
    localizacao = "Início"
  } else if (location.pathname.startsWith("/produtos/")) {
    localizacao = "Produto"
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="configuracoes" element={<Config />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="privacidade" element={<Privacidade />} />
          <Route path="termos" element={<Termos />} />
          <Route path="produtos/:id" element={<Produto />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export { App };

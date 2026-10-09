import './App.css'
import { Header, Footer } from './reutilizavel/hud.jsx'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Inicio } from './paginas/inicial.jsx';
import { Login } from './paginas/login.jsx';
import { Registro } from './paginas/registro.jsx';


function Layout() {

  return (
    <div className="App">
      <Header />

      <main className="content">
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export { App };

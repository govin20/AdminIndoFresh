import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import Produk from './components/Produk/Produk';
import Pesanan from './components/pesanan/pesanan';
import DetailPesanan from './components/pesanan/detail_pesanan';
import Login from './components/login/login';
import Dashboard from './components/dashboard/dashboard';
import { BsReverseLayoutTextWindowReverse,BsCartCheck,BsArrowBarRight,BsCalendar3} from "react-icons/bs";
import { AiOutlineProduct } from "react-icons/ai";

const orders = [];
const users = {};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
      <Nav.Link
        as={Link}
        to={to}
        style={{
          backgroundColor: isActive ? 'lightblue' : 'transparent',
          border: 'none',
          color: isActive ? 'black' : 'inherit',
          borderRadius: 10,
        }}
      >
        {children}
      </Nav.Link>
    );
  };

  return (
    <Router basename="/AdminIndofresh">
      {isAuthenticated && (
        <Navbar sticky="top" expand="md" className="bg-body-tertiary mb-3" >
          <Container fluid>
            <Navbar.Brand as={Link} to="/Produk">
              Admin IndoFresh
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} />
            <Navbar.Offcanvas id={`offcanvasNavbar-expand-md`} aria-labelledby={`offcanvasNavbarLabel-expand-md`} placement="end">
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-md`}>Admin IndoFresh</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  <NavLink to="/Dashboard">Dashboard <BsReverseLayoutTextWindowReverse size={15} /></NavLink>
                  <NavLink to="/Produk">Produk <AiOutlineProduct /></NavLink>
                  <NavLink to="/Pesanan">Pesanan <BsCartCheck /></NavLink>
                  <Nav.Link variant="outline-danger" onClick={handleLogout}>
                    Logout <BsArrowBarRight />
                  </Nav.Link>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      )}
      <Container className="mt-1">
        <div className="m-2 text-end">
          <h4><BsCalendar3 /> {formatDateTime(currentDateTime)}</h4>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? '/Dashboard' : '/Login'} />} />
          <Route path="/Login" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/Produk" element={isAuthenticated ? <Produk /> : <Navigate to="/Login" />} />
          <Route path="/Pesanan" element={isAuthenticated ? <Pesanan /> : <Navigate to="/Login" />} />
          <Route path="/detail_pesanan/:orderId" element={isAuthenticated ? <DetailPesanan orders={orders} users={users} /> : <Navigate to="/Login" />} />
          <Route path="/Dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/Login" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import Produk from './components/Produk/Produk';
import Pesanan from './components/pesanan/pesanan';
import DetailPesanan from './components/pesanan/detail_pesanan';
import Login from './components/login/login';
import Dashboard from './components/dashboard/dashboard';
const orders = [];
const users = {};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <Router>
      {['md'].map((expand) => (
        <Navbar sticky="top" key={expand} expand={expand} className="bg-body-tertiary mb-3">
          <Container fluid>
            <Navbar.Brand as={Link} to="/Produk">
              Admin IndoFresh
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas id={`offcanvasNavbar-expand-${expand}`} aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`} placement="end">
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>Admin IndoFresh</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  <div className="d-flex align-items-center me-3">
                    <h6>{formatDateTime(currentDateTime)}</h6>
                  </div>
                  <Nav.Link as={Link} to="/Dashboard">
                    Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/Produk">
                    Produk
                  </Nav.Link>
                  <Nav.Link as={Link} to="/Pesanan">
                    Pesanan
                  </Nav.Link>
                  <Nav.Link variant="outline-danger" onClick={handleLogout}>
                    Logout
                  </Nav.Link>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
      <Container className="mt-1">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? '/Produk' : '/Login'} />} />
          <Route path="/Login" element={isAuthenticated ? <Navigate to="/Produk" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
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

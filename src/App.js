import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Produk from './components/Produk/Produk';
import Pesanan from './components/pesanan/pesanan';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Login from './components/login/login';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    alert('Anda berhasil logout');
    setIsAuthenticated(false);
  };
  return (
    <Router>
      {[false].map((expand) => (
        <Navbar key={expand} expand={expand} className="bg-body-tertiary mb-3">
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
                  <Nav.Link as={Link} to="/Produk">
                    Produk
                  </Nav.Link>
                  <Nav.Link as={Link} to="/Pesanan">
                    Pesanan
                  </Nav.Link>
                  <Button variant="outline-danger" onClick={handleLogout}>
                    Logout
                  </Button>
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
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

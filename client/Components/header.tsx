import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ setShowFileConvert, setShowUpdateProfile }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Navbar bg="light" expand="lg"  className="shadow-sm" sticky="top">
      <Container fluid className="bm-8">
       <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
  <img
    src="/src/images/File.png"
    alt="File Conversion Service"
    width="40"
    height="40"
    className="me-2"
  />
  <span className="d-none d-lg-inline">File Conversion Service</span>
</Navbar.Brand>

        <div className="d-lg-none">
          <Dropdown show={showDropdown} onToggle={setShowDropdown}>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
              Menu
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              {isLoggedIn ? (
                <>
                  <Dropdown.Item onClick={() => { setShowFileConvert(true); setShowDropdown(false); }}>
                    Convert Files
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => { setShowUpdateProfile(true); setShowDropdown(false); }}>
                    Update Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => { handleLogout(); setShowDropdown(false); }}>
                    Logout
                  </Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item as={Link} to="/login" onClick={() => setShowDropdown(false)}>
                    Login
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/signup" onClick={() => setShowDropdown(false)}>
                    Register
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Show regular nav only on large screens */}
        <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex justify-content-end">
          <Nav className="d-flex align-items-center">
            {isLoggedIn ? (
              <>
                <Button
                  variant="primary"
                 size="sm"
                 className="me-2 px-4 py-2"
                  onClick={() => setShowFileConvert(true)}
                >
                  Convert Files
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                 className="me-2 px-4 py-2"
                  onClick={() => setShowUpdateProfile(true)}
                >
                  Update Profile
                </Button>
                <Button variant="danger" size='sm' className="me-2 px-4 py-2" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link  as={Link} to="/login">

                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { logout } from '../auth';
import fontawesome from '@fortawesome/fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlusCircle,
  faSignOutAlt,
  faUsers,
} from '@fortawesome/fontawesome-free-solid';

fontawesome.library.add(faPlusCircle, faSignOutAlt, faHome, faUsers);

interface Props {
  onMenuChange: (menu: string) => void;
}

export function Header(props: Props) {
  return (
    <Navbar bg="white" variant="light" className="navbar" fixed="top" style={{boxShadow: '0px 8px 8px -6px rgba(0,0,0,.5)'}}>
      <Navbar.Brand>
        &nbsp;&nbsp;
        <img
          src="assets/ic_launcher.png"
          width="48"
          height="48"
          alt="S4"
        />
        &nbsp;<span className="text-black">Rapports</span>
      </Navbar.Brand>
      <Container fluid>
        <Navbar.Collapse id="responsive-navbar-nav">
          <span className="flex-expand"></span>
          <Nav>
            <Button
              style={{ marginLeft: 16, borderRadius: 26 }}
              onClick={() => props.onMenuChange('home')}
              title="Acceuil"
            >
              <FontAwesomeIcon icon="home" />
            </Button>
          </Nav>
          <Nav>
            <Button
              style={{ marginLeft: 16, borderRadius: 26 }}
              onClick={() => props.onMenuChange('publishers')}
              title="Proclamateurs"
            >
              <FontAwesomeIcon icon="users" />
            </Button>
          </Nav>
          <Nav>
            <Button
              style={{ marginLeft: 16, borderRadius: 26 }}
              onClick={() => logout().then(() => window.location.reload())}
              title="Se déconnecter"
            >
              <FontAwesomeIcon icon="sign-out-alt" />
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

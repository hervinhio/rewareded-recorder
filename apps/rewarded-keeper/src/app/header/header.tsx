import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { logout } from '../auth';
import fontawesome from '@fortawesome/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faCalendar, faPlusCircle, faSignOutAlt } from '@fortawesome/fontawesome-free-solid';

fontawesome.library.add(faPlusCircle, faSignOutAlt, faAddressBook, faCalendar);


interface Props {
  onMenuChange: (menu: string) => void;
}

export function Header(props: Props) {
  return (
    <Navbar bg="dark" variant="light">
      <Navbar.Brand style={{ marginLeft: 16 }} href="#home">S-4</Navbar.Brand>
      <Container fluid>
        <Navbar.Brand>
          <img src="assets/1296370_book_note_icon.png" width="48" height="48" alt="S4"/>
          &nbsp;<span className="text-white">Rapports</span>
        </Navbar.Brand>
        <Navbar.Collapse id="responsive-navbar-nav">
          <span className="flex-expand"></span>
          <Nav>
            <Button 
              style={{marginLeft: 16, borderRadius: 26}}
              onClick={() => props.onMenuChange('home')}
              title="Acceuil"
            >
              <FontAwesomeIcon icon='calendar'/>
            </Button>
          </Nav>
          <Nav>
            <Button 
              style={{marginLeft: 16, borderRadius: 26}}
              onClick={() => props.onMenuChange('publishers')}
              title="Proclamateurs"
            >
              <FontAwesomeIcon icon='address-book'/>
            </Button>
          </Nav>
          <Nav>
            <Button 
              style={{marginLeft: 16, borderRadius: 26}}
              onClick={() => logout().then(() => window.location.reload())}
              title="Se déconnecter"
            >
              <FontAwesomeIcon icon='sign-out-alt'/>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

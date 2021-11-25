import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { logout } from '../auth';
import { Month } from '../types';
import { MonthSelector } from "./month-selector";
import fontawesome from '@fortawesome/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faSignOutAlt } from '@fortawesome/fontawesome-free-solid';

fontawesome.library.add(faPlusCircle, faSignOutAlt);

export interface HeaderProps {
  onMonthSelected: (month: Month | undefined) => void;
  onShowAddMonthModal: () => void;
}

export function Header(props: HeaderProps) {
  return (
    <Navbar bg="light" variant="light">
      <Navbar.Brand style={{ marginLeft: 16 }} href="#home">S-4</Navbar.Brand>
      <Container fluid>
        <Navbar.Collapse id="responsive-navbar-nav">
          <span className="flex-expand"></span>
          <Nav>
            <Button style={{marginRight: 16}} onClick={() => props.onShowAddMonthModal()}><FontAwesomeIcon  icon='plus-circle'/></Button>
          </Nav>
          <Nav>
            <MonthSelector onMonthSelected={props.onMonthSelected}/>
          </Nav>
          <Nav>
            <Button style={{marginLeft: 16}} onClick={() => logout().then(() => window.location.reload())}><FontAwesomeIcon icon='sign-out-alt'/></Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Month } from '../types';
import { MonthSelector } from "./month-selector";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface HeaderProps {
  onMonthSelected: (month: Month | undefined) => void;
}

export function Header(props: HeaderProps) {
  return (
    <Navbar bg="light" variant="light">
      <Navbar.Brand style={{ marginLeft: 16 }} href="#home">Formulaire S-4</Navbar.Brand>
      <Container fluid>
        <Navbar.Collapse id="responsive-navbar-nav">
          <span className="flex-expand"></span>
          <Nav>
            <Button><FontAwesomeIcon icon={['fas', 'plus-circle']} />Ajouter</Button>
          </Nav>
          <Nav>
            <MonthSelector onMonthSelected={props.onMonthSelected}/>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

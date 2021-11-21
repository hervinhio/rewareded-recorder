import { Container, Nav, Navbar } from 'react-bootstrap';
import { Month } from '../types';
import { MonthSelector } from "./month-selector";

export interface HeaderProps {
  onMonthSelected: (month: Month | undefined) => void;
}

export function Header(props: HeaderProps) {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand href="#home">Editeur de rapports S-4</Navbar.Brand>
      <Container fluid>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav>
            <MonthSelector onMonthSelected={props.onMonthSelected}/>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

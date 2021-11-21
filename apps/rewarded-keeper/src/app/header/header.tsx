import { Dropdown, DropdownButton } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

export function Header() {
  return (
    <header>
      <DropdownButton
        title="Sélectionnez le mois"
      >
        <Dropdown.Item eventKey="1">Action</Dropdown.Item>
      </DropdownButton>
    </header>
  );
}

import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

export function MonthRangeSelector() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  return (
    <InputGroup>
      <Form.Control
        value={start}
        onChange={(event) => setStart(event.target.value)}
      />
      <Form.Control
        value={end}
        onChange={(event) => setEnd(event.target.value)}
      />
    </InputGroup>
  );
}

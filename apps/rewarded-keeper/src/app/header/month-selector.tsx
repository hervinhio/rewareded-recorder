import { Dropdown, DropdownButton } from 'react-bootstrap';
import { getLastSixMonths } from '../utils';
import { Month } from '../types';
import { Component } from 'react';

interface MonthSelectorProps {
  selectedMonth?: Month | undefined;
  disabled?: boolean | undefined;
  onMonthSelected: (month: Month | undefined) => void;
}

interface State {
  months: Month[];
  month: Month;
  mounted: boolean;
}

export class MonthSelector extends Component<MonthSelectorProps, State> {
  constructor(props: MonthSelectorProps) {
    super(props);

    const months = getLastSixMonths();
    const defaultMonth = props.selectedMonth || months[0];

    this.state = {
      month: defaultMonth,
      mounted: false,
      months,
    };

    if (!this.props.selectedMonth) {
      this.props.onMonthSelected(defaultMonth);
    }
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    const { month } = this.state;

    return (
      <DropdownButton
        title={month.toLocaleFullMonth()}
        disabled={this.props.disabled}
        onSelect={(v) => {
          if (!!v && this.state.mounted) {
            this.setState({ month: this.state.months[Number(v)] });
            this.props.onMonthSelected(this.state.months[Number(v)]);
          }
        }}
      >
        {this.state.months.map((month: Month, index: number) => (
          <Dropdown.Item key={month.getKey()} eventKey={index}>
            {' '}
            {month.toLocaleFullMonth()}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  }
}

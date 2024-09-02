import React from 'react';
import { Stats } from './stats';
import Enzyme, { shallow, EnzymeAdapter } from 'enzyme';
import { useSelector } from 'react-redux';

jest.mock('firebase/firestore');
jest.mock('firebase/app');
jest.mock('firebase/auth', () => {
  return {
    auth: jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(() => Promise.resolve({})),
      signOut: jest.fn(() => Promise.resolve({})),
      getAuth: {},
    })),
    getAuth: () => ({}),
    connectAuthEmulator: () => {},
    GoogleAuthProvider: function() {},
  }
});

jest.mock('firebase/functions', () => {
  return {
    functions: jest.fn().mockReturnThis(),
    getFunctions: jest.fn().mockReturnThis(),
    connectFunctionsEmulator: jest.fn().mockReturnThis(),
    httpsCallable: jest.fn().mockReturnThis(),
    call: jest.fn().mockResolvedValue({ data: 'mock data' })
  };
});

jest.mock("react-redux", () => ({
    useSelector: jest.fn(),
}));

describe('Stats Function', () => {
    Enzyme.configure({ adapter: new EnzymeAdapter() });

    let wrapper;

    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                reports: { unsubmitted: [] },
                publishers: { publishers: [] },
                submissions: { submissions: [] },
            });
        });
        wrapper = shallow(<Stats />);
    });

    it('should render and initialize without crashing', () => {
        expect(wrapper.exists()).toBeTruthy();
    });

    it('renders page component', () => {
        expect(wrapper.find('Page').length).toEqual(1);
    });

    it('renders Grid layout', () => {
        expect(wrapper.find('Grid').length).toEqual(1);
    });

    it('renders submission history', () => {
        expect(wrapper.find('GridColumn').contains(<h4>Historique des soumissions</h4>)).toEqual(true);
    });

});

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/es/Link';
import style from './Header.css';
import logo from '../../assets/logo_blue.svg';
import SelectAccount from '../SelectAccount/SelectAccount';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';

const TEST_ACCOUNTS = [
  {
    name: 'Test 1',
    account: '0003:000011BB:0001'
  }, {
    name: 'Test 2',
    account: '0013:000011CD:0002'
  }, {
    name: 'Test 3',
    account: '0003:000012BB:0001'
  },
];


export default class Header extends React.PureComponent {
  render() {
    const { logoutAction, ereaseAction, accounts } = this.props;
    console.log('this.props.accounts', this.props.accounts);
    return (
      <header className={style.header}>
        <Link to="/">
          <img src={logo} alt="Adshares wallet" className={style.headerLogo} />
        </Link>
        <SelectAccount options={accounts || TEST_ACCOUNTS} />
        <HamburgerMenu logoutAction={logoutAction} ereaseAction={ereaseAction} />
      </header>
    );
  }
}

Header.propTypes = {
  accounts: PropTypes.array.isRequired,
  logoutAction: PropTypes.func.isRequired,
  ereaseAction: PropTypes.func.isRequired,
};


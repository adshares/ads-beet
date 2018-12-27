import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'react-router-dom/es/Link';
import ButtonLink from '../atoms/ButtonLink';
import SelectAccount from '../SelectAccount/SelectAccount';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import ConfirmDialog from '../confirmDialog/confirmDialog';
import Timer from '../Timer/Timer';
import * as VaultActions from '../../actions/vault';
import * as FormActions from '../../actions/form';
import logo from '../../assets/logo_blue.svg';
import config from '../../config/config';
import style from './Page.css';

@connect(
  state => ({
    vault: state.vault,
    pages: state.pages
  }),
  dispatch => ({
    actions: {
      vault: bindActionCreators(VaultActions, dispatch),
      form: bindActionCreators(FormActions, dispatch)
    }
  })
)
export default class Page extends React.Component {
  getSelectedAccount = () => {
    if (this.props.vault.selectedAccount) {
      return this.props.vault.selectedAccount;
    } else if (this.props.vault.accounts.length > 0) {
      this.props.actions.vault.selectActiveAccount(this.props.vault.accounts[0].address);
      return this.props.vault.accounts[0];
    }
  };

  render() {
    const {
      vault,
      actions,
      title,
      subTitle,
      cancelLink,
      onCancelClick,
      noLinks,
      scroll,
      smallTitle,
      children,
      className,
      onPasswordInputChange,
      onDialogSubmit,
      password,
      autenticationModalOpen,
    } = this.props;

    let classes = [];
    classes.push(style.header);
    if (smallTitle) {
      classes.push(style.smallHeader);
    }
    const headerClass = classes.join(' ');

    classes = [];
    classes.push(style.contentWrapper);
    if (className) {
      classes.push(className);
    }
    if (scroll) {
      classes.push(style.withScroll);
    }
    const wrapperClass = classes.join(' ');
    let menu;
    if (noLinks) {
      menu = <div />;
    } else if (cancelLink) {
      menu = (
        <ButtonLink
          to={cancelLink}
          onClick={onCancelClick}
          className={style.close}
          size="small"
          inverse
        >
          <FontAwesomeIcon icon={faTimes} />
        </ButtonLink>
      );
    } else {
      menu = <HamburgerMenu logoutAction={actions.vault.seal} />;
    }

    return (
      <section>
        {this.props.showLoader && <LoaderOverlay />}
        {autenticationModalOpen && (
          <ConfirmDialog
            showDialog
            handlePasswordChange={onPasswordInputChange}
            onSubmit={onDialogSubmit}
            password={password}
          />
        )}
        <header className={headerClass}>
          <div className={style.logo}>
            {noLinks ? (
              <img src={logo} alt="Adshares wallet" />
            ) : (
              <Link to="/">
                <img src={logo} alt="Adshares wallet" />
          </Link>)}
            {config.testnet ? <span>TESTNET</span> : ''}
          </div>
          {title ? (
            <h1>
              {title} {subTitle ? <small>{subTitle}</small> : ''}
            </h1>
          ) : (
            <SelectAccount
              options={vault.accounts} selectedAccount={this.getSelectedAccount()}
              selectAccount={actions.vault.selectActiveAccount}
            />
          )}
          {menu}
        </header>
        <div className={wrapperClass}>{children}</div>
        <footer className={style.footer}>
          <Timer />
        </footer>
      </section>
    );
  }
}

Page.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  vault: PropTypes.object,
  actions: PropTypes.object,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  cancelLink: PropTypes.any,
  onCancelClick: PropTypes.func,
  noLinks: PropTypes.bool,
  smallTitle: PropTypes.bool,
  scroll: PropTypes.bool,
  onPasswordInputChange: PropTypes.func,
  onDialogSubmit: PropTypes.func,
  password: PropTypes.object,
  autenticationModalOpen: PropTypes.bool,
  showLoader: PropTypes.bool,
};

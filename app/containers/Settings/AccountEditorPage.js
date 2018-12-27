import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { faChevronRight, faTimes, faCheck, faInfo } from '@fortawesome/free-solid-svg-icons/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InvalidPasswordError, ItemNotFound, UnknownPublicKeyError } from '../../actions/errors';
import FormComponent from '../../components/FormComponent';
import Form from '../../components/atoms/Form';
import Button from '../../components/atoms/Button';
import ButtonLink from '../../components/atoms/ButtonLink';
import LoaderOverlay from '../../components/atoms/LoaderOverlay';
import config from '../../config/config';
import Page from '../../components/Page/Page';
import Box from '../../components/atoms/Box';
import style from './SettingsPage.css';
import InputControl from '../../components/atoms/InputControl';
import { inputChange, passwordChange, toggleVisibility, passInputValidate, formValidate, formClean } from '../../actions/form';

@connect(
  state => ({
    vault: state.vault,
    page: state.pages.AccountEditorPage
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        handleInputChange: inputChange,
        handlePasswordChange: passwordChange,
        formValidate,
        passInputValidate,
        toggleVisibility,
        formClean
      },
      dispatch
    )
  })
)

export default class AccountEditorPage extends FormComponent {
  static PAGE_NAME = 'AccountEditorPage';

  constructor(props) {
    super(props);

    let selectedAccount;
    const { address } = this.props.match.params;

    if (address) {
      selectedAccount = this.props.vault.accounts.find(a => a.address === address);
      if (!selectedAccount) {
        throw new ItemNotFound('account', address);
      }
    }

    this.state = {
      account: selectedAccount,
      name: '',
      address: '',
      publicKey: '',
      password: '',
      isSubmitted: false,
    };

    if (selectedAccount) {
      this.state.name = selectedAccount.name;
      this.state.address = selectedAccount.address;
      this.state.publicKey = selectedAccount.publicKey;
    }
  }

  handleSubmit = () => {
    this.props.actions.formValidate(AccountEditorPage.PAGE_NAME);
  };

  handleCancel = () => {
    this.props.actions.formClean(AccountEditorPage.PAGE_NAME);
  }

  handleInputChange = (inputName, inputValue) => {
    this.props.actions.handleInputChange(
      AccountEditorPage.PAGE_NAME,
      inputName,
      inputValue
    );
  };

  render() {
    const {
      page: {
        auth: { authModalOpen, password },
        inputs: { name, address, publicKey },
      }
    } = this.props;
    const limitWarning =
        !this.state.account && this.props.vault.accounts.length >= config.accountsLimit;
    const title = this.state.account ? this.state.account.name : 'Import an account';

    return (
      <Page
        title={title}
        smallTitle
        className={style.page}
        onPasswordInputChange={value =>
              this.props.actions.handlePasswordChange(
                AccountEditorPage.PAGE_NAME,
                value
              )
            }
        onDialogSubmit={() => {
          this.props.actions.passInputValidate(
                AccountEditorPage.PAGE_NAME
              );
          this.props.saveAction();
        }}
        password={password}
        autenticationModalOpen={authModalOpen}
        cancelLink={this.getReferrer()}
      >
        {this.state.isSubmitted && <LoaderOverlay />}
        {limitWarning ? (
          <div>
            <Box layout="warning" icon={faInfo}>
              Maximum account limit has been reached. Please remove unused accounts.
            </Box>
            <ButtonLink to={this.getReferrer()} icon="left" size="wide" layout="info">
              <FontAwesomeIcon icon={faCheck} /> OK
            </ButtonLink>
          </div>
            ) : (
              <Form>
                <InputControl
                  required
                  isInput
                  maxLength={config.accountNameAndKeyMaxLength}
                  label="Account name"
                  value={name.value}
                  errorMessage={name.errorMsg}
                  handleChange={value => this.handleInputChange('name', value)}
                />
                <InputControl
                  required
                  isInput
                  label="Account address"
                  value={address.value}
                  errorMessage={address.errorMsg}
                  handleChange={value => this.handleInputChange('address', value)}
                />
                <InputControl
                  required
                  pattern="[0-9a-fA-F]{64}"
                  label="Account public key"
                  value={publicKey.value}
                  errorMessage={publicKey.errorMsg}
                  handleChange={value => this.handleInputChange('publicKey', value)}
                />
                <div className={style.buttons}>
                  <ButtonLink
                    to={this.getReferrer()}
                    inverse
                    icon="left"
                    disabled={this.state.isSubmitted}
                    layout="info"
                    onClick={this.handleCancel}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </ButtonLink>
                  <Button
                    name="button"
                    icon="right"
                    layout="info"
                    disabled={this.state.isSubmitted}
                    onClick={this.handleSubmit}
                  >
                    {this.state.account ? 'Save' : 'Import'}
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Button>
                </div>
              </Form>
            )}
      </Page>
    );
  }
}

AccountEditorPage.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  vault: PropTypes.object.isRequired,
  saveAction: PropTypes.func.isRequired,
};

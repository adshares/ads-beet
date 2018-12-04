import React from 'react';
import bip39 from 'bip39';
import Form from '../components/atoms/Form';
import Button from '../components/atoms/Button';
import ButtonLink from '../components/atoms/ButtonLink';
import Box from '../components/atoms/Box';
import config from '../config';
import style from './RestorePage.css';

export default class RestorePage extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      password2: '',
      seedPhrase: '',
    };
    // This binding is necessary to make `this` work in the callback
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSeedPhraseChange = this.handleSeedPhraseChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRestoreSubmit = this.handleRestoreSubmit.bind(this);
  }

  validateSeedPhrase() {
    const seedPhrase = document.querySelector('[name=seedPhrase]');
    const mnemonic = this.state.seedPhrase;
    if (
      mnemonic.split(/\s+/g).length < 12 ||
      !bip39.validateMnemonic(mnemonic)
    ) {
      seedPhrase.setCustomValidity('Please provide a valid seed phrase');
      return false;
    }

    seedPhrase.setCustomValidity('');
    return true;
  }

  validatePasswords() {
    const password2 = document.querySelector('[name=password2]');
    if (this.state.password !== this.state.password2) {
      password2.setCustomValidity("Passwords don't match");
      return false;
    }

    password2.setCustomValidity('');
    return true;
  }

  handleInputChange(event, callback) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, callback);
  }

  handleSeedPhraseChange(event) {
    this.handleInputChange(event, this.validateSeedPhrase);
  }

  handlePasswordChange(event) {
    this.handleInputChange(event, this.validatePasswords);
  }

  handleRestoreSubmit(event) {
    if (this.validateSeedPhrase() && this.validatePasswords()) {
      event.preventDefault();
      event.stopPropagation();

      console.debug(this.state);
    }
  }

  render() {
    return (
      <div className={style.page}>
        <header>
          <h1>Restore the account</h1>
        </header>
        <Box type="warning">
          Restoring your account will overwrite all current data.
        </Box>
        <Form onSubmit={this.handleRestoreSubmit}>
          <div>
            <textarea
              autoFocus
              required
              placeholder="Seed phrase"
              name="seedPhrase"
              value={this.state.seedPhrase}
              onChange={this.handleSeedPhraseChange}
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="New password"
              minLength={config.passwordMinLength}
              name="password"
              value={this.state.password}
              onChange={this.handlePasswordChange}
            />
          </div>
          <div>
            <input
              type="password"
              autoFocus
              required
              placeholder="Confirm password"
              minLength={config.passwordMinLength}
              name="password2"
              value={this.state.password2}
              onChange={this.handlePasswordChange}
            />
          </div>
          <div className={style.buttons}>
            <ButtonLink className={style.cancel} to={'/'} inverse>Cancel</ButtonLink>
            <Button type="subbmit">Restore</Button>
          </div>
        </Form>
        <div className={style.restore}>

        </div>
      </div>
    );
  }
}
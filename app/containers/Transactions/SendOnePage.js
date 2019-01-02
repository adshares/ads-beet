import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faTimes, faCheck, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import {
  cleanForm,
  inputChanged,
  validateForm,
  transactionAccepted,
  transactionRejected,
} from '../../actions/transactionActions';
import TransactionPage from './TransactionPage';
import Form from '../../components/atoms/Form';
import Box from '../../components/atoms/Box';
import InputControl from '../../components/atoms/InputControl';
import CheckboxControl from '../../components/atoms/CheckboxControl';
import ButtonLink from '../../components/atoms/ButtonLink';
import Button from '../../components/atoms/Button';
import ADS from '../../utils/ads';
import { fieldLabels } from './labels';
import style from './TransactionPage.css';
import config from '../../config/config'

@connect(
  state => ({
    ...state.transactions[ADS.TX_TYPES.SEND_ONE]
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        cleanForm,
        inputChanged,
        validateForm,
        transactionAccepted,
        transactionRejected,
      },
      dispatch
    )
  })
)
export default class SendOnePage extends TransactionPage {
  constructor(props) {
    super(ADS.TX_TYPES.SEND_ONE, props);
  }

  renderForm() {
    const {
      inputs: { address, amount, message, rawMessage }
    } = this.props;
    return (
      <Form onSubmit={this.handleSubmit}>
        <InputControl
          name="address"
          label={fieldLabels.recipient}
          value={address.value}
          isValid={address.isValid}
          required
          isInput
          handleChange={this.handleInputChange}
          errorMessage={address.errorMsg}
        />
        <div className={style.amount}>
          <InputControl
            name="amount"
            label={fieldLabels.amount}
            value={amount.value}
            isValid={amount.isValid}
            required
            isInput
            type="number"
            handleChange={this.handleInputChange}
            errorMessage={amount.errorMsg}
          ><span>ADS</span></InputControl>
        </div>
        <div className={style.message}>
          <InputControl
            name="message"
            label={fieldLabels.message}
            value={message.value}
            isValid={message.isValid}
            rows={2}
            handleChange={this.handleInputChange}
            errorMessage={message.errorMsg}
          >
            <CheckboxControl
              name="rawMessage"
              label="Hexadecimal data"
              checked={rawMessage.value}
              handleChange={this.handleInputChange}
            />
          </InputControl>
        </div>
        <div className={style.buttons}>
          <ButtonLink
            to={this.getReferrer()}
            onClick={this.handleCloseForm}
            inverse
            icon="left"
            layout="info"
            disabled={this.props.isSubmitted}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </ButtonLink>
          <Button
            type="submit"
            icon="right"
            layout="info"
            disabled={this.props.isSubmitted}
          >Next <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </div>
      </Form>
    );
  }

  renderSuccessInfo() {
    const { transactionId, transactionFee } = this.props;
    const addressLink = `${config.operatorUrl}blockexplorer/transactions/`;

    return (
      <React.Fragment>
        <Box title="Success" layout="success" icon={faCheck} className={style.transactionSuccess}>
          Transaction id:
          <ButtonLink
            external
            href={`${addressLink}${transactionId}`}
            icon="right"
            layout="contrast"
            size="wide"
            target="_blank"
            rel="noopener noreferrer"
          >
            {transactionId}<FontAwesomeIcon icon={faExternalLinkAlt} />
          </ButtonLink>
          <small>Transaction fee:
            <b>{ADS.formatAdsMoney(transactionFee, 11, true)} ADS</b>
          </small>
        </Box>
        <ButtonLink
          to={this.getReferrer()}
          onClick={this.handleCloseForm}
          icon="left"
          layout="info"
          size="wide"
        >
          <FontAwesomeIcon icon={faTimes} /> Close
        </ButtonLink>
      </React.Fragment>
    );
  }
}

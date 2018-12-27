import {
  inputValidateSuccess,
  inputValidateFailure,
  formValidationSuccess,
  formValidationFailure,
  signTransaction,
} from '../actions/transactionActions';
import * as validators from '../utils/transactionValidators';
import ADS from '../utils/ads';

function sanitizeField(name, value, inputs) {
  let matches;
  switch (name) {
    case ADS.TX_FIELDS.AMOUNT:
      matches = value.match(/^([0-9]*)[.,]?([0-9]*)$/);
      return BigInt(matches[1] + matches[2].padEnd(11, '0'));
    default:
      return value;
  }
}

export function validateForm(transactionType) {
  return (dispatch, getState) => {
    const { transactions, vault } = getState();
    if (!transactions[transactionType]) {
      throw new Error(`Transaction ${transactionType} does not exist in store!`);
    }

    const { inputs } = transactions[transactionType];
    if (inputs) {
      const { isFormValid, actionsToDispatch } = Object.entries(inputs).reduce(
        (acc, [inputName, inputProps]) => {
          const validator = validators[inputName];
          let errorMsg = null;
          if (!validator) {
            throw new Error(`No validator is defined for name ${inputName}`);
          }

          if (typeof inputProps.shown === 'undefined' || inputProps.shown === true) {
            errorMsg = validator({ value: inputProps.value, inputs, transactionType, pageName: undefined });
          }
          const isInputValid = errorMsg === null;
          const action = isInputValid
            ? dispatch(inputValidateSuccess(transactionType, inputName))
            : dispatch(inputValidateFailure(transactionType, inputName, errorMsg));
          return {
            isFormValid: acc.isFormValid === false ? false : isInputValid,
            actionsToDispatch: [...acc.actionsToDispatch, action]
          };
        },
        { isFormValid: true, actionsToDispatch: [] }
      );

      if (isFormValid) {
        const account = vault.accounts[0];
        const command = {};
        command[ADS.TX_FIELDS.TYPE] = transactionType;
        command[ADS.TX_FIELDS.SENDER] = account.address;
        command[ADS.TX_FIELDS.MESSAGE_ID] = account.messageId;
        command[ADS.TX_FIELDS.TIME] = new Date();
        Object.keys(inputs).forEach((k) => {
          command[k] = sanitizeField(k, inputs[k].value);
        });
        const transactionData = ADS.encodeCommand(command);

        actionsToDispatch.concat([
          dispatch(signTransaction(transactionType, account.hash, transactionData)),
          dispatch(formValidationSuccess(transactionType)) // only for info purposes
        ]);
      } else {
        actionsToDispatch.push([
          dispatch(formValidationFailure(transactionType))
        ]); // to prevent from sendingg
      }

      return Promise.all(actionsToDispatch);
    }
    return Promise.resolve(dispatch(formValidationFailure(transactionType)));
  };
}

export function sendTransaction(transactionType) {

}

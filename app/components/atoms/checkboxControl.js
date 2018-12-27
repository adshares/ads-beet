import React from 'react';
import PropTypes from 'prop-types';
import style from './checkboxControl.css';

export const CheckboxControl = ({ checked, desc, handleChange }) => {
  const handleChanges = (e) => {
    if (e.keyCode && e.keyCode !== 13) return;
    handleChange(e.target.checked);
  };

  return (
    <div className={style.checkboxWrapper}>
      <input
        tabIndex="0"
        className={`${style.checkbox} ${ style.checkboxChecked}`}
        type="checkbox"
        id="check"
        checked={checked}
        onChange={handleChanges}
      />
      <label htmlFor="check" className={style.checked}>
        <svg viewBox={[0, 0, 50, 50].join()} className={style.checkedSvg}>
          <path d="M5 30 L 20 45 L 45 5" />
        </svg>
      </label>
      <span className={style.desc}>{desc}</span>
    </div>
  );
};

export default CheckboxControl;

CheckboxControl.propTypes = {
  checked: PropTypes.bool,
  desc: PropTypes.string.isRequired,
  handleChange: PropTypes.func,
};
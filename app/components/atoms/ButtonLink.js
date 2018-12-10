import React from 'react';
import { Link } from 'react-router-dom';
import style from './Button.css';

export default class ButtonLink extends React.Component {
  render() {
    const {
      className,
      children,
      layout,
      size,
      inverse,
      icon,
      ...rest
    } = { ...this.props };

    const classNames = [];
    classNames.push(style.button);
    if (layout) {
      classNames.push(style[layout]);
    }
    if (size) {
      classNames.push(style[size]);
    }
    if (inverse) {
      classNames.push(style.inverse);
    }
    if (icon) {
      classNames.push(style[`icon-${icon}`]);
    }
    if (className) {
      classNames.push(className);
    }
    const styleClassName = classNames.join(' ');
    return (
      <Link className={styleClassName} {...rest}>
        {children}
      </Link>
    );
  }
}

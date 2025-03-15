import PropTypes from 'prop-types';
import React from 'react';
import '../index.css';

const TextField = ({
  classes = '',
  helperText,
  label,
  name,
  placeholder = ' ',
  fieldClasses = '',
  ...rest
}) => {
  return (
    <div className={`text-field-wrapper ${classes}`}>
      <input
        className={`text-field ${fieldClasses}`}
        id={name}
        name={name}
        placeholder={placeholder}
        {...rest}
      />
      <label
        htmlFor={name}
        className='label-text'
      >
        {label}
      </label>
      {helperText && <p className='helper-text'>{helperText}</p>}
    </div>
  );
};

TextField.propTypes = {
  classes: PropTypes.string,
  helperText: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  fieldClasses: PropTypes.string,
};

export default TextField;
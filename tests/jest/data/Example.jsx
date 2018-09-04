// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import React from 'React';
import PropTypes from 'prop-types';

const propTypes = {
  example1: PropTypes.bool,
  example2: PropTypes.bool,
  example3: PropTypes.element,
  example4: PropTypes.node,
  example5: PropTypes.number,
  example6: PropTypes.string,
  example7: PropTypes.string,
  example8: PropTypes.arrayOf(PropTypes.string),
  example9: PropTypes.oneOf(['One', 'Two', 'Three']),
};

const defaultProps = {
  example1: true,
  example2: false,
  example5: 1,
  example6: 'Default',
  example9: 'Two',
};

const Example = ({
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8,
  example9,
}) => (
  <div>
    {example1}
    {example2}
    {example3}
    {example4}
    {example5}
    {example6}
    {example7}
    {example8}
    {example9}
  </div>
);

Example.propTypes = propTypes;
Example.defaultProps = defaultProps;

export default Example;

const fs = require('fs');
/* eslint-disable-next-line import/no-extraneous-dependencies */
const { parse } = require('react-docgen');
const Generator = require('../../../scripts/generator/Generator');

const { props = {} } = parse(fs.readFileSync('tests/jest/data/Example.jsx'));

describe('Generator', () => {
  describe('defaultValue', () => {
    it('should return the default value for a string property', () => {
      expect(Generator.defaultValue(props.example6).default).toEqual('Default');
    });

    it('should return the default value for an enum property', () => {
      expect(Generator.defaultValue(props.example9).default).toEqual('Two');
    });

    it('should return the default value for a number property', () => {
      expect(Generator.defaultValue(props.example5).default).toEqual(1);
    });

    it('should return the default value for a boolean property', () => {
      expect(Generator.defaultValue(props.example1).default).toEqual(true);
    });

    it('should return an empty object for a boolean property that defaults to false', () => {
      expect(Generator.defaultValue(props.example2)).toEqual({});
    });

    it('should return an empty object for a property with no default', () => {
      expect(Generator.defaultValue(props.example7)).toEqual({});
    });
  });

  describe('createProperty', () => {
    it('should return a formatted string property', () => {
      const property = Generator.createProperty('test', 'example6', props.example6);
      const expected = { default: 'Default', display: 'Example6', type: 'String' };
      expect(property).toEqual(expected);
    });

    it('should return a formatted boolean property', () => {
      const property = Generator.createProperty('test', 'example1', props.example1);
      const expected = { default: true, display: 'Example1', type: 'Bool' };
      expect(property).toEqual(expected);
    });

    it('should return a formatted boolean property with no default', () => {
      const property = Generator.createProperty('test', 'example2', props.example2);
      const expected = { display: 'Example2', type: 'Bool' };
      expect(property).toEqual(expected);
    });

    it('should return a formatted number property', () => {
      const property = Generator.createProperty('test', 'example5', props.example5);
      const expected = { default: 1, display: 'Example5', type: 'Number' };
      expect(property).toEqual(expected);
    });

    it('should return a formatted enum property', () => {
      const property = Generator.createProperty('test', 'example9', props.example9);
      const expected = {
        type: 'String', display: 'Example9', default: 'Two', form_type: 'CodifiedList', options: [{ display: 'One', value: 'One', type: 'String' }, { display: 'Two', value: 'Two', type: 'String' }, { display: 'Three', value: 'Three', type: 'String' }],
      };
      expect(property).toEqual(expected);
    });
  });

  describe('mergeProperties', () => {
    it('should return an object containing merged properties', () => {
      const config = { dependency: 'test' };
      const properties = Generator.mergeProperties(config, props, {});
      const expected = {
        example1: { default: true, display: 'Example1', type: 'Bool' },
        example2: { display: 'Example2', type: 'Bool' },
        example3: { display: 'Example3', type: 'Component' },
        example5: { default: 1, display: 'Example5', type: 'Number' },
        example6: { default: 'Default', display: 'Example6', type: 'String' },
        example7: { display: 'Example7', type: 'String' },
        example9: {
          default: 'Two', display: 'Example9', form_type: 'CodifiedList', options: [{ display: 'One', type: 'String', value: 'One' }, { display: 'Two', type: 'String', value: 'Two' }, { display: 'Three', type: 'String', value: 'Three' }], type: 'String',
        },
      };
      expect(properties).toEqual(expected);
    });

    it('should exclude ignored properties', () => {
      const config = { dependency: 'test', ignoredProperties: ['example2'] };
      const properties = Generator.mergeProperties(config, props, {});
      const expected = {
        example1: { default: true, display: 'Example1', type: 'Bool' },
        example3: { display: 'Example3', type: 'Component' },
        example5: { default: 1, display: 'Example5', type: 'Number' },
        example6: { default: 'Default', display: 'Example6', type: 'String' },
        example7: { display: 'Example7', type: 'String' },
        example9: {
          default: 'Two', display: 'Example9', form_type: 'CodifiedList', options: [{ display: 'One', type: 'String', value: 'One' }, { display: 'Two', type: 'String', value: 'Two' }, { display: 'Three', type: 'String', value: 'Three' }], type: 'String',
        },
      };
      expect(properties).toEqual(expected);
    });

    it('should delete removed properties', () => {
      const config = { dependency: 'test' };
      const existingProperties = {
        example1: { default: true, display: 'Example1', type: 'Bool' },
        example2: { display: 'Example2', type: 'Bool' },
        example3: { display: 'Example3', type: 'Component' },
        example5: { default: 1, display: 'Example5', type: 'Number' },
        example6: { default: 'Default', display: 'Example6', type: 'String' },
        example7: { display: 'Example7', type: 'String' },
        removedProperty: {},
      };
      const properties = Generator.mergeProperties(config, props, existingProperties);
      const expected = {
        example1: { default: true, display: 'Example1', type: 'Bool' },
        example2: { display: 'Example2', type: 'Bool' },
        example3: { display: 'Example3', type: 'Component' },
        example5: { default: 1, display: 'Example5', type: 'Number' },
        example6: { default: 'Default', display: 'Example6', type: 'String' },
        example7: { display: 'Example7', type: 'String' },
        example9: {
          default: 'Two', display: 'Example9', form_type: 'CodifiedList', options: [{ display: 'One', type: 'String', value: 'One' }, { display: 'Two', type: 'String', value: 'Two' }, { display: 'Three', type: 'String', value: 'Three' }], type: 'String',
        },
      };
      expect(properties).toEqual(expected);
    });

    it('should append new properties', () => {
      const config = { dependency: 'test' };
      const existingProperties = {
        example1: { default: true, display: 'Example1', type: 'Bool' },
        example3: { display: 'Example3', type: 'Component' },
        example7: { display: 'Example7', type: 'String' },
      };
      const properties = Generator.mergeProperties(config, props, existingProperties);
      const expected = {
        example1: { default: true, display: 'Example1', type: 'Bool' },
        example2: { display: 'Example2', type: 'Bool' },
        example3: { display: 'Example3', type: 'Component' },
        example5: { default: 1, display: 'Example5', type: 'Number' },
        example6: { default: 'Default', display: 'Example6', type: 'String' },
        example7: { display: 'Example7', type: 'String' },
        example9: {
          default: 'Two', display: 'Example9', form_type: 'CodifiedList', options: [{ display: 'One', type: 'String', value: 'One' }, { display: 'Two', type: 'String', value: 'Two' }, { display: 'Three', type: 'String', value: 'Three' }], type: 'String',
        },
      };
      expect(properties).toEqual(expected);
    });
  });

  describe('humanize', () => {
    it('should return a humanized string', () => {
      expect(Generator.humanize('examplePropertyName')).toEqual('Example property name');
    });

    it('should return a humanized string omitting an is prefix', () => {
      expect(Generator.humanize('isExamplePropertyName')).toEqual('Example property name');
    });
  });

  describe('titleize', () => {
    it('should return a titleize string', () => {
      expect(Generator.titleize('example-dependency-name')).toEqual('ExampleDependencyName');
    });

    it('should return a titleize string omitting the Terra prefix', () => {
      expect(Generator.titleize('terra-example-dependency-name')).toEqual('ExampleDependencyName');
    });

    it('should return a titleize string omitting the Form substring', () => {
      expect(Generator.titleize('terra-form-dependency-name')).toEqual('DependencyName');
    });

    it('should return a titleize string omitting the Clinical substring', () => {
      expect(Generator.titleize('terra-clinical-dependency-name')).toEqual('DependencyName');
    });
  });

  describe('namespace', () => {
    it('should return a file name namespaced by its dependency', () => {
      expect(Generator.namespace('example-dependency', 'FileName')).toEqual('ExampleDependencyFileName');
    });
  });

  describe('schema', () => {
    it('should return the schema for an arrayOf property type', () => {
      const expected = { schema: { type: 'String' } };
      expect(Generator.schema('dependency', 'prop', props.example8)).toEqual(expected);
    });

    it('should return the schema for an enum property type', () => {
      const expected = { form_type: 'CodifiedList', options: [{ display: 'One', type: 'String', value: 'One' }, { display: 'Two', type: 'String', value: 'Two' }, { display: 'Three', type: 'String', value: 'Three' }] };
      expect(Generator.schema('dependency', 'prop', props.example9)).toEqual(expected);
    });

    it('should return the schema for a node property type', () => {
      const expected = { schema: { type: 'Component' } };
      expect(Generator.schema('dependency', 'prop', props.example4)).toEqual(expected);
    });
  });

  describe('propertyType', () => {
    it('should return a boolean property type', () => {
      expect(Generator.propertyType('dependency', 'prop', props.example1)).toEqual('Bool');
    });

    it('should return a component property type', () => {
      expect(Generator.propertyType('dependency', 'prop', props.example3)).toEqual('Component');
    });

    it('should return a number property type', () => {
      expect(Generator.propertyType('dependency', 'prop', props.example5)).toEqual('Number');
    });

    it('should return a string property type', () => {
      expect(Generator.propertyType('dependency', 'prop', props.example6)).toEqual('String');
    });

    it('should return a string property type for an interpreted enum', () => {
      expect(Generator.propertyType('dependency', 'prop', props.example9)).toEqual('String');
    });
  });

  describe('enumType', () => {
    it('should return a string property type for an interpreted enum', () => {
      expect(Generator.enumType(props.example9)).toEqual('String');
    });
  });

  describe('enumList', () => {
    it('should return an enum list of codified options', () => {
      const expected = { form_type: 'CodifiedList', options: [{ display: 'One', type: 'String', value: 'One' }, { display: 'Two', type: 'String', value: 'Two' }, { display: 'Three', type: 'String', value: 'Three' }] };
      expect(Generator.enumList('dependency', 'props', props.example9)).toEqual(expected);
    });
  });
});

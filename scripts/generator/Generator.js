const fs = require('fs');
/* eslint-disable-next-line import/no-extraneous-dependencies */
const chalk = require('chalk');
/* eslint-disable-next-line import/no-extraneous-dependencies */
const { parse } = require('react-docgen');

/**
 * Supported Kaiju types.
 */
const SupportedTypes = {
  Array: 'Array',
  Bool: 'Bool',
  CodifiedList: 'CodifiedList',
  Component: 'Component',
  Number: 'Number',
  String: 'String',
};

/**
 * A map from react-docgen to Kaiju types.
 */
const TypeMap = {
  array: SupportedTypes.Array,
  arrayOf: SupportedTypes.Array,
  bool: SupportedTypes.Bool,
  element: SupportedTypes.Component,
  node: SupportedTypes.Array,
  number: SupportedTypes.Number,
  string: SupportedTypes.String,
};

class Generator {
  /**
   * Returns a hash containing the default value of the property.
   * @param {Object} property - The component property.
   * @return {Object} - A JSON object representing the property defaults.
   */
  static defaultValue(property) {
    const { type, defaultValue } = property;
    const { name } = type;
    const { value } = defaultValue || {};

    if (value === undefined || value === 'undefined' || value === 'null') {
      return {};
    }

    switch (name) {
      case 'bool':
        return value === 'true' ? { default: true } : {};
      case 'number':
        return { default: parseInt(defaultValue.value, 10) };
      case 'string':
        return { default: value.replace(/[']+/g, '') };
      case 'enum':
        return { default: value.replace(/[']+/g, '') };
      default:
        return {};
    }
  }

  /**
   * Creates a JSON representation of a property.
   * @param {string} dependency - The dependency name.
   * @param {string} prop - The property name.
   * @param {Object} property - The component property.
   * @return {Object|null} - A JSON object representing the property.
   */
  static createProperty(dependency, prop, property) {
    const type = Generator.propertyType(dependency, prop, property);

    if (type) {
      return {
        type,
        display: Generator.humanize(prop),
        ...Generator.defaultValue(property),
        ...Generator.schema(dependency, prop, property),
      };
    }

    return null;
  }

  /**
   * Combines existing properties with new properties.
   * @param {string} dependency - The React dependency.
   * @param {Object} props - All interpreted component properties.
   * @param {Object} properties - Existing properties.
   * @return {Object} - A hash containing all the properties.
   */
  static mergeProperties(dependency, props, properties) {
    const componentProps = { ...properties };

    // Generate new properties.
    Object.keys(props).filter(key => properties[key] === undefined).forEach((prop) => {
      const property = Generator.createProperty(dependency, prop, props[prop]);

      if (property) {
        componentProps[prop] = property;
      }
    });

    // Remove any properties that no longer exist.
    Object.keys(properties).filter(key => props[key] === undefined).forEach((prop) => {
      delete componentProps[prop];
    });

    return componentProps;
  }

  /**
   * Creates a JSON representation of the dependency.
   * @param {Object} dependency - The React dependency.
   * @return {Object} - A JSON representing the dependency.
   */
  static createJSON(data) {
    const {
      dependency,
      name,
      exported,
      subcomponent,
    } = data;

    const { main, description } = JSON.parse(fs.readFileSync(`node_modules/${dependency}/package.json`));

    const sourceFile = name || main.substring(main.lastIndexOf('/') + 1, main.lastIndexOf('.js'));
    const { props = {} } = parse(fs.readFileSync(`node_modules/${dependency}/src/${sourceFile}.jsx`));
    const { group = '', properties = {} } = Generator.retrieveJSON(`./kaiju/${sourceFile}.json`);

    const file = {
      name: Generator.titleize(name || dependency),
      library: dependency,
      display: Generator.titleize(name || dependency, ' '),
      description,
      group,
      ...subcomponent && { import: Generator.titleize(dependency) },
      ...exported && { import_from: `${dependency}/lib/${name}` },
      documentation: `http://engineering.cerner.com/terra-ui/#/components/${dependency}/${dependency.replace('terra-', '')}`,
      properties: Generator.mergeProperties(dependency, props, properties),
    };
    //
    // fs.writeFileSync(
    //   `./kaiju/${sourceFile}.json`,
    //   `${JSON.stringify({
    //     name: Generator.titleize(name || dependency),
    //     library: dependency,
    //     display: Generator.titleize(name || dependency, ' '),
    //     description,
    //     group,
    //     ...subcomponent && { import: Generator.titleize(dependency) },
    //     ...exported && { import_from: `${dependency}/lib/${name}` },
    //     documentation: `http://engineering.cerner.com/terra-ui/#/components/${dependency}/${dependency.replace('terra-', '')}`,
    //     properties: Generator.mergeProperties(dependency, props, properties),
    //   }, null, 2)}\n`,
    // );

    return file;
  }

  /**
   * Generates the JSON files for each dependency declared in the configuration.
   * @param {Object} config - The dependency configuration.
   */
  static generate(config) {
    const { dependencies } = config;

    Object.keys(dependencies).forEach((dependency) => {
      const { deprecated, exports = {}, subcomponents = {} } = dependencies[dependency];

      // Do not generate deprecated components.
      if (deprecated) {
        return;
      }

      Generator.createJSON({ dependency });
      Generator.generateExports(dependency, exports);
      Generator.generateSubcomponents(dependency, subcomponents);
    });
  }

  /**
   * Generates the JSON files for each subcomponent of the dependency.
   * @param {string} dependency - The library dependency.
   * @param {Object} subComponents - The dependency subcomponents.
   */
  static generateSubcomponents(dependency, subcomponents) {
    Object.keys(subcomponents).forEach((name) => {
      Generator.createJSON({ dependency, name, subcomponent: true });
    });
  }

  /**
   * Generates the JSON files for each export of the dependency.
   * @param {string} dependency - The library dependency.
   * @param {Object} exports - The dependency exports.
   */
  static generateExports(dependency, exports) {
    Object.keys(exports).forEach((name) => {
      Generator.createJSON({ dependency, name, exported: true });
    });
  }

  /**
   * Transforms a property name into a sentence.
   * @param {string} property - The property name.
   * @return {string} - A humanized string.
   */
  static humanize(property) {
    const result = property.replace(/([A-Z])/g, ' $1').toLowerCase().trim().split(' ');

    // Remove the "is" prefix from boolean properties.
    if (result[0] === 'is') {
      result.shift();
    }

    return result.join(' ').charAt(0).toUpperCase() + result.join(' ').slice(1);
  }

  /**
   * Transforms a string into titlecase. Removes the terra prefix.
   * Example:  terra-button-group -> ButtonGroup.
   * @param {string} string - The string to titleize
   * @param {string} delimiter - The delimiter to insert between words.
   * @return {string} - A titleized string.
   */
  static titleize(string, delimiter = '') {
    return string.split('-').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(delimiter);
  }

  /**
   * Retrieves the previously generated JSON if one exists.
   * @param {string} fileName - The file name.
   * @return {Object} - The JSON file.
   */
  static retrieveJSON(fileName) {
    if (fs.existsSync(fileName)) {
      return JSON.parse(fs.readFileSync(fileName));
    }
    return {};
  }

  /**
   * Returns the schema for the property.
   * @param {string} dependency - The dependency name.
   * @param {string} prop - The property name.
   * @param {Object} property - The component property.
   * @return {Object} - The property schema.
   */
  static schema(dependency, prop, property) {
    const { type } = property;
    const { name, value = {} } = type;
    const { name: schemaType } = value;

    switch (name) {
      case 'arrayOf':
        return schemaType ? { schema: { type: TypeMap[schemaType] } } : {};
      case 'enum':
        return Generator.enumList(dependency, prop, property);
      case 'node':
        return { schema: { type: 'Component' } };
      default:
        return {};
    }
  }

  /**
   * Determines the Kaiju property type. Null if unable to interpret.
   * @param {string} dependency - The dependency name.
   * @param {string} prop - The property name.
   * @param {Object} property - The component property.
   * @return {Object|null} - The property type.
   */
  static propertyType(dependency, prop, property) {
    const { type } = property;
    const { name } = type;

    if (TypeMap[name]) {
      return TypeMap[name];
    }

    if (name === 'enum') {
      const enumType = Generator.enumType(property);

      if (enumType) {
        return enumType;
      }

      // eslint-disable-next-line no-console
      console.warn(`${chalk.yellow('WARN:')} [${dependency}] Unable to interpret enum type for ${prop}. This prop requires manual entry.`);
    }

    return null;
  }

  /**
   * Returns the enum property type. Null if unable to interpret.
   * @param {Object} property - The component property.
   * @return {Object|null} - The property type.
   */
  static enumType(property) {
    const { type } = property;
    const { value, computed } = type;

    if (computed) {
      return null;
    }

    // Attempt to find a non-computed option. Computed options cannot be interpreted.
    const enumSample = value.find(option => option.computed === false);

    if (!enumSample) {
      return null;
    } else if (parseInt(enumSample.value, 10)) {
      return SupportedTypes.Number;
    } else if (enumSample.value.toString().indexOf('\'') > -1) {
      return SupportedTypes.String;
    }

    return null;
  }

  /**
   * Generates a codified list of options.
   * @param {string} dependency - The dependency name.
   * @param {string} prop - The property name.
   * @param {Object} property - The component property.
   * @return {array} - An array of codified options.
   */
  static enumList(dependency, prop, property) {
    const { type } = property;
    const { value: enumValues } = type;

    const enumType = Generator.enumType(property);

    const options = [];
    enumValues.forEach(({ value, computed }) => {
      if (computed) {
        // eslint-disable-next-line no-console
        console.warn(`${chalk.yellow('WARN:')} [${dependency}] Unable to interpret ${value} for ${prop}. This prop requires manual entry.`);
      } else {
        options.push({
          display: Generator.humanize(value.replace(/[']+/g, '')),
          value: value.replace(/[']+/g, ''),
          type: enumType,
        });
      }
    });

    return options.length > 0 ? { form_type: SupportedTypes.CodifiedList, options } : {};
  }
}

module.exports = Generator;

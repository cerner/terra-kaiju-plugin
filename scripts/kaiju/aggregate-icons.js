/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const glob = require('glob');
const template = require('./template');

/**
 * Indents a string.
 * @param {String} string - The string to indent.
 * @param {Integer} count - The number of indentations.
 * @return {String} - A string with the specified indentation.
 */
const indent = (string, count) => (
  string.replace(/^(?!\s*$)/mg, (' ').repeat(count))
);

const imports = [];
const iconMap = [];
glob.sync('node_modules/terra-icon/lib/icon/*.js').forEach((file) => {
  const fileName = file.split('/').pop();
  const iconName = fileName.substring(0, fileName.lastIndexOf('.'));
  const titleCase = `${iconName.split('Icon').pop().replace(/([A-Z])/g, ' $1').trim()} Icon`;
  const importFrom = `terra-icon/lib/icon/${iconName}`;

  fs.writeFileSync(`kaiju/icons/${iconName}.json`, JSON.stringify({
    ...template,
    name: iconName,
    display: titleCase,
    description: titleCase,
    import_from: importFrom,
  }, null, 2));

  // Build out the icon map.
  iconMap.push(`'${importFrom}': ${iconName},`);
  imports.push(`import ${iconName} from '${importFrom}';`);
});

const mapString = `\n\nconst iconMap = {\n${indent(iconMap.join('\n'), 2)}\n};`;

fs.writeFileSync(
  'iconMap.js',
  `${imports.join('\n')}${mapString}\n\nexport default iconMap;\n`,
);

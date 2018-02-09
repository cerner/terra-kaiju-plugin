/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const glob = require('glob');
const template = require('./template');

/**
 * Indents a string.
 * @param {string} string - The string to indent.
 * @param {number} count - The number of indentations.
 * @return {string} - A string with the specified indentation.
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

  // Build out the icon map.
  iconMap.push(`${iconName}: ${iconName},`);
  imports.push(`import ${iconName} from '${importFrom}';`);

  fs.writeFileSync(`kaiju/icons/${iconName}.json`, JSON.stringify({
    ...template,
    name: iconName,
    display: titleCase,
    description: titleCase,
    import_from: importFrom,
  }, null, 2));
});

// Generate the icon map file.
const mapString = `\n\nconst iconMap = {\n${indent(iconMap.join('\n'), 2)}\n};`;

fs.writeFileSync(
  'iconMap.js',
  `${imports.join('\n')}${mapString}\n\nexport default iconMap;\n`,
);

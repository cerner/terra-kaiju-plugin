/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const glob = require('glob');
const template = require('./template');

glob.sync('node_modules/terra-icon/lib/icon/*.js').forEach((file) => {
  const fileName = file.split('/').pop();
  const iconName = fileName.substring(0, fileName.lastIndexOf('.'));
  const titleCase = `${iconName.split('Icon').pop().replace(/([A-Z])/g, ' $1').trim()} Icon`;

  fs.writeFileSync(`kaiju/icons/${iconName}.json`, JSON.stringify({
    ...template,
    name: iconName,
    display: titleCase,
    description: titleCase,
    import_from: `terra-icon/lib/icon/${iconName}`,
  }, null, 2));
});

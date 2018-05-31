# terra-kaiju-plugin

[![Cerner OSS](https://img.shields.io/badge/Cerner-OSS-blue.svg?style=flat)](http://engineering.cerner.com/2014/01/cerner-and-open-source/)
[![Build Status](https://travis-ci.org/cerner/terra-kaiju-plugin.svg?branch=master)](https://travis-ci.org/cerner/terra-kaiju-plugin)

This is the [Kaiju](https://github.com/cerner/kaiju) plugin for Terra UI. The plugin provides a single project that will offer all terra-ui components to be used within Kaiju.

## Usage
Import the plugin into your node/kaiju-plugin.config.js file in your Kaiju node server.

```js
import TerraPlugin from 'terra-kaiju-plugin';

const config = {
  terra: {
    name: 'Terra',
    plugin: TerraPlugin,
  },
};
```

See Kaiju's [Plugin Guide](https://github.com/cerner/kaiju/tree/master/docs/kaiju_plugin_guide.md) for more information.

## Development notes
This module uses app-root-path to determine root path to the kaiju node server. This library determines the root path by walking up the current directory path to be one level below the last occurrence of 'node_modules'. This works great normally but can be incorrect when this module is setup as a file dependency because the directory is symlinked instead of copied. For this module to work as expected in development you cannot require this module as a file.

## History

[Releases](https://github.com/cerner/kaiju/releases)

## License

Copyright 2017 Cerner Innovation, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

const TerraPlugin = require('../../src/TerraPlugin');
const MemoryFS = require('memory-fs');
const fs = require('fs');

describe('TerraPlugin', () => {
  describe('projectDescription', () => {
    it('returns the description of the project', () => {
      expect(TerraPlugin.projectDescription()).toBe('The default Terra project');
    });
  });

  describe('componentModules', () => {
    it('returns the modules that contain kaiju jsons', () => {
      expect(TerraPlugin.componentModules()).toEqual(['kaiju-bundle']);
    });
  });

  describe('generateCode', () => {
    it('returns a fully formed code file in a vfs', (done) => {
      const memFs = new MemoryFS();
      const ast = JSON.parse(fs.readFileSync('./tests/jest/data/ast.json'));
      // console.log(JSON.stringify(ast, null, 2));
      TerraPlugin.generateCode(ast, memFs).then(([manifest, vfs]) => {
        expect(manifest).toEqual(['/src/code.jsx']);
        expect(vfs.readFileSync('/src/code.jsx')).toEqual(fs.readFileSync('./tests/jest/data/code.txt'));
        done();
      });
    });
  });

  describe('generatePreview', () => {
    it('returns previewable file in a vfs', (done) => {
      const memFs = new MemoryFS();
      const ast = JSON.parse(fs.readFileSync('./tests/jest/data/ast.json'));
      // console.log(JSON.stringify(ast, null, 2));
      TerraPlugin.generateCode(ast, memFs).then(([, vfs]) => {
        TerraPlugin.generatePreview(vfs, '/publicpath/').then(([entry, previewFs]) => {
          expect(entry).toEqual('preview.js');
          // I cheated, I just saved the file that was generated. I'd like to see you hand role a webpacked react component.
          // The downside here is that a lot of variables go into creating this file and it will have to be recreated.
          // fs.writeFileSync('./tests/jest/data/preview.txt', previewFs.readFileSync('/build/preview.js'));
          expect(previewFs.readFileSync('/build/preview.js')).toEqual(fs.readFileSync('./tests/jest/data/preview.txt'));
          done();
        });
      });
    });
  });
});

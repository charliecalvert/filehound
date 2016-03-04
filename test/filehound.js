const assert = require('assert');
const path = require('path');

const justFiles = qualifyNames(['/justFiles/a.json', '/justFiles/b.json', '/justFiles/dummy.txt']);
const nestedFiles = qualifyNames(['/nested/c.json', 'nested/d.json', '/nested/mydir/e.json']);
const textFiles = qualifyNames(['/justFiles/dummy.txt']);
const matchFiles = qualifyNames(['/mixed/aabbcc.json', '/mixed/ab.json']);

const FileHound = require('../lib/filehound');

function getAbsolutePath(file) {
  return path.join(__dirname + '/fixtures/', file);
}

function qualifyNames(names) {
  return names.map(getAbsolutePath);
}

describe('FileHound', () => {
  describe('.find', () => {
    const fixtureDir = __dirname + '/fixtures';

    it('returns all files in a given directory', () => {
      const query = FileHound.create()
        .path(fixtureDir + '/justFiles')
        .find();

      return query
        .then((files) => {
          assert.deepEqual(files, justFiles);
        });
    });

    it('returns files performing a recursive search', () => {
      const query = FileHound.create()
        .path(fixtureDir + '/nested')
        .find();

      return query
        .then((files) => {
          assert.deepEqual(files, nestedFiles);
        });
    });

    it('returns files for a given ext', () => {
      const query = FileHound.create()
        .ext('txt')
        .path(fixtureDir + '/justFiles')
        .find();

      return query
        .then((files) => {
          assert.deepEqual(files, textFiles);
        });
    });

    it('returns files for given match name', () => {
      const query = FileHound.create()
        .match('*ab*.json')
        .path(fixtureDir + '/mixed')
        .find();

      return query
        .then((files) => {
          assert.deepEqual(files.sort(), matchFiles);
        });
    });

    it('returns matching files for any query', () => {
      const jsonStartingWithZ = FileHound.create()
        .match('*.json')
        .path(fixtureDir + '/justFiles')
        .find();

      const onlyTextFles = FileHound.create()
        .ext('txt')
        .path(fixtureDir + '/justFiles')
        .find();

      const results = FileHound.any(jsonStartingWithZ, onlyTextFles);

      return results
        .then((files) => {
          assert.deepEqual(files, justFiles);
        });
    });

    it('returns files not matching the given query', () => {
      const notJsonStartingWithZ = FileHound.create()
        .match('*.json')
        .path(fixtureDir + '/justFiles')
        .not()
        .find();

      return notJsonStartingWithZ
        .then((files) => {
          assert.deepEqual(files, qualifyNames(['/justFiles/dummy.txt']));
        });
    });

    it('return files that match a given number of bytes', () => {
      const greaterThan10 = FileHound.create()
        .size(20)
        .path(fixtureDir + '/justFiles')
        .find();

      return greaterThan10
        .then((files) => {
          assert.deepEqual(files, qualifyNames(['/justFiles/b.json']));
        });
    });

    it('returns zero length files');
    it('returns max depth');
    it('returns contains');
  });
});

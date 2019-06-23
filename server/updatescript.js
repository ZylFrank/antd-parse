const fs = require('fs');
const path = require('path');
const semver = require('semver');
const async = require('async');
const initParse = require('./helper/initParse');

const Parse = initParse();

const updatesPath = path.join(__dirname, '/updates');
const Console = console;

const dashes = '------------------------------------------------';

exports.apply = callback => {
  let updateCount = 0;
  let skipCount = 0;

  const logError = () => {
    // eslint-disable-next-line no-undef
    for (let i = 0, len = arguments.length; i < len; i += 1) {
      // eslint-disable-next-line no-undef
      process.stderr.write(`${arguments[i]} \n`);
    }
  };

  const parseQuery = new Parse.Query('AppUpdates');
  const AppUpdates = Parse.Object.extend('AppUpdates');
  const applyUpdate = (file, done) => {
    parseQuery.equalTo('key', file);
    try {
      // eslint-disable-next-line consistent-return
      parseQuery.first().then(updateRecord => {
        if (!updateRecord) {
          const update = require(path.join(updatesPath, file)); // eslint-disable-line
          // skip updates that export a falsy value
          if (!update) {
            skipCount += 1;
            return done();
          }

          // ensure type
          if (typeof update !== 'function') {
            Console.log(
              `\nError in update file ./updates/${file}.js\nUpdate files must export a function\n`
            );
            process.exit();
          }

          Console.log(`${dashes}\nApplying update ${file}...`);
          update(err => {
            if (!err) {
              updateCount += 1;
              const appUpdates = new AppUpdates();
              appUpdates.set('key', file);
              appUpdates.save().then(() => {
                done();
              });
            } else {
              done(err);
            }
          });
        } else {
          done();
        }
      });
    } catch (e) {
      Console.error(`Error searching database for update ${file}:`);
      Console.error(e);
      done(e);
    }
  };

  if (!fs.existsSync(updatesPath)) {
    Console.log(
      '\nUpdate Error:\n\nAn updates folder must exist in your project root to use automatic updates.\n'
    );
    process.exit();
  }

  const updates = fs
    .readdirSync(updatesPath)
    .map(i => {
      // exclude non-javascript or coffee files in the updates folder
      return path.extname(i) !== '.js' && path.extname(i) !== '.coffee'
        ? false
        : path.basename(i, '.js');
    })
    .filter(i => {
      // exclude falsy values and filenames that without a valid semver
      return i && semver.valid(i.split('-')[0]);
    })
    .sort((a, b) => {
      // exclude anything after a hyphen from the version number
      return semver.compare(a.split('-')[0], b.split('-')[0]);
    });

  async.eachSeries(updates, applyUpdate, err => {
    if (updateCount || skipCount) {
      let status = '';
      if (updateCount) {
        status += `Successfully applied ${updateCount}`;
        if (skipCount) {
          status += ', ';
        }
      }
      if (skipCount) {
        status += `Skipped ${skipCount}`;
      }
      status += '.';

      Console.log(`${dashes}\n${status}\n${dashes}`);
    }
    if (err) {
      let errmsg = 'An error occurred applying updates.\n\nError details:';
      if (!(updateCount || skipCount)) {
        errmsg = `${dashes}\nerrmsg`;
      }
      logError(errmsg);
      logError(err);
      // wait till nextTick to exit so the trace completes.
      process.nextTick(() => {
        process.exit(1);
      });
      return;
    }
    callback && callback(); // eslint-disable-line no-unused-expressions
  });
};

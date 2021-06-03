const { spawn } = require('child_process');

function gitlog (from, to, format) {
  return new Promise ((resolve, reject) => {
    if (from && typeof from !== 'string') {
      return reject(new Error(`Invalid from range argument: ${from}`));
    }

    if (to && typeof to !== 'string') {
      return reject(new Error(`Invalid to range argument: ${to}`));
    }

    if (format && typeof format !== 'string') {
      return reject(new Error(`Invalid format argument: ${format}`));
    }

    // Default format to '%h %s'
    format = format || '%h %s';

    let args = ['log', '--oneline', `--format=${format}`];

    // Set commit range regarding the from and to args
    if (from && to) {
      args.push(`${from}^...${to}`);
    } else if (from) {
      args.push(`${from}^...`);
    } else if (to) {
      args.push(to);
    }

    let git = spawn('git', args);

    let stdout = Buffer.alloc(0);

    git.stdout.on('data', (chunk) => {
      stdout = Buffer.concat([stdout, chunk]);
    });

    let stderr = Buffer.alloc(0);

    git.stderr.on('data', (chunk) => {
      stderr = Buffer.concat([stderr, chunk]);
    });

    git.on('error', (error) => {
      reject(error);
    });

    git.on('close', (code) => {
      if (code !== 0) {
        // Codes other than 0 mean an error is thrown
        const error = new Error(stderr);

        // Pass error code to the caller
        error.code = code;

        reject(error);
      } else {
        // Convert to string and split based on end of line
        let subjects = stdout.toString().split('\n');

        // Pop the last empty string element
        subjects.pop();

        resolve(subjects);
      }
    });
  });
}

async function changelog (from, to, format) {
  const logs = await gitlog(from, to, format);

  return logs;
};

module.exports = { changelog };
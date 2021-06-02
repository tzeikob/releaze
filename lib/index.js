const { spawn } = require('child_process');

function gitlog (from, to) {
  return new Promise ((resolve, reject) => {
    let git;

    if (from && to) {
      git = spawn('git', ['log', '--oneline', '--format=%h %s', `${from}...${to}`]);
    } else {
      git = spawn('git', ['log', '--oneline', '--format=%h %s']);
    }

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

async function changelog (from, to) {
  const logs = await gitlog(from, to);

  return logs;
};

module.exports = { changelog };
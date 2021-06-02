const { spawn } = require('child_process');

function gitlog (from, to) {
  return new Promise ((resolve, reject) => {
    let git;
    
    if (from && to) {
      git = spawn('git', ['log', '--oneline', '--format=%h %s', `${from}...${to}`]);
    } else {
      git = spawn('git', ['log', '--oneline', '--format=%h %s']);
    }

    let buf = Buffer.alloc(0);

    git.stdout.on('data', (data) => {
      buf = Buffer.concat([buf, data])
    });

    git.stderr.on('data', (data) => {
      reject(new Error(data));
    });

    git.on('error', (error) => {
      reject(error);
    });

    git.on('close', (code) => {
      // Convert to string and split based on end of line
      let subjects = buf.toString().split('\n');

      // Pop the last empty string element
      subjects.pop();

      resolve(subjects);
    });
  });
}

async function changelog (from, to) {
  const logs = await gitlog(from, to);

  return logs;
};

module.exports = { changelog };
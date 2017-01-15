const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;

//Parse the line returning an array of tuples
const parseLine = (line) => {
  res = [];
  let count = 1;
  let prev = line.charAt(0);
  for(let i = 1; i < line.length; i++) {
    const char = line.charAt(i);
    if(prev === char) {
      count++;
    } else {
      res.push([count, prev]);
      count = 1;
    }
    prev = char;
  }
  res.push([count, prev]);
  return res;
};

// Parses a file designated by the file descriptor 
// returning a decoded version as a string.
const decompress = (fd) => {
  let res = '';
  const buffer = new Buffer(1);
  let num = true;
  let count = 0;
  while(true) {
    let bytesRead = fs.readSync(fd, buffer, 0, 1, null);
    if(bytesRead === 0) {
      break;
    }
    
    expect(buffer[0]).to.be.below(256);
    if(num) {
      count = buffer[0];
      if(count === 255) {
        res += '\n';
        continue;
      }
      num = !num;
    } else {
      const char = String.fromCharCode(buffer[0]);
      for(let i = 0; i < count; i++) {
        res += char;
      }
      num = !num;
    }
  }
  return res;
}

const encode = () => {
  const data = fs.readFileSync('data.txt', 'utf8').split('\n');
  fs.open('data.compressed', 'w', (err, fd) => {
    if (err) {
      throw err;
    }
    data.forEach((line, index) => {
      const countArr = parseLine(line);
      countArr.forEach((tuple) => {
        if(tuple[1] !== '') {
          fs.writeSync(fd, Buffer.alloc(1, tuple[0]), 0, 1, null);
          fs.writeSync(fd, Buffer.from(tuple[1], 'ascii'), 0, 1, null);
        } 
      });
      fs.writeSync(fd, Buffer.alloc(1, 255), 0, 1, null);
    });
  }); 
};

const decode = () => {
  let res = '';
  fs.open('data.compressed', 'r', (err, fd) => {
    if (err) {
      throw err;
    }
    fs.writeFileSync('output.txt', decompress(fd));
  });

};

encode();
decode();

const concat = require('concat');

build = async () =>{
  const files = [
    './dist/ng18-submission/browser/main.js',
    './dist/ng18-submission/browser/polyfills.js',
  ];

  await concat(files, '../../dspace-angular/libs/ng18-submission.js');
}
build();

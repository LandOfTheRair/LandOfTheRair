
console.info('Building Macicon font...');

const fs = require('fs');
const webfont = require('webfont').default;

const dir = `${__dirname}/../src/styles/macicons`;
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

const dir2 = `${__dirname}/../src/assets/fonts`;
if (!fs.existsSync(dir2)){
  fs.mkdirSync(dir2);
}

webfont({
  fontName: 'macicons',
  files: 'src/assets/macicons/*.svg',
  template: 'scss'
})
  .then(result => {
    fs.writeFileSync(`${__dirname}/../src/styles/macicons/macicons.scss`, result.styles.split('./macicons').join('/assets/fonts/macicons'));

    result.config.formats.forEach(format => {
      fs.writeFileSync(`${__dirname}/../src/assets/fonts/macicons.${format}`, result[format]);
    });

    return result;
  })
  .catch(error => {
    throw error;
  });

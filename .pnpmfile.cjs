function readPackage(pkg, context) {
  if (pkg.name === 'canvas' || pkg.name === 'sharp' || pkg.name === 'tesseract.js') {
    pkg.requiresBuild = true
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}

const selfsigned = require('selfsigned');
const fs = require('fs');

async function main() {
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 365 });
  fs.writeFileSync('ssl/key.pem', pems.private);
  fs.writeFileSync('ssl/cert.pem', pems.cert);
  console.log('SSL cert and key created in ssl/');
}

main().catch((err) => {
  console.error('Error generating cert:', err);
});
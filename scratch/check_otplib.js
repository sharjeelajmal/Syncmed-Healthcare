const { generateURI, generateSecret } = require('otplib');
const secret = generateSecret();
const uri = generateURI({
    secret,
    issuer: 'Healthcare',
    label: 'user@test.com',
    algorithm: 'sha1',
    digits: 6,
    step: 30
});
console.log('URI:', uri);

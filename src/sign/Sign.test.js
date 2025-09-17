import React from 'react';
import rs from 'jsrsasign';
import rsu from 'jsrsasign-util';

test('generateRSASignature' , async () => {
    const kp = rs.KEYUTIL.generateKeypair("RSA", 64);
})

test('generateKeys', async () => {
    const kp = rs.KEYUTIL.generateKeypair("RSA", 64);

    console.log(kp)
})
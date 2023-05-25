import { create } from 'ipfs-http-client'
const sharp = require('sharp')

async function uploadToIpfs(content) {
    const client =  create({ host: 'localhost', port: '5001', protocol: 'http' })
    const { cid } = await client.add(content, {
        cidVersion: 1
    })

    return cid.toString()
}

export default function handler(req, res) {
    uploadToIpfs(req.body).then((cid) => {
        res.status(200).json({"cid": cid})
    })
}
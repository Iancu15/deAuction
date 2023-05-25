import { create } from 'ipfs-http-client'

async function getFromIpfs(cid) {
    const client =  create({ host: 'localhost', port: '5001', protocol: 'http' })
    const response = client.cat(cid)
    for await (const file of response) {
        return Buffer.from(file).toString();
    }
}

export default function handler(req, res) {
    const { data } = req.body
    getFromIpfs(data).then((file) => {
        res.status(200).json(file)
    })
}  
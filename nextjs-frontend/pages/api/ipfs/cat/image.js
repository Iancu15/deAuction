import { create } from 'ipfs-http-client'

async function getFromIpfs(cid) {
    const client =  create({ host: 'localhost', port: '5001', protocol: 'http' })
    const response = client.cat(cid)
    var file = ""
    for await (const str of response) {
        file += Buffer.from(str).toString();
    }

    return file
}

export default function handler(req, res) {
    const { data } = req.body
    getFromIpfs(data).then((file) => {
        console.log(file)
        res.status(200).send(file)
    })
}  
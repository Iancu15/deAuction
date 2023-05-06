import { create } from 'ipfs-http-client'

async function getFromIpfs() {
    const client =  create({ host: 'localhost', port: '5001', protocol: 'http' })
    // client.cat(cid.toString(), (err, data) => {
    //   console.log(data.toString())
    //     if (err) {
    //       res.status(200).json();
    //     } else {
    //       console.log(data.toString());
    //     }
    // });
}

export default function handler(req, res) {
    getFromIpfs()

    res.status(200).json()
}  
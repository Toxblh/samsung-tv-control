import * as dgram from 'dgram'
import { Client, SsdpHeaders } from 'node-ssdp'
import * as request from 'request'

const SAMSUNG_TV_URN = 'urn:samsung.com:device'

interface TV {
  name: string
  model: string
  ip: string
  mac: string
}

class AutoSearch {
  private IPs: string[] = []
  private TVs: TV[] = []
  private client = new Client()

  constructor() {
    this.client.on('response', this.deviceUpdate.bind(this))
  }

  public search(time: number) {
    return new Promise<TV[]>((resolve, reject) => {
      this.client.search('ssdp:all')

      setTimeout(this.stopSearch.bind(this, resolve, reject), time || 5000)
    })
  }

  public deviceUpdate(headers: SsdpHeaders, _: number, rinfo: dgram.RemoteInfo) {
    if (headers && headers.ST && headers.ST.includes(SAMSUNG_TV_URN) && !this.IPs.includes(rinfo.address)) {
      this.IPs.push(rinfo.address)

      // TODO Add rotation Urls
      request.get({ url: `http://${rinfo.address}:8001/api/v2/` }, (err, res) => {
        if (!err && res.statusCode === 200) {
          const data = JSON.parse(res.body)

          this.TVs.push({
            name: data.device.name,
            model: data.device.modelName,
            ip: data.device.ip,
            mac: data.device.wifiMac
          })
        }
      })
    }
  }
  private stopSearch(resolve: (data: TV[]) => void) {
    this.client.stop()
    resolve(this.TVs)
  }
}

export default AutoSearch

// Example
// async function main() {
//   const autoSearch = new AutoSearch()
//   const tvs = await autoSearch.search(1000)
//   console.log(tvs)
// }

// main()

import * as dgram from 'dgram'
import { Client, SsdpHeaders } from 'node-ssdp'
import * as request from 'request'

const SAMSUNG_TV_URN = 'urn:samsung.com:device'

interface TV {
  name: string
  model: string
  ip: string
  wifiMac: string
}

interface Device {
  FrameTVSupport: string
  GamePadSupport: string
  ImeSyncedSupport: string
  OS: string
  TokenAuthSupport: string
  VoiceSupport: string
  countryCode: string
  description: string
  developerIP: string
  developerMode: string
  duid: string
  firmwareVersion: string
  id: string
  ip: string
  model: string
  modelName: string
  name: string
  networkType: string
  resolution: string
  smartHubAgreement: string
  ssid: string
  type: string
  udn: string
  wifiMac: string
}

interface SamsungInfo {
  device: Device
  id: string
  isSupport: string
  name: string
  remote: string
  type: string
  uri: string
  version: string
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

      setTimeout(this.stopSearch.bind(this, resolve, reject), time || 15000)
    })
  }

  public deviceUpdate(headers: SsdpHeaders, _: number, rinfo: dgram.RemoteInfo) {
    if ((headers && headers.ST && !headers.ST.includes(SAMSUNG_TV_URN)) || this.IPs.includes(rinfo.address)) {
      return
    }

    this.IPs.push(rinfo.address)

    // TODO Add rotation Urls
    request.get({ url: `http://${rinfo.address}:8001/api/v2/` }, (err: Error, res, body: string) => {
      if (err || res.statusCode !== 200) {
        return
      }

      const data: SamsungInfo = JSON.parse(body) as SamsungInfo

      this.TVs.push({
        ip: data.device.ip,
        model: data.device.modelName,
        name: data.device.name,
        wifiMac: data.device.wifiMac,
      })
    })
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

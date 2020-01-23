export interface Configuration {
  /** IP addess TV */
  ip: string
  /** MAC addess TV */
  mac: string
  /** Provide token for suppress notifications about access */
  token?: string
  /** Provide appString */
  appString?: string
  /** Provide tvAppString */
  tvAppString?: string
  /** Will show in notification how ask remote access. Default: NodeJS */
  nameApp?: string
  /** Verbose Mode */
  debug?: boolean
  /** Port, for old models 8001 (Default: 8002) */
  port?: number
  /** Autosave token (Default: false) */
  saveToken?: boolean
}

export interface App {
  appId: string
  app_type: number
  icon: string
  is_lock: number
  name: string
}

export interface Command {
  method: string
  params: {
    Cmd?: string
    DataOfCmd?: string
    Option?: string
    TypeOfRemote?: string
    data?: string | object
    event?: string
    to?: string
  }
}

export type WSData = {
  event?: string
  data?: {
    token?: string
    data?: App[]
  }
}

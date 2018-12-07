import { KEYS } from "./keys";

const WebSocket = require("ws");
const request = require("request");

export type Configuration = {
  ip: string;
  nameApp?: string;
};

module.exports = function(config: Configuration) {
  if (!config.ip) {
    throw new Error("You must provide IP in config");
  }

  const IP = config.ip;
  const PORT = "8002";
  const NAME_APP = Buffer.from(config.nameApp || "NodeJS Remote").toString(
    "base64"
  );

  return {
    sendKey: function(key: KEYS, done?: () => void) {
      var ws = new WebSocket(
        `wss://${IP}:${PORT}/api/v2/channels/samsung.remote.control?name=${NAME_APP}=&token=10985883`,
        { rejectUnauthorized: false }
      );

      ws.on("message", function(message: string) {
        var cmd = {
          method: "ms.remote.control",
          params: {
            Cmd: "Click",
            DataOfCmd: key,
            Option: "false",
            TypeOfRemote: "SendRemoteKey"
          }
        };

        // TODO: change to correct type
        const data: any = JSON.parse(message);
        if (data.event === "ms.channel.connect") {
          ws.send(JSON.stringify(cmd));
          ws.close();
        }
      });

      // TODO: change to correct type
      ws.on("response", function(response: any) {
        console.log(response);
        done && done();
      });

      // TODO: change to correct type
      ws.on("error", function(err: any) {
        let errorMsg = "";
        if (err.code === "EHOSTUNREACH" || err.code === "ECONNREFUSED") {
          errorMsg = "TV is off or unavalible";
        }
        console.error(errorMsg, err);
      });
    },

    isAvaliable: function() {
      request.get(
        { url: `http://${config.ip}:8001/api/v2/`, timeout: 3000 },
        function(err: any, res: { statusCode: number }) {
          if (!err && res.statusCode === 200) {
            console.info("TV is avaliable");
            return true;
          } else {
            console.error("No response from TV");
            return false;
          }
        }
      );
    }
    /**
    turnOn: () => {
      // WakeOnLan
      // Try to send powerButton
    }
     */
  };
};

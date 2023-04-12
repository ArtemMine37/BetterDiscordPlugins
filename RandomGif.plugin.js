/**
 * @name Random GIFs
 * @author ArtemMine37
 * @authorId 628564082185994240
 * @version 1.0.0
 * @invite 2ZkbJPHqJ6
 * @description Adds a slash command to send a random GIF (with parameters).
 */
/*@cc_on
@if (@_jscript)
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
var pathSelf = WScript.ScriptFullName;
shell.Popup("Don't try installing plugins with this method.\nClick OK to continue.", 0, "Hey!", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
shell.Popup("This plugin is already installed.", 0, "Info", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
shell.Popup("This plugin is intended only for BetterDiscord.\nAre you sure it's correct plugin or client?", 0, "Error", 0x10);
} else if (shell.Popup("Should I move myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
fs.MoveFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)));
shell.Exec("explorer " + pathPlugins);
shell.Popup("Plugin installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();
@else@*/
module.exports = (() => {
  const config = {
    info: {
      name: "RandomGif",
      authors: [
        {
          name: "ArtemMine37",
          discord_id: "628564082185994240",
          github_username: "Tharki-God",
        },
      ],
      version: "1.0.0",
      description: "Adds a slash command to send a random GIF.",
      github: "https://github.com/ArtemMine37/BetterDiscordPlugins",
      github_raw:
        "https://tharki-god.github.io/BetterDiscordPlugins/RandomGif.plugin.js",
    },
    changelog: [
      {
        title: "v1.0.0",
        items: [
          "First Release",
          "Based on Tharki-God's BunnyGirls plugin.",
        ],
      },
    ],
    main: "RandomGif.plugin.js",
  };
  const RequiredLibs = [{
    window: "ZeresPluginLibrary",
    filename: "0PluginLibrary.plugin.js",
    external: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
    downloadUrl: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
  },
  {
    window: "BunnyLib",
    filename: "1BunnyLib.plugin.js",
    external: "https://github.com/Tharki-God/BetterDiscordPlugins",
    downloadUrl: "https://tharki-god.github.io/BetterDiscordPlugins/1BunnyLib.plugin.js"
  },
  ];
  class handleMissingLibrarys {
    load() {
      for (const Lib of RequiredLibs.filter(lib => !window.hasOwnProperty(lib.window)))
        BdApi.showConfirmationModal(
          "Library Missing",
          `(${Lib.window}) needed for ${config.info.name} is missing. Click Download to install it.`,
          {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => this.downloadLib(Lib),
          }
        );
    }
    async downloadLib(Lib) {
      const fs = require("fs");
      const path = require("path");
      const { Plugins } = BdApi;
      const LibFetch = await fetch(
        Lib.downloadUrl
      );
      if (!LibFetch.ok) return this.errorDownloadLib(Lib);
      const LibContent = await LibFetch.text();
      try {
        await fs.writeFile(
          path.join(Plugins.folder, Lib.filename),
          LibContent,
          (err) => {
            if (err) return this.errorDownloadLib(Lib);
          }
        );
      } catch (err) {
        return this.errorDownloadLib(Lib);
      }
    }
    errorDownloadZLib(Lib) {
      const { shell } = require("electron");
      BdApi.showConfirmationModal(
        "Sorry, but there's a problem",
        [
          `We can't download ${Lib.window}. Install plugin from the link below.`,
        ],
        {
          confirmText: "Download",
          cancelText: "Cancel",
          onConfirm: () => {
            shell.openExternal(
              Lib.external
            );
          },
        }
      );
    }
    start() { }
    stop() { }
  }
  return RequiredLibs.some(m => !window.hasOwnProperty(m.window))
    ? handleMissingLibrarys
    : (([Plugin, ZLibrary]) => {
      const {
        PluginUpdater,
        Logger,
        DiscordModules: { MessageActions },
      } = ZLibrary;
      const { LibraryUtils, ApplicationCommandAPI } = BunnyLib.build(config);
      return class RandomGif extends Plugin {
        checkForUpdates() {
          try {
            PluginUpdater.checkForUpdate(
              config.info.name,
              config.info.version,
              config.info.github_raw
            );
          } catch (err) {
            Logger.err("Plugin Updater could not be reached.", err);
          }
        }
        start() {
          this.checkForUpdates();
          this.addCommand();
        }
        addCommand() {
          ApplicationCommandAPI.register(config.info.name, {
            name: "randomgif",
            displayName: "Random Gif",
            displayDescription: "Sends a random GIF.",
            description: "Sends a random GIF.",
            type: 1,
            target: 1,
            execute: async ([send], { channel }) => {
              try {
                const GIF = await this.getGif(send.value);
                if (!GIF)
                  return MessageActions.receiveMessage(
                    channel.id,
                    LibraryUtils.FakeMessage(
                      channel.id,
                      "Failed to get any GIF."
                    )
                  );
                send.value
                  ? MessageActions.sendMessage(
                    channel.id,
                    {
                      content: GIF,
                      tts: false,
                      bottom: true,
                      invalidEmojis: [],
                      validNonShortcutEmojis: [],
                    },
                    undefined,
                    {}
                  )
                  : MessageActions.receiveMessage(
                    channel.id,
                    LibraryUtils.FakeMessage(channel.id, "", [GIF])
                  );
              } catch (err) {
                Logger.err(err);
                MessageActions.receiveMessage(
                  channel.id,
                  LibraryUtils.FakeMessage(
                    channel.id,
                    "Failed to get any random GIF."
                  )
                );
              }
            },
            options: [
              {
                description: "Whether you want to send this or not.",
                displayDescription: "Whether you want to send this or not.",
                displayName: "Send",
                name: "Send",
                required: true,
                type: 5,
              },
            ],
          });
        }
        async getGif(send) {
          const response = await fetch(
            "https://g.tenor.com/v1/random?q=terraria&key=ZVWM77CCK1QF&limit=50"
          );
          if (!response.ok) return;
          const data = await response.json();
          const GIF = Object.values(data.results)[LibraryUtils.randomNo(0, 50)];
          return send
            ? GIF.itemurl
            : {
              image: {
                url: GIF.media[0].gif.url,
                proxyURL: GIF.media[0].gif.url,
                width: GIF.media[0].gif.dims[0],
                height: GIF.media[0].gif.dims[1],
              },
            };
        }
        onStop() {
          ApplicationCommandAPI.unregister(config.info.name);
        }
      };
    })(ZLibrary.buildPlugin(config));
})();
/*@end@*/

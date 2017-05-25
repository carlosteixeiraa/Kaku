const Remote = require('electron').remote;
const App = Remote.app;
const Dialog = Remote.dialog;

import os from 'os';
import Path from 'path';
import AppCore from './AppCore';
import Constants from './Constants';
import L10nManager from './L10nManager';
import { Downloader } from 'kaku-core/modules/YoutubeDL';
import { autoUpdater } from "electron-updater";

const _ = L10nManager.get.bind(L10nManager);
const ytdlDownloader = new Downloader();
ytdlDownloader.setPath(App.getPath('userData'))

class AutoUpdater {
  constructor() {
    if (AppCore.isDev()) {
      return;
    }

    if (os.platform() !== 'darwin' && os.platform() !== 'win32') {
      return;
    }

    // disable autoupdate for win32
    if (os.platform() === 'win32' && os.platform() !== 'x64') {
      return;
    }

    this._hasFeedUrl = true;

    autoUpdater.on('checking-for-update', (e) => {
      console.log('found a new update');
    });

    autoUpdater.on('update-available', (e) => {
      console.log('update is available');
    });

    autoUpdater.on('update-not-available', (e) => {
      console.log('update not available');
    });

    autoUpdater.on('error', (error) => {
      console.log(error);
    });

    autoUpdater.on('update-downloaded',
      (e, releaseNotes, releaseName, releaseDate, updateURL) => {
        console.log('update downloaded');

        let title = _('autoupdater_found_update_title');
        let message = _('autoupdater_found_update_message', {
          version:  releaseName
        });

        Dialog.showMessageBox({
          type: 'question',
          title: title,
          message: message,
          buttons: [
            _('autoupdater_yes_button_wording'),
            _('autoupdater_no_button_wording')
          ],
          cancelId: -1
        }, (response) => {
          if (response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    });
  }

  updateApp() {
    autoUpdater.checkForUpdates();
  }

  updateYoutubeDl(force=false) {
    return ytdlDownloader.save(os.platform(), force);
  }
}

module.exports = new AutoUpdater();

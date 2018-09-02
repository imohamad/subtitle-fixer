import { Component, OnInit } from "@angular/core";
import { ElectronService } from "../../providers/electron.service";
var iconv = require("iconv-lite");
var path = require("path");
import { shell } from "electron";

import { UploadEvent, UploadFile, FileSystemFileEntry } from "ngx-file-drop";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  status: String = "";
  public files: UploadFile[] = [];

  constructor(private electron: ElectronService) {}

  ngOnInit() {}

  closeWindow() {
    this.electron.window.close();
  }

  minimizeWindow() {
    this.electron.window.minimize();
  }
  openBrowser(url: string) {
    shell.openExternal(url);
  }

  public dropped(event: UploadEvent) {
    this.files = event.files;
    for (const droppedFile of event.files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.status = "Subtitle Fixed";
          this.changeEncoding(file.path, file.name);
        });
      } else {
        this.status = "Is Directory.";
      }
    }
  }

  public fileOver(event) {
    this.status = "wow cool";
  }

  public fileLeave(event) {
    this.status = "";
  }

  changeEncoding(subtitlePath: string, subtitleName: string) {
    if (path.extname(subtitlePath) !== ".srt") {
      return (this.status = "file format must be SRT!");
    }
    const content = this.electron.fs.readFileSync(subtitlePath);

    this.electron.fs.writeFileSync(
      `${path.dirname(subtitlePath)}\\fixed_${subtitleName}`,
      iconv.decode(content, "windows-1256")
    );
  }
}

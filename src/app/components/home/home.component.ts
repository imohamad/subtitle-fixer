import { Component, OnInit } from "@angular/core";
import { ElectronService } from "../../providers/electron.service";
var iconv = require("iconv-lite");
var path = require("path");
import { shell } from "electron";
const isUtf8 = require("isutf8");
import { convert } from "arabic-to-persian";

import { UploadEvent, UploadFile, FileSystemFileEntry } from "ngx-file-drop";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  status: String = "";
  public files: UploadFile[] = [];
  loading: boolean;

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
          this.loading = true;
          this.changeEncoding(file.path, file.name); //send file path
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

    this.electron.fs.readFile(subtitlePath, (error, content) => {
      if (error) {
        throw error;
      } else {
        if (isUtf8(content)) {
          this.electron.fs.writeFile(
            `${path.dirname(subtitlePath)}\\fixed_${subtitleName}`,
            convert(content.toString()),
            error => {
              if (error) {
                throw error;
              } else {
                this.loading = false;
                this.status = "Subtitle Fixed";
              }
            }
          );
        } else {
          content = iconv.decode(content, "windows-1256");

          this.electron.fs.writeFile(
            `${path.dirname(subtitlePath)}\\fixed_${subtitleName}`,
            convert(content.toString()),
            error => {
              if (error) {
                throw error;
              } else {
                this.loading = false;
                this.status = "Subtitle Fixed";
              }
            }
          );
        }
      }
    });
  }
}

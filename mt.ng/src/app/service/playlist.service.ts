import { RequestService } from "./request.service";
import { Injectable } from "@angular/core";
import { Observable, NEVER } from "rxjs";
import { Song } from "../model/song.interface";
import { Playlist } from "../model/playlist.interface";

@Injectable({
  providedIn: "root",
})
export class PlaylistService {
  public constructor(private requestService: RequestService) {}

  public addSong(song: Song): Observable<Song> {
    // console.log('addSong send', JSON.stringify(song));
    // return this.requestService.postRequest<Song>('http://localhost:54536/playlist', JSON.stringify(song));
    return NEVER;
  }

  public getPlaylist(): Observable<Playlist> {
    // return this.requestService.getRequest<Playlist>('http://localhost:54536/playlist');
    return NEVER;
  }

  public deletePlaylist(): Observable<Playlist> {
    // return this.requestService.deleteRequest<Playlist>('http://localhost:54536/playlist');
    return NEVER;
  }

  public getCurrentSong() {}
}

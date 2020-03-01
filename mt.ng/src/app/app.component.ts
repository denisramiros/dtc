import { Component, OnInit } from '@angular/core';
import { PlaylistService } from './service/playlist.service';
import { Song } from './model/song.interface';
import { Playlist } from './model/playlist.interface';

@Component({
    selector: 'mt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'mt';
    public playlist: Playlist;
    public newSongUrl: string;

    public constructor(private playlistService: PlaylistService) {}

    public ngOnInit() {
        this.onRefreshClick();
    }

    public onRefreshClick(): void {
        this.playlistService.getPlaylist().subscribe(pl => {
            console.log('retreived playlist', pl);
            this.playlist = pl;
        });
    }

    public onDeleteClick(): void {
        this.playlistService.deletePlaylist().subscribe(r => {});
    }

    public onAddClick(): void {
        this.playlistService.addSong({ url: this.newSongUrl, length: (Math.floor(Math.random() * 3) + 1) * 60 }).subscribe(r => {});
    }
}

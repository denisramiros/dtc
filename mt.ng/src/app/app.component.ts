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
        this.playlistService.addSong({ url: Guid.newGuid(), length: (Math.floor(Math.random() * 3) + 1) * 60 }).subscribe(r => {});
    }
}

class Guid {
    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

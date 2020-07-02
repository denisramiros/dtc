import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlaylistService } from './service/playlist.service';
import { Song } from './model/song.interface';
import { Playlist } from './model/playlist.interface';
import { YouTubePlayer } from '@angular/youtube-player';
import { viewClassName } from '@angular/compiler';

@Component({
    selector: 'mt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    public songs: Song[] = [];
    public playerVars;

    public get currentSong(): Song {
        return this.songs[0];
    }

    @ViewChild('newItem') public input: ElementRef;
    @ViewChild('player') public player: any;

    public constructor(private playlistService: PlaylistService) {}

    public ngOnInit() {
        this.playlistService.getPlaylist().subscribe(pl => {
            this.songs = pl;
        });
    }

    public onPlayerReady(): void {
        // this.player.playerVars = {
        //     autoplay: 1,
        //     controls: 0,
        // };

        this.player.playVideo();
    }

    public onDeleteClick(key: string): void {
        this.playlistService.deleteSong(key);
    }

    public onAddClick(url: string): void {
        if (!url || url.length === 0) {
            return;
        }
        this.input.nativeElement.value = '';
        url = url.match(/[A-Za-z0-9_\-]{11}/)[0];
        this.playlistService.addSong({ url, length: (Math.floor(Math.random() * 3) + 1) * 60 } as Song).subscribe(r => {});
    }
}

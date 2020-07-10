import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Song } from './model/song.interface';
import { PlaylistService } from './service/playlist.service';

@Component({
    selector: 'mt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    public songs: Song[] = [];
    public currentSongIndex = 0;
    public currentSongStartSeconds = 5;

    public get currentSong(): Song {
        return this.songs && this.songs.length > this.currentSongIndex ? this.songs[this.currentSongIndex] : null;
    }

    @ViewChild('newItem') public input: ElementRef;
    @ViewChild('player') public player: any;

    public constructor(private playlistService: PlaylistService) {}

    public ngOnInit() {
        this.playlistService.getPlaylist().subscribe(pl => {
            this.songs = pl;
            this.calcCurrentSong();
        });
    }

    public calcCurrentSong(): void {
        if (!this.songs || this.songs.length === 0) {
            return;
        }
        const now = new Date();
        let diff: number = now.valueOf() / 1000 - this.songs[0].added.valueOf() / 1000;
        let i = 0;
        let l = 0;
        while (diff > 0 && i < this.songs.length) {
            if (i === 0 || this.addSeconds(this.songs[i - 1].added, l) < this.songs[i].added) {
                diff = now.valueOf() / 1000 - this.songs[i].added.valueOf() / 1000;
                l = this.songs[i].length;
                diff -= l;
            } else if (this.addSeconds(this.songs[i - 1].added, l) >= this.songs[i].added) {
                diff -= this.songs[i].length;
                l += this.songs[i].length;
            }
            i++;
        }
        if (diff > 0) {
            this.currentSongIndex = this.songs.length;
            this.currentSongStartSeconds = 0;
        } else if (diff === 0) {
            this.currentSongIndex = i;
            this.currentSongStartSeconds = 0;
        } else if (diff < 0) {
            this.currentSongIndex = --i;
            this.currentSongStartSeconds = this.songs[i].length + diff;
        }
    }

    public onPlayerReady(): void {
        this.player.playVideo();
    }

    public onDeleteClick(key: string): void {
        this.playlistService.deleteSong(key);
    }

    public onAddClick(id: string): void {
        if (!id || id.length === 0) {
            return;
        }
        this.input.nativeElement.value = '';
        id = id.match(/[A-Za-z0-9_\-]{11}/)[0];
        this.playlistService
            .getDurationOfSong(id)
            .subscribe(l => this.playlistService.addSong({ id, length: l, added: new Date().toString() } as Song));
    }

    private addSeconds(date: Date, seconds: number): Date {
        const d = new Date(date.getTime());
        d.setSeconds(date.getSeconds() + seconds);
        return d;
    }
}

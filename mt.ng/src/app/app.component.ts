import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Song } from './model/song.interface';
import { PlaylistService } from './service/playlist.service';
import { YouTubePlayer } from '@angular/youtube-player';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'mt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    private unsubscribe = new Subject<boolean>();
    private lastState: number;

    public songs: Song[] = [];
    public currentSongIndex = 0;
    public currentSongStartSeconds = 0;
    public playerIframe: YT.Player;

    public get currentSong(): Song {
        return this.songs && this.songs.length > this.currentSongIndex ? this.songs[this.currentSongIndex] : null;
    }

    @ViewChild('newItem') public input: ElementRef;
    @ViewChild('player') public player: YouTubePlayer;

    public constructor(private playlistService: PlaylistService) {}

    public ngOnInit() {
        if (window.YT) {
            this.startVideo();
        }
        window.onYouTubeIframeAPIReady = () => this.startVideo();

        this.playlistService
            .getPlaylist()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(pl => {
                this.songs = pl;
                this.calcCurrentSong();
            });
    }

    private startVideo(): void {
        this.playerIframe = new window.YT.Player('player', {
            videoId: 'lrrXRv6s-C4',
            playerVars: {
                autoplay: 0,
                controls: 1,
            },
            events: {
                onReady: this.onPlayerReady.bind(this),
                onStateChange: this.onPlayerStateChange.bind(this),
            },
        });
    }

    public calcCurrentSong(): void {
        if (!this.songs || this.songs.length === 0) {
            return;
        }
        const now = new Date();
        let diff = 1;
        let i = 0;
        let l = 0;
        this.currentSongStartSeconds = 0;
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

    public onPlayerReady(event?: any): void {
        this.calcCurrentSong();
        if (this.currentSong) {
            this.playerIframe.loadVideoById(this.currentSong.id, this.currentSongStartSeconds);
        } else {
            this.playerIframe.pauseVideo();
        }
    }

    public onPlayerStateChange(event: any): void {
        if (event.data === 0) {
            this.calcCurrentSong();
            this.playerIframe.loadVideoById(this.currentSong.id, this.currentSongStartSeconds);
        } else if (event.data === 1 && this.lastState === 2) {
            this.calcCurrentSong();
            this.playerIframe.seekTo(this.currentSongStartSeconds, true);
        }
        this.lastState = event.data;
    }

    public onDeleteClick(key: string): void {
        this.currentSongIndex++;
        if (this.currentSong) {
            this.playerIframe.loadVideoById(this.currentSong.id, 0);
        } else {
            this.playerIframe.pauseVideo();
        }
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
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(l => this.playlistService.addSong({ id, length: l, added: new Date().toString() } as Song));
    }

    private addSeconds(date: Date, seconds: number): Date {
        const d = new Date(date.getTime());
        d.setSeconds(date.getSeconds() + seconds);
        return d;
    }

    public ngOnDestroy() {
        this.unsubscribe.next(true);
        this.unsubscribe.complete();
    }
}

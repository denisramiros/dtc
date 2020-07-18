import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Song } from './model/song.interface';
import { PlaylistService } from './service/playlist.service';
import * as _ from 'lodash';

@Component({
    selector: 'mt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    private unsubscribe = new Subject<boolean>();
    private lastState: number;
    private lastCurrentSong: Song;
    private firstTime = true;

    private _currentSongStartSeconds = 0;

    public songs: Song[] = [];
    public currentSong: Song;
    public playerIframe: YT.Player;
    public set currentSongStartSeconds(seconds: number) {
        this._currentSongStartSeconds = seconds;
    }
    public get currentSongStartSeconds() {
        return Math.floor(this._currentSongStartSeconds);
    }

    @ViewChild('newItem') public input: ElementRef;

    public constructor(private playlistService: PlaylistService) {}

    public ngOnInit() {
        if (window.YT) {
            this.startVideo();
        }
        window.onYouTubeIframeAPIReady = () => this.startVideo();
    }

    public ngAfterViewInit() {
        this.playlistService
            .getPlaylist()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(pl => {
                this.songs = pl;
                this.calcCurrentSong();
                if (!this.firstTime) {
                    this.loadCurrentSong();
                }
                this.firstTime = false;
            });
    }

    private startVideo(): void {
        this.playerIframe = new window.YT.Player('player', {
            videoId: 'dQw4w9WgXcQ',
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

    private calcCurrentSong(): void {
        if (!this.songs || this.songs.length === 0) {
            this.lastCurrentSong = _.cloneDeep(this.currentSong);
            // this.currentSongIndex = -1;
            this.currentSong = null;
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
            this.lastCurrentSong = _.cloneDeep(this.currentSong);
            this.currentSong = null;
            this.currentSongStartSeconds = 0;
        } else if (diff === 0) {
            this.currentSong = this.songs[i];
            this.currentSongStartSeconds = 0;
        } else if (diff < 0) {
            i--;
            if (this.songs[i]?.id != this.currentSong?.id) {
                this.lastCurrentSong = _.cloneDeep(this.currentSong);
                this.currentSongStartSeconds = 0;
            } else {
                this.currentSongStartSeconds = this.songs[i].length + diff;
            }
            this.currentSong = this.songs[i];
        }
    }

    public onPlayerReady(): void {
        this.playerIframe.mute();
        this.loadCurrentSong();
    }

    public onPlayerStateChange(event: any): void {
        if (event.data === YT.PlayerState.ENDED) {
            this.calcCurrentSong();
            this.playerIframe.loadVideoById(this.currentSong?.id, 0);
        } else if (event.data === YT.PlayerState.PLAYING && this.lastState === YT.PlayerState.PAUSED) {
            this.calcCurrentSong();
            this.playerIframe.seekTo(this.currentSongStartSeconds, true);
        }
        this.lastState = event.data;
    }

    public onDeleteClick(key: string): void {
        this.playlistService.deleteSong(key);
    }

    public onAddClick(url: string): void {
        if (!url || url.length === 0) {
            return;
        }
        this.input.nativeElement.value = '';
        const id = this.getIdFromUrl(url);
        this.playlistService
            .getDurationOfSong(id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(l => this.playlistService.addSong({ id, length: l, added: new Date().toString() } as Song));
    }

    private loadCurrentSong(): void {
        if (this.getIdFromUrl(this.playerIframe.getVideoUrl()) !== this.currentSong?.id) {
            if (this.currentSong) {
                this.playerIframe.loadVideoById(this.currentSong?.id, this.currentSongStartSeconds);
            } else {
                this.playerIframe.pauseVideo();
            }
        }
    }

    private addSeconds(date: Date, seconds: number): Date {
        const d = new Date(date.getTime());
        d.setSeconds(date.getSeconds() + seconds);
        return d;
    }

    private getIdFromUrl(url: string): string {
        return url.match(/[A-Za-z0-9_\-]{11}/)[0];
    }

    public ngOnDestroy() {
        this.unsubscribe.next(true);
        this.unsubscribe.complete();
    }
}

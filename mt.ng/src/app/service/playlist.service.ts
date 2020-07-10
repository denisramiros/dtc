import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import * as moment from 'moment';
import { NEVER, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Song } from '../model/song.interface';
import { RequestService } from './request.service';

@Injectable({
    providedIn: 'root',
})
export class PlaylistService {
    private listRef: AngularFireList<Song>;
    public constructor(private requestService: RequestService, private db: AngularFireDatabase) {
        this.listRef = this.db.list<Song>('playlist');
    }

    public addSong(song: Song): Observable<Song> {
        this.listRef.push(song);
        return NEVER;
    }

    public getPlaylist(): Observable<Song[]> {
        const list = this.listRef
            .snapshotChanges()
            .pipe(
                map(changes =>
                    changes.map(c => ({ key: c.payload.key, ...c.payload.val(), added: new Date(c.payload.val().added) } as Song))
                )
            );
        return list;
    }

    public getDurationOfSong(id: string) {
        const s = this.requestService.getRequest<any>(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${environment.youtubeKey}`
        );
        return s.pipe(map(o => moment.duration(o.items[0].contentDetails.duration).asSeconds()));
    }

    public deleteSong(key: string): void {
        this.listRef.remove(key);
    }
}

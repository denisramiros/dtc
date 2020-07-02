import { RequestService } from './request.service';
import { Injectable } from '@angular/core';
import { Observable, NEVER } from 'rxjs';
import { Song } from '../model/song.interface';
import { Playlist } from '../model/playlist.interface';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map } from 'rxjs/operators';

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
            .pipe(map(changes => changes.map(c => ({ key: c.payload.key, ...c.payload.val() } as Song))));
        return list;
    }

    public deleteSong(key: string): void {
        this.listRef.remove(key);
    }
}

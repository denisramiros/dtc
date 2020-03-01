import { Song } from './song.interface';

export interface Playlist {
    songs: Song[];
    currentSong: Song;
    currentTime: number;
}

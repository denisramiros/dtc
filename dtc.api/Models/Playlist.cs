using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dtc.api.Models
{
    public class Playlist
    {
        public List<Song> Songs { get; set; }
        public Song CurrentSong { get; set; }
        public int CurrentTime { get; set; }
        public Playlist()
        {
            Songs = new List<Song>();
        }
    }
}

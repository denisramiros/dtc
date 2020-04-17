using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dtc.api.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace dtc.api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlayListController : ControllerBase
    {
        private static Playlist playlist = new Playlist();
        private static DateTime startDateTime;

        private readonly ILogger<PlayListController> _logger;

        public PlayListController(ILogger<PlayListController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Get()
        {
            if (playlist.Songs.Count != 0)
            {
                var diff = DateTime.Now - startDateTime;
                var diffInSeconds = diff.Hours * 3600 + diff.Minutes * 60 + diff.Seconds;
                int i = 0;
                while (diffInSeconds > 0 && i< playlist.Songs.Count)
                {
                    diffInSeconds -= playlist.Songs[i].Length;
                    i++;
                }
                playlist.CurrentSong = playlist.Songs[i-1];
                playlist.CurrentTime = playlist.CurrentSong.Length + diffInSeconds;
            }
            return Ok(playlist);
        }

        [HttpPost]
        public IActionResult AddSong([FromBody] Song song)
        {
            if (song != null)
            {
                if (playlist.Songs.Count == 0)
                {
                    startDateTime = DateTime.Now;
                }
                playlist.Songs.Add(song);
            }

            return Ok(song);
        }

        [HttpDelete]
        public IActionResult DeletePlaylist()
        {
            playlist.Songs.Clear();
            return Ok();
        }
    }
}

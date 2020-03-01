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
                var nowDatetime = DateTime.Now;
                var diff = DateTime.Now - startDateTime;
                var now = nowDatetime.Hour * 3600 + nowDatetime.Minute * 60 + nowDatetime.Second;
                var start = startDateTime.Hour * 3600 + startDateTime.Minute * 60 + startDateTime.Second;
                int i = 0;
                while (start <= now)
                {
                    start += playlist.Songs[i].Length;
                    i++;
                }
                playlist.CurrentSong = playlist.Songs[i-1];
                playlist.CurrentTime = playlist.CurrentSong.Length - (start - now);
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

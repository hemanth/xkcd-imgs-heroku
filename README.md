# xkcd-imgs-heroku

Get random xkcd image urls. http://xkcd-imgs.herokuapp.com/

## features

* [X] responses in JSON format
* [X] CORS support

## API:

```http
GET|POST|PUT|DELETE|OPTIONS /
```

sample response ([schema reference](https://raw.githubusercontent.com/hemanth/xkcd-imgs-heroku/master/response-schema.json)):

```http
200 OK
```

```json
{
  "url": "http://imgs.xkcd.com/comics/mystery_news.png",
  "title": "If you find and stop the video, but you've--against all odds--gotten curious about the trade summit, just leave the tab opened. It will mysteriously start playing again 30 minutes later!"
}
```


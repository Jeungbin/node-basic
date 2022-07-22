var http = require("http");
var fs = require("fs");
var url = require("url");
const qs = require("querystring");

var template = {
  html: function (title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list: function (filelist) {
    var list = "<ul>";
    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list + "</ul>";
    return list;
  },
};

var app = http.createServer(function (request, response) {
  var _url = request.url;
  // _url = /?id=HTML  query string을 의미
  var queryData = url.parse(_url, true).query;
  //query => id=HTML&page=12 이런형식
  //parse 는 이런형식을 객체로 바꿈
  //console.log(queryData);
  //{ id: 'CSSss' }
  var pathname = url.parse(_url, true).pathname;
  //console.log(pathname);
  // all pages pathname is '/'
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (error, fillist) => {
        //console.log(fillist); // [ 'CSS', 'HTML', 'JavaScript' ]

        var title = "welcome";
        var description = "hello node.js";
        var list = template.list(fillist);
        var template = template.html(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        // server response
        response.end(template);
      });
    } else {
      fs.readdir("./data", (error, fillist) => {
        fs.readFile(
          // read entire entire contents of a file
          `data/${queryData.id}`, // path
          "utf8",
          function (err, description) {
            var title = queryData.id;
            var list = template.list(fillist);
            var template = template.html(
              title,
              list,
              `<h2>${title}</h2>${description}`,
              ` <a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>`
              // delete 는 항상 form
              //항상 post방식으로
            );
            response.writeHead(200);
            response.end(template);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (error, fillist) => {
      //reacd a directory
      //console.log(fillist); // [ 'CSS', 'HTML', 'JavaScript' ]
      var title = "WEB - create";
      var list = template.list(fillist);
      var html = template.html(
        title,
        list,
        `
        <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
        ""
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", (data) => {
      //요청에 data있으면
      body = body + data;
      console.log(body);
      // title=s&description=ds
    });
    // web browser 가 post 방식으로 data를 전송할때
    // data가 많으면 이 방법을 쓴다.
    // data = 조각 조각의 data를 수신할때 마자 callback을 호출
    //data라는 인자를 통해 수신한 정보를 전달
    request.on("end", () => {
      // data가 더이상 없으면 callback수신
      var post = qs.parse(body);
      // key value형태로
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", (err) => {
        // data안에 title 의 이름에 파일이 생짐
        // filr이 생긴다는 것은 파일이름에 새로운 webpage생설
        // 안에 내용은 description
        response.writeHead(
          302,
          // 200은 성공
          //302는 page를 redirection
          { Location: `/?id=${title}` }
          // 해당파일(방금생성한 파일)로 이동
        );
        response.end();
      });
      // parde를 통해 정보를 객체화
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", (error, fillist) => {
      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        var title = queryData.id;
        var list = template.list(fillist);
        var html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <input type='hidden' name='id' value='${title}'/>
            <p><input type="text" name="title" placeholder="title" value='${title}'></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
      console.log(data);
    });
    request.on("end", function () {
      var post = qs.parse(body);
      //qs => formatingURL query string
      //parse into key:value
      //id=html...
      var id = post.id;
      var title = post.title;
      var description = post.description;

      // node filr rename
      //fs.rename(oldPath, newPath, callback)
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        // 수정이 끝나면
        fs.writeFile(`data/${title}`, description, "utf8", function (err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          // 해당page로 이동
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, (error) => {
        //삭제가 끝나면
        response.writeHead(302, { Location: `/` });
        //home 으로 보낸다
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3555);

var http = require("http");
var fs = require("fs");
var url = require("url");
const qs = require("querystring");

const templateHTML = (title, list, body, control) => {
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
};
const templateList = (fillist) => {
  let list = "<ul>";
  let i = 0;
  while (i < fillist.length) {
    list = list + `<li><a href="/?id=${fillist[i]}">${fillist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ul>";
  return list;
};
var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  //console.log(url.parse(_url, true));
  var pathname = url.parse(_url, true).pathname;
  console.log(pathname);
  // all pages pathname is '/'
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (error, fillist) => {
        //console.log(fillist); // [ 'CSS', 'HTML', 'JavaScript' ]

        var title = "welcome";
        var description = "hello node.js";
        var list = templateList(fillist);
        var template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", (error, fillist) => {
        fs.readFile(
          `data/${queryData.id}`,
          "utf8",
          function (err, description) {
            var title = queryData.id;
            var list = templateList(fillist);
            var template = templateHTML(
              title,
              list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
            response.writeHead(200);
            response.end(template);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (error, fillist) => {
      //console.log(fillist); // [ 'CSS', 'HTML', 'JavaScript' ]
      var title = "WEB -create";
      var list = templateList(fillist);
      var template = templateHTML(
        title,
        list,
        `
        <form action="http://localhost:3000/create_process" method="post">
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
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    // web browser 가 post 방식으로 data를 전송할때
    // data가 많으면 이 방법을 쓴다.
    // data = 조각 조각의 data를 수신할때 마자 callback을 호출
    //data라는 인자를 통해 수신한 정보를 전달
    request.on("end", () => {
      // data가 더이상 없으면 callback수신
      var post = qs.parse(body);
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
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);

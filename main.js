var http = require("http");
var fs = require("fs");
var url = require("url");

const templateHTML = (title, list, body) => {
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
  <a href="/create">create</a>
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
          `<h2>${title}</h2>${description}`
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
              `<h2>${title}</h2>${description}`
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
        <form action="http://localhost:3000/process_create" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `
      );
      response.writeHead(200);
      response.end(template);
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);

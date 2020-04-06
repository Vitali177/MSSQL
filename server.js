const sql = require("mssql");
const http = require("http");
const fs = require("fs");

const dbConfig = {
  server: "DESKTOP-9V3T2L9\\SQLEXPRESS01",
  user: "test",
  password: "123",
  database: "SVA",
  port: 1433
};

const urlNames = ["faculties", "pulpits", "subjects", "auditoriumstypes", "auditorims"];
const dbNames = ["FACULTY", "PULPIT", "SUBJECT", "AUDITORIUM_TYPE", "AUDITORIUM"];

const server = http.createServer();

function handleError(err, res) {
  console.log("err =", err);
  res.writeHead(404, {"Content-type": "text/plain; charset=utf-8"});
  res.end("Error with request to DB");
}

const http_handler = (req, res) => {
  if (req.method === "GET" && req.url === "/client.js") {
    const script = fs.readFileSync("./client.js");
    res.writeHead(200, {"Content-type": "text/javascript; charset=utf-8"});
    res.end(script);
  }
  else if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync("./index.html");
    res.writeHead(200, {"Content-type": "text/html; charset=utf-8"});
    res.end(html);
  }
  else if (req.method === "GET") {
    const urlName = req.url.split("/")[2];

    if (urlNames.indexOf(urlName) !== -1) {        
      const dbName = dbNames[urlNames.indexOf(urlName)];
      const conn = new sql.ConnectionPool(dbConfig);

      conn.connect((err) => {
        if (err) {
          handleError(err, res);  
        }

        const req = new sql.Request(conn);
        req.query(`select * from ${dbName}`, (err, recordset) => {
          if (err) {
            handleError(err, res);            
          }
          else {
            res.writeHead(200, {"Content-type": "application/json; charset=utf-8"});
            res.end(JSON.stringify(recordset["recordset"]));
          }
          conn.close();
        });
      });      
    } 
    else {
      res.writeHead(404, {"Content-type": "text/plain; charset=utf-8"});
      res.end("This request is not supported"); 
    }    
  }
  else if (req.method === "DELETE") {
    const id = req.url.split("/")[3];
    const dbName = dbNames[urlNames.indexOf(req.url.split("/")[2])];  
    const foreignKey = dbName;  
    const conn = new sql.ConnectionPool(dbConfig);
    
    conn.connect((err) => {
      if (err) {
        handleError(err, res);  
      }

      const req = new sql.Request(conn);
      req.query(`DELETE FROM ${dbName} WHERE ${foreignKey} = ${id}`, (err, recordset) => {
        if (err) {
          handleError(err, res);  
        }
        else {
          res.writeHead(200, {"Content-type": "text/plain; charset=utf-8"});
          res.end("Данные успешно удалены из БД");
        }
        conn.close();
      });
    });  
  }
  else if (req.method === "POST" || req.method === "PUT") {
    let result = "";

    req.on("data", data => {result += data});
    req.on("end", () => {
      const newData = JSON.parse(result);   
      const urlName = req.url.split("/")[2];   

      if (urlNames.indexOf(urlName) !== -1) { 
        const dbName = dbNames[urlNames.indexOf(req.url.split("/")[2])];
     
        if (req.method === "PUT") {
          const conn = new sql.ConnectionPool(dbConfig);
          const foreignKey = dbName;
          let str = "";

          for (key in newData) {
            if (key !== dbName) { // because it is FOREIGN KEY and it is equal dbName
              str += `${key} = '${newData[key]}', `;
            }
          }
          str = str.slice(0, -2); // slice last ", " from str

          conn.connect((err) => {
            if (err) {
              handleError(err, res);  
            }

            const req = new sql.Request(conn);
            req.query(`UPDATE ${dbName} SET ${str} WHERE ${foreignKey} = ${newData[foreignKey]}`, (err, recordset) => {
              if (err) {
                handleError(err, res);  
              }
              else {
                res.writeHead(200, {"Content-type": "text/plain; charset=utf-8"});
                res.end("Данные успешно изменены в БД");
              }
              conn.close();
            });
          });  
        } 
        else { // POST method
          const keys = Object.keys(newData);
          let values = "";

          Object.values(newData).forEach(item => {
            values += `'${item}', `;
          });
          values = values.slice(0, -2); // slice last ", " from str

          const conn = new sql.ConnectionPool(dbConfig);

          conn.connect((err) => {
            if (err) {
              handleError(err, res);  
            }

            const req = new sql.Request(conn);
            req.query(`insert ${dbName} (${keys.join(", ")}) VALUES (${values})`, (err, recordset) => {
              if (err) {
                handleError(err, res);  
              }
              else {
                res.writeHead(200, {"Content-type": "text/plain; charset=utf-8"});
                res.end("Данные успешно добавлены в БД");
              }
              conn.close();
            });
          });   
        }           
      } 
      else {
        res.writeHead(404, {"Content-type": "text/plain; charset=utf-8"});
        res.end("This request is not supported"); 
      } 
    });        
  }
  else {
    res.writeHead(404, {"Content-type": "text/plain; charset=utf-8"});
    res.end(`You made a ${req.method} request! This request is not supported`);
  }
};
server.on("request", http_handler);
server.listen(3000);
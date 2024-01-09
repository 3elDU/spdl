import * as http from 'node:http';

const page = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
      }
      #root {
        display: flex;
        flex-direction: column;
        height: 100vh;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <h1>Authenticating</h1>
      <h4>Please wait</h4>
    </div>

    <script>
      window.ipc.redirectToApp(location.search);
    </script>
  </body>
</html>`.trim();

let listening = false;
export default function initAuthServer(): Promise<void> {
  if (listening) {
    return new Promise((resolve) => resolve());
  }
  listening = true;
  console.log('launching auth server');

  const server = http.createServer((req, res) => {
    res
      .writeHead(200, {
        'Content-Type': 'text/html',
      })
      .end(page);

    server.close();
    listening = false;
  });

  let resolve: () => void;

  server.listen(61624).on('listening', () => {
    resolve();
  });

  return new Promise((resolveInner) => (resolve = resolveInner));
}

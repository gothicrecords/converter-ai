import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Upscaler AI</title>
        <link rel="stylesheet" href="/styles.css" />
        <script src="/client.js" defer></script>
      </Head>

      <main>
        <div className="container">
          <h1>Upscaler AI</h1>
          <div id="dropzone" className="dropzone">
            <p>Drag & Drop image here or click to select</p>
            <input id="fileInput" type="file" accept="image/*" />
          </div>

          <div className="controls">
            <button id="uploadBtn" disabled>Upscale</button>
          </div>

          <div id="status" className="status"></div>

          <div id="resultWrap" className="result" style={{ display: 'none' }}>
            <h3>Result</h3>
            <img id="resultImg" alt="upscaled result" />
            <a id="downloadLink" href="#" download="upscaled.png">Download</a>
          </div>
        </div>
      </main>
    </>
  );
}

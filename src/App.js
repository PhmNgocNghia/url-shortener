import React, { useState, useRef, useCallback } from 'react';
import ky from 'ky';

const App = () => {
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const shortLinkRef = useRef(null);

  const generateUrl = useCallback(async url => {
    try {
      setLoading(true);
      const { shortenedUrl } = await ky
        .post('/.netlify/functions/shortener', { json: { url } })
        .json();
      setShortUrl(shortenedUrl);
    } catch (e) {
      alert('Something went wrong in the process, please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onShortLinkFocus = useCallback(() => {
    shortLinkRef.current.select();
  }, []);

  return (
    <main className="container font-mono leading-normal pt-16 pb-16 ">
      <h1 className="text-center mb-8 text-grey-darkest">URL SHORTENER</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const url = e.target.elements.namedItem('url').value;
          generateUrl(url);
        }}
        className="max-w-md mx-auto text-center"
      >
        <label
          htmlFor="url"
          className="inline-block mb-4 font-medium text-grey-darkest"
        >
          Enter URL to shortern
        </label>
        <input
          type="url"
          name="url"
          id="url"
          required
          className="block w-full border border-grey rounded px-5 py-4 text-sm text-center text-grey-darkest bg-grey-lightest focus:bg-white focus:outline-none focus:shadow-outline"
          disabled={loading}
        />
        {shortUrl && (
          <input
            ref={shortLinkRef}
            type="url"
            readOnly
            className="block w-full border border-grey rounded px-5 py-4 text-sm text-center text-grey-darkest bg-grey-light focus:bg-white focus:outline-none focus:shadow-outline mt-4"
            value={loading ? '...' : shortUrl}
            onFocus={onShortLinkFocus}
          />
        )}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="rounded bg-blue text-white font-semibold px-5 py-4 focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            Shorten it!
          </button>
        </div>
      </form>
    </main>
  );
};

export default App;

import React from 'react';
import { hot } from 'react-hot-loader';
import ky from 'ky';

import './App.css';

const App = () => {
  const generateUrl = async url => {
    const json = await ky
      .post('/.netlify/functions/shortener', { json: { url } })
      .json();
    console.log(json.shortenedUrl);
  };

  return (
    <div className="container">
      <form
        onSubmit={e => {
          e.preventDefault();
          const url = e.target.elements.namedItem('url').value;
          generateUrl(url);
        }}
      >
        <input
          type="url"
          required
          name="url"
          className="block border rounded px-4 py-2 text-center"
        />
        <button type="submit">Shorten Url</button>
      </form>
    </div>
  );
};

export default hot(module)(App);
